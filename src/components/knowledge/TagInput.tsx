'use client'

import { useState, KeyboardEvent, useEffect } from 'react'
import { Tag as TagIcon, X } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const addTag = () => {
    const trimmed = input.trim().replace(/^#/, '')
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
      setInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map(tag => (
        <span 
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20"
        >
          <TagIcon className="w-3 h-3" />
          {tag}
          <button 
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-indigo-300 hover:bg-indigo-500/20 rounded-sm p-0.5 ml-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? "输入 # 标签并按回车..." : "添加更多标签..."}
          className="w-full bg-transparent border-none text-sm text-zinc-300 placeholder-zinc-600 focus:ring-0 px-0 py-1"
        />
      </div>
    </div>
  )
}
