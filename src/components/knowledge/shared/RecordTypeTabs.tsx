'use client'

import { FileText, Code2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'

export const RECORD_TYPES = [
  { id: 'text', icon: FileText, label: '笔记' },
  { id: 'code', icon: Code2, label: '代码' },
  { id: 'image', icon: ImageIcon, label: '图片' },
  { id: 'file', icon: LinkIcon, label: '附件' },
] as const

export type RecordTypeId = (typeof RECORD_TYPES)[number]['id']

interface RecordTypeTabsProps {
  value: string
  onChange: (typeId: string) => void
  mode?: 'filter' | 'select'
  showLabels?: boolean
}

export function RecordTypeTabs({
  value,
  onChange,
  mode = 'filter',
  showLabels = true,
}: RecordTypeTabsProps) {
  return (
    <div className="sg-filter-bar sg-kb-type-tabs">
      {RECORD_TYPES.map((t) => {
        const isActive = value === t.id
        const Icon = t.icon

        if (mode === 'filter') {
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(isActive ? '' : t.id)}
              className={`sg-filter-chip${isActive ? ' sg-filter-chip--active' : ''}`}
            >
              <Icon className="sg-kb-type-tabs__icon" aria-hidden />
              {showLabels ? <span>{t.label}</span> : null}
            </button>
          )
        }

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`sg-filter-chip${isActive ? ' sg-filter-chip--active' : ''}`}
          >
            <Icon className="sg-kb-type-tabs__icon" aria-hidden />
            {showLabels ? <span>{t.label}</span> : null}
          </button>
        )
      })}
    </div>
  )
}
