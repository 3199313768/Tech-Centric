'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { AllProjectItem } from '@/data/site/allProjects'
import { deleteAllProject } from '@/lib/projects/actions'
import { useToast } from '@/components/spirit/feedback/ToastProvider'
import { DeleteConfirmBar } from '@/components/spirit/feedback/DeleteConfirmBar'

interface ProjectModalProps {
  project: AllProjectItem
  canManage?: boolean
  onClose: () => void
  onDeleteSuccess?: () => void
  onEdit?: () => void
}

export function ProjectModal({ project, canManage = false, onClose, onDeleteSuccess, onEdit }: ProjectModalProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const { error } = await deleteAllProject(project.id)
    setIsDeleting(false)
    setShowDeleteConfirm(false)

    if (error) {
      toast(`删除失败：${error}`, 'error')
    } else {
      toast('项目已删除', 'success')
      onClose()
      onDeleteSuccess?.()
    }
  }

  return (
    <div className="sg-modal-backdrop" style={{ zIndex: 3000 }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="sg-modal-panel sg-modal-panel--wide"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sg-modal-hero">
          {project.screenshots.length > 0 ? (
            <Image
              src={project.screenshots[0]}
              alt={project.name}
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              暂无截图
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭项目详情"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              color: '#fff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            ×
          </button>
        </div>

        <div className="sg-modal-detail-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
                  {project.name}
                </h2>
                <span
                  style={{
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: project.isPublic ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: project.isPublic ? '#22c55e' : '#ef4444',
                    border: `1px solid ${project.isPublic ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}
                >
                  {project.isPublic ? '🌐 公网可访问' : '🔒 内网/私有系统'}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>分类: {project.category}</span>
            </div>

            <div className="sg-modal-detail-actions">
              {canManage ? (
                <>
                  {showDeleteConfirm ? (
                    <DeleteConfirmBar
                      message={`确定删除「${project.name}」？不可撤销`}
                      onCancel={() => setShowDeleteConfirm(false)}
                      onConfirm={handleDelete}
                      isLoading={isDeleting}
                    />
                  ) : (
                    <button
                      type="button"
                      className="sg-btn sg-btn--ghost sg-icon-btn--danger"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                      style={{ width: 'auto', height: 'auto', borderRadius: '8px', padding: '10px 16px' }}
                    >
                      删除项目
                    </button>
                  )}

                  <button type="button" className="sg-btn sg-btn--ghost" onClick={onEdit} style={{ padding: '10px 16px' }}>
                    ✎ 修改信息
                  </button>
                </>
              ) : null}

              {project.isPublic ? (
                <a href={project.url} target="_blank" rel="noreferrer" className="sg-btn sg-btn--primary" style={{ textDecoration: 'none' }}>
                  访问项目 ↗
                </a>
              ) : (
                <div className="sg-btn sg-btn--ghost" style={{ cursor: 'default', opacity: 0.7 }}>
                  需内网环境访问
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h4 className="sg-modal-section-title">业务痛点 / 核心功能</h4>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                {project.description}
              </p>
            </div>
            <div>
              <h4 className="sg-modal-section-title">主导工作 / 核心贡献</h4>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                {project.roleAndContribution}
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '12px' }}>核心技术标签</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {project.tags.map((tag) => <span key={tag} className="sg-tag">{tag}</span>)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
