import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { SitePageFallback } from '@/components/spirit/feedback/SitePageFallback'
import { getSessionProfile } from '@/lib/auth/getSessionProfile'
import { SITE_ROLE } from '@/lib/auth/roles'
import { fetchResourcesPageData } from '@/lib/resources/queries'

const ResourceLinks = dynamic(
  () => import('@/components/home/resources/ResourceLinks').then((m) => ({ default: m.ResourceLinks })),
  { loading: () => <SitePageFallback label="资源库" variant="resources" /> },
)

export const metadata = {
  title: '资源库 · SpiritGarden',
  description: '学习、工具与设计相关的精选资源链接。',
}

async function ResourcesPageContent() {
  const [{ items, categories, error }, profile] = await Promise.all([
    fetchResourcesPageData(),
    getSessionProfile(),
  ])

  if (error) {
    return <div className="sg-kb-error">加载资源失败：{error.message}</div>
  }

  const canManage = profile?.role === SITE_ROLE.super_admin

  return (
    <ResourceLinks initialItems={items} initialCategories={categories} canManage={canManage} />
  )
}

export default function ResourcesPage() {
  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--library">
      <Suspense fallback={<SitePageFallback label="资源库" variant="resources" />}>
        <ResourcesPageContent />
      </Suspense>
    </div>
  )
}
