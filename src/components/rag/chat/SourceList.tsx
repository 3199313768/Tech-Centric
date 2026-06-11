import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { RagSource } from '@/lib/rag/types'

interface SourceListProps {
  sources: RagSource[]
}

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) return null

  return (
    <div className="sg-rag-source-list">
      <p className="sg-rag-source-list__label">参考来源</p>
      <div className="sg-rag-source-items">
        {sources.map((source) => {
          const safeUrl = getSafeUrl(source.url)
          const isInternal = safeUrl?.startsWith('/')

          if (isInternal && safeUrl) {
            return (
              <Link key={`${source.sourceType}-${source.title}`} href={safeUrl} className="sg-rag-source-item">
                <span className="sg-rag-source-item__head">
                  <span className="sg-rag-source-item__title">{source.title}</span>
                  <ExternalLink className="sg-rag-source-item__link-icon" aria-hidden />
                </span>
                <span className="sg-rag-source-item__meta">
                  <span>{formatSourceType(source.sourceType)}</span>
                  <span className="sg-rag-source-item__dot" aria-hidden />
                  <span>{(source.similarity * 100).toFixed(0)}%</span>
                </span>
              </Link>
            )
          }

          const SourceWrapper = safeUrl ? 'a' : 'div'

          return (
            <SourceWrapper
              key={`${source.sourceType}-${source.title}`}
              {...(safeUrl ? { href: safeUrl, target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="sg-rag-source-item"
            >
              <span className="sg-rag-source-item__head">
                <span className="sg-rag-source-item__title">{source.title}</span>
                {safeUrl ? <ExternalLink className="sg-rag-source-item__link-icon" aria-hidden /> : null}
              </span>
              <span className="sg-rag-source-item__meta">
                <span>{formatSourceType(source.sourceType)}</span>
                <span className="sg-rag-source-item__dot" aria-hidden />
                <span>{(source.similarity * 100).toFixed(0)}%</span>
              </span>
            </SourceWrapper>
          )
        })}
      </div>
    </div>
  )
}

function formatSourceType(sourceType: string) {
  return sourceType.replace(/_/g, ' ')
}

function getSafeUrl(url: string | null) {
  if (!url) return null
  if (url.startsWith('/')) return url

  try {
    const parsed = new URL(url)
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.toString() : null
  } catch {
    return null
  }
}
