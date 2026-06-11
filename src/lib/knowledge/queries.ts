import { createClient } from '@/lib/supabase/server'
import { KB_RECORDS_PAGE_SIZE, KB_TAGS_PAGE_SIZE } from '@/lib/knowledge/constants'
import type { KnowledgePageData, KnowledgeSearchParams, KbRecord } from '@/lib/knowledge/types'

async function fetchAllUserTags(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const tagSet = new Set<string>()
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from('kb_records')
      .select('tags')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + KB_TAGS_PAGE_SIZE - 1)

    if (error) throw error
    if (!data?.length) break

    for (const row of data) {
      for (const tag of row.tags ?? []) {
        tagSet.add(tag)
      }
    }

    if (data.length < KB_TAGS_PAGE_SIZE) break
    offset += KB_TAGS_PAGE_SIZE
  }

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

export async function fetchKnowledgePageData(
  userId: string,
  params: KnowledgeSearchParams,
): Promise<KnowledgePageData> {
  const supabase = await createClient()

  let dbQuery = supabase
    .from('kb_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (params.query) {
    dbQuery = dbQuery.textSearch('content', params.query, {
      type: 'websearch',
    })
  }

  if (params.tagsFilter.length > 0) {
    dbQuery = dbQuery.contains('tags', params.tagsFilter)
  }

  if (params.typeFilter) {
    dbQuery = dbQuery.eq('type', params.typeFilter)
  }

  const [{ data: records, error: recordsError }, uniqueTags] = await Promise.all([
    dbQuery.limit(KB_RECORDS_PAGE_SIZE),
    fetchAllUserTags(userId),
  ])

  const recordList = (records ?? []) as KbRecord[]

  return {
    records: recordList,
    uniqueTags,
    hasMore: recordList.length === KB_RECORDS_PAGE_SIZE,
    recordsError: recordsError ? new Error(recordsError.message) : null,
  }
}
