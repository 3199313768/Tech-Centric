'use client'

import { useState } from 'react'
import { RecordCard } from './RecordCard'
import { HighlightThemeLoader } from './HighlightThemeLoader'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/spirit/feedback/ToastProvider'
import { KB_RECORDS_PAGE_SIZE } from '@/lib/knowledge/constants'
import type { KbRecord } from '@/lib/knowledge/types'

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
  const [records, setRecords] = useState(initialRecords)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loadError, setLoadError] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

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
      <div className="sg-state sg-state--empty">
        没有找到相关记录
      </div>
    )
  }

  return (
    <div className="sg-kb-list">
      <HighlightThemeLoader />
      <div className="sg-kb-masonry">
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
