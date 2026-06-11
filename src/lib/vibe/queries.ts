import { createClient } from '@/lib/supabase/server'

export interface VibeProject {
  id: string
  name: string
  description: string
  url: string
  icon: string
}

export interface VibePageData {
  projects: VibeProject[]
  error: Error | null
}

interface VibeProjectRow {
  id: string
  name: string
  description: string
  url: string
  icon: string
}

function mapVibeProjectRow(row: VibeProjectRow): VibeProject {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    url: row.url,
    icon: row.icon,
  }
}

export async function fetchVibePageData(): Promise<VibePageData> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vibe_coding')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { projects: [], error: new Error(error.message) }
  }

  return {
    projects: (data as VibeProjectRow[]).map(mapVibeProjectRow),
    error: null,
  }
}
