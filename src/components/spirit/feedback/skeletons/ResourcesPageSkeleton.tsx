import { SpiritHeroSkeleton } from '@/components/spirit/feedback/skeletons/SpiritHeroSkeleton'
import { SpiritListSkeleton } from '@/components/spirit/feedback/SpiritListSkeleton'

function PinnedRailSkeleton() {
  return (
    <div className="sg-skeleton-rail">
      {[0, 1, 2].map((index) => (
        <div key={index} className="sg-skeleton-rail__item">
          <div className="sg-skeleton-shimmer sg-skeleton-rail__icon" />
          <div className="sg-skeleton-shimmer sg-skeleton-rail__line sg-skeleton-rail__line--title" />
          <div className="sg-skeleton-shimmer sg-skeleton-rail__line sg-skeleton-rail__line--meta" />
        </div>
      ))}
    </div>
  )
}

function ShelfSectionSkeleton({ cardCount = 3 }: { cardCount?: number }) {
  return (
    <section className="sg-skeleton-shelf">
      <header className="sg-skeleton-shelf__head">
        <div className="sg-skeleton-shimmer sg-skeleton-shelf__icon" />
        <div className="sg-skeleton-shimmer sg-skeleton-shelf__title" />
        <div className="sg-skeleton-shimmer sg-skeleton-shelf__count" />
      </header>
      <SpiritListSkeleton count={cardCount} className="sg-shelf--depth" />
    </section>
  )
}

export function ResourcesPageSkeleton() {
  return (
    <div className="sg-page-skeleton__layout" aria-hidden>
      <SpiritHeroSkeleton theme="library" />

      <div className="sg-skeleton-search-wrap">
        <div className="sg-skeleton-shimmer sg-skeleton-search" />
      </div>

      <div className="sg-skeleton-toolbar">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="sg-skeleton-shimmer sg-skeleton-chip" />
        ))}
      </div>

      <PinnedRailSkeleton />
      <ShelfSectionSkeleton cardCount={3} />
      <ShelfSectionSkeleton cardCount={2} />
    </div>
  )
}
