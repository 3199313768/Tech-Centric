'use client'

import { type ResourceItem } from '@/data/resources/initialResources'
import {
  ResourceCard,
  type ResourceCardHandlers,
} from '@/components/spirit/resource/ResourceCard'
import {
  getResourceCategoryIcon,
  getResourceCategoryLabel,
} from '@/utils/resourceCategory'

interface ResourceShelfGridProps {
  items: ResourceItem[]
  categories: string[]
  filter: string | 'all'
  searchQuery: string
  nowTs: number
  hoveredId: string | null
  isManageMode: boolean
  selectedIds: Set<string>
  copyingId: string | null
  deleteConfirmId: string | null
  onHoverChange: (id: string | null) => void
  handlers: ResourceCardHandlers
}

function renderCard(
  item: ResourceItem,
  props: Omit<ResourceShelfGridProps, 'items' | 'categories' | 'filter'>,
) {
  return (
    <ResourceCard
      key={item.id}
      item={item}
      searchQuery={props.searchQuery}
      nowTs={props.nowTs}
      isHovered={props.hoveredId === item.id}
      isManageMode={props.isManageMode}
      isSelected={props.selectedIds.has(item.id)}
      copyingId={props.copyingId}
      deleteConfirmId={props.deleteConfirmId}
      onHoverChange={props.onHoverChange}
      handlers={props.handlers}
    />
  )
}

export function ResourceShelfGrid({
  items,
  categories,
  filter,
  searchQuery,
  nowTs,
  hoveredId,
  isManageMode,
  selectedIds,
  copyingId,
  deleteConfirmId,
  onHoverChange,
  handlers,
}: ResourceShelfGridProps) {
  const cardProps = {
    searchQuery,
    nowTs,
    hoveredId,
    isManageMode,
    selectedIds,
    copyingId,
    deleteConfirmId,
    onHoverChange,
    handlers,
  }

  const useShelfLayout = filter === 'all' && !searchQuery.trim()

  if (items.length === 0) {
    return null
  }

  if (!useShelfLayout) {
    return (
      <div className="sg-resource-grid">
        {items.map((item) => renderCard(item, cardProps))}
      </div>
    )
  }

  const shelfCategories = categories.filter((cat) =>
    items.some((item) => item.category === cat),
  )

  return (
    <div className="sg-resource-shelves">
      {shelfCategories.map((category) => {
        const sectionItems = items.filter((item) => item.category === category)
        if (sectionItems.length === 0) return null

        return (
          <section key={category} className="sg-resource-shelf">
            <header className="sg-resource-shelf__head">
              <span className="sg-resource-shelf__icon" aria-hidden>
                {getResourceCategoryIcon(category)}
              </span>
              <h2 className="sg-resource-shelf__title">{getResourceCategoryLabel(category)}</h2>
              <span className="sg-resource-shelf__count">{sectionItems.length} 项</span>
            </header>
            <div className="sg-resource-shelf__grid">
              {sectionItems.map((item) => renderCard(item, cardProps))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
