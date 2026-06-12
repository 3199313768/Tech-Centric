'use server'

import { revalidatePath } from 'next/cache'
import { requireAuthenticatedUser } from '@/lib/auth/requireUser'
import { createClient } from '@/lib/supabase/server'
import { buildProjectSlug } from '@/lib/projects/slug'
import { scheduleRagReindex } from '@/lib/rag/reindexTrigger'
import type { VibeKind } from '@/lib/vibe/types'
import { SITE_ROUTES } from '@/lib/site/routes'

export interface SaveVibeEntryInput {
  id?: string
  name: string
  icon: string
  description: string
  url: string
  kind: VibeKind
  body?: string
  isPublic?: boolean
  tags?: string[]
  slug?: string
}

export async function saveVibeProject(input: SaveVibeEntryInput): Promise<{ error: string | null }> {
  const { error: authError } = await requireAuthenticatedUser()
  if (authError) return { error: authError }

  const supabase = await createClient()
  const entryId = input.id ?? crypto.randomUUID()
  const slug = input.slug?.trim() || buildProjectSlug(input.name, entryId)

  const row = {
    name: input.name,
    icon: input.icon,
    description: input.description,
    url: input.url,
    kind: input.kind,
    body: input.body ?? '',
    is_public: input.isPublic ?? false,
    tags: input.tags ?? [],
    slug,
  }

  const { error } = input.id
    ? await supabase.from('vibe_coding').update(row).eq('id', input.id)
    : await supabase.from('vibe_coding').insert([{ id: entryId, ...row }])

  if (error) return { error: error.message }
  revalidatePath(SITE_ROUTES.vibe)
  revalidatePath(`${SITE_ROUTES.vibe}/${slug}`)
  if (input.isPublic && (input.kind === 'note' || input.kind === 'article')) {
    scheduleRagReindex('vibe_save')
  }
  return { error: null }
}

export async function deleteVibeProject(projectId: string): Promise<{ error: string | null }> {
  const { error: authError } = await requireAuthenticatedUser()
  if (authError) return { error: authError }

  const supabase = await createClient()
  const { error } = await supabase.from('vibe_coding').delete().eq('id', projectId)

  if (error) return { error: error.message }
  revalidatePath(SITE_ROUTES.vibe)
  scheduleRagReindex('vibe_delete')
  return { error: null }
}
