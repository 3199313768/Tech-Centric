'use client'

import Link from 'next/link'

interface TagFilterBarProps {
  tags: string[]
  activeTags: string[]
  query?: string
  typeFilter?: string
  variant?: 'sidebar' | 'mobile'
}

export function TagFilterBar({
  tags,
  activeTags,
  query,
  typeFilter,
  variant = 'sidebar',
}: TagFilterBarProps) {
  const buildHref = (tag: string) => {
    const isActive = activeTags.includes(tag)
    const newTags = isActive ? activeTags.filter((t) => t !== tag) : [...activeTags, tag]
    const searchParams = new URLSearchParams()
    if (query) searchParams.set('q', query)
    if (typeFilter) searchParams.set('type', typeFilter)
    if (newTags.length > 0) searchParams.set('tags', newTags.join(','))
    return `/knowledge${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  }

  if (tags.length === 0) {
    return <span className="sg-kb-tag-empty">暂无标签记录</span>
  }

  return (
    <div
      className={
        variant === 'mobile'
          ? 'sg-filter-bar sg-kb-tag-bar sg-kb-tag-bar--mobile'
          : 'sg-filter-bar sg-kb-tag-bar'
      }
    >
      {tags.map((tag) => {
        const isActive = activeTags.includes(tag)
        return (
          <Link
            key={tag}
            href={buildHref(tag)}
            className={`sg-filter-chip${isActive ? ' sg-filter-chip--active' : ''}`}
          >
            #{tag}
          </Link>
        )
      })}
    </div>
  )
}
