import { createClient } from '@/lib/supabase/server'
import type { AllProjectItem, ProjectCategory } from '@/data/site/allProjects'

export interface AllProjectsPageData {
  projects: AllProjectItem[]
  error: Error | null
}

interface AllProjectRow {
  id: string
  name: string
  url: string
  is_public: boolean
  category: string
  description: string
  role_and_contribution: string
  tags: string[]
  screenshots: string[]
}

function mapAllProjectRow(row: AllProjectRow): AllProjectItem {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    isPublic: row.is_public,
    category: row.category as ProjectCategory,
    description: row.description,
    roleAndContribution: row.role_and_contribution,
    tags: row.tags,
    screenshots: row.screenshots,
  }
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
