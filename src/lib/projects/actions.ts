'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ProjectCategory } from '@/data/site/allProjects'
import { SITE_ROUTES } from '@/lib/site/routes'

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
}

export async function saveAllProject(input: SaveAllProjectInput): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const row = {
    name: input.name,
    url: input.url,
    is_public: input.isPublic,
    category: input.category,
    description: input.description,
    role_and_contribution: input.roleAndContribution,
    tags: input.tags,
    screenshots: input.screenshots,
  }

  const { error } = input.id
    ? await supabase.from('all_projects').update(row).eq('id', input.id)
    : await supabase.from('all_projects').insert([{ id: crypto.randomUUID(), ...row }])

  if (error) return { error: error.message }
  revalidatePath(SITE_ROUTES.projects)
  return { error: null }
}

export async function deleteAllProject(projectId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('all_projects').delete().eq('id', projectId)

  if (error) return { error: error.message }
  revalidatePath(SITE_ROUTES.projects)
  return { error: null }
}
