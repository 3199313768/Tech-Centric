'use client'

import { type ResourceItem } from '@/data/resources/initialResources'
import { ResourceFavicon } from '@/components/spirit/resource/ResourceFavicon'
import { SearchHighlight } from '@/components/spirit/resource/SearchHighlight'
import { getResourceAccent, getResourceCategoryLabel } from '@/utils/resourceCategory'
import { handleWatercolorHover } from '@/utils/watercolorHover'

export interface ResourceCardHandlers {
  onCopy: (e: React.MouseEvent, url: string, id: string) => void
  onTogglePin: (e: React.MouseEvent, id: string) => void
  onEdit: (e: React.MouseEvent, item: ResourceItem) => void
  onDeleteRequest: (e: React.MouseEvent, id: string) => void
  onDeleteConfirm: (e: React.MouseEvent, id: string) => void
  onDeleteCancel: (e: React.MouseEvent) => void
  onTagClick: (tag: string) => void
  onVisit: (id: string) => void
  onSelectToggle: (id: string) => void
}

interface ResourceCardProps {
  item: ResourceItem
  searchQuery: string
  nowTs: number
  isHovered: boolean
  isManageMode: boolean
  isSelected: boolean
  copyingId: string | null
  deleteConfirmId: string | null
  onHoverChange: (id: string | null) => void
  handlers: ResourceCardHandlers
}

export function ResourceCard({
  item,
  searchQuery,
  nowTs,
  isHovered,
  isManageMode,
  isSelected,
  copyingId,
  deleteConfirmId,
  onHoverChange,
  handlers,
}: ResourceCardProps) {
  const isNew = nowTs - item.createdAt < 7 * 24 * 60 * 60 * 1000 && !item.isPinned
  const accent = getResourceAccent(item.category)

  return (
    <div
      onMouseEnter={() => onHoverChange(item.id)}
      onMouseLeave={() => onHoverChange(null)}
      onMouseMove={handleWatercolorHover}
      className={`sg-card sg-card--watercolor sg-card--list sg-card--resource${item.isPinned ? ' sg-card--list-pinned' : ''}`}
      style={{ ['--resource-accent' as string]: accent, position: 'relative', minWidth: 0 }}
    >
      {item.isPinned ? <span className="sg-resource-card__ribbon">PINNED</span> : null}
      {isNew ? <span className="sg-resource-card__new">NEW</span> : null}

      {isManageMode ? (
        <input
          type="checkbox"
          className="sg-resource-card__checkbox"
          checked={isSelected}
          onChange={() => handlers.onSelectToggle(item.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`选择 ${item.name}`}
        />
      ) : null}

      <div
        className={`sg-resource-card__actions${isHovered ? ' sg-resource-card__actions--visible' : ''}`}
      >
        <button
          type="button"
          className="sg-resource-card__action-btn"
          onClick={(e) => handlers.onCopy(e, item.url, item.id)}
          title="复制链接"
        >
          {copyingId === item.id ? '✓' : '📄'}
        </button>
        <button
          type="button"
          className={`sg-resource-card__action-btn${item.isPinned ? ' sg-resource-card__action-btn--pinned' : ''}`}
          onClick={(e) => handlers.onTogglePin(e, item.id)}
          title={item.isPinned ? '取消置顶' : '置顶'}
        >
          📌
        </button>
        <button
          type="button"
          className="sg-resource-card__action-btn"
          onClick={(e) => handlers.onEdit(e, item)}
          title="编辑"
        >
          ✎
        </button>
        {deleteConfirmId === item.id ? (
          <>
            <button
              type="button"
              className="sg-resource-card__action-btn sg-resource-card__action-btn--danger"
              onClick={(e) => handlers.onDeleteConfirm(e, item.id)}
              title="确认删除"
            >
              ✓
            </button>
            <button
              type="button"
              className="sg-resource-card__action-btn"
              onClick={handlers.onDeleteCancel}
              title="取消"
            >
              ×
            </button>
          </>
        ) : (
          <button
            type="button"
            className="sg-resource-card__action-btn"
            onClick={(e) => handlers.onDeleteRequest(e, item.id)}
            title="删除"
          >
            🗑
          </button>
        )}
      </div>

      <div className="sg-resource-card__head">
        <ResourceFavicon url={item.url} category={item.category} name={item.name} />
        <span className="sg-resource-card__category">{getResourceCategoryLabel(item.category)}</span>
      </div>

      <h3 className="sg-resource-card__title">
        <SearchHighlight text={item.name} query={searchQuery} />
      </h3>

      <p className="sg-resource-card__desc">
        {item.description ? (
          <SearchHighlight text={item.description} query={searchQuery} />
        ) : (
          <span style={{ opacity: 0.5 }}>{item.url}</span>
        )}
      </p>

      {(item.tags ?? []).length > 0 ? (
        <div className="sg-resource-card__tags">
          {(item.tags ?? []).map((tag) => (
            <button
              key={tag}
              type="button"
              className="sg-resource-card__tag"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handlers.onTagClick(tag)
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      ) : null}

      <div className="sg-resource-card__meta">
        <span title="访问次数">🔥 {item.clickCount || 0}</span>
        <span title="添加日期">📅 {new Date(item.createdAt).toLocaleDateString()}</span>
      </div>

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="sg-resource-card__link"
        onClick={(e) => {
          e.stopPropagation()
          handlers.onVisit(item.id)
        }}
      >
        访问 →
        {item.clickCount ? (
          <span className="sg-resource-card__link-count">({item.clickCount} 次)</span>
        ) : null}
      </a>
    </div>
  )
}
