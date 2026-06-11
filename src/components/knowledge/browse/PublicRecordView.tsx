import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import type { KbRecord } from '@/lib/knowledge/types'
import type { RelatedKbRecord } from '@/lib/knowledge/relatedRecords'
import { SITE_ROUTES } from '@/lib/site/routes'

interface PublicRecordViewProps {
  record: KbRecord
  relatedRecords?: RelatedKbRecord[]
}

const TYPE_LABELS: Record<string, string> = {
  text: '笔记',
  code: '代码',
  image: '图片',
  file: '附件',
}

export function PublicRecordView({ record, relatedRecords = [] }: PublicRecordViewProps) {
  return (
    <article className="sg-page sg-kb-public-detail">
      <header className="sg-kb-public-detail__hero">
        <Link href={SITE_ROUTES.knowledge} className="sg-project-detail__back">
          ← 返回档案馆
        </Link>
        <p className="sg-kb-public-detail__eyebrow">
          公开记录 · {TYPE_LABELS[record.type] ?? record.type}
        </p>
        {record.tags && record.tags.length > 0 ? (
          <div className="sg-card__tags">
            {record.tags.map((tag) => (
              <span key={tag} className="sg-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div className="sg-kb-public-detail__body">
        {record.type === 'code' ? (
          <div className="sg-kb-code-block">
            <div className="sg-kb-code-content">
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {`\`\`\`\n${record.content}\n\`\`\``}
              </ReactMarkdown>
            </div>
          </div>
        ) : null}

        {record.type === 'text' ? (
          <div className="sg-prose">
            <ReactMarkdown>{record.content}</ReactMarkdown>
          </div>
        ) : null}

        {record.type === 'image' || record.type === 'file' ? (
          <p className="sg-kb-public-detail__path">{record.content}</p>
        ) : null}
      </div>

      {relatedRecords.length > 0 ? (
        <section className="sg-related-records" aria-labelledby="related-records-title">
          <h2 id="related-records-title" className="sg-related-records__title">关联记录</h2>
          <p className="sg-related-records__hint">基于相同标签的公开知识片段</p>
          <ul className="sg-related-records__list">
            {relatedRecords.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="sg-card sg-card--watercolor sg-related-records__card">
                  <p className="sg-related-records__summary">{item.summary}</p>
                  {item.sharedTags.length > 0 ? (
                    <div className="sg-card__tags">
                      {item.sharedTags.map((tag) => (
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
      ) : null}
    </article>
  )
}
