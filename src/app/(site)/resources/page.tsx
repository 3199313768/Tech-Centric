import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { SitePageFallback } from '@/components/spirit/feedback/SitePageFallback'
import { fetchResourcesPageData } from '@/lib/resources/queries'

const ResourceLinks = dynamic(
  () => import('@/components/home/resources/ResourceLinks').then((m) => ({ default: m.ResourceLinks })),
  { loading: () => <SitePageFallback label="资源库" /> },
)

export const metadata = {
  title: '资源库 · SpiritGarden',
  description: '学习、工具与设计相关的精选资源链接。',
}

async function ResourcesPageContent() {
  const { items, categories, error } = await fetchResourcesPageData()

  if (error) {
    return <div className="sg-kb-error">加载资源失败：{error.message}</div>
  }

  return <ResourceLinks initialItems={items} initialCategories={categories} />
}

export default function ResourcesPage() {
  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--library">
      <Suspense fallback={<SitePageFallback label="资源库" />}>
        <ResourcesPageContent />
      </Suspense>
    </div>
  )
}
