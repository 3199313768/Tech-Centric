'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SITE_ROUTES } from '@/lib/site/routes'

interface HealthResult {
  id: string
  name: string
  url: string
  status: 'ok' | 'broken' | 'timeout' | 'invalid'
  statusCode?: number
  message?: string
}

interface HealthResponse {
  checkedAt: string
  total: number
  okCount: number
  brokenCount: number
  results: HealthResult[]
}

export function ResourceHealthPanel() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<HealthResponse | null>(null)

  async function runCheck() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/resources/health', { method: 'POST' })
      const payload = (await response.json()) as HealthResponse & { error?: string }

      if (!response.ok) {
        setError(payload.error ?? '检测失败')
        return
      }

      setReport(payload)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '检测失败')
    } finally {
      setLoading(false)
    }
  }

  const broken = report?.results.filter((item) => item.status !== 'ok') ?? []

  return (
    <section className="sg-studio-health" aria-labelledby="studio-health-title">
      <h2 id="studio-health-title" className="sg-studio-section-title">资源链接检测</h2>
      <p className="sg-studio-health__lead">
        对资源架外链发起 HEAD/GET 探测，帮助发现失效链接（最多 60 条）。
      </p>

      <button
        type="button"
        className="sg-btn sg-btn--secondary"
        onClick={runCheck}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? '检测中…' : '检测资源链接'}
      </button>

      {error ? (
        <div className="sg-kb-error sg-kb-error--inline" role="alert">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="sg-studio-health__report">
          <p className="sg-studio-health__summary">
            共 {report.total} 条 · 正常 {report.okCount} · 异常 {report.brokenCount}
          </p>

          {broken.length > 0 ? (
            <ul className="sg-studio-health__list">
              {broken.map((item) => (
                <li key={item.id} className="sg-studio-health__item">
                  <strong>{item.name}</strong>
                  <span className="sg-studio-health__status">{item.message ?? item.status}</span>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sg-studio-health__ok">所有检测链接均可访问。</p>
          )}

          <Link href={SITE_ROUTES.resources} className="sg-studio-health__link">
            前往资源架管理 →
          </Link>
        </div>
      ) : null}
    </section>
  )
}
