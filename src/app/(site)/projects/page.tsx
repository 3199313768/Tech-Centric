import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { SitePageFallback } from '@/components/spirit/feedback/SitePageFallback'
import { fetchAllProjectsPageData } from '@/lib/projects/queries'
import { createClient } from '@/lib/supabase/server'

const AllProjects = dynamic(
  () => import('@/components/home/projects/AllProjects').then((m) => ({ default: m.AllProjects })),
  { loading: () => <SitePageFallback label="项目归档" variant="archive" /> },
)

export const metadata = {
  title: '项目归档 · SpiritGarden',
  description: '个人项目归档与作品集。',
}

async function ProjectsPageContent() {
  const supabase = await createClient()
  const [{ projects, error }, { data: { user } }] = await Promise.all([
    fetchAllProjectsPageData(),
    supabase.auth.getUser(),
  ])

  if (error) {
    return <div className="sg-kb-error">加载项目失败：{error.message}</div>
  }

  return <AllProjects initialProjects={projects} canReorder={Boolean(user)} />
}

export default function ProjectsPage() {
  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--archive">
      <Suspense fallback={<SitePageFallback label="项目归档" variant="archive" />}>
        <ProjectsPageContent />
      </Suspense>
    </div>
  )
}
