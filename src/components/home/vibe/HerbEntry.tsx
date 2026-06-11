'use client'

import { SpiritListCard } from '@/components/spirit/shell/SpiritListCard'
import { DeleteConfirmBar } from '@/components/spirit/feedback/DeleteConfirmBar'
import type { VibeEntry } from '@/lib/vibe/types'
import { scrollRevealClass, useScrollReveal } from '@/utils/useScrollReveal'

interface HerbEntryProps {
  entry: VibeEntry
  index: number
  dateLabel: string
  hoveredId: string | null
  deletingId: string | null
  confirmDeleteId: string | null
  onHover: (id: string | null) => void
  onEdit: (entry: VibeEntry) => void
  onOpen: (entry: VibeEntry) => void
  onRequestDelete: (e: React.MouseEvent, id: string) => void
  onConfirmDelete: (id: string) => void
  onCancelDelete: () => void
}

const KIND_LABELS: Record<VibeEntry['kind'], string> = {
  project: '实验',
  note: '笔记',
  article: '长文',
}

export function HerbEntry({
  entry,
  index,
  dateLabel,
  hoveredId,
  deletingId,
  confirmDeleteId,
  onHover,
  onEdit,
  onOpen,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: HerbEntryProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()
  const isExternal = entry.kind === 'project'
  const href = isExternal ? entry.url : undefined
  const linkLabel = isExternal ? '访问实验' : '阅读全文'

  return (
    <div
      ref={ref}
      className={`sg-herb-entry ${index % 2 === 0 ? 'sg-herb-entry--left' : 'sg-herb-entry--right'} ${scrollRevealClass(isVisible, index)}`}
    >
      <span className="sg-herb-entry__node" aria-hidden />
      <SpiritListCard
        variant="herb"
        index={0}
        href={href}
        onClick={isExternal ? undefined : () => onOpen(entry)}
        actionsVisible={hoveredId === entry.id || deletingId === entry.id || confirmDeleteId === entry.id}
        actions={
          <>
            <button
              type="button"
              className="sg-icon-btn"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit(entry)
              }}
              title="修改此手札"
              aria-label={`修改：${entry.name}`}
            >
              ✎
            </button>
            <button
              type="button"
              className="sg-icon-btn sg-icon-btn--danger"
              onClick={(e) => onRequestDelete(e, entry.id)}
              disabled={deletingId === entry.id}
              title="删除此手札"
              aria-label={`删除：${entry.name}`}
            >
              {deletingId === entry.id ? '...' : '×'}
            </button>
          </>
        }
      >
        <div
          onMouseEnter={() => onHover(entry.id)}
          onMouseLeave={() => onHover(null)}
        >
          <span className="sg-herb-date sg-tag sg-tag--leaf">
            {dateLabel} · {KIND_LABELS[entry.kind]}
          </span>
          <div className="sg-card__icon-wrap">{entry.icon}</div>
          <h3 className="sg-card__title">{entry.name}</h3>
          <p className="sg-card__desc">{entry.description}</p>
          <span className="sg-herb-link">{linkLabel}</span>
          {confirmDeleteId === entry.id ? (
            <DeleteConfirmBar
              message={`确定删除「${entry.name}」？不可撤销`}
              onCancel={onCancelDelete}
              onConfirm={() => onConfirmDelete(entry.id)}
              isLoading={deletingId === entry.id}
            />
          ) : null}
        </div>
      </SpiritListCard>
    </div>
  )
}
