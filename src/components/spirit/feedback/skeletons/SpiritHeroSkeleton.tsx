import type { SpiritSubpageTheme } from '@/components/spirit/shell/SpiritSubpageHero'

interface SpiritHeroSkeletonProps {
  theme?: SpiritSubpageTheme
  statCount?: number
}

export function SpiritHeroSkeleton({ theme = 'archive', statCount = 3 }: SpiritHeroSkeletonProps) {
  return (
    <header className={`sg-skeleton-hero sg-subpage-hero sg-subpage-hero--${theme}`}>
      <div className="sg-subpage-hero__wash" />
      <div className="sg-skeleton-hero__inner">
        <div className="sg-skeleton-hero__copy">
          <div className="sg-skeleton-shimmer sg-skeleton-hero__eyebrow" />
          <div className="sg-skeleton-shimmer sg-skeleton-hero__title" />
          <div className="sg-skeleton-shimmer sg-skeleton-hero__lead" />
          <div className="sg-skeleton-shimmer sg-skeleton-hero__lead sg-skeleton-hero__lead--short" />
        </div>
        <div className="sg-skeleton-hero__stats">
          {Array.from({ length: statCount }, (_, index) => (
            <div key={index} className="sg-skeleton-hero__stat">
              <div className="sg-skeleton-shimmer sg-skeleton-hero__stat-value" />
              <div className="sg-skeleton-shimmer sg-skeleton-hero__stat-label" />
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
