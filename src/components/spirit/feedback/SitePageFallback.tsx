import { SpiritLoadingIndicator } from '@/components/spirit/feedback/SpiritLoadingIndicator'
import { SpiritPageSkeleton } from '@/components/spirit/feedback/SpiritPageSkeleton'
import {
  ArchivePageSkeleton,
  HerbPageSkeleton,
  KnowledgePageSkeleton,
  ResourcesPageSkeleton,
  WorkshopPageSkeleton,
  type SitePageSkeletonVariant,
} from '@/components/spirit/feedback/skeletons'

interface SitePageFallbackProps {
  label?: string
  variant?: SitePageSkeletonVariant
}

function renderPageSkeleton(variant: SitePageSkeletonVariant) {
  switch (variant) {
    case 'resources':
      return <ResourcesPageSkeleton />
    case 'archive':
      return <ArchivePageSkeleton />
    case 'workshop':
      return <WorkshopPageSkeleton />
    case 'herb':
      return <HerbPageSkeleton />
    case 'knowledge':
      return <KnowledgePageSkeleton />
    default:
      return <SpiritPageSkeleton />
  }
}

export function SitePageFallback({ label = '页面', variant = 'default' }: SitePageFallbackProps) {
  return (
    <div className="sg-page sg-page-skeleton" aria-busy="true">
      {renderPageSkeleton(variant)}
      <SpiritLoadingIndicator label={`${label}加载中…`} />
    </div>
  )
}
