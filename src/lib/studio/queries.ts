import { createClient } from '@/lib/supabase/server'
import { SITE_ROUTES } from '@/lib/site/routes'

export interface StudioStats {
  projects: number
  skills: number
  vibeEntries: number
  kbRecords: number
  resources: number
}

export interface PublicContentStats {
  publicProjects: number
  publicVibeEntries: number
  publicKbRecords: number
}

export async function fetchStudioStats(userId: string): Promise<StudioStats> {
  const supabase = await createClient()

  const [projects, skills, vibe, kb, resources] = await Promise.all([
    supabase.from('all_projects').select('id', { count: 'exact', head: true }),
    supabase.from('ai_skills').select('id', { count: 'exact', head: true }),
    supabase.from('vibe_coding').select('id', { count: 'exact', head: true }),
    supabase.from('kb_records').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('resources').select('id', { count: 'exact', head: true }),
  ])

  return {
    projects: projects.count ?? 0,
    skills: skills.count ?? 0,
    vibeEntries: vibe.count ?? 0,
    kbRecords: kb.count ?? 0,
    resources: resources.count ?? 0,
  }
}

export async function fetchPublicContentStats(userId: string): Promise<PublicContentStats> {
  const supabase = await createClient()

  const [projects, vibe, kb] = await Promise.all([
    supabase.from('all_projects').select('id', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('vibe_coding').select('id', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('kb_records').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_public', true),
  ])

  return {
    publicProjects: projects.count ?? 0,
    publicVibeEntries: vibe.count ?? 0,
    publicKbRecords: kb.count ?? 0,
  }
}

export const STUDIO_QUICK_LINKS = [
  { href: SITE_ROUTES.projects, label: '管理归档', description: '新增或编辑项目' },
  { href: SITE_ROUTES.skills, label: '管理技能', description: 'Agent Skills 卷轴' },
  { href: SITE_ROUTES.vibe, label: '管理草本集', description: '实验 / 笔记 / 长文' },
  { href: SITE_ROUTES.knowledge, label: '进入档案馆', description: 'Cmd+K 快速录入' },
  { href: SITE_ROUTES.resources, label: '管理资源', description: '外链资源架' },
] as const
