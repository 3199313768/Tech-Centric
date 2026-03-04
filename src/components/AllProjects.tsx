'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { type AllProjectItem, type ProjectCategory } from '@/data/allProjects'
import { useBreakpoint } from '@/utils/useBreakpoint'
import { createClient } from '@/lib/supabase/client'
import { AddAllProjectModal } from './AddAllProjectModal'

// ==========================================
// 详情弹窗 Modal 组件
// ==========================================
function ProjectModal({
  project,
  isOpen,
  onClose,
  onDeleteSuccess,
  onEdit
}: {
  project: AllProjectItem | null
  isOpen: boolean
  onClose: () => void
  onDeleteSuccess?: () => void
  onEdit?: () => void
}) {
  const { isMobile } = useBreakpoint()
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen || !project) return null

  const handleDelete = async () => {
    if (!window.confirm(`确定要删除项目 "${project.name}" 吗？此操作不可逆。`)) {
      return
    }
    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('all_projects').delete().eq('id', project.id)
    setIsDeleting(false)

    if (error) {
      console.error('Delete error:', error)
      alert('删除失败：' + error.message)
    } else {
      onClose()
      if (onDeleteSuccess) {
        onDeleteSuccess()
      }
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '12px' : '40px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          background: 'var(--color-bg)',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--color-cyan-30)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部大图展示区 */}
        <div style={{ position: 'relative', width: '100%', height: isMobile ? '200px' : '360px', backgroundColor: '#000' }}>
          {project.screenshots.length > 0 ? (
            <Image
              src={project.screenshots[0]} // 这里暂不写复杂的弹窗内轮播，直接展示头图
              alt={project.name}
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>暂无截图</div>
          )}
          <button
            onClick={onClose}
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

        {/* 内容区 */}
        <div style={{ padding: isMobile ? '24px' : '40px', overflowY: 'auto' }}>
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
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>分类: {project.category}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                {isDeleting ? '删除中...' : '删除项目'}
              </button>

              <button
                onClick={onEdit}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  color: 'var(--color-cyan)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                ✎ 修改信息
              </button>

              {project.isPublic ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--color-cyan)',
                    color: 'var(--color-bg)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    boxShadow: '0 4px 14px 0 var(--color-cyan-glow)',
                  }}
                >
                  访问项目 ↗
                </a>
              ) : (
                <div style={{
                  padding: '10px 20px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'var(--color-text-muted)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  需内网环境访问
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--color-cyan-30)', paddingBottom: '8px' }}>
                业务痛点 / 核心功能
              </h4>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                {project.description}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--color-cyan-30)', paddingBottom: '8px' }}>
                主导工作 / 核心贡献
              </h4>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                {project.roleAndContribution}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
                核心技术标签
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {project.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: '13px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--color-ai-tag-bg)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-ai-tag-border)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ==========================================
// 卡片组件
// ==========================================
const ProjectCard = ({ project, delay, onClick }: { project: AllProjectItem, delay: number, onClick: () => void }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isHovered && project.screenshots.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % project.screenshots.length)
      }, 1200) // 1.2秒切换一次截图
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isHovered, project.screenshots.length])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setCurrentImageIndex(0)
      }}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-ai-card-bg, rgba(255,255,255,0.02))',
        borderRadius: '16px',
        border: '1px solid var(--color-cyan-30)',
        overflow: 'hidden',
        boxShadow: isHovered ? '0 10px 40px rgba(0, 217, 255, 0.15)' : 'none',
        transition: 'all 0.3s ease',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* 右上角角标 */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 20,
        backgroundColor: project.isPublic ? 'rgba(34, 197, 94, 0.9)' : 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 'bold',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {project.isPublic ? '公网可见' : '内部系统'}
      </div>

      {/* 截图容器，16:9 展示区 */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#000', overflow: 'hidden' }}>
        {project.screenshots.length > 0 ? (
          <AnimatePresence initial={false}>
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.5s ease',
              }}
            >
              <Image
                src={project.screenshots[currentImageIndex]}
                alt={`${project.name} screenshot`}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                style={{ objectFit: 'cover' }}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
            暂无截图
          </div>
        )}

        {/* 轮播指示器 */}
        {project.screenshots.length > 1 && (
          <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>
            {project.screenshots.map((_, idx) => (
              <div key={idx} style={{
                width: idx === currentImageIndex ? '16px' : '6px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: idx === currentImageIndex ? 'var(--color-cyan)' : 'rgba(255,255,255,0.6)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--color-cyan)' }}>
            {project.name}
          </h3>
        </div>
        
        <p style={{
          fontSize: '0.9rem',
          lineHeight: '1.6',
          color: 'var(--color-text-secondary)',
          flex: 1,
          marginBottom: '20px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {project.description}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {project.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-cyan-10)',
              color: 'var(--color-cyan)',
              border: '1px solid var(--color-cyan-30)',
              fontFamily: 'var(--font-space-mono), monospace',
            }}>
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ==========================================
// 主页面组件
// ==========================================
export function AllProjects() {
  const { isMobile, isTablet } = useBreakpoint()
  const px = isMobile ? '20px' : isTablet ? '24px' : '40px'
  
  const [allProjectsList, setAllProjectsList] = useState<AllProjectItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | '全部'>('全部')
  const [selectedProject, setSelectedProject] = useState<AllProjectItem | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<AllProjectItem | null>(null)

  const fetchAllProjects = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('all_projects').select('*').order('created_at', { ascending: false })
    if (!error && data) {
      setAllProjectsList(data.map(p => ({
        id: p.id,
        name: p.name,
        url: p.url,
        isPublic: p.is_public,
        category: p.category as ProjectCategory,
        description: p.description,
        roleAndContribution: p.role_and_contribution,
        tags: p.tags,
        screenshots: p.screenshots
      })))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line
    fetchAllProjects()
  }, [fetchAllProjects])

  const categories: Array<ProjectCategory | '全部'> = ['全部', '数字孪生', '后台与管理系统', '门户与展现', '未分类']

  const filteredProjects = activeCategory === '全部' 
    ? allProjectsList 
    : allProjectsList.filter(p => p.category === activeCategory)

  // 处理溢出滚动锁定
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selectedProject])

  if (isLoading) {
    return (
      <div style={{ padding: `120px ${px} 80px`, maxWidth: '1400px', margin: '0 auto', color: 'var(--color-text-primary)', minHeight: '100vh' }}>
        <h2 className="magazine-headline" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 'bold', marginBottom: '16px', fontFamily: 'var(--font-space-mono), monospace', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-headline)' }}>
          全部项目
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-cyan-30)', borderTopColor: 'var(--color-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: `120px ${px} 80px`,
        maxWidth: '1400px',
        margin: '0 auto',
        color: 'var(--color-text-primary)',
        minHeight: '100vh',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '40px' }}
      >
        <h2
          className="magazine-headline"
          style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 'bold',
            marginBottom: '16px',
            fontFamily: 'var(--font-space-mono), monospace',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'var(--color-headline)',
            textShadow: 'var(--color-headline-shadow)',
          }}
        >
          全部项目
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '700px', lineHeight: '1.6' }}>
          在此查看我参与交付的所有商业层级与架构层级应用。通过多维度的业务重构与技术探索，建立稳健、动态且极具响应表现的系统工程。
        </p>
      </motion.div>

      {/* 过滤器 Tab 与操作区 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '48px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '300px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: `1px solid ${activeCategory === cat ? 'var(--color-cyan)' : 'var(--color-ai-tag-border)'}`,
                background: activeCategory === cat ? 'var(--color-cyan-10)' : 'transparent',
                color: activeCategory === cat ? 'var(--color-cyan)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeCategory === cat ? 'bold' : 'normal',
                transition: 'all 0.2s',
                boxShadow: activeCategory === cat ? '0 0 10px var(--color-cyan-30)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 新增操作 */}
        <div>
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
              display: 'flex',
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
            新增项目
          </button>
        </div>
      </motion.div>

      {/* 项目网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '280px' : '360px'}, 1fr))`,
          gap: isMobile ? '24px' : '32px',
        }}
      >
        {filteredProjects.map((project, idx) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            delay={idx * 0.05} 
            onClick={() => setSelectedProject(project)}
          />
        ))}
        {filteredProjects.length === 0 && (
          <div style={{ color: 'var(--color-text-muted)', padding: '40px 0', gridColumn: '1 / -1', textAlign: 'center' }}>
            暂无该分类下的项目
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            isOpen={!!selectedProject}
            onClose={() => setSelectedProject(null)}
            onDeleteSuccess={fetchAllProjects}
            onEdit={() => {
              setEditingProject(selectedProject)
              setIsAddModalOpen(true)
            }}
          />
        )}
      </AnimatePresence>

      <AddAllProjectModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingProject(null)
        }}
        onSuccess={() => {
          fetchAllProjects()
          // Refresh open modal data
          if (editingProject && selectedProject) {
            setSelectedProject(null) // Simply close details modal on update
          }
        }}
        initialData={editingProject}
      />
    </div>
  )
}
