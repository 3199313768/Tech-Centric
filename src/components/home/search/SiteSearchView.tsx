'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import type { SiteSearchResult, SearchResultSource } from '@/lib/site/search'
import { SpiritSubpageHero } from '@/components/spirit/shell/SpiritSubpageHero'
import { SpiritEmptyState } from '@/components/spirit/feedback/SpiritEmptyState'

const SOURCE_LABELS: Record<SearchResultSource, string> = {
  project: '归档',
  vibe: '草本集',
  knowledge: '档案馆',
  skill: '技能工坊',
  resource: '资源',
}

interface SiteSearchViewProps {
  query: string
  results: SiteSearchResult[]
}

export function SiteSearchView({ query, results }: SiteSearchViewProps) {
  const router = useRouter()
  const [input, setInput] = useState(query)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = input.trim()
    if (next.length < 2) return
    router.push(`/search?q=${encodeURIComponent(next)}`)
  }

  return (
    <div className="sg-page">
      <SpiritSubpageHero
        theme="archive"
        eyebrow="全站检索"
        title="搜索庭院"
        lead="跨归档、草本集、档案馆、技能与资源统一搜索。"
        stats={[
          { label: '关键词', value: query || '—' },
          { label: '命中', value: query ? results.length : '—' },
        ]}
      />

      <form className="sg-search-form" onSubmit={handleSubmit} role="search">
        <label htmlFor="site-search-input" className="sg-sr-only">
          搜索站点内容
        </label>
        <Search className="sg-search-form__icon" aria-hidden size={18} />
        <input
          id="site-search-input"
          className="sg-search-form__input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="输入关键词，至少 2 个字符..."
          minLength={2}
          autoFocus
        />
        <button type="submit" className="sg-btn sg-btn--primary">
          搜索
        </button>
      </form>

      {!query ? (
        <SpiritEmptyState
          imageSrc="/spirit-garden/icon-book.png"
          title="输入关键词开始搜索"
          description="可搜索项目名、技能、笔记正文与公开知识片段。"
        />
      ) : results.length === 0 ? (
        <SpiritEmptyState
          className="sg-empty-state--grid"
          imageSrc="/spirit-garden/icon-book.png"
          title={`未找到与「${query}」相关的内容`}
          description="换个关键词，或通过导航浏览各分区。"
        />
      ) : (
        <ul className="sg-search-results">
          {results.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="sg-search-result">
                <span className="sg-search-result__source">{SOURCE_LABELS[item.source]}</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
