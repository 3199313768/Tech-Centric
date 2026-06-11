import { buildProjectSlug } from '@/lib/projects/slug'
import type { VibeEntry, VibeKind } from '@/lib/vibe/types'

export interface VibeEntryRow {
  id: string
  name: string
  description: string
  url: string
  icon: string
  kind?: string | null
  slug?: string | null
  body?: string | null
  is_public?: boolean | null
  tags?: string[] | null
}

export function mapVibeEntryRow(row: VibeEntryRow): VibeEntry {
  const kind = (row.kind ?? 'project') as VibeKind

  return {
    id: row.id,
    slug: row.slug?.trim() || buildProjectSlug(row.name, row.id),
    name: row.name,
    description: row.description,
    url: row.url,
    icon: row.icon,
    kind,
    body: row.body ?? '',
    isPublic: row.is_public ?? false,
    tags: row.tags ?? [],
  }
}
