begin;

-- Rebuild only the RPC function because PostgreSQL cannot replace its return
-- table shape in place. This does not modify rag_documents or rag_chunks data.
drop function if exists public.match_rag_chunks(vector, integer, double precision);

create index if not exists rag_chunks_content_fts_idx
  on public.rag_chunks
  using gin (to_tsvector('simple', content));

create function public.match_rag_chunks(
  query_embedding vector(1536),
  match_count integer default 12,
  min_similarity double precision default 0.2
)
returns table (
  chunk_id uuid,
  document_id uuid,
  source_id text,
  content text,
  title text,
  url text,
  source_type text,
  tags text[],
  similarity double precision
)
language sql
stable
security invoker
as $$
  select
    rag_chunks.id as chunk_id,
    rag_documents.id as document_id,
    rag_documents.source_id,
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
  order by rag_chunks.embedding <=> query_embedding, rag_chunks.id
  limit greatest(1, least(match_count, 50));
$$;

create or replace function public.match_rag_chunks_lexical(
  query_text text,
  match_count integer default 12
)
returns table (
  chunk_id uuid,
  document_id uuid,
  source_id text,
  content text,
  title text,
  url text,
  source_type text,
  tags text[],
  lexical_score double precision,
  exact_match boolean
)
language sql
stable
security invoker
as $$
  with input as (
    select lower(btrim(coalesce(query_text, ''))) as normalized_query
  ), search_input as (
    select
      normalized_query,
      case
        when normalized_query = '' then null
        else websearch_to_tsquery('simple', normalized_query)
      end as ts_query
    from input
  ), scored as (
    select
      rag_chunks.id as chunk_id,
      rag_documents.id as document_id,
      rag_documents.source_id,
      rag_chunks.content,
      rag_documents.title,
      rag_documents.url,
      rag_documents.source_type,
      rag_documents.tags,
      (
        ts_rank_cd(
          to_tsvector('simple', rag_chunks.content),
          search_input.ts_query
        )
        + case when lower(rag_documents.title) = search_input.normalized_query then 2.0 else 0.0 end
        + case when strpos(lower(rag_documents.title), search_input.normalized_query) > 0 then 0.75 else 0.0 end
        + case when tag_matches.exact_match then 1.5 else 0.0 end
        + case when tag_matches.substring_match then 0.5 else 0.0 end
      )::double precision as lexical_score,
      (
        lower(rag_documents.title) = search_input.normalized_query
        or tag_matches.exact_match
      ) as exact_match
    from public.rag_chunks
    join public.rag_documents on rag_documents.id = rag_chunks.document_id
    cross join search_input
    cross join lateral (
      select
        coalesce(bool_or(lower(tag) = search_input.normalized_query), false) as exact_match,
        coalesce(bool_or(strpos(lower(tag), search_input.normalized_query) > 0), false) as substring_match
      from unnest(rag_documents.tags) as tag
    ) as tag_matches
    where rag_documents.is_public = true
      and search_input.normalized_query <> ''
      and (
        to_tsvector('simple', rag_chunks.content) @@ search_input.ts_query
        or strpos(lower(rag_documents.title), search_input.normalized_query) > 0
        or tag_matches.substring_match
      )
  ), ranked as (
    select
      scored.*,
      row_number() over (
        partition by document_id
        order by lexical_score desc, chunk_id
      ) as doc_rank
    from scored
  )
  select
    chunk_id,
    document_id,
    source_id,
    content,
    title,
    url,
    source_type,
    tags,
    lexical_score,
    exact_match
  from ranked
  where doc_rank <= 2
  order by lexical_score desc, exact_match desc, chunk_id
  limit greatest(1, least(match_count, 50));
$$;

revoke all on function public.match_rag_chunks(vector, integer, double precision) from public;
revoke all on function public.match_rag_chunks_lexical(text, integer) from public;
grant execute on function public.match_rag_chunks(vector, integer, double precision) to service_role;
grant execute on function public.match_rag_chunks_lexical(text, integer) to service_role;

commit;
