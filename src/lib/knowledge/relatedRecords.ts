import { createClient } from '@/lib/supabase/server'
import type { KbRecord } from '@/lib/knowledge/types'
import { knowledgePublicRoute } from '@/lib/site/routes'

export interface RelatedKbRecord {
  id: string
  summary: string
  tags: string[]
  href: string
  sharedTags: string[]
}

function summarizeContent(content: string, max = 80): string {
  const trimmed = content.replace(/\s+/g, ' ').trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max)}…`
}

export async function fetchRelatedPublicKbRecords(
  recordId: string,
  tags: string[],
  limit = 5,
): Promise<RelatedKbRecord[]> {
  const normalizedTags = tags.map((tag) => tag.trim()).filter(Boolean)
  if (normalizedTags.length === 0) {
    return []
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kb_records')
    .select('id, content, tags')
    .eq('is_public', true)
    .neq('id', recordId)
    .overlaps('tags', normalizedTags)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data?.length) {
    return []
  }

  return (data as KbRecord[]).map((record) => {
    const recordTags = record.tags ?? []
    const sharedTags = recordTags.filter((tag) =>
      normalizedTags.some(
        (needle) => needle.toLowerCase() === tag.toLowerCase(),
      ),
    )

    return {
      id: record.id,
      summary: summarizeContent(record.content),
      tags: recordTags,
      href: knowledgePublicRoute(record.id),
      sharedTags,
    }
  })
}
