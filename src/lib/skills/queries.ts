import { createClient } from '@/lib/supabase/server'

export interface AgentSkill {
  id: string
  name: string
  icon: string
  description: string
  tags: string[]
  platform?: string
  link?: string
}

export interface AiSkillsPageData {
  skills: AgentSkill[]
  error: Error | null
}

export interface AiSkillRow {
  id: string
  name: string
  icon: string
  description: string
  tags: string[] | string | null
  platform: string | null
  link: string | null
}

function normalizeTags(tags: AiSkillRow['tags']): string[] {
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    return tags
      .replace(/^{|}$/g, '')
      .split(',')
      .map((s) => s.trim().replace(/^"|"$/g, ''))
      .filter(Boolean)
  }
  return []
}

export function mapAiSkillRow(row: AiSkillRow): AgentSkill {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    description: row.description,
    tags: normalizeTags(row.tags),
    platform: row.platform ?? undefined,
    link: row.link ?? undefined,
  }
}

export async function fetchAiSkillsPageData(): Promise<AiSkillsPageData> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ai_skills')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { skills: [], error: new Error(error.message) }
  }

  return {
    skills: (data as AiSkillRow[]).map(mapAiSkillRow),
    error: null,
  }
}
