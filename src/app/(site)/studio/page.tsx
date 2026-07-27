import { ForbiddenPanel } from '@/components/auth/ForbiddenPanel'
import { StudioDashboard } from '@/components/home/studio/StudioDashboard'
import { getSessionProfile } from '@/lib/auth/getSessionProfile'
import { SITE_ROLE } from '@/lib/auth/roles'
import { fetchPublicContentStats, fetchStudioStats } from '@/lib/studio/queries'

export const metadata = {
  title: '工作台 · SpiritGarden',
  description: '站点所有者内容管理入口。',
}

export default async function StudioPage() {
  const profile = await getSessionProfile()
  if (!profile || profile.role !== SITE_ROLE.super_admin) {
    return <ForbiddenPanel />
  }

  const [stats, publicStats] = await Promise.all([
    fetchStudioStats(profile.user.id),
    fetchPublicContentStats(profile.user.id),
  ])

  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--workshop">
      <StudioDashboard stats={stats} publicStats={publicStats} />
    </div>
  )
}
