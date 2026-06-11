'use client'

import { type ResourceItem } from '@/data/resources/initialResources'
import { ResourceFavicon } from '@/components/spirit/resource/ResourceFavicon'
import {
  getResourceAccent,
  getResourceCategoryLabel,
} from '@/utils/resourceCategory'

interface ResourcePinnedRailProps {
  items: ResourceItem[]
  onVisit: (item: ResourceItem) => void
}

export function ResourcePinnedRail({ items, onVisit }: ResourcePinnedRailProps) {
  const pinned = items.filter((i) => i.isPinned).slice(0, 6)
  if (pinned.length === 0) return null

  return (
    <div className="sg-resource-rail" aria-label="置顶书签">
      {pinned.map((item) => (
        <button
          key={item.id}
          type="button"
          className="sg-resource-rail__item"
          style={{ ['--resource-accent' as string]: getResourceAccent(item.category) }}
          onClick={() => onVisit(item)}
        >
          <div className="sg-resource-rail__head">
            <div className="sg-resource-rail__icon">
              <ResourceFavicon
                url={item.url}
                category={item.category}
                name={item.name}
                size={32}
                className=""
              />
            </div>
            <div>
              <p className="sg-resource-rail__name">{item.name}</p>
              <span className="sg-resource-rail__meta">
                {getResourceCategoryLabel(item.category)} · 🔥 {item.clickCount || 0}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
