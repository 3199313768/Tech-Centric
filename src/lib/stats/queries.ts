import { createClient } from '@/lib/supabase/server'
import { skillsDetail } from '@/data/site/personal'
import type { AiSkillRow } from '@/lib/skills/queries'

export interface SiteStatCounts {
  publicProjects: number
  skills: number
  publicVibe: number
  publicKnowledge: number
  resources: number
  showcaseTotal: number
}

export interface SkillDistributionItem {
  label: string
  count: number
}

export interface ActivityMonth {
  month: string
  label: string
  count: number
}

export interface SiteStatsData {
  counts: SiteStatCounts
  skillDistribution: SkillDistributionItem[]
  activity: ActivityMonth[]
  lastUpdated: string
}

const ACTIVITY_MONTHS = 6

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-')
  return `${year}年${Number(month)}月`
}

function buildRecentMonthKeys(count: number): string[] {
  const keys: string[] = []
  const cursor = new Date()
  cursor.setDate(1)

  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1)
    keys.push(monthKey(date))
  }

  return keys
}

function bumpMonth(map: Map<string, number>, raw: string | number | null | undefined): void {
  if (raw == null) return

  const date = typeof raw === 'number' ? new Date(raw) : new Date(raw)
  if (Number.isNaN(date.getTime())) return

  const key = monthKey(date)
  map.set(key, (map.get(key) ?? 0) + 1)
}

function buildSkillDistribution(rows: AiSkillRow[]): SkillDistributionItem[] {
  const counts = new Map<string, number>()

  for (const row of rows) {
    const platform = row.platform?.trim() || '通用'
    counts.set(platform, (counts.get(platform) ?? 0) + 1)
  }

  if (counts.size === 0) {
    const categories = new Map<string, number>()
    for (const skill of skillsDetail) {
      categories.set(skill.category, (categories.get(skill.category) ?? 0) + 1)
    }
    return Array.from(categories.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

export async function fetchSiteStats(): Promise<SiteStatsData> {
  const supabase = await createClient()
  const monthKeys = buildRecentMonthKeys(ACTIVITY_MONTHS)
  const activityMap = new Map<string, number>(monthKeys.map((key) => [key, 0]))

  const [
    publicProjectsRes,
    skillsCountRes,
    publicVibeRes,
    publicKbRes,
    resourcesRes,
    projectDatesRes,
    vibeDatesRes,
    kbDatesRes,
    resourceDatesRes,
    skillPlatformRes,
  ] = await Promise.all([
    supabase.from('all_projects').select('id', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('ai_skills').select('id', { count: 'exact', head: true }),
    supabase.from('vibe_coding').select('id', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('kb_records').select('id', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('resources').select('id', { count: 'exact', head: true }),
    supabase.from('all_projects').select('created_at').eq('is_public', true),
    supabase.from('vibe_coding').select('created_at').eq('is_public', true),
    supabase.from('kb_records').select('created_at').eq('is_public', true),
    supabase.from('resources').select('created_at'),
    supabase.from('ai_skills').select('platform'),
  ])

  const publicProjects = publicProjectsRes.count ?? 0
  const skills = skillsCountRes.count ?? 0
  const publicVibe = publicVibeRes.count ?? 0
  const publicKnowledge = publicKbRes.count ?? 0
  const resources = resourcesRes.count ?? 0

  for (const row of projectDatesRes.data ?? []) {
    bumpMonth(activityMap, row.created_at as string)
  }
  for (const row of vibeDatesRes.data ?? []) {
    bumpMonth(activityMap, row.created_at as string)
  }
  for (const row of kbDatesRes.data ?? []) {
    bumpMonth(activityMap, row.created_at as string)
  }
  for (const row of resourceDatesRes.data ?? []) {
    bumpMonth(activityMap, row.created_at as number)
  }

  const distribution = buildSkillDistribution(
    (skillPlatformRes.data ?? []) as AiSkillRow[],
  )

  const activity = monthKeys.map((key) => ({
    month: key,
    label: monthLabel(key),
    count: activityMap.get(key) ?? 0,
  }))

  return {
    counts: {
      publicProjects,
      skills,
      publicVibe,
      publicKnowledge,
      resources,
      showcaseTotal: publicProjects + publicVibe + publicKnowledge,
    },
    skillDistribution: distribution,
    activity: activity.map((item) => ({
      ...item,
    })),
    lastUpdated: new Date().toISOString(),
  }
}

export function getActivityIntensity(count: number, max: number): number {
  if (max <= 0 || count <= 0) return 0
  return Math.max(0.12, count / max)
}
