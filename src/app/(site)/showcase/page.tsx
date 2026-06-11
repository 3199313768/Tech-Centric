import { Suspense } from 'react'
import { ShowcaseGallery } from '@/components/home/showcase/ShowcaseGallery'
import { SitePageFallback } from '@/components/spirit/feedback/SitePageFallback'
import { fetchShowcaseItems } from '@/lib/showcase/queries'

export const metadata = {
  title: '公开展柜 · SpiritGarden',
  description: '公开项目、草本集长文与知识库片段聚合展示。',
}

export default async function ShowcasePage() {
  const items = await fetchShowcaseItems()

  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--library">
      <Suspense fallback={<SitePageFallback label="公开展柜" variant="archive" />}>
        <ShowcaseGallery items={items} />
      </Suspense>
    </div>
  )
}
