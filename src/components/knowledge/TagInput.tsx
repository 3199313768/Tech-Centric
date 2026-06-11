'use client'

import { useState, KeyboardEvent } from 'react'
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
    onChange(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="sg-kb-tag-input">
      {tags.map((tag) => (
        <span key={tag} className="sg-tag sg-kb-tag-input-chip">
          <TagIcon className="sg-kb-tag-input-icon" aria-hidden />
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="sg-kb-tag-input-remove"
            aria-label={`移除标签 ${tag}`}
          >
            <X className="sg-kb-tag-input-remove-icon" aria-hidden />
          </button>
        </span>
      ))}
      <div className="sg-kb-tag-input-field">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? '输入 # 标签并按回车...' : '添加更多标签...'}
          className="sg-kb-tag-input-text"
        />
      </div>
    </div>
  )
}
