'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ResourceItem } from '@/data/resources/initialResources'
import { mapResourceRow, type ResourceRow } from '@/lib/resources/mappers'
import { SITE_ROUTES } from '@/lib/site/routes'

function revalidateResourcesPath() {
  revalidatePath(SITE_ROUTES.resources)
}

function toDbRow(item: ResourceItem) {
  return {
    id: item.id,
    name: item.name,
    url: item.url,
    description: item.description || null,
    category: item.category,
    tags: item.tags || null,
    created_at: item.createdAt,
    is_pinned: item.isPinned ?? false,
    click_count: item.clickCount ?? 0,
  }
}

export async function saveResourceItem(item: ResourceItem): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('resources').upsert([toDbRow(item)], { onConflict: 'id' })

  if (error) return { error: error.message }
  revalidateResourcesPath()
  return { error: null }
}

export async function insertResourceItem(item: ResourceItem): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('resources').insert([toDbRow(item)])

  if (error) return { error: error.message }
  revalidateResourcesPath()
  return { error: null }
}

export async function updateResourceItem(
  id: string,
  patch: Partial<Pick<ResourceItem, 'name' | 'url' | 'description' | 'category' | 'tags' | 'isPinned' | 'clickCount'>>,
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const row: Record<string, unknown> = {}

  if (patch.name !== undefined) row.name = patch.name
  if (patch.url !== undefined) row.url = patch.url
  if (patch.description !== undefined) row.description = patch.description ?? null
  if (patch.category !== undefined) row.category = patch.category
  if (patch.tags !== undefined) row.tags = patch.tags ?? null
  if (patch.isPinned !== undefined) row.is_pinned = patch.isPinned
  if (patch.clickCount !== undefined) row.click_count = patch.clickCount

  const { error } = await supabase.from('resources').update(row).eq('id', id)

  if (error) return { error: error.message }
  revalidateResourcesPath()
  return { error: null }
}

export async function deleteResourceItem(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('resources').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidateResourcesPath()
  return { error: null }
}

export async function deleteResourceItems(ids: string[]): Promise<{ error: string | null }> {
  if (ids.length === 0) return { error: null }

  const supabase = await createClient()
  const { error } = await supabase.from('resources').delete().in('id', ids)

  if (error) return { error: error.message }
  revalidateResourcesPath()
  return { error: null }
}

export async function upsertResourceItems(items: ResourceItem[]): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('resources').upsert(items.map(toDbRow), { onConflict: 'id' })

  if (error) return { error: error.message }
  revalidateResourcesPath()
  return { error: null }
}

export async function fetchResourcesSnapshot(): Promise<{ items: ResourceItem[]; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('resources').select('*')

  if (error) return { items: [], error: error.message }
  return { items: (data as ResourceRow[]).map(mapResourceRow), error: null }
}
