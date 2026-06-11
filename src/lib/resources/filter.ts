import type { ResourceItem } from '@/data/resources/initialResources'

export function filterAndSortResources(
  items: ResourceItem[],
  filter: string | 'all',
  searchQuery: string,
): ResourceItem[] {
  const queryStr = searchQuery.trim().toLowerCase()

  return items
    .filter((item) => {
      if (!queryStr) return filter === 'all' ? true : item.category === filter

      const name = (item.name ?? '').toLowerCase()
      const desc = (item.description ?? '').toLowerCase()
      const tagsStr = (item.tags ?? []).join(' ').toLowerCase()
      const categoryMatch = filter === 'all' ? true : item.category === filter
      const searchTerms = queryStr.split(/\s+/)
      const textMatch = searchTerms.every(
        (term) => name.includes(term) || desc.includes(term) || tagsStr.includes(term),
      )

      return categoryMatch && textMatch
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      const clickDiff = (b.clickCount || 0) - (a.clickCount || 0)
      if (clickDiff !== 0) return clickDiff
      return b.createdAt - a.createdAt
    })
}
