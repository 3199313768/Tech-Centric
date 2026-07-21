import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { RagSource } from '@/lib/rag/types'

const SOURCE_TYPE_LABELS: Record<RagSource['sourceType'], string> = {
  static_personal: '个人介绍',
  static_project: '项目资料',
  static_resource: '资源分享',
  knowledge_record: '知识库',
  vibe_entry: '动态记录',
}

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
              <Link
                key={source.sourceId}
                href={safeUrl}
                className="sg-rag-source-item"
              >
                <span className="sg-rag-source-item__head">
                  <span className="sg-rag-source-item__title">
                    <span className="sg-rag-source-item__citation">[{source.citation}]</span>
                    {source.title}
                  </span>
                  <ExternalLink
                    className="sg-rag-source-item__link-icon"
                    aria-hidden
                  />
                </span>
                <span className="sg-rag-source-item__meta">
                  {formatSourceType(source.sourceType)}
                </span>
                <span className="sg-rag-source-item__excerpt">{source.excerpt}</span>
              </Link>
            )
          }

          const SourceWrapper = safeUrl ? 'a' : 'div'

          return (
            <SourceWrapper
              key={source.sourceId}
              {...(safeUrl
                ? {
                    href: safeUrl,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  }
                : {})}
              className="sg-rag-source-item"
            >
              <span className="sg-rag-source-item__head">
                <span className="sg-rag-source-item__title">
                  <span className="sg-rag-source-item__citation">[{source.citation}]</span>
                  {source.title}
                </span>
                {safeUrl ? (
                  <ExternalLink
                    className="sg-rag-source-item__link-icon"
                    aria-hidden
                  />
                ) : null}
              </span>
              <span className="sg-rag-source-item__meta">
                {formatSourceType(source.sourceType)}
              </span>
              <span className="sg-rag-source-item__excerpt">{source.excerpt}</span>
            </SourceWrapper>
          )
        })}
      </div>
    </div>
  )
}

function formatSourceType(sourceType: RagSource['sourceType']) {
  return SOURCE_TYPE_LABELS[sourceType]
}

function getSafeUrl(url: string | null) {
  if (!url) return null
  if (/[\\\u0000-\u001f\u007f]/.test(url)) return null
  if (url.startsWith('/') && !url.startsWith('//')) return url

  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null
  } catch {
    return null
  }
}
