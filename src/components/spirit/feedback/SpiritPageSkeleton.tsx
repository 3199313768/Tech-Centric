import { SpiritHeroSkeleton } from '@/components/spirit/feedback/skeletons/SpiritHeroSkeleton'
import { SpiritListSkeleton } from '@/components/spirit/feedback/SpiritListSkeleton'

interface SpiritPageSkeletonProps {
  cardCount?: number
}

export function SpiritPageSkeleton({ cardCount = 6 }: SpiritPageSkeletonProps) {
  return (
    <div className="sg-page-skeleton__layout" aria-hidden>
      <SpiritHeroSkeleton />

      <div className="sg-skeleton-search-wrap">
        <div className="sg-skeleton-shimmer sg-skeleton-search" />
      </div>

      <div className="sg-skeleton-toolbar">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="sg-skeleton-shimmer sg-skeleton-chip" />
        ))}
      </div>

      <SpiritListSkeleton count={cardCount} />
    </div>
  )
}
