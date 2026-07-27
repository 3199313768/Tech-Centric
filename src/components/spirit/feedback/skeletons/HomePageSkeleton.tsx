function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`sg-skeleton-shimmer ${className}`.trim()} />
}

export function HomePageSkeleton() {
  return (
    <div className="sg-home-skeleton" aria-hidden>
      <section className="sg-hero-stage sg-hero-stage--garden sg-home-skeleton__hero">
        <div className="sg-home-skeleton__hero-inner">
          <div className="sg-home-skeleton__profile">
            <SkeletonLine className="sg-home-skeleton__avatar" />
            <SkeletonLine className="sg-home-skeleton__name" />
            <SkeletonLine className="sg-home-skeleton__badge" />
          </div>
          <SkeletonLine className="sg-home-skeleton__title" />
          <SkeletonLine className="sg-home-skeleton__lead" />
          <SkeletonLine className="sg-home-skeleton__lead sg-home-skeleton__lead--short" />
          <div className="sg-home-skeleton__actions">
            <SkeletonLine className="sg-home-skeleton__button" />
            <SkeletonLine className="sg-home-skeleton__button" />
          </div>
        </div>
      </section>

      <main className="sg-main sg-main--garden">
        <div className="sg-home-skeleton__proof">
          {[0, 1, 2].map(item => <SkeletonLine key={item} className="sg-home-skeleton__proof-item" />)}
        </div>
        <div className="sg-garden-grid">
          <article className="sg-card sg-card--featured sg-home-skeleton__card sg-home-skeleton__featured">
            <SkeletonLine className="sg-home-skeleton__card-eyebrow" />
            <SkeletonLine className="sg-home-skeleton__card-title" />
            <SkeletonLine className="sg-home-skeleton__card-line" />
            <SkeletonLine className="sg-home-skeleton__media" />
          </article>
          <article className="sg-card sg-card--meter sg-home-skeleton__card">
            <SkeletonLine className="sg-home-skeleton__card-title" />
            {[0, 1, 2].map(item => <SkeletonLine key={item} className="sg-home-skeleton__meter" />)}
          </article>
          <article className="sg-card sg-card--lab sg-home-skeleton__card">
            <SkeletonLine className="sg-home-skeleton__card-title" />
            <SkeletonLine className="sg-home-skeleton__card-line" />
            <SkeletonLine className="sg-home-skeleton__card-line sg-home-skeleton__card-line--short" />
          </article>
          <article className="sg-card sg-card--skills sg-home-skeleton__card">
            <SkeletonLine className="sg-home-skeleton__card-title" />
            <div className="sg-home-skeleton__chips">
              {[0, 1, 2, 3].map(item => <SkeletonLine key={item} className="sg-home-skeleton__chip" />)}
            </div>
          </article>
        </div>
      </main>
    </div>
  )
}
