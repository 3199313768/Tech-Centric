'use client'

import { motion } from 'framer-motion'
import {
  getResourceAccent,
  RESOURCE_CATEGORY_LABELS,
} from '@/utils/resourceCategory'

interface ResourceToolbarProps {
  categories: string[]
  filter: string | 'all'
  isManageMode: boolean
  isExploring: boolean
  candidateCount: number
  onFilterChange: (key: string | 'all') => void
  onToggleManage: () => void
  onAdd: () => void
  onOpenCandidates: () => void
  onExplore: () => void
  onExport: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ResourceToolbar({
  categories,
  filter,
  isManageMode,
  isExploring,
  candidateCount,
  onFilterChange,
  onToggleManage,
  onAdd,
  onOpenCandidates,
  onExplore,
  onExport,
  onImport,
}: ResourceToolbarProps) {
  const filterKeys = ['all', ...categories] as const

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="sg-resource-toolbar"
    >
      <div className="sg-resource-toolbar__group">
        {filterKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(key)}
            className={`sg-filter-chip sg-filter-chip--sign${filter === key ? ' sg-filter-chip--active' : ''}`}
          >
            <span
              className="sg-filter-chip__dot"
              style={{ background: getResourceAccent(key === 'all' ? 'all' : key) }}
              aria-hidden
            />
            {key === 'all' ? '全部' : RESOURCE_CATEGORY_LABELS[key] || key}
          </button>
        ))}
      </div>

      <div className="sg-resource-toolbar__divider" aria-hidden />

      <div className="sg-resource-toolbar__group">
        <button
          type="button"
          className={`sg-btn sg-btn--ghost${isManageMode ? ' sg-filter-chip--active' : ''}`}
          onClick={onToggleManage}
        >
          {isManageMode ? '退出管理' : '批量管理'}
        </button>
        <button type="button" className="sg-btn sg-btn--primary" onClick={onAdd}>
          + 添加
        </button>
        <button
          type="button"
          className="sg-btn sg-btn--ghost sg-resource-toolbar__candidates"
          onClick={onOpenCandidates}
          disabled={candidateCount === 0}
          title={candidateCount === 0 ? '暂无待选灵感' : '查看待选灵感'}
        >
          💡 灵感待选{candidateCount > 0 ? ` (${candidateCount})` : ''}
        </button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="sg-btn sg-resource-toolbar__discover"
          onClick={onExplore}
          disabled={isExploring}
          title="AI 灵感发现"
        >
          {isExploring ? '正在扫描趋势...' : '✨ AI 发现'}
        </motion.button>
        <button
          type="button"
          className="sg-btn sg-btn--ghost sg-resource-toolbar__icon-btn"
          onClick={onExport}
          title="导出备份 (JSON)"
        >
          📥
        </button>
        <label
          className="sg-btn sg-btn--ghost sg-resource-toolbar__icon-btn"
          title="导入备份"
        >
          📤
          <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
        </label>
      </div>
    </motion.div>
  )
}
