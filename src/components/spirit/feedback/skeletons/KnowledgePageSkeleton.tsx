import { SpiritHeroSkeleton } from '@/components/spirit/feedback/skeletons/SpiritHeroSkeleton'

function KbRecordSkeleton({ variant }: { variant: 'text' | 'code' | 'image' }) {
  return (
    <div className={`sg-skeleton-kb-card sg-kb-card sg-kb-card--${variant}`}>
      <div className="sg-skeleton-kb-card__meta">
        <div className="sg-skeleton-shimmer sg-skeleton-kb-card__type" />
        <div className="sg-skeleton-shimmer sg-skeleton-kb-card__date" />
      </div>
      {variant === 'image' ? (
        <div className="sg-skeleton-shimmer sg-skeleton-kb-card__media" />
      ) : (
        <>
          <div className="sg-skeleton-shimmer sg-skeleton-kb-card__title" />
          <div className="sg-skeleton-shimmer sg-skeleton-kb-card__line" />
          <div className="sg-skeleton-shimmer sg-skeleton-kb-card__line sg-skeleton-kb-card__line--short" />
        </>
      )}
      <div className="sg-skeleton-kb-card__tags">
        <div className="sg-skeleton-shimmer sg-skeleton-kb-card__tag" />
        <div className="sg-skeleton-shimmer sg-skeleton-kb-card__tag" />
      </div>
    </div>
  )
}

export function KnowledgePageSkeleton() {
  return (
    <div className="sg-page-skeleton__layout" aria-hidden>
      <SpiritHeroSkeleton theme="archive" statCount={2} />

      <div className="sg-toolbar-row sg-kb-toolbar">
        <div className="sg-skeleton-shimmer sg-skeleton-kb-search" />
      </div>

      <div className="sg-kb-layout">
        <main className="sg-kb-main">
          <div className="sg-kb-grid">
            <KbRecordSkeleton variant="text" />
            <KbRecordSkeleton variant="code" />
            <KbRecordSkeleton variant="image" />
            <KbRecordSkeleton variant="text" />
          </div>
        </main>

        <aside className="sg-kb-sidebar sg-skeleton-kb-sidebar">
          <div className="sg-skeleton-shimmer sg-skeleton-kb-sidebar__title" />
          <div className="sg-skeleton-kb-sidebar__tags">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="sg-skeleton-shimmer sg-skeleton-kb-sidebar__tag" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
