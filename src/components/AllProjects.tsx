'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { type AllProjectItem, type ProjectCategory } from '@/data/allProjects'
import { createClient } from '@/lib/supabase/client'
import { AddAllProjectModal } from './AddAllProjectModal'
import { SpiritSubpageHero } from '@/components/spirit/SpiritSubpageHero'
import { getArchiveAccent, getArchiveCode } from '@/utils/archiveCategory'
import { handleWatercolorHover } from '@/utils/watercolorHover'

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
    <div className="sg-modal-backdrop" style={{ zIndex: 3000 }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="sg-modal-panel sg-modal-panel--wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sg-modal-hero">
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
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>分类: {project.category}</span>
              </div>
            </div>

            <div className="sg-modal-detail-actions">
              <button
                type="button"
                className="sg-btn sg-btn--ghost sg-icon-btn--danger"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ width: 'auto', height: 'auto', borderRadius: '8px', padding: '10px 16px' }}
              >
                {isDeleting ? '删除中...' : '删除项目'}
              </button>

              <button
                type="button"
                className="sg-btn sg-btn--ghost"
                onClick={onEdit}
                style={{ padding: '10px 16px' }}
              >
                ✎ 修改信息
              </button>

              {project.isPublic ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="sg-btn sg-btn--primary"
                  style={{ textDecoration: 'none' }}
                >
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
              <h4 className="sg-modal-section-title">
                业务痛点 / 核心功能
              </h4>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                {project.description}
              </p>
            </div>

            <div>
              <h4 className="sg-modal-section-title">
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
                  <span key={tag} className="sg-tag">
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

function ProjectMedia({
  project,
  isHovered,
  currentImageIndex,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 400px',
}: {
  project: AllProjectItem
  isHovered: boolean
  currentImageIndex: number
  priority?: boolean
  sizes?: string
}) {
  if (project.screenshots.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
        暂无截图
      </div>
    )
  }

  return (
    <>
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
            priority={priority}
            sizes={sizes}
            style={{ objectFit: 'cover' }}
          />
        </motion.div>
      </AnimatePresence>
      {project.screenshots.length > 1 ? (
        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>
          {project.screenshots.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === currentImageIndex ? '16px' : '6px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: idx === currentImageIndex ? 'var(--color-cyan)' : 'rgba(255,255,255,0.6)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}

function useProjectCarousel(screenshotCount: number) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isHovered && screenshotCount > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % screenshotCount)
      }, 1200)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isHovered, screenshotCount])

  return {
    isHovered,
    currentImageIndex,
    bindHover: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => {
        setIsHovered(false)
        setCurrentImageIndex(0)
      },
    },
  }
}

