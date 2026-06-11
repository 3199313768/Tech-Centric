'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SITE_ROUTES } from '@/lib/site/routes'

export interface SaveAiSkillInput {
  id?: string
  name: string
  icon: string
  description: string
  tags: string[]
  platform?: string
  link?: string
}

export async function saveAiSkill(input: SaveAiSkillInput): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const row = {
    name: input.name,
    icon: input.icon,
    description: input.description,
    tags: input.tags,
    platform: input.platform || null,
    link: input.link || null,
  }

  const { error } = input.id
    ? await supabase.from('ai_skills').update(row).eq('id', input.id)
    : await supabase.from('ai_skills').insert([{ id: crypto.randomUUID(), ...row }])

  if (error) return { error: error.message }
  revalidatePath(SITE_ROUTES.skills)
  return { error: null }
}

export async function deleteAiSkill(skillId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('ai_skills').delete().eq('id', skillId)

  if (error) return { error: error.message }
  revalidatePath(SITE_ROUTES.skills)
  return { error: null }
}
