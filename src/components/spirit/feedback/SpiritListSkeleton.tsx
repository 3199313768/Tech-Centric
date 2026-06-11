interface SpiritListSkeletonProps {
  count?: number
  className?: string
}

function SpiritCardSkeleton() {
  return (
    <div className="sg-skeleton-card sg-card sg-card--list">
      <div className="sg-skeleton-card__ribbon sg-skeleton-shimmer" />
      <div className="sg-skeleton-card__head">
        <div className="sg-skeleton-shimmer sg-skeleton-card__icon" />
        <div className="sg-skeleton-shimmer sg-skeleton-card__chip" />
      </div>
      <div className="sg-skeleton-shimmer sg-skeleton-card__title" />
      <div className="sg-skeleton-shimmer sg-skeleton-card__line" />
      <div className="sg-skeleton-shimmer sg-skeleton-card__line sg-skeleton-card__line--short" />
      <div className="sg-skeleton-card__tags">
        <div className="sg-skeleton-shimmer sg-skeleton-card__tag" />
        <div className="sg-skeleton-shimmer sg-skeleton-card__tag" />
        <div className="sg-skeleton-shimmer sg-skeleton-card__tag sg-skeleton-card__tag--narrow" />
      </div>
      <div className="sg-skeleton-card__meta">
        <div className="sg-skeleton-shimmer sg-skeleton-card__meta-item" />
        <div className="sg-skeleton-shimmer sg-skeleton-card__meta-item sg-skeleton-card__meta-item--wide" />
      </div>
    </div>
  )
}

export function SpiritListSkeleton({ count = 3, className = '' }: SpiritListSkeletonProps) {
  return (
    <div className={`sg-skeleton-grid ${className}`.trim()} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <SpiritCardSkeleton key={index} />
      ))}
    </div>
  )
}
