import Link from 'next/link'
import type { CSSProperties } from 'react'
import { SpiritSubpageHero } from '@/components/spirit/shell/SpiritSubpageHero'
import {
  getActivityIntensity,
  type SiteStatsData,
} from '@/lib/stats/queries'
import { SITE_ROUTES } from '@/lib/site/routes'

interface SiteStatsViewProps {
  stats: SiteStatsData
}

export function SiteStatsView({ stats }: SiteStatsViewProps) {
  const { counts, skillDistribution, activity } = stats
  const maxActivity = Math.max(...activity.map((item) => item.count), 1)
  const maxSkillCount = Math.max(...skillDistribution.map((item) => item.count), 1)

  const countItems = [
    { label: '公开归档', value: counts.publicProjects, href: SITE_ROUTES.projects },
    { label: '技能卷轴', value: counts.skills, href: SITE_ROUTES.skills },
    { label: '公开草本', value: counts.publicVibe, href: SITE_ROUTES.vibe },
    { label: '公开知识', value: counts.publicKnowledge, href: SITE_ROUTES.knowledge },
    { label: '资源条目', value: counts.resources, href: SITE_ROUTES.resources },
    { label: '展柜合计', value: counts.showcaseTotal, href: SITE_ROUTES.showcase },
  ]

  return (
    <div className="sg-page">
      <SpiritSubpageHero
        theme="workshop"
        eyebrow="开放数据"
        title="庭园度量"
        lead="聚合公开内容的数量与近月更新节奏，不含私有知识库细节。"
        stats={[
          { label: '公开内容', value: counts.showcaseTotal },
          { label: '技能', value: counts.skills },
        ]}
      />

      <section className="sg-stats-counts" aria-label="内容统计">
        <ul className="sg-stats-count-grid">
          {countItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="sg-card sg-card--watercolor sg-stats-count-card">
                <span className="sg-stats-count-card__value">{item.value}</span>
                <span className="sg-stats-count-card__label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="sg-stats-section" aria-labelledby="stats-skills">
        <h2 id="stats-skills" className="sg-stats-section__title">技能分布</h2>
        {skillDistribution.length === 0 ? (
          <p className="sg-stats-empty">暂无技能数据</p>
        ) : (
          <ul className="sg-stats-bar-list">
            {skillDistribution.map((item) => (
              <li key={item.label} className="sg-stats-bar-item">
                <div className="sg-stats-bar-item__head">
                  <span>{item.label}</span>
                  <span>{item.count}</span>
                </div>
                <div className="sg-stats-bar-item__track" aria-hidden>
                  <span
                    className="sg-stats-bar-item__fill"
                    style={{ width: `${(item.count / maxSkillCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sg-stats-section" aria-labelledby="stats-activity">
        <h2 id="stats-activity" className="sg-stats-section__title">近 {activity.length} 月更新</h2>
        <p className="sg-stats-section__hint">基于公开项目、草本集、知识库与资源的创建时间聚合。</p>
        <ul className="sg-stats-heatmap" aria-label="月度更新热力">
          {activity.map((item) => {
            const intensity = getActivityIntensity(item.count, maxActivity)
            return (
              <li key={item.month} className="sg-stats-heatmap__cell">
                <div
                  className="sg-stats-heatmap__bar"
                  style={{ '--sg-heat': intensity } as CSSProperties}
                  title={`${item.label}：${item.count} 条`}
                >
                  <span className="sg-stats-heatmap__count">{item.count}</span>
                </div>
                <span className="sg-stats-heatmap__label">{item.label.replace(/^\d{4}年/, '')}</span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
