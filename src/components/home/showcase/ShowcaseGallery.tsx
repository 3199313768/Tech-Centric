import Link from 'next/link'
import type { ShowcaseItem, ShowcaseSource } from '@/lib/showcase/queries'
import { getShowcaseSourceLabel } from '@/lib/showcase/queries'
import { SpiritSubpageHero } from '@/components/spirit/shell/SpiritSubpageHero'
import { SpiritEmptyState } from '@/components/spirit/feedback/SpiritEmptyState'

interface ShowcaseGalleryProps {
  items: ShowcaseItem[]
}

const SOURCE_ORDER: ShowcaseSource[] = ['project', 'vibe', 'knowledge']

export function ShowcaseGallery({ items }: ShowcaseGalleryProps) {
  const grouped = SOURCE_ORDER.map((source) => ({
    source,
    label: getShowcaseSourceLabel(source),
    items: items.filter((item) => item.source === source),
  })).filter((group) => group.items.length > 0)

  return (
    <div className="sg-page">
      <SpiritSubpageHero
        theme="library"
        eyebrow="公开展柜"
        title="庭院展柜"
        lead="自动聚合标记为公开的项目、草本集长文与知识库片段，供访客浏览与 AI 引用。"
        stats={[
          { label: '展柜总数', value: items.length },
          { label: '来源', value: grouped.length },
        ]}
      />

      {items.length === 0 ? (
        <SpiritEmptyState
          imageSrc="/spirit-garden/icon-book.png"
          title="展柜尚空"
          description="将项目设为公网可见，或在草本集 / 知识库中标记公开后，内容会自动出现在此。"
        />
      ) : (
        <div className="sg-showcase-groups">
          {grouped.map((group) => (
            <section key={group.source} className="sg-showcase-group" aria-labelledby={`showcase-${group.source}`}>
              <h2 id={`showcase-${group.source}`} className="sg-showcase-group__title">
                {group.label}
                <span className="sg-showcase-group__count">{group.items.length}</span>
              </h2>
              <ul className="sg-showcase-grid">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="sg-card sg-card--watercolor sg-showcase-card">
                      <p className="sg-showcase-card__eyebrow">{getShowcaseSourceLabel(item.source)}</p>
                      <h3>{item.title}</h3>
                      <p className="sg-showcase-card__summary">{item.summary}</p>
                      {item.tags.length > 0 ? (
                        <div className="sg-card__tags">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="sg-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
