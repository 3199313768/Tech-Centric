import { createClient } from '@/lib/supabase/server'
import { mapAllProjectRow, type AllProjectRow } from '@/lib/projects/mappers'
import { mapVibeEntryRow, type VibeEntryRow } from '@/lib/vibe/mappers'
import { mapAiSkillRow, type AiSkillRow } from '@/lib/skills/queries'
import { mapResourceRow, type ResourceRow } from '@/lib/resources/mappers'
import {
  knowledgePublicRoute,
  projectRoute,
  SITE_ROUTES,
  vibeRoute,
} from '@/lib/site/routes'

export type SearchResultSource =
  | 'project'
  | 'vibe'
  | 'knowledge'
  | 'skill'
  | 'resource'

export interface SiteSearchResult {
  id: string
  title: string
  summary: string
  href: string
  source: SearchResultSource
  tags: string[]
}

const SEARCH_LIMIT = 8

function escapeIlike(value: string): string {
  return value.replace(/[%_,]/g, ' ').trim()
}

function buildOrIlike(columns: string[], pattern: string): string {
  return columns.map((col) => `${col}.ilike.${pattern}`).join(',')
}

export async function searchSite(query: string): Promise<SiteSearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) {
    return []
  }

  const escaped = escapeIlike(trimmed)
  const pattern = `%${escaped}%`
  const supabase = await createClient()
  const results: SiteSearchResult[] = []

  const [projectsRes, vibeRes, kbRes, skillsRes, resourcesRes] = await Promise.all([
    supabase
      .from('all_projects')
      .select('*')
      .eq('is_public', true)
      .or(buildOrIlike(['name', 'description', 'role_and_contribution'], pattern))
      .limit(SEARCH_LIMIT),
    supabase
      .from('vibe_coding')
      .select('*')
      .eq('is_public', true)
      .or(buildOrIlike(['name', 'description', 'body'], pattern))
      .limit(SEARCH_LIMIT),
    supabase
      .from('kb_records')
      .select('id,type,content,tags')
      .eq('is_public', true)
      .in('type', ['text', 'code'])
      .ilike('content', pattern)
      .limit(SEARCH_LIMIT),
    supabase
      .from('ai_skills')
      .select('*')
      .or(buildOrIlike(['name', 'description'], pattern))
      .limit(SEARCH_LIMIT),
    supabase
      .from('resources')
      .select('*')
      .or(buildOrIlike(['name', 'description'], pattern))
      .limit(SEARCH_LIMIT),
  ])

  for (const row of (projectsRes.data ?? []) as AllProjectRow[]) {
    const project = mapAllProjectRow(row)
    results.push({
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
    results.push({
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
    results.push({
      id: `kb-${row.id}`,
      title: `知识片段 · ${row.type}`,
      summary: content.slice(0, 140),
      href: knowledgePublicRoute(String(row.id)),
      source: 'knowledge',
      tags: (row.tags as string[]) ?? [],
    })
  }

  for (const row of (skillsRes.data ?? []) as AiSkillRow[]) {
    const skill = mapAiSkillRow(row)
    results.push({
      id: `skill-${skill.id}`,
      title: skill.name,
      summary: skill.description,
      href: skill.link || SITE_ROUTES.skills,
      source: 'skill',
      tags: skill.tags,
    })
  }

  for (const row of (resourcesRes.data ?? []) as ResourceRow[]) {
    const resource = mapResourceRow(row)
    results.push({
      id: `resource-${resource.id}`,
      title: resource.name,
      summary: resource.description ?? '',
      href: resource.url,
      source: 'resource',
      tags: resource.tags ?? [],
    })
  }

  return results.slice(0, 30)
}
