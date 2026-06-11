'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { deleteVibeProject } from '@/lib/vibe/actions'
import { SpiritSubpageHero } from '@/components/spirit/shell/SpiritSubpageHero'
import { HerbEntry } from '@/components/home/vibe/HerbEntry'
import { useToast } from '@/components/spirit/feedback/ToastProvider'
import type { VibeProject } from '@/lib/vibe/queries'
import { SpiritEmptyState } from '@/components/spirit/feedback/SpiritEmptyState'
import { useSyncInitialData } from '@/utils/useSyncInitialData'

const AddVibeModal = dynamic(
  () => import('./AddVibeModal').then((m) => ({ default: m.AddVibeModal })),
)

function formatHerbDate(index: number): string {
  const day = String(((index * 7) % 28) + 1).padStart(2, '0')
  const month = String(((index * 3) % 12) + 1).padStart(2, '0')
  return `采集于 · ${month}/${day}`
}

export function VibeCoding({ initialProjects }: { initialProjects: VibeProject[] }) {
  const { toast } = useToast()
  const router = useRouter()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [projects, setProjects] = useState(initialProjects)
  useSyncInitialData(initialProjects, setProjects)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<VibeProject | null>(null)

  const refreshProjects = useCallback(() => {
    router.refresh()
  }, [router])

  const executeDelete = async (id: string) => {
    setDeletingId(id)
    setConfirmDeleteId(null)
    const { error } = await deleteVibeProject(id)
    setDeletingId(null)

    if (error) {
      toast(`删除失败：${error}`, 'error')
    } else {
      toast('项目已删除', 'success')
      setProjects((prev) => prev.filter((project) => project.id !== id))
      refreshProjects()
    }
  }

  const requestDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmDeleteId(id)
  }

  const openAddModal = () => {
    setEditingProject(null)
    setIsAddModalOpen(true)
  }

  return (
    <div className="sg-page">
      <SpiritSubpageHero
        theme="herb"
        eyebrow="手札实验室"
        title="草本集"
        lead="用 AI 辅助快速迭代出的个人项目，像采集药草一样记录每一次灵感实验。"
        stats={[
          { label: '手札条目', value: projects.length },
          { label: '实验状态', value: projects.length > 0 ? '进行中' : '待播种' },
          { label: '记录方式', value: 'Vibe' },
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

      {projects.length === 0 ? (
        <SpiritEmptyState
          imageSrc="/spirit-garden/icon-leaf.png"
          title="草本集尚待播种"
          description="记录每一次 Vibe 实验，从这里开始。"
          action={
            <button type="button" className="sg-btn sg-btn--primary" onClick={openAddModal}>
              新增手札
            </button>
          }
        />
      ) : (
        <div className="sg-herb-journal">
          {projects.map((project, index) => (
            <HerbEntry
              key={project.id}
              project={project}
              index={index}
              dateLabel={formatHerbDate(index)}
              hoveredId={hoveredId}
              deletingId={deletingId}
              confirmDeleteId={confirmDeleteId}
              onHover={setHoveredId}
              onEdit={(item) => {
                setEditingProject(item)
                setIsAddModalOpen(true)
              }}
              onRequestDelete={requestDelete}
              onConfirmDelete={executeDelete}
              onCancelDelete={() => setConfirmDeleteId(null)}
            />
          ))}
        </div>
      )}

      <AddVibeModal
        key={editingProject?.id ?? 'new-vibe'}
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingProject(null)
        }}
        onSuccess={refreshProjects}
        initialData={editingProject}
      />
    </div>
  )
}
