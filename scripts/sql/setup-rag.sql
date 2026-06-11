create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists public.rag_documents (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  title text not null,
  url text,
  summary text,
  tags text[] not null default '{}',
  is_public boolean not null default true,
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rag_documents_source_unique unique (source_type, source_id)
);

create table if not exists public.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.rag_documents(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding vector(1536) not null,
  token_estimate integer,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  constraint rag_chunks_document_chunk_unique unique (document_id, chunk_index)
);

create index if not exists rag_documents_public_idx
  on public.rag_documents (is_public, source_type);

create index if not exists rag_chunks_document_id_idx
  on public.rag_chunks (document_id);

create index if not exists rag_chunks_embedding_idx
  on public.rag_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function public.match_rag_chunks(
  query_embedding vector(1536),
  match_count integer default 8,
  min_similarity double precision default 0.2
)
returns table (
  chunk_id uuid,
  document_id uuid,
  content text,
  title text,
  url text,
  source_type text,
  tags text[],
  similarity double precision
)
language sql
stable
as $$
  select
    rag_chunks.id as chunk_id,
    rag_documents.id as document_id,
    rag_chunks.content,
    rag_documents.title,
    rag_documents.url,
    rag_documents.source_type,
    rag_documents.tags,
    1 - (rag_chunks.embedding <=> query_embedding) as similarity
  from public.rag_chunks
  join public.rag_documents on rag_documents.id = rag_chunks.document_id
  where rag_documents.is_public = true
    and 1 - (rag_chunks.embedding <=> query_embedding) >= min_similarity
  order by rag_chunks.embedding <=> query_embedding
  limit match_count;
$$;

alter table public.rag_documents enable row level security;
alter table public.rag_chunks enable row level security;

drop policy if exists "service role can manage rag documents" on public.rag_documents;
create policy "service role can manage rag documents"
  on public.rag_documents
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service role can manage rag chunks" on public.rag_chunks;
create policy "service role can manage rag chunks"
  on public.rag_chunks
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
