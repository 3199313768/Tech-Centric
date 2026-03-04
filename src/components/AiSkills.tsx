'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AddSkillModal } from './AddSkillModal'

interface AgentSkill {
  id: string
  name: string
  icon: string
  description: string
  tags: string[]
  platform?: string
  link?: string
}

// SKILL_REPO link constant will remain if needed.
const SKILL_REPO = 'https://github.com/3199313768/SKILL'

export function AiSkills() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [skills, setSkills] = useState<AgentSkill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingSkill, setEditingSkill] = useState<AgentSkill | null>(null)

  const fetchSkills = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('ai_skills').select('*').order('created_at', { ascending: false })
    if (!error && data) {
      setSkills(data.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        description: item.description,
        tags: Array.isArray(item.tags) ? item.tags : (typeof item.tags === 'string' ? item.tags.replace(/^{|}$/g, '').split(',').map((s: string) => s.trim().replace(/^"|"$/g, '')) : []),
        platform: item.platform,
        link: item.link
      })))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line
    fetchSkills()
  }, [fetchSkills])

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation() // Prevent triggering the card click
    if (!window.confirm(`确定要删除技能 "${name}" 吗？此操作不可逆。`)) {
      return
    }
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('ai_skills').delete().eq('id', id)
    setDeletingId(null)

    if (error) {
      alert('删除失败：' + error.message)
    } else {
      fetchSkills()
    }
  }

  // Unused variants removed

  return (
    <div style={{
      padding: '120px 24px 80px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-inter), sans-serif',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: '60px', textAlign: 'center' }}
      >
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: '1.2rem',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          一套提高开发效率的 Agent Skills 集合，包含代码提交、提交规范、周报生成、UI 优化、代码审计等实用技能
        </p>
        <div style={{ marginTop: '24px' }}>
          <button
            onClick={() => {
              setEditingSkill(null)
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
            新增技能
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
        ) : skills.length === 0 ? (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '100px 0', color: 'var(--color-text-muted)' }}>
            暂无技能数据，通过上方按钮添加一个吧！
          </div>
        ) : (
          skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 12,
                delay: index * 0.1
              }}
              onHoverStart={() => setHoveredId(skill.id)}
              onHoverEnd={() => setHoveredId(null)}
              onClick={() => {
                const url = skill.link || SKILL_REPO
                window.open(url, '_blank', 'noopener,noreferrer')
              }}
              style={{
                background: 'var(--color-ai-card-bg)',
                border: `1px solid ${hoveredId === skill.id ? 'var(--color-cyan-50)' : 'var(--color-ai-card-border)'}`,
                borderRadius: '16px',
                padding: '32px 24px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: hoveredId === skill.id ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: hoveredId === skill.id ? `0 15px 30px var(--color-ai-shadow-hover)` : `0 5px 15px var(--color-ai-shadow)`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--color-cyan), transparent)',
                opacity: hoveredId === skill.id ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }} />
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '20px',
                height: '20px',
                borderTop: `2px solid ${hoveredId === skill.id ? 'var(--color-cyan)' : 'transparent'}`,
                borderRight: `2px solid ${hoveredId === skill.id ? 'var(--color-cyan)' : 'transparent'}`,
                transition: 'all 0.3s ease',
              }} />

              {/* Edit button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingSkill(skill)
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
                  opacity: hoveredId === skill.id ? 1 : 0,
                  transition: 'all 0.2s',
                  transform: hoveredId === skill.id ? 'scale(1)' : 'scale(0.8)',
                  zIndex: 2,
                }}
                title="修改此技能"
              >
                ✎
              </button>

              {/* Delete button that appears on hover */}
              <button
                onClick={(e) => handleDelete(e, skill.id, skill.name)}
                disabled={deletingId === skill.id}
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
                  cursor: deletingId === skill.id ? 'not-allowed' : 'pointer',
                  opacity: (hoveredId === skill.id || deletingId === skill.id) ? 1 : 0,
                  transition: 'all 0.2s',
                  transform: (hoveredId === skill.id || deletingId === skill.id) ? 'scale(1)' : 'scale(0.8)',
                  zIndex: 2,
                }}
                title="删除此技能"
              >
                {deletingId === skill.id ? '...' : '×'}
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  background: 'var(--color-ai-card-icon-bg)',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  border: '1px solid var(--color-ai-card-icon-border)',
                }}>
                  {skill.icon}
                </div>
                {skill.platform && (
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    background: 'var(--color-cyan-10)',
                    color: 'var(--color-cyan)',
                    borderRadius: '20px',
                    fontFamily: 'var(--font-space-mono), monospace',
                    letterSpacing: '0.5px',
                    border: '1px solid var(--color-cyan-20)'
                  }}>
                    {skill.platform}
                  </span>
                )}
              </div>

              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: '12px',
                color: 'var(--color-text-primary)',
                transition: 'color 0.3s ease',
                paddingRight: '30px', // Prevent overlap with delete button
              }}>
                {skill.name}
              </h3>
              <p style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: '24px',
                minHeight: '70px',
              }}>
                {skill.description}
              </p>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                {skill.tags.map((tag, index) => (
                  <span key={index} style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    background: 'var(--color-ai-tag-bg)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--color-ai-tag-border)',
                    transition: 'all 0.2s ease',
                    ...(hoveredId === skill.id ? {
                      color: 'var(--color-cyan)',
                      borderColor: 'var(--color-cyan-20)',
                      background: 'var(--color-cyan-10)'
                    } : {})
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>

              <div style={{
                position: 'absolute',
                bottom: '-50%',
                left: '-20%',
                width: '140%',
                height: '100%',
                background: 'radial-gradient(ellipse at bottom, var(--color-cyan-15) 0%, transparent 70%)',
                opacity: hoveredId === skill.id ? 1 : 0,
                transition: 'opacity 0.5s ease',
                pointerEvents: 'none',
                zIndex: -1
              }} />
            </motion.div>
          ))
        )}
      </div>

      <AddSkillModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingSkill(null)
        }}
        onSuccess={fetchSkills}
        initialData={editingSkill}
      />
    </div>
  )
}
