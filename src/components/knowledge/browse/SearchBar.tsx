'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { RecordTypeTabs } from '@/components/knowledge/shared/RecordTypeTabs'

export function SearchBar({
  initialQuery = '',
  initialType = '',
}: {
  initialQuery?: string
  initialType?: string
  initialTags?: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(initialQuery)
  const [activeType, setActiveType] = useState(initialType)

  const updateUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrl({ q: query || undefined, type: activeType || undefined })
  }

  const handleTypeChange = (typeId: string) => {
    setActiveType(typeId)
    updateUrl({ type: typeId || undefined, q: query || undefined })
  }

  return (
    <div className="sg-kb-search">
      <form onSubmit={handleSearch} className="sg-kb-search-form">
        <Search className="sg-kb-search-icon" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索知识内容、标题或关键词..."
          className="sg-form-input sg-kb-search-input"
        />
        <button type="submit" className="sg-btn sg-btn--ghost sg-kb-search-submit">
          搜索
        </button>
      </form>

      <RecordTypeTabs value={activeType} onChange={handleTypeChange} mode="filter" />
    </div>
  )
}
