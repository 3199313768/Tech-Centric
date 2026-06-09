import { createClient } from '@supabase/supabase-js'
import type { RagSearchResult } from './types'

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

export async function matchRagChunks(queryEmbedding: number[], matchCount = 8, minSimilarity = 0.2) {
  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('match_rag_chunks', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    min_similarity: minSimilarity,
  })

  if (error) {
    throw new Error(`RAG retrieval failed: ${error.message}`)
  }

  return (data || []) as RagSearchResult[]
}

export function toPublicSources(results: RagSearchResult[]) {
  const seen = new Set<string>()
  return results.filter(result => {
    if (seen.has(result.document_id)) return false
    seen.add(result.document_id)
    return true
  }).map(result => ({
    title: result.title,
    url: sanitizeSourceUrl(result.url),
    sourceType: result.source_type,
    similarity: result.similarity,
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
