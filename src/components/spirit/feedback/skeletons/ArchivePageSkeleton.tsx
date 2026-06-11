import { SpiritHeroSkeleton } from '@/components/spirit/feedback/skeletons/SpiritHeroSkeleton'

function ArchiveFeaturedSkeleton() {
  return (
    <div className="sg-skeleton-archive-featured sg-bento-archive__featured">
      <div className="sg-skeleton-shimmer sg-skeleton-archive-featured__media" />
      <div className="sg-skeleton-archive-featured__body">
        <div className="sg-skeleton-shimmer sg-skeleton-archive-featured__eyebrow" />
        <div className="sg-skeleton-shimmer sg-skeleton-archive-featured__title" />
        <div className="sg-skeleton-shimmer sg-skeleton-archive-featured__line" />
        <div className="sg-skeleton-shimmer sg-skeleton-archive-featured__line sg-skeleton-archive-featured__line--short" />
        <div className="sg-skeleton-archive-featured__tags">
          <div className="sg-skeleton-shimmer sg-skeleton-archive-featured__tag" />
          <div className="sg-skeleton-shimmer sg-skeleton-archive-featured__tag" />
        </div>
      </div>
    </div>
  )
}

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

      <div className="sg-archive-shelf sg-bento-archive">
        <ArchiveFeaturedSkeleton />
        {[0, 1, 2].map((index) => (
          <ArchiveCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
