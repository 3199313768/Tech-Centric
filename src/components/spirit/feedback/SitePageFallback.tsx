import { SpiritListSkeleton } from '@/components/spirit/feedback/SpiritListSkeleton'

interface SitePageFallbackProps {
  label?: string
}

export function SitePageFallback({ label = '页面' }: SitePageFallbackProps) {
  return (
    <div className="spirit-garden-content sg-subpage sg-page" role="status" aria-live="polite">
      <SpiritListSkeleton count={4} />
      <p className="sg-state__label sg-state--loading-label">{label}加载中...</p>
    </div>
  )
}
