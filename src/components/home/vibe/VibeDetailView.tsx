import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import type { VibeEntry } from '@/lib/vibe/types'
import { SITE_ROUTES } from '@/lib/site/routes'

interface VibeDetailViewProps {
  entry: VibeEntry
}

const KIND_LABELS: Record<VibeEntry['kind'], string> = {
  project: '实验项目',
  note: '短笔记',
  article: '长文',
}

export function VibeDetailView({ entry }: VibeDetailViewProps) {
  const isReadable = entry.kind === 'note' || entry.kind === 'article'

  return (
    <article className="sg-page sg-vibe-detail">
      <header className="sg-vibe-detail__hero">
        <Link href={SITE_ROUTES.vibe} className="sg-project-detail__back">
          ← 返回草本集
        </Link>
        <p className="sg-vibe-detail__eyebrow">
          {KIND_LABELS[entry.kind]}
          {entry.isPublic ? ' · 公开' : ''}
        </p>
        <h1>{entry.name}</h1>
        <p className="sg-vibe-detail__desc">{entry.description}</p>
        {entry.tags.length > 0 ? (
          <div className="sg-card__tags">
            {entry.tags.map((tag) => (
              <span key={tag} className="sg-tag sg-tag--leaf">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {isReadable && entry.body ? (
        <section className="sg-vibe-detail__body sg-markdown">
          <ReactMarkdown>{entry.body}</ReactMarkdown>
        </section>
      ) : null}

      {entry.kind === 'project' && entry.url ? (
        <div className="sg-vibe-detail__actions">
          <a href={entry.url} target="_blank" rel="noopener noreferrer" className="sg-btn sg-btn--primary">
            访问实验 ↗
          </a>
        </div>
      ) : null}
    </article>
  )
}
