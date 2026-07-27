import { SpiritHeroSkeleton } from '@/components/spirit/feedback/skeletons/SpiritHeroSkeleton'

function ArchiveCardSkeleton() {
  return (
    <div className="sg-skeleton-archive-card sg-bento-archive__item">
      <div className="sg-skeleton-shimmer sg-skeleton-archive-card__media" />
      <div className="sg-skeleton-archive-card__body">
        <div className="sg-skeleton-shimmer sg-skeleton-archive-card__title" />
        <div className="sg-skeleton-shimmer sg-skeleton-archive-card__line" />
        <div className="sg-skeleton-shimmer sg-skeleton-archive-card__chip" />
      </div>
    </div>
  )
}

export function ArchivePageSkeleton() {
  return (
    <div className="sg-page-skeleton__layout" aria-hidden>
      <SpiritHeroSkeleton theme="archive" />

      <div className="sg-skeleton-toolbar sg-skeleton-toolbar--left">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="sg-skeleton-shimmer sg-skeleton-chip" />
        ))}
      </div>

      <div className="sg-archive-shelf sg-bento-archive sg-bento-archive--uniform">
        {[0, 1, 2, 3].map((index) => (
          <ArchiveCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
