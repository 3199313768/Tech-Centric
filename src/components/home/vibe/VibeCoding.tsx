'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { deleteVibeProject } from '@/lib/vibe/actions'
import { SpiritSubpageHero } from '@/components/spirit/shell/SpiritSubpageHero'
import { HerbEntry } from '@/components/home/vibe/HerbEntry'
import { useToast } from '@/components/spirit/feedback/ToastProvider'
import type { VibeEntry, VibeKind } from '@/lib/vibe/types'
import { SpiritEmptyState } from '@/components/spirit/feedback/SpiritEmptyState'
import { useSyncInitialData } from '@/utils/useSyncInitialData'
import { vibeRoute } from '@/lib/site/routes'

const AddVibeModal = dynamic(
  () => import('./AddVibeModal').then((m) => ({ default: m.AddVibeModal })),
)

type VibeFilter = '全部' | VibeKind

function formatHerbDate(index: number): string {
  const day = String(((index * 7) % 28) + 1).padStart(2, '0')
  const month = String(((index * 3) % 12) + 1).padStart(2, '0')
  return `采集于 · ${month}/${day}`
}

export function VibeCoding({ initialEntries }: { initialEntries: VibeEntry[] }) {
  const { toast } = useToast()
  const router = useRouter()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [entries, setEntries] = useState(initialEntries)
  useSyncInitialData(initialEntries, setEntries)
  const [activeFilter, setActiveFilter] = useState<VibeFilter>('全部')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<VibeEntry | null>(null)

  const refreshEntries = useCallback(() => {
    router.refresh()
  }, [router])

  const filteredEntries =
    activeFilter === '全部' ? entries : entries.filter((entry) => entry.kind === activeFilter)

  const executeDelete = async (id: string) => {
    setDeletingId(id)
    setConfirmDeleteId(null)
    const { error } = await deleteVibeProject(id)
    setDeletingId(null)

    if (error) {
      toast(`删除失败：${error}`, 'error')
    } else {
      toast('手札已删除', 'success')
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
      refreshEntries()
    }
  }

  const requestDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmDeleteId(id)
  }

  const openAddModal = () => {
    setEditingEntry(null)
    setIsAddModalOpen(true)
  }

  const filters: VibeFilter[] = ['全部', 'project', 'note', 'article']
  const filterLabels: Record<VibeFilter, string> = {
    全部: '全部',
    project: '实验',
    note: '笔记',
    article: '长文',
  }

  return (
    <div className="sg-page">
      <SpiritSubpageHero
        theme="herb"
        eyebrow="手札实验室"
        title="草本集"
        lead="实验项目、短笔记与长文合辑——像采集药草一样记录每一次灵感。"
        stats={[
          { label: '手札条目', value: entries.length },
          { label: '长文', value: entries.filter((e) => e.kind === 'article').length },
          { label: '实验', value: entries.filter((e) => e.kind === 'project').length },
        ]}
        actions={
          <button type="button" className="sg-btn sg-btn--primary" onClick={openAddModal}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            新增手札
          </button>
        }
      />

      <div className="sg-toolbar-row">
        <div className="sg-filter-bar">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`sg-filter-chip sg-filter-chip--sign${activeFilter === filter ? ' sg-filter-chip--active' : ''}`}
            >
              {filterLabels[filter]}
            </button>
          ))}
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <SpiritEmptyState
          imageSrc="/spirit-garden/icon-leaf.png"
          title="草本集尚待播种"
          description="记录实验、笔记或长文，从这里开始。"
          action={
            <button type="button" className="sg-btn sg-btn--primary" onClick={openAddModal}>
              新增手札
            </button>
          }
        />
      ) : (
        <div className="sg-herb-journal">
          {filteredEntries.map((entry, index) => (
            <HerbEntry
              key={entry.id}
              entry={entry}
              index={index}
              dateLabel={formatHerbDate(index)}
              hoveredId={hoveredId}
              deletingId={deletingId}
              confirmDeleteId={confirmDeleteId}
              onHover={setHoveredId}
              onEdit={(item) => {
                setEditingEntry(item)
                setIsAddModalOpen(true)
              }}
              onOpen={(item) => router.push(vibeRoute(item.slug))}
              onRequestDelete={requestDelete}
              onConfirmDelete={executeDelete}
              onCancelDelete={() => setConfirmDeleteId(null)}
            />
          ))}
        </div>
      )}

      <AddVibeModal
        key={editingEntry?.id ?? 'new-vibe'}
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingEntry(null)
        }}
        onSuccess={refreshEntries}
        initialData={editingEntry}
      />
    </div>
  )
}
