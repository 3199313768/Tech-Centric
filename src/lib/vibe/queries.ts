import { createClient } from '@/lib/supabase/server'
import { mapVibeEntryRow, type VibeEntryRow } from '@/lib/vibe/mappers'
import type { VibeEntry } from '@/lib/vibe/types'

export interface VibePageData {
  entries: VibeEntry[]
  error: Error | null
}

/** @deprecated 使用 VibeEntry */
export type VibeProject = VibeEntry

export async function fetchVibePageData(): Promise<VibePageData> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vibe_coding')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { entries: [], error: new Error(error.message) }
  }

  return {
    entries: (data as VibeEntryRow[]).map(mapVibeEntryRow),
    error: null,
  }
}

export async function fetchVibeEntryBySlug(slug: string): Promise<VibeEntry | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vibe_coding')
    .select('*')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapVibeEntryRow(data as VibeEntryRow)
}
