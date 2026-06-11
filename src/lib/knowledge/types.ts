export interface KbRecord {
  id: string
  user_id: string
  type: string
  content: string
  tags?: string[]
  created_at: string
  [key: string]: unknown
}

export interface KnowledgeSearchParams {
  query?: string
  tagsFilter: string[]
  typeFilter?: string
}

export interface KnowledgePageData {
  records: KbRecord[]
  uniqueTags: string[]
  hasMore: boolean
  recordsError: Error | null
}

export function parseKnowledgeSearchParams(
  resolvedParams: { [key: string]: string | string[] | undefined },
): KnowledgeSearchParams {
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined
  const tagsFilter =
    typeof resolvedParams.tags === 'string' ? resolvedParams.tags.split(',').filter(Boolean) : []
  const typeFilter = typeof resolvedParams.type === 'string' ? resolvedParams.type : undefined
  return { query, tagsFilter, typeFilter }
}
