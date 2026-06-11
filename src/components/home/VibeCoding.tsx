'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AddVibeModal } from './AddVibeModal'
import { SpiritSubpageHero } from '@/components/spirit/SpiritSubpageHero'
import { SpiritListCard } from '@/components/spirit/SpiritListCard'
import { DeleteConfirmBar } from '@/components/spirit/DeleteConfirmBar'
import { useToast } from '@/components/spirit/ToastProvider'

interface VibeProject {
  id: string
  name: string
  description: string
  url: string
  icon: string
}

function formatHerbDate(index: number): string {
  const day = String(((index * 7) % 28) + 1).padStart(2, '0')
  const month = String(((index * 3) % 12) + 1).padStart(2, '0')
  return `采集于 · ${month}/${day}`
}

export function VibeCoding() {
  const { toast } = useToast()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [projects, setProjects] = useState<VibeProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<VibeProject | null>(null)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('vibe_coding').select('*').order('created_at', { ascending: false })
    if (!error && data) {
      setProjects(data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        url: item.url,
        icon: item.icon
      })))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects()
  }, [fetchProjects])

  const executeDelete = async (id: string) => {
    setDeletingId(id)
    setConfirmDeleteId(null)
    const supabase = createClient()
    const { error } = await supabase.from('vibe_coding').delete().eq('id', id)
    setDeletingId(null)

    if (error) {
      toast('删除失败：' + error.message, 'error')
    } else {
      toast('项目已删除', 'success')
      fetchProjects()
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
          { label: '手札条目', value: isLoading ? '—' : projects.length },
          { label: '实验状态', value: isLoading ? '—' : projects.length > 0 ? '进行中' : '待播种' },
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

      {isLoading ? (
        <div className="sg-state sg-state--loading">
          <div className="sg-state__spinner" aria-hidden />
          加载中...
        </div>
      ) : projects.length === 0 ? (
        <div className="sg-state sg-state--empty">
          暂无手札数据，通过上方按钮添加一条吧！
        </div>
      ) : (
        <div className="sg-herb-journal">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`sg-herb-entry ${index % 2 === 0 ? 'sg-herb-entry--left' : 'sg-herb-entry--right'}`}
            >
              <span className="sg-herb-entry__node" aria-hidden />
              <SpiritListCard
                variant="herb"
                index={index}
                href={project.url}
                actionsVisible={hoveredId === project.id || deletingId === project.id || confirmDeleteId === project.id}
                actions={
                  <>
                    <button
                      type="button"
                      className="sg-icon-btn"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setEditingProject(project)
                        setIsAddModalOpen(true)
                      }}
                      title="修改此项目"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="sg-icon-btn sg-icon-btn--danger"
                      onClick={(e) => requestDelete(e, project.id)}
                      disabled={deletingId === project.id}
                      title="删除此项目"
                    >
                      {deletingId === project.id ? '...' : '×'}
                    </button>
                  </>
                }
              >
                <div
                  onMouseEnter={() => setHoveredId(project.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <span className="sg-herb-date">{formatHerbDate(index)}</span>
                  <div className="sg-card__icon-wrap">{project.icon}</div>
                  <h3 className="sg-card__title">{project.name}</h3>
                  <p className="sg-card__desc">{project.description}</p>
                  <span className="sg-herb-link">访问实验</span>
                  {confirmDeleteId === project.id ? (
                    <DeleteConfirmBar
                      message={`确定删除「${project.name}」？不可撤销`}
                      onCancel={() => setConfirmDeleteId(null)}
                      onConfirm={() => executeDelete(project.id)}
                      isLoading={deletingId === project.id}
                    />
                  ) : null}
                </div>
              </SpiritListCard>
            </div>
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
        onSuccess={fetchProjects}
        initialData={editingProject}
      />
    </div>
  )
}
