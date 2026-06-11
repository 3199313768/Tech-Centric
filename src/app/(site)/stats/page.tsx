import { SiteStatsView } from '@/components/home/stats/SiteStatsView'
import { fetchSiteStats } from '@/lib/stats/queries'

export const metadata = {
  title: '庭园度量 · SpiritGarden',
  description: 'SpiritGarden 站点公开内容统计与更新节奏。',
}

export default async function StatsPage() {
  const stats = await fetchSiteStats()

  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--workshop">
      <SiteStatsView stats={stats} />
    </div>
  )
}
