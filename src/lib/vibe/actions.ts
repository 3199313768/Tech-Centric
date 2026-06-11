'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SITE_ROUTES } from '@/lib/site/routes'

export interface SaveVibeProjectInput {
  id?: string
  name: string
  icon: string
  description: string
  url: string
}

export async function saveVibeProject(input: SaveVibeProjectInput): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const row = {
    name: input.name,
    icon: input.icon,
    description: input.description,
    url: input.url,
  }

  const { error } = input.id
    ? await supabase.from('vibe_coding').update(row).eq('id', input.id)
    : await supabase.from('vibe_coding').insert([{ id: crypto.randomUUID(), ...row }])

  if (error) return { error: error.message }
  revalidatePath(SITE_ROUTES.vibe)
  return { error: null }
}

export async function deleteVibeProject(projectId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('vibe_coding').delete().eq('id', projectId)

  if (error) return { error: error.message }
  revalidatePath(SITE_ROUTES.vibe)
  return { error: null }
}
