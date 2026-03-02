'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, Image as ImageIcon, FileText, Code2, Link as LinkIcon } from 'lucide-react'

export function SearchBar({
  initialQuery = '',
  initialType = ''
}: {
  initialQuery?: string
  initialType?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState(initialQuery)
  const [activeType, setActiveType] = useState(initialType)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrl({ q: query, type: activeType })
  }

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

  const toggleType = (typeId: string) => {
    const newType = activeType === typeId ? '' : typeId
    setActiveType(newType)
    updateUrl({ type: newType, q: query })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative flex-1 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索知识内容、标题或关键词..."
          className="block w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl leading-5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all focus:bg-zinc-800/80 text-zinc-200 placeholder-zinc-500"
        />
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <button
                type="submit"
               className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-zinc-700/50"
            >
              <kbd className="hidden sm:inline-block font-mono text-xs px-1 text-zinc-400">↵ Exit</kbd>
            </button>
        </div>
      </form>

      {/* Type Filters */}
      <div className="flex bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 overflow-x-auto shrink-0 scrollbar-hide">
        {(
          [
            { id: 'text', icon: FileText, label: '笔记' },
            { id: 'code', icon: Code2, label: '代码' },
            { id: 'image', icon: ImageIcon, label: '图片' },
            { id: 'file', icon: LinkIcon, label: '附件' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => toggleType(t.id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeType === t.id
                ? 'bg-zinc-800 text-indigo-300 shadow-sm border border-zinc-700/50'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline-block">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
