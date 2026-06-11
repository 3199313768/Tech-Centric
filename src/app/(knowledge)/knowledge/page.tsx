import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/knowledge/browse/SearchBar'
import { LoginForm } from '@/components/knowledge/auth/LoginForm'
import { RecordList } from '@/components/knowledge/browse/RecordList'
import { MobileFab } from '@/components/knowledge/capture/MobileFab'
import { TagFilterBar } from '@/components/knowledge/browse/TagFilterBar'
import { SpiritSubpageHero } from '@/components/spirit/shell/SpiritSubpageHero'
import { SitePageFallback } from '@/components/spirit/feedback/SitePageFallback'
import { fetchKnowledgePageData } from '@/lib/knowledge/queries'
import { parseKnowledgeSearchParams } from '@/lib/knowledge/types'

export const metadata = {
  title: 'Knowledge Base',
  description: 'Personal fragmented knowledge and snippets',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function KnowledgePageContent({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="spirit-garden-content sg-subpage sg-subpage--archive sg-kb-login-wrap">
        <LoginForm />
      </div>
    )
  }

  const resolvedParams = await searchParams
  const { query, tagsFilter, typeFilter } = parseKnowledgeSearchParams(resolvedParams)
  const { records, uniqueTags, hasMore, recordsError } = await fetchKnowledgePageData(user.id, {
    query,
    tagsFilter,
    typeFilter,
  })

  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--archive">
      <SpiritSubpageHero
        theme="archive"
        eyebrow="SpiritGarden Archive"
        title="碎片知识库"
        lead={
          <>
            按 <kbd className="sg-kb-kbd">Cmd</kbd> + <kbd className="sg-kb-kbd">K</kbd>{' '}
            随时快速归档；支持笔记、代码、图片与附件。
          </>
        }
        stats={[
          { label: '当前记录', value: records.length },
          { label: '标签数', value: uniqueTags.length },
        ]}
      />

      <div className="sg-toolbar-row sg-kb-toolbar">
        <SearchBar initialQuery={query} initialTags={tagsFilter} initialType={typeFilter} />
      </div>

      {uniqueTags.length > 0 ? (
        <div className="sg-kb-tag-mobile-only">
          <h3 className="sg-kb-sidebar-title">常用标签</h3>
          <TagFilterBar
            tags={uniqueTags}
            activeTags={tagsFilter}
            query={query}
            typeFilter={typeFilter}
            variant="mobile"
          />
        </div>
      ) : null}

      <div className="sg-kb-layout">
        <main className="sg-kb-main">
          {recordsError ? (
            <div className="sg-kb-error">
              加载记录失败：{recordsError.message}
            </div>
          ) : (
            <RecordList
              initialRecords={records}
              initialHasMore={hasMore}
              initialQuery={query}
              initialTags={tagsFilter}
              initialType={typeFilter}
            />
          )}
        </main>

        <aside className="sg-kb-sidebar">
          <div className="sg-kb-sidebar-sticky">
            <h3 className="sg-kb-sidebar-title">常用标签</h3>
            <TagFilterBar
              tags={uniqueTags}
              activeTags={tagsFilter}
              query={query}
              typeFilter={typeFilter}
              variant="sidebar"
            />
          </div>
        </aside>
      </div>

      <MobileFab />
    </div>
  )
}

export default function KnowledgePage(props: PageProps) {
  return (
    <Suspense fallback={<SitePageFallback label="知识库" variant="knowledge" />}>
      <KnowledgePageContent {...props} />
    </Suspense>
  )
}
