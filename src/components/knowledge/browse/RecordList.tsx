'use client'

import { useEffect, useState } from 'react'
import { LayoutGrid, List, Loader2 } from 'lucide-react'
import { RecordCard } from './RecordCard'
import { HighlightThemeLoader } from './HighlightThemeLoader'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/spirit/feedback/ToastProvider'
import { KB_RECORDS_PAGE_SIZE } from '@/lib/knowledge/constants'
import type { KbRecord } from '@/lib/knowledge/types'
import { SpiritEmptyState } from '@/components/spirit/feedback/SpiritEmptyState'
import { useBreakpoint } from '@/utils/useBreakpoint'

const KB_VIEW_KEY = 'sg-kb-view-mode'

type KbViewMode = 'list' | 'grid'

export function RecordList({
  initialRecords,
  initialHasMore,
  initialQuery,
  initialTags,
  initialType,
}: {
  initialRecords: KbRecord[]
  initialHasMore: boolean
  initialQuery?: string
  initialTags?: string[]
  initialType?: string
}) {
  const { isMobile } = useBreakpoint()
  const [records, setRecords] = useState(initialRecords)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [preferredView, setPreferredView] = useState<KbViewMode>('list')
  const supabase = createClient()
  const { toast } = useToast()
  const viewMode: KbViewMode = isMobile ? 'list' : preferredView

  useEffect(() => {
    const stored = window.localStorage.getItem(KB_VIEW_KEY)
    if (stored === 'list' || stored === 'grid') {
      const frame = requestAnimationFrame(() => setPreferredView(stored))
      return () => cancelAnimationFrame(frame)
    }
  }, [])

  const handleViewChange = (mode: KbViewMode) => {
    setPreferredView(mode)
    window.localStorage.setItem(KB_VIEW_KEY, mode)
  }

  const loadMore = async () => {
    if (loading || !hasMore) return
    setLoading(true)
    setLoadError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let dbQuery = supabase
        .from('kb_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (initialQuery) {
        dbQuery = dbQuery.textSearch('content', initialQuery, { type: 'websearch' })
      }
      if (initialTags && initialTags.length > 0) {
        dbQuery = dbQuery.contains('tags', initialTags)
      }
      if (initialType) {
        dbQuery = dbQuery.eq('type', initialType)
      }

      const offset = records.length
      const { data: newRecords, error } = await dbQuery.range(
        offset,
        offset + KB_RECORDS_PAGE_SIZE - 1,
      )

      if (error) throw error

      if (newRecords) {
        setRecords((prev) => [...prev, ...newRecords])
        setHasMore(newRecords.length === KB_RECORDS_PAGE_SIZE)
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : '加载失败'
      setLoadError(message)
      toast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (records.length === 0) {
    return (
      <SpiritEmptyState
        imageSrc="/spirit-garden/icon-book.png"
        title="档案馆暂无匹配记录"
        description="调整搜索或标签筛选，或使用 Cmd+K 录入新碎片。"
      />
    )
  }

  const layoutClass = viewMode === 'grid' ? 'sg-kb-grid' : 'sg-kb-masonry'

  return (
    <div className="sg-kb-list">
      <HighlightThemeLoader />

      {!isMobile ? (
        <div className="sg-kb-view-toggle" role="group" aria-label="浏览视图">
          <button
            type="button"
            className={`sg-kb-view-toggle__btn${viewMode === 'list' ? ' sg-kb-view-toggle__btn--active' : ''}`}
            onClick={() => handleViewChange('list')}
            aria-pressed={viewMode === 'list'}
            aria-label="列表视图"
          >
            <List size={16} aria-hidden />
            列表
          </button>
          <button
            type="button"
            className={`sg-kb-view-toggle__btn${viewMode === 'grid' ? ' sg-kb-view-toggle__btn--active' : ''}`}
            onClick={() => handleViewChange('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="网格视图"
          >
            <LayoutGrid size={16} aria-hidden />
            网格
          </button>
        </div>
      ) : null}

      <div className={layoutClass}>
        {records.map((record, index) => (
          <RecordCard key={record.id} record={record} index={index} />
        ))}
      </div>

      {loadError ? (
        <div className="sg-kb-error sg-kb-error--inline">{loadError}</div>
      ) : null}

      {hasMore ? (
        <div className="sg-kb-load-more">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="sg-btn sg-btn--ghost"
          >
            {loading ? <Loader2 className="sg-kb-spinner" aria-hidden /> : null}
            {loading ? '加载中...' : '加载更多'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
