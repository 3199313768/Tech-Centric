interface SpiritListSkeletonProps {
  count?: number
  className?: string
}

export function SpiritListSkeleton({ count = 3, className = '' }: SpiritListSkeletonProps) {
  return (
    <div className={`sg-skeleton-grid ${className}`.trim()} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="sg-skeleton sg-skeleton--paper sg-card">
          <div className="sg-skeleton__line sg-skeleton__line--short" />
          <div className="sg-skeleton__line" />
          <div className="sg-skeleton__line sg-skeleton__line--medium" />
        </div>
      ))}
    </div>
  )
}
