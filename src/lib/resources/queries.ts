import { createClient } from '@/lib/supabase/server'
import type { ResourceItem } from '@/data/resources/initialResources'
import { deriveResourceCategories, mapResourceRow, type ResourceRow } from '@/lib/resources/mappers'

export interface ResourcesPageData {
  items: ResourceItem[]
  categories: string[]
  error: Error | null
}

export async function fetchResourcesPageData(): Promise<ResourcesPageData> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('resources').select('*')

  if (error) {
    return { items: [], categories: [...deriveResourceCategories([])], error: new Error(error.message) }
  }

  const items = (data as ResourceRow[]).map(mapResourceRow)
  return {
    items,
    categories: deriveResourceCategories(items),
    error: null,
  }
}
