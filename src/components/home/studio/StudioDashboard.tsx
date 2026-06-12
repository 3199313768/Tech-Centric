import Link from 'next/link'
import { RagReindexPanel } from '@/components/home/studio/RagReindexPanel'
import { ResourceHealthPanel } from '@/components/home/studio/ResourceHealthPanel'
import { STUDIO_QUICK_LINKS, type PublicContentStats, type StudioStats } from '@/lib/studio/queries'

interface StudioDashboardProps {
  stats: StudioStats
  publicStats: PublicContentStats
}

export function StudioDashboard({ stats, publicStats }: StudioDashboardProps) {
  const statItems = [
    { label: '归档项目', value: stats.projects },
    { label: '技能卷轴', value: stats.skills },
    { label: '草本手札', value: stats.vibeEntries },
    { label: '知识记录', value: stats.kbRecords },
    { label: '资源条目', value: stats.resources },
  ]

  return (
    <div className="sg-page sg-studio">
      <header className="sg-studio__hero">
        <p className="sg-studio__eyebrow">Owner 工作台</p>
        <h1>内容工作台</h1>
        <p className="sg-studio__lead">统一入口管理归档、技能、草本集、档案馆与资源。</p>
      </header>

      <section className="sg-studio-stats" aria-label="内容统计">
        {statItems.map((item) => (
          <div key={item.label} className="sg-studio-stat">
            <span className="sg-studio-stat__value">{item.value}</span>
            <span className="sg-studio-stat__label">{item.label}</span>
          </div>
        ))}
      </section>

      <section className="sg-studio-links" aria-label="快捷入口">
        <h2 className="sg-studio-section-title">快捷入口</h2>
        <ul className="sg-studio-link-grid">
          {STUDIO_QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="sg-card sg-card--watercolor sg-studio-link-card">
                <h3>{link.label}</h3>
                <p>{link.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <RagReindexPanel publicStats={publicStats} />

      <ResourceHealthPanel />

      <section className="sg-studio-note">
        <h2 className="sg-studio-section-title">维护提示</h2>
        <ul>
          <li>知识库录入：任意页面按 Cmd+K</li>
          <li>公开内容保存后会自动后台同步索引；也可在上方手动触发</li>
          <li>内容 CRUD 需先登录；生产环境执行 `patch-owner-auth-write.sql`</li>
          <li>Supabase SQL 补丁见 `scripts/README.md`</li>
        </ul>
      </section>
    </div>
  )
}
