import { createClient } from '@/lib/supabase/server'
import { mapAllProjectRow, type AllProjectRow } from '@/lib/projects/mappers'
import { mapVibeEntryRow, type VibeEntryRow } from '@/lib/vibe/mappers'
import { knowledgePublicRoute, projectRoute, vibeRoute } from '@/lib/site/routes'

export type ShowcaseSource = 'project' | 'vibe' | 'knowledge'

export interface ShowcaseItem {
  id: string
  title: string
  summary: string
  href: string
  source: ShowcaseSource
  tags: string[]
}

const SOURCE_LABELS: Record<ShowcaseSource, string> = {
  project: '归档',
  vibe: '草本集',
  knowledge: '档案馆',
}

export function getShowcaseSourceLabel(source: ShowcaseSource): string {
  return SOURCE_LABELS[source]
}

export async function fetchShowcaseItems(): Promise<ShowcaseItem[]> {
  const supabase = await createClient()

  const [projectsRes, vibeRes, kbRes] = await Promise.all([
    supabase
      .from('all_projects')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(24),
    supabase
      .from('vibe_coding')
      .select('*')
      .eq('is_public', true)
      .in('kind', ['note', 'article'])
      .order('created_at', { ascending: false })
      .limit(24),
    supabase
      .from('kb_records')
      .select('id,type,content,tags,created_at')
      .eq('is_public', true)
      .in('type', ['text', 'code'])
      .order('created_at', { ascending: false })
      .limit(24),
  ])

  const items: ShowcaseItem[] = []

  for (const row of (projectsRes.data ?? []) as AllProjectRow[]) {
    const project = mapAllProjectRow(row)
    items.push({
      id: `project-${project.id}`,
      title: project.name,
      summary: project.description,
      href: projectRoute(project.slug),
      source: 'project',
      tags: project.tags,
    })
  }

  for (const row of (vibeRes.data ?? []) as VibeEntryRow[]) {
    const entry = mapVibeEntryRow(row)
    items.push({
      id: `vibe-${entry.id}`,
      title: entry.name,
      summary: entry.description,
      href: vibeRoute(entry.slug),
      source: 'vibe',
      tags: entry.tags,
    })
  }

  for (const row of kbRes.data ?? []) {
    const content = String(row.content ?? '')
    items.push({
      id: `kb-${row.id}`,
      title: `知识片段 · ${row.type}`,
      summary: content.slice(0, 120),
      href: knowledgePublicRoute(String(row.id)),
      source: 'knowledge',
      tags: (row.tags as string[]) ?? [],
    })
  }

  return items
}
