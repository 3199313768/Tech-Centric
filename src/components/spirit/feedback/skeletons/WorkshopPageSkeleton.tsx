import { SpiritHeroSkeleton } from '@/components/spirit/feedback/skeletons/SpiritHeroSkeleton'

function WorkshopCardSkeleton() {
  return (
    <div className="sg-skeleton-workshop-card sg-card sg-card--list">
      <div className="sg-skeleton-workshop-card__head">
        <div className="sg-skeleton-shimmer sg-skeleton-workshop-card__icon" />
        <div className="sg-skeleton-workshop-card__meta">
          <div className="sg-skeleton-shimmer sg-skeleton-workshop-card__title" />
          <div className="sg-skeleton-shimmer sg-skeleton-workshop-card__platform" />
        </div>
      </div>
      <div className="sg-skeleton-shimmer sg-skeleton-workshop-card__line" />
      <div className="sg-skeleton-shimmer sg-skeleton-workshop-card__line sg-skeleton-workshop-card__line--short" />
      <div className="sg-skeleton-workshop-card__tags">
        <div className="sg-skeleton-shimmer sg-skeleton-workshop-card__tag" />
        <div className="sg-skeleton-shimmer sg-skeleton-workshop-card__tag" />
      </div>
    </div>
  )
}

function WorkshopSectionSkeleton({ wideTitle = false }: { wideTitle?: boolean }) {
  return (
    <section className="sg-workshop-section">
      <header className="sg-workshop-section__head">
        <span className="sg-skeleton-shimmer sg-skeleton-workshop-section__dot" aria-hidden />
        <div className="sg-workshop-section__copy">
          <div
            className={`sg-skeleton-shimmer sg-skeleton-workshop-section__title${wideTitle ? ' sg-skeleton-workshop-section__title--wide' : ''}`}
          />
          <div className="sg-skeleton-shimmer sg-skeleton-workshop-section__hint" />
        </div>
        <div className="sg-skeleton-shimmer sg-skeleton-workshop-section__count" />
      </header>
      <div className="sg-workshop-grid">
        {[0, 1, 2].map((index) => (
          <WorkshopCardSkeleton key={index} />
        ))}
      </div>
    </section>
  )
}

export function WorkshopPageSkeleton() {
  return (
    <div className="sg-page-skeleton__layout" aria-hidden>
      <SpiritHeroSkeleton theme="workshop" />

      <section className="sg-workshop-panel sg-skeleton-workshop-panel">
        <div className="sg-workshop-panel__row">
          <span className="sg-workshop-panel__label">平台</span>
          <div className="sg-skeleton-toolbar sg-skeleton-toolbar--left">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="sg-skeleton-shimmer sg-skeleton-chip" />
            ))}
          </div>
        </div>
        <div className="sg-workshop-panel__row">
          <span className="sg-workshop-panel__label">标签</span>
          <div className="sg-skeleton-toolbar sg-skeleton-toolbar--left">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="sg-skeleton-shimmer sg-skeleton-chip sg-skeleton-chip--tag" />
            ))}
          </div>
        </div>
        <div className="sg-skeleton-shimmer sg-skeleton-workshop-panel__summary" />
      </section>

      <div className="sg-workshop-catalog">
        <WorkshopSectionSkeleton />
        <WorkshopSectionSkeleton wideTitle />
      </div>
    </div>
  )
}