const FeaturedProjectCard = ({
  project,
  onClick,
}: {
  project: AllProjectItem
  onClick: () => void
}) => {
  const { isHovered, currentImageIndex, bindHover } = useProjectCarousel(project.screenshots.length)
  const accent = getArchiveAccent(project.category)

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px' }}
      transition={{ duration: 0.6 }}
      {...bindHover}
      onMouseMove={handleWatercolorHover}
      onClick={onClick}
      className="sg-card sg-card--watercolor sg-archive-featured sg-bento-archive__featured"
      style={{ ['--archive-accent' as string]: accent }}
    >
      <span className="sg-project-card__code">{getArchiveCode(project.category, 0)}</span>
      <div className={`sg-project-card__badge ${project.isPublic ? 'sg-project-card__badge--public' : 'sg-project-card__badge--private'}`}>
        {project.isPublic ? '公网可见' : '内部系统'}
      </div>
      <div className="sg-archive-featured__media">
        <ProjectMedia
          project={project}
          isHovered={isHovered}
          currentImageIndex={currentImageIndex}
          priority
          sizes="(max-width: 768px) 100vw, 720px"
        />
      </div>
      <div className="sg-archive-featured__body">
        <p className="sg-archive-featured__eyebrow">最新归档 · {project.category}</p>
        <h2 className="sg-archive-featured__title">{project.name}</h2>
        <p className="sg-card-desc">{project.description}</p>
        <div className="sg-card__tags">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="sg-tag sg-tag--platform">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

// ==========================================
// 卡片组件
// ==========================================
const ProjectCard = ({
  project,
  delay,
  index,
  onClick,
}: {
  project: AllProjectItem
  delay: number
  index: number
  onClick: () => void
}) => {
  const { isHovered, currentImageIndex, bindHover } = useProjectCarousel(project.screenshots.length)
  const accent = getArchiveAccent(project.category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px' }}
      transition={{ duration: 0.5, delay }}
      {...bindHover}
      onMouseMove={handleWatercolorHover}
      onClick={onClick}
      className="sg-card sg-card--watercolor sg-project-card sg-project-card--accent sg-bento-archive__item"
      style={{ ['--archive-accent' as string]: accent }}
    >
      <span className="sg-project-card__code">{getArchiveCode(project.category, index)}</span>
      <div className={`sg-project-card__badge ${project.isPublic ? 'sg-project-card__badge--public' : 'sg-project-card__badge--private'}`}>
        {project.isPublic ? '公网可见' : '内部系统'}
      </div>

      <div className="sg-project-card__media">
        <ProjectMedia
          project={project}
          isHovered={isHovered}
          currentImageIndex={currentImageIndex}
        />
      </div>

      <div className="sg-project-card__body">
        <h3 className="sg-project-card__title">
          {project.name}
        </h3>
        
        <p className="sg-project-card__desc">
          {project.description}
        </p>
        <div className="sg-card__tags">
          {project.tags.slice(0, 3).map(tag => (
            <span key={tag} className="sg-tag sg-tag--platform">
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

  const publicCount = allProjectsList.filter((p) => p.isPublic).length
  const categoryCount = new Set(allProjectsList.map((p) => p.category)).size
  const showBento = activeCategory === '全部' && filteredProjects.length > 0
  const featuredProject = showBento ? filteredProjects[0] : null
  const gridProjects = showBento ? filteredProjects.slice(1) : filteredProjects

  if (isLoading) {
    return (
      <div className="sg-page">
        <SpiritSubpageHero theme="archive" eyebrow="工艺档案室" title="全部项目" />
        <div className="sg-state sg-state--loading">
          <div className="sg-state__spinner" aria-hidden />
          加载中...
        </div>
      </div>
    )
  }

  return (
    <div className="sg-page">
      <SpiritSubpageHero
        theme="archive"
        eyebrow="工艺档案室"
        title="全部项目"
        lead="在此查看我参与交付的所有商业层级与架构层级应用。通过多维度的业务重构与技术探索，建立稳健、动态且极具响应表现的系统工程。"
        stats={[
          { label: '项目总数', value: allProjectsList.length },
          { label: '公网可见', value: publicCount },
          { label: '分类维度', value: categoryCount },
        ]}
        actions={
          <button
            type="button"
            className="sg-btn sg-btn--primary"
            onClick={() => {
              setEditingProject(null)
              setIsAddModalOpen(true)
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            新增项目
          </button>
        }
      />

      <div className="sg-toolbar-row">
        <div className="sg-filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`sg-filter-chip sg-filter-chip--sign${activeCategory === cat ? ' sg-filter-chip--active' : ''}`}
            >
              <span
                className="sg-filter-chip__dot"
                style={{ background: getArchiveAccent(cat) }}
                aria-hidden
              />
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={`sg-bento-archive${showBento ? '' : ' sg-bento-archive--uniform'}`}>
        {featuredProject ? (
          <FeaturedProjectCard
            project={featuredProject}
            onClick={() => setSelectedProject(featuredProject)}
          />
        ) : null}
        {gridProjects.map((project, idx) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={showBento ? idx + 1 : idx}
            delay={idx * 0.05}
            onClick={() => setSelectedProject(project)}
          />
        ))}
        {filteredProjects.length === 0 ? (
          <div className="sg-state sg-state--empty" style={{ gridColumn: '1 / -1' }}>
            暂无该分类下的项目
          </div>
        ) : null}
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
