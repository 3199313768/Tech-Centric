'use client'

import { useState } from 'react'
import { RecordCard } from './RecordCard'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

// Basic interface to replace `any`
interface IRecord {
  id: string;
  user_id: string;
  type: string;
  content: string;
  tags?: string[];
  created_at: string;
  [key: string]: any; // Catch-all for other fields
}

export function RecordList({ 
  initialRecords, 
  initialQuery, 
  initialTags, 
  initialType 
}: { 
  initialRecords: IRecord[],
  initialQuery?: string,
  initialTags?: string[],
  initialType?: string
}) {
  const [records, setRecords] = useState(initialRecords)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialRecords.length === 50)
  const supabase = createClient()

  const loadMore = async () => {
    if (loading || !hasMore) return
    setLoading(true)

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

      // Fetch the next 50 records using the current records length as offset
      const currentLength = records.length
      const { data: newRecords, error } = await dbQuery.range(currentLength, currentLength + 49)

      if (error) throw error

      if (newRecords) {
        setRecords(prev => [...prev, ...newRecords])
        setHasMore(newRecords.length === 50)
      }
    } catch (e) {
      console.error('Failed to load more records:', e)
    } finally {
      setLoading(false)
    }
  }

  if (records.length === 0) {
    return (
      <div className="py-24 text-center text-zinc-500 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl">
        <span className="text-4xl mb-4">📭</span>
        <p>没有找到相关记录</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {records.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-8 pb-12">
          <button
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-full transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
    </div>
  )
}
