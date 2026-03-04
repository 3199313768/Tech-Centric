'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AddVibeModal } from './AddVibeModal'

export function VibeCoding() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  
  // Dynamic states
  interface VibeProject {
    id: string
    name: string
    description: string
    url: string
    icon: string
  }
  
  const [projects, setProjects] = useState<VibeProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
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
    // eslint-disable-next-line
    fetchProjects()
  }, [fetchProjects])

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault() // Link click prevention
    e.stopPropagation()
    if (!window.confirm(`确定要删除 Vibe 编程项目 "${name}" 吗？此操作不可逆。`)) {
      return
    }
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('vibe_coding').delete().eq('id', id)
    setDeletingId(null)

    if (error) {
      alert('删除失败：' + error.message)
    } else {
      fetchProjects()
    }
  }

  return (
    <div
      style={{
        padding: '120px 24px 80px',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-inter), sans-serif',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: '60px', textAlign: 'center' }}
      >
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 600,
            marginBottom: '12px',
            color: 'var(--color-text-primary)',
          }}
        >
          Vibe Coding 项目
        </h1>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          用 AI 辅助快速迭代出的个人项目
        </p>
        <div style={{ marginTop: '24px' }}>
          <button
            onClick={() => {
              setEditingProject(null)
              setIsAddModalOpen(true)
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--color-cyan)',
              color: 'var(--color-bg)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px 0 var(--color-cyan-glow)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px 0 var(--color-cyan-glow)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 14px 0 var(--color-cyan-glow)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            新增 Vibe 项目
          </button>
        </div>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '100px 0', color: 'var(--color-text-muted)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--color-cyan-30)',
              borderTopColor: 'var(--color-cyan)',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite',
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            加载中...
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '100px 0', color: 'var(--color-text-muted)' }}>
            暂无项目数据，通过上方按钮添加一个吧！
          </div>
        ) : (
          projects.map((project, index) => (
            <motion.a
              key={project.id}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 12,
                delay: index * 0.1
              }}
              onHoverStart={() => setHoveredId(project.id)}
              onHoverEnd={() => setHoveredId(null)}
              style={{
                display: 'block',
                background: 'var(--color-ai-card-bg)',
                border: `1px solid ${hoveredId === project.id ? 'var(--color-cyan-50)' : 'var(--color-ai-card-border)'}`,
                borderRadius: '16px',
                padding: '32px 24px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: hoveredId === project.id ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow:
                  hoveredId === project.id
                    ? `0 15px 30px var(--color-ai-shadow-hover)`
                    : `0 5px 15px var(--color-ai-shadow)`,
                backdropFilter: 'blur(10px)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              {/* Edit button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setEditingProject(project)
                  setIsAddModalOpen(true)
                }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '56px', // 放在删除按钮左侧
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: 'var(--color-cyan)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: hoveredId === project.id ? 1 : 0,
                  transition: 'all 0.2s',
                  transform: hoveredId === project.id ? 'scale(1)' : 'scale(0.8)',
                  zIndex: 2,
                }}
                title="修改此项目"
              >
                ✎
              </button>

              {/* Delete button that appears on hover */}
              <button
                onClick={(e) => handleDelete(e, project.id, project.name)}
                disabled={deletingId === project.id}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: deletingId === project.id ? 'not-allowed' : 'pointer',
                  opacity: (hoveredId === project.id || deletingId === project.id) ? 1 : 0,
                  transition: 'all 0.2s',
                  transform: (hoveredId === project.id || deletingId === project.id) ? 'scale(1)' : 'scale(0.8)',
                  zIndex: 2,
                }}
                title="删除此项目"
              >
                {deletingId === project.id ? '...' : '×'}
              </button>

              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, var(--color-cyan), transparent)',
                  opacity: hoveredId === project.id ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '20px',
                  height: '20px',
                  borderTop: `2px solid ${hoveredId === project.id ? 'var(--color-cyan)' : 'transparent'}`,
                  borderRight: `2px solid ${hoveredId === project.id ? 'var(--color-cyan)' : 'transparent'}`,
                  transition: 'all 0.3s ease',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '2.5rem',
                    background: 'var(--color-ai-card-icon-bg)',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    border: '1px solid var(--color-ai-card-icon-border)',
                  }}
                >
                  {project.icon}
                </div>
              </div>

              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: 'var(--color-text-primary)',
                  paddingRight: '30px', // Prevent overlap with delete button
                }}
              >
                {project.name}
              </h3>
              <p
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                  minHeight: '60px',
                }}
              >
                {project.description}
              </p>

              <span
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-cyan)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                访问 →
              </span>

              <div
                style={{
                  position: 'absolute',
                  bottom: '-50%',
                  left: '-20%',
                  width: '140%',
                  height: '100%',
                  background:
                    'radial-gradient(ellipse at bottom, var(--color-cyan-15) 0%, transparent 70%)',
                  opacity: hoveredId === project.id ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                  pointerEvents: 'none',
                  zIndex: -1,
                }}
              />
            </motion.a>
          ))
        )}
      </div>

      <AddVibeModal
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
