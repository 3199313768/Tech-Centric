'use client'

import { useState, useEffect, useCallback, type HTMLAttributes } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { type AllProjectItem, type ProjectCategory } from '@/data/site/allProjects'
import { reorderAllProjects } from '@/lib/projects/actions'
import { mergeVisibleOrder } from '@/lib/projects/mergeVisibleOrder'
import { projectRoute } from '@/lib/site/routes'
import { SpiritSubpageHero } from '@/components/spirit/shell/SpiritSubpageHero'
import { useToast } from '@/components/spirit/feedback/ToastProvider'
import { getArchiveAccent, getArchiveCode } from '@/utils/archiveCategory'
import { handleWatercolorHover } from '@/utils/watercolorHover'
import { ScrollReveal } from '@/components/spirit/feedback/ScrollReveal'
import { SpiritEmptyState } from '@/components/spirit/feedback/SpiritEmptyState'
import { useSyncInitialData } from '@/utils/useSyncInitialData'

const AddAllProjectModal = dynamic(
  () => import('./AddAllProjectModal').then((m) => ({ default: m.AddAllProjectModal })),
)

const ProjectModal = dynamic(
  () => import('./ProjectModal').then((module) => ({ default: module.ProjectModal })),
)

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

// ==========================================
// 卡片组件
// ==========================================
const ProjectCard = ({
  project,
  index,
  onManage,
  onOpen,
  dragHandle,
}: {
  project: AllProjectItem
  index: number
  onManage: (project: AllProjectItem) => void
  onOpen: (project: AllProjectItem) => void
  dragHandle?: {
    attributes: HTMLAttributes<HTMLButtonElement>
    listeners?: HTMLAttributes<HTMLButtonElement>
  }
}) => {
  const { isHovered, currentImageIndex, bindHover } = useProjectCarousel(project.screenshots.length)
  const accent = getArchiveAccent(project.category)

  return (
    <ScrollReveal index={index} className="sg-bento-archive__item">
      <div
        role="button"
        tabIndex={0}
        {...bindHover}
        onMouseMove={handleWatercolorHover}
        onClick={() => onOpen(project)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpen(project)
          }
        }}
        className="sg-card sg-card--watercolor sg-card--exhibit sg-card--archive sg-project-card sg-project-card--accent"
        style={{ ['--archive-accent' as string]: accent }}
      >
      {dragHandle ? (
        <button
          type="button"
          className="sg-project-card__drag"
          aria-label="拖动排序"
          onClick={(event) => event.stopPropagation()}
          {...dragHandle.attributes}
          {...dragHandle.listeners}
        >
          ⋮⋮
        </button>
      ) : null}
      <button
        type="button"
        className="sg-project-card__manage"
        aria-label={`管理项目：${project.name}`}
        onClick={(event) => {
          event.stopPropagation()
          onManage(project)
        }}
      >
        管理
      </button>
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
      </div>
    </ScrollReveal>
  )
}

function SortableProjectCard({
  project,
  index,
  onManage,
  onOpen,
}: {
  project: AllProjectItem
  index: number
  onManage: (project: AllProjectItem) => void
  onOpen: (project: AllProjectItem) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.85 : undefined,
        zIndex: isDragging ? 2 : undefined,
      }}
    >
      <ProjectCard
        project={project}
        index={index}
        onManage={onManage}
        onOpen={onOpen}
        dragHandle={{
          attributes: attributes as HTMLAttributes<HTMLButtonElement>,
          listeners: listeners as HTMLAttributes<HTMLButtonElement> | undefined,
        }}
      />
    </div>
  )
}

// ==========================================
// 主页面组件
// ==========================================
export function AllProjects({
  initialProjects,
  canReorder = false,
}: {
  initialProjects: AllProjectItem[]
  canReorder?: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [allProjectsList, setAllProjectsList] = useState(initialProjects)
  useSyncInitialData(initialProjects, setAllProjectsList)
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | '全部'>('全部')
  const [selectedProject, setSelectedProject] = useState<AllProjectItem | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<AllProjectItem | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const refreshProjects = useCallback(() => {
    router.refresh()
  }, [router])

  const openProject = useCallback(
    (project: AllProjectItem) => {
      router.push(projectRoute(project.slug))
    },
    [router],
  )

  const categories: Array<ProjectCategory | '全部'> = ['全部', '门户与展现', '数字孪生']

  const filteredProjects =
    activeCategory === '全部'
      ? allProjectsList
      : allProjectsList.filter((p) => p.category === activeCategory)

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || isReordering) return

    const oldIndex = filteredProjects.findIndex((project) => project.id === active.id)
    const newIndex = filteredProjects.findIndex((project) => project.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const visibleOrderedIds = arrayMove(filteredProjects, oldIndex, newIndex).map((project) => project.id)
    const fullIds = allProjectsList.map((project) => project.id)
    let nextFullIds: string[]
    try {
      nextFullIds = mergeVisibleOrder(fullIds, visibleOrderedIds)
    } catch (error) {
      toast(error instanceof Error ? error.message : '排序失败', 'error')
      return
    }

    const previous = allProjectsList
    const byId = new Map(allProjectsList.map((project) => [project.id, project]))
    setAllProjectsList(
      nextFullIds.map((id, index) => ({
        ...byId.get(id)!,
        sortOrder: index,
      })),
    )

    setIsReordering(true)
    const { error } = await reorderAllProjects(nextFullIds)
    setIsReordering(false)

    if (error) {
      setAllProjectsList(previous)
      toast(error, 'error')
    }
  }, [allProjectsList, filteredProjects, isReordering, toast])

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

  const shelf = (
    <div className="sg-archive-shelf sg-bento-archive sg-bento-archive--uniform">
      {canReorder
        ? filteredProjects.map((project, idx) => (
            <SortableProjectCard
              key={project.id}
              project={project}
              index={idx}
              onManage={setSelectedProject}
              onOpen={openProject}
            />
          ))
        : filteredProjects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={idx}
              onManage={setSelectedProject}
              onOpen={openProject}
            />
          ))}
      {filteredProjects.length === 0 ? (
        <SpiritEmptyState
          className="sg-empty-state--grid"
          imageSrc="/spirit-garden/icon-book.png"
          title="暂无该分类下的项目"
          description="切换其他分类，或通过上方按钮新增归档。"
        />
      ) : null}
    </div>
  )

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

      {canReorder ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            void handleDragEnd(event)
          }}
        >
          <SortableContext
            items={filteredProjects.map((project) => project.id)}
            strategy={rectSortingStrategy}
          >
            {shelf}
          </SortableContext>
        </DndContext>
      ) : shelf}

      <AnimatePresence>
        {selectedProject ? (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onDeleteSuccess={refreshProjects}
            onEdit={() => {
              setEditingProject(selectedProject)
              setIsAddModalOpen(true)
            }}
          />
        ) : null}
      </AnimatePresence>

      {isAddModalOpen ? (
        <AddAllProjectModal
          key={editingProject?.id ?? 'new-all-project'}
          isOpen
          onClose={() => {
            setIsAddModalOpen(false)
            setEditingProject(null)
          }}
          onSuccess={() => {
            refreshProjects()
            if (editingProject && selectedProject) {
              setSelectedProject(null)
            }
          }}
          initialData={editingProject}
        />
      ) : null}
    </div>
  )
}
