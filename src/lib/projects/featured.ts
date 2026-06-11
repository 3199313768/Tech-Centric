import { createClient } from '@/lib/supabase/server'
import type { AllProjectItem } from '@/data/site/allProjects'
import { mapAllProjectRow, type AllProjectRow } from '@/lib/projects/mappers'

export async function fetchFeaturedProject(): Promise<AllProjectItem | null> {
  const supabase = await createClient()
  const { data: featured, error: featuredError } = await supabase
    .from('all_projects')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!featuredError && featured) {
    return mapAllProjectRow(featured as AllProjectRow)
  }

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

  return mapAllProjectRow(data as AllProjectRow)
}
