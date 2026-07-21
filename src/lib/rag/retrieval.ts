import { createClient } from '@supabase/supabase-js'
import type {
  RagRetrievalCandidate,
  RagSearchResult,
  RagSource,
  RagSourceType,
} from './types'

const SOURCE_EXCERPT_LENGTH = 160

interface VectorMatchRow {
  chunk_id: string
  document_id: string
  source_id: string
  content: string
  title: string
  url: string | null
  source_type: RagSourceType
  tags: string[]
  similarity: number
}

interface LexicalMatchRow extends Omit<VectorMatchRow, 'similarity'> {
  lexical_score: number
  exact_match: boolean
}

interface RetrievalDependencies {
  vector: (embedding: number[], signal?: AbortSignal) => Promise<RagRetrievalCandidate[]>
  lexical: (query: string, signal?: AbortSignal) => Promise<RagRetrievalCandidate[]>
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase service credentials are not configured')
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function matchRagChunksVector(
  queryEmbedding: number[],
  matchCount = 12,
  minSimilarity = 0.2,
  signal?: AbortSignal,
) {
  const supabase = createServiceClient()
  const request = supabase.rpc('match_rag_chunks', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    min_similarity: minSimilarity,
  })
  const { data, error } = signal
    ? await request.abortSignal(signal)
    : await request

  if (error) {
    throw new Error(`RAG vector retrieval failed: ${error.message}`)
  }

  return ((data || []) as VectorMatchRow[]).map((row) =>
    toRetrievalCandidate(row, {
      similarity: row.similarity,
      lexicalScore: null,
      exactMatch: false,
    }),
  )
}

export async function matchRagChunksLexical(
  query: string,
  matchCount = 12,
  signal?: AbortSignal,
) {
  const supabase = createServiceClient()
  const request = supabase.rpc('match_rag_chunks_lexical', {
    query_text: query,
    match_count: matchCount,
  })
  const { data, error } = signal
    ? await request.abortSignal(signal)
    : await request

  if (error) {
    throw new Error(`RAG lexical retrieval failed: ${error.message}`)
  }

  return ((data || []) as LexicalMatchRow[]).map((row) =>
    toRetrievalCandidate(row, {
      similarity: null,
      lexicalScore: row.lexical_score,
      exactMatch: row.exact_match,
    }),
  )
}

export async function retrieveRagCandidates(
  query: string,
  embedding: number[],
  signal?: AbortSignal,
  dependencies: RetrievalDependencies = {
    vector: (value, operationSignal) =>
      matchRagChunksVector(value, 12, 0.2, operationSignal),
    lexical: (value, operationSignal) =>
      matchRagChunksLexical(value, 12, operationSignal),
  },
) {
  const [vectorResult, lexicalResult] = await Promise.allSettled([
    dependencies.vector(embedding, signal),
    dependencies.lexical(query, signal),
  ])

  signal?.throwIfAborted()

  if (vectorResult.status === 'rejected' && lexicalResult.status === 'rejected') {
    throw new Error('RAG retrieval failed')
  }

  return {
    vector: vectorResult.status === 'fulfilled' ? vectorResult.value : [],
    lexical: lexicalResult.status === 'fulfilled' ? lexicalResult.value : [],
  }
}

// Compatibility adapter for the legacy chat route until it consumes fused candidates.
export async function matchRagChunks(
  queryEmbedding: number[],
  matchCount = 8,
  minSimilarity = 0.2,
) {
  const candidates = await matchRagChunksVector(
    queryEmbedding,
    matchCount,
    minSimilarity,
  )
  return candidates.map((candidate): RagSearchResult => ({
    chunk_id: candidate.chunkId,
    document_id: candidate.documentId,
    content: candidate.content,
    title: candidate.title,
    url: candidate.url,
    source_type: candidate.sourceType,
    tags: candidate.tags,
    similarity: candidate.similarity ?? 0,
  }))
}

export function toPublicSources(results: RagSearchResult[]): RagSource[] {
  const seen = new Set<string>()
  return results
    .filter((result) => {
      if (seen.has(result.document_id)) return false
      seen.add(result.document_id)
      return true
    })
    .map((result, index) => ({
      // Compatibility shape for the legacy meta event until citation-aware SSE replaces it.
      citation: index + 1,
      sourceId: result.document_id,
      title: result.title,
      url: sanitizeSourceUrl(result.url),
      sourceType: result.source_type,
      excerpt: result.content.slice(0, SOURCE_EXCERPT_LENGTH),
    }))
}

function sanitizeSourceUrl(url: string | null) {
  if (!url) return null
  if (url.startsWith('/')) return url

  try {
    const parsed = new URL(url)
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.toString() : null
  } catch {
    return null
  }
}

function toRetrievalCandidate(
  row: Omit<VectorMatchRow, 'similarity'>,
  scores: Pick<
    RagRetrievalCandidate,
    'similarity' | 'lexicalScore' | 'exactMatch'
  >,
): RagRetrievalCandidate {
  return {
    chunkId: row.chunk_id,
    documentId: row.document_id,
    sourceId: row.source_id,
    content: row.content,
    excerpt: row.content.slice(0, SOURCE_EXCERPT_LENGTH),
    title: row.title,
    url: row.url,
    sourceType: row.source_type,
    tags: row.tags,
    ...scores,
  }
}
