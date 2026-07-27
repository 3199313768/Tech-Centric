import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { SitePageFallback } from '@/components/spirit/feedback/SitePageFallback'
import { getSessionProfile } from '@/lib/auth/getSessionProfile'
import { SITE_ROLE } from '@/lib/auth/roles'
import { fetchAllProjectsPageData } from '@/lib/projects/queries'

const AllProjects = dynamic(
  () => import('@/components/home/projects/AllProjects').then((m) => ({ default: m.AllProjects })),
  { loading: () => <SitePageFallback label="项目归档" variant="archive" /> },
)

export const metadata = {
  title: '项目归档 · SpiritGarden',
  description: '个人项目归档与作品集。',
}

async function ProjectsPageContent() {
  const [{ projects, error }, profile] = await Promise.all([
    fetchAllProjectsPageData(),
    getSessionProfile(),
  ])

  if (error) {
    return <div className="sg-kb-error">加载项目失败：{error.message}</div>
  }

  const canManage = profile?.role === SITE_ROLE.super_admin

  return (
    <AllProjects
      initialProjects={projects}
      canManage={canManage}
      canReorder={canManage}
    />
  )
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
