import { createClient } from '@/lib/supabase/server'
import type { AllProjectItem } from '@/data/site/allProjects'
import { mapAllProjectRow, type AllProjectRow } from '@/lib/projects/mappers'

export interface AllProjectsPageData {
  projects: AllProjectItem[]
  error: Error | null
}

export async function fetchAllProjectsPageData(): Promise<AllProjectsPageData> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('all_projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { projects: [], error: new Error(error.message) }
  }

  return {
    projects: (data as AllProjectRow[]).map(mapAllProjectRow),
    error: null,
  }
}

export async function fetchProjectBySlug(slug: string): Promise<AllProjectItem | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('all_projects')
    .select('*')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapAllProjectRow(data as AllProjectRow)
}
