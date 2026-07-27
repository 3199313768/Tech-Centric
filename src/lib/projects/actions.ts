'use server'

import { revalidatePath } from 'next/cache'
import { requireSuperAdmin } from '@/lib/auth/requireUser'
import { createClient } from '@/lib/supabase/server'
import type { ProjectCategory } from '@/data/site/allProjects'
import { assertCompleteProjectOrder } from '@/lib/projects/assertCompleteProjectOrder'
import { buildProjectSlug } from '@/lib/projects/slug'
import { scheduleRagReindex } from '@/lib/rag/reindexTrigger'
import { SITE_ROUTES, projectRoute } from '@/lib/site/routes'

export interface SaveAllProjectInput {
  id?: string
  name: string
  url: string
  isPublic: boolean
  category: ProjectCategory
  description: string
  roleAndContribution: string
  tags: string[]
  screenshots: string[]
  body?: string
  highlights?: string[]
  techStack?: string[]
  period?: string
  role?: string
  isFeatured?: boolean
  slug?: string
}

export async function saveAllProject(input: SaveAllProjectInput): Promise<{ error: string | null }> {
  const { error: authError } = await requireSuperAdmin()
  if (authError) return { error: authError }

  const supabase = await createClient()
  const projectId = input.id ?? crypto.randomUUID()
  const slug = input.slug?.trim() || buildProjectSlug(input.name, projectId)

  const row = {
    name: input.name,
    url: input.url,
    is_public: input.isPublic,
    category: input.category,
    description: input.description,
    role_and_contribution: input.roleAndContribution,
    tags: input.tags,
    screenshots: input.screenshots,
    slug,
    body: input.body ?? '',
    highlights: input.highlights ?? [],
    tech_stack: input.techStack ?? [],
    period: input.period ?? '',
    role: input.role ?? '',
    is_featured: input.isFeatured ?? false,
  }

  if (input.id) {
    const { error } = await supabase.from('all_projects').update(row).eq('id', input.id)
    if (error) return { error: error.message }
  } else {
    const { data: maxRow, error: maxError } = await supabase
      .from('all_projects')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (maxError) return { error: maxError.message }

    const nextSortOrder = (maxRow?.sort_order ?? -1) + 1
    const { error } = await supabase.from('all_projects').insert([{
      id: projectId,
      ...row,
      sort_order: nextSortOrder,
    }])
    if (error) return { error: error.message }
  }

  revalidatePath(SITE_ROUTES.projects)
  revalidatePath(projectRoute(slug))
  if (input.isPublic) {
    scheduleRagReindex('project_save')
  }
  return { error: null }
}

export async function deleteAllProject(projectId: string): Promise<{ error: string | null }> {
  const { error: authError } = await requireSuperAdmin()
  if (authError) return { error: authError }

  const supabase = await createClient()
  const { error } = await supabase.from('all_projects').delete().eq('id', projectId)

  if (error) return { error: error.message }
  revalidatePath(SITE_ROUTES.projects)
  scheduleRagReindex('project_delete')
  return { error: null }
}

export async function reorderAllProjects(
  orderedIds: string[],
): Promise<{ error: string | null }> {
  const { error: authError } = await requireSuperAdmin()
  if (authError) return { error: authError }

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { error: '排序列表无效' }
  }

  const supabase = await createClient()
  const { data, error: listError } = await supabase
    .from('all_projects')
    .select('id')

  if (listError) return { error: listError.message }

  const existingIds = (data ?? []).map((row) => row.id)
  const validationError = assertCompleteProjectOrder(orderedIds, existingIds)
  if (validationError) return { error: validationError }

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('all_projects').update({ sort_order: index }).eq('id', id),
    ),
  )

  const failed = results.find((result) => result.error)
  if (failed?.error) return { error: failed.error.message }

  revalidatePath(SITE_ROUTES.projects)
  return { error: null }
}
