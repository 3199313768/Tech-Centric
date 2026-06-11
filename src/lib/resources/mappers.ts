import type { ResourceItem } from '@/data/resources/initialResources'
import { RESOURCE_DEFAULT_CATEGORIES } from '@/lib/resources/constants'

export interface ResourceRow {
  id: string
  name: string
  url: string
  description: string | null
  category: string
  tags: string[] | null
  created_at: number
  is_pinned: boolean | null
  click_count: number | null
}

export function mapResourceRow(row: ResourceRow): ResourceItem {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    description: row.description ?? undefined,
    category: row.category,
    tags: row.tags ?? undefined,
    createdAt: Number(row.created_at),
    isPinned: row.is_pinned ?? false,
    clickCount: row.click_count ?? 0,
  }
}

export function deriveResourceCategories(items: ResourceItem[]): string[] {
  return Array.from(
    new Set([
      ...RESOURCE_DEFAULT_CATEGORIES,
      ...items.map((item) => item.category),
    ]),
  )
}
