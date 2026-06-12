'use client'

import { useState } from 'react'
import { triggerRagReindex } from '@/lib/studio/actions'
import type { PublicContentStats } from '@/lib/studio/queries'

interface RagReindexPanelProps {
  publicStats: PublicContentStats
}

export function RagReindexPanel({ publicStats }: RagReindexPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleReindex = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    const result = await triggerRagReindex()
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.stats) {
      setMessage(
        `索引完成：${result.stats.documents} 篇文档，新增 ${result.stats.indexed}，跳过 ${result.stats.skipped}，${result.stats.chunks} 个分块。`,
      )
    }
  }

  const totalPublic = publicStats.publicProjects + publicStats.publicVibeEntries + publicStats.publicKbRecords

  return (
    <section className="sg-studio-reindex" aria-labelledby="studio-reindex-heading">
      <h2 id="studio-reindex-heading" className="sg-studio-section-title">
        助手索引同步
      </h2>
      <p className="sg-studio-reindex__lead">
        公开内容变更后，同步庭院导引的知识索引。当前公开：归档 {publicStats.publicProjects} · 草本集{' '}
        {publicStats.publicVibeEntries} · 档案馆 {publicStats.publicKbRecords}（共 {totalPublic} 条）。
      </p>
      <button
        type="button"
        className="sg-btn sg-btn--primary"
        onClick={handleReindex}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? '索引中…' : '一键同步助手索引'}
      </button>
      {error ? <div className="sg-kb-error sg-kb-error--inline">{error}</div> : null}
      {message ? <p className="sg-studio-reindex__ok" role="status">{message}</p> : null}
    </section>
  )
}
