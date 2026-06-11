import { createClient } from '@/lib/supabase/server'
import type { AllProjectItem, ProjectCategory } from '@/data/site/allProjects'

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

function mapFeaturedRow(row: AllProjectRow): AllProjectItem {
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

export async function fetchFeaturedProject(): Promise<AllProjectItem | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('all_projects')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapFeaturedRow(data as AllProjectRow)
}
