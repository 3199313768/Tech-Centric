interface SitePageFallbackProps {
  label?: string
}

export function SitePageFallback({ label = '页面' }: SitePageFallbackProps) {
  return (
    <div className="spirit-garden-content sg-subpage">
      <div className="sg-state sg-state--loading" role="status" aria-live="polite">
        <div className="sg-skeleton sg-skeleton--paper sg-skeleton--hero" aria-hidden />
        <p className="sg-state__label">{label}加载中...</p>
      </div>
    </div>
  )
}
