import { SpiritHeroSkeleton } from '@/components/spirit/feedback/skeletons/SpiritHeroSkeleton'

function HerbEntrySkeleton({ side }: { side: 'left' | 'right' }) {
  return (
    <article className={`sg-skeleton-herb-entry sg-herb-entry sg-herb-entry--${side}`}>
      <span className="sg-skeleton-shimmer sg-skeleton-herb-entry__node" aria-hidden />
      <div className="sg-skeleton-herb-entry__card sg-card sg-card--list">
        <div className="sg-skeleton-shimmer sg-skeleton-herb-entry__date" />
        <div className="sg-skeleton-shimmer sg-skeleton-herb-entry__title" />
        <div className="sg-skeleton-shimmer sg-skeleton-herb-entry__line" />
        <div className="sg-skeleton-shimmer sg-skeleton-herb-entry__line sg-skeleton-herb-entry__line--short" />
        <div className="sg-skeleton-shimmer sg-skeleton-herb-entry__link" />
      </div>
    </article>
  )
}

export function HerbPageSkeleton() {
  return (
    <div className="sg-page-skeleton__layout" aria-hidden>
      <SpiritHeroSkeleton theme="herb" />

      <div className="sg-herb-journal sg-skeleton-herb-journal">
        <HerbEntrySkeleton side="left" />
        <HerbEntrySkeleton side="right" />
        <HerbEntrySkeleton side="left" />
      </div>
    </div>
  )
}
