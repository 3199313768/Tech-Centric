import { Suspense } from 'react'
import { SiteSearchView } from '@/components/home/search/SiteSearchView'
import { SitePageFallback } from '@/components/spirit/feedback/SitePageFallback'
import { searchSite } from '@/lib/site/search'

export const metadata = {
  title: '搜索 · SpiritGarden',
  description: '全站内容搜索。',
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

async function SearchPageContent({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q.trim() : ''
  const results = query.length >= 2 ? await searchSite(query) : []

  return <SiteSearchView query={query} results={results} />
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--archive">
      <Suspense fallback={<SitePageFallback label="搜索" variant="archive" />}>
        <SearchPageContent {...props} />
      </Suspense>
    </div>
  )
}
