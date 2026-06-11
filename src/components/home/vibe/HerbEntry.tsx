'use client'

import { SpiritListCard } from '@/components/spirit/shell/SpiritListCard'
import { DeleteConfirmBar } from '@/components/spirit/feedback/DeleteConfirmBar'
import type { VibeProject } from '@/lib/vibe/queries'
import { scrollRevealClass, useScrollReveal } from '@/utils/useScrollReveal'

interface HerbEntryProps {
  project: VibeProject
  index: number
  dateLabel: string
  hoveredId: string | null
  deletingId: string | null
  confirmDeleteId: string | null
  onHover: (id: string | null) => void
  onEdit: (project: VibeProject) => void
  onRequestDelete: (e: React.MouseEvent, id: string) => void
  onConfirmDelete: (id: string) => void
  onCancelDelete: () => void
}

export function HerbEntry({
  project,
  index,
  dateLabel,
  hoveredId,
  deletingId,
  confirmDeleteId,
  onHover,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: HerbEntryProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`sg-herb-entry ${index % 2 === 0 ? 'sg-herb-entry--left' : 'sg-herb-entry--right'} ${scrollRevealClass(isVisible, index)}`}
    >
      <span className="sg-herb-entry__node" aria-hidden />
      <SpiritListCard
        variant="herb"
        index={0}
        href={project.url}
        actionsVisible={hoveredId === project.id || deletingId === project.id || confirmDeleteId === project.id}
        actions={
          <>
            <button
              type="button"
              className="sg-icon-btn"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit(project)
              }}
              title="修改此项目"
            >
              ✎
            </button>
            <button
              type="button"
              className="sg-icon-btn sg-icon-btn--danger"
              onClick={(e) => onRequestDelete(e, project.id)}
              disabled={deletingId === project.id}
              title="删除此项目"
            >
              {deletingId === project.id ? '...' : '×'}
            </button>
          </>
        }
      >
        <div
          onMouseEnter={() => onHover(project.id)}
          onMouseLeave={() => onHover(null)}
        >
          <span className="sg-herb-date sg-tag sg-tag--leaf">{dateLabel}</span>
          <div className="sg-card__icon-wrap">{project.icon}</div>
          <h3 className="sg-card__title">{project.name}</h3>
          <p className="sg-card__desc">{project.description}</p>
          <span className="sg-herb-link">访问实验</span>
          {confirmDeleteId === project.id ? (
            <DeleteConfirmBar
              message={`确定删除「${project.name}」？不可撤销`}
              onCancel={onCancelDelete}
              onConfirm={() => onConfirmDelete(project.id)}
              isLoading={deletingId === project.id}
            />
          ) : null}
        </div>
      </SpiritListCard>
    </div>
  )
}
