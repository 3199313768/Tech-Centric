'use client'

import { useState, useEffect } from 'react'
import { Project, ProjectType } from '@/data/projects'
import { ProjectReader } from './ProjectReader'
import { ClipCard } from './ClipCard'
import { motion } from 'framer-motion'
import { useBreakpoint } from '@/utils/useBreakpoint'
import { createClient } from '@/lib/supabase/client'
import { AddProjectModal } from './AddProjectModal'

interface ProjectsProps {
  compact?: boolean
}

export function Projects({ compact = false }: ProjectsProps) {
  const [projectsList, setProjectsList] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<ProjectType | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'in-progress' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isReaderOpen, setIsReaderOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { isMobile, isTablet } = useBreakpoint()
  const px = isMobile ? '20px' : isTablet ? '24px' : '40px'

  const fetchProjects = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (!error && data) {
      setProjectsList(data.map(p => ({
        id: p.id,
        title: p.title,
        type: p.type as ProjectType,
        description: p.description,
        detailedDescription: p.detailed_description,
        image: p.image,
        demoUrl: p.demo_url,
        githubUrl: p.github_url,
        technologies: p.technologies,
        highlights: p.highlights,
        status: p.status,
        startDate: p.start_date,
        endDate: p.end_date
      })))
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const projectTypes = ['all', ...Array.from(new Set(projectsList.map(p => p.type)))]
  const statusOptions: Array<'all' | 'completed' | 'in-progress' | 'archived'> = ['all', 'completed', 'in-progress', 'archived']

  const SearchHighlight = ({ text, query }: { text: string; query: string }) => {
    if (!query.trim()) return <span>{text}</span>
    const parts = text.split(new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\\\^$|#\\s]/g, '\\\\$&')})`, 'gi'))
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} style={{ backgroundColor: 'var(--color-cyan-30)', color: 'var(--color-cyan)', padding: '0 2px', borderRadius: '2px' }}>{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    )
  }

  const filteredProjects = projectsList.filter((project) => {
    const typeMatch = selectedType === 'all' || project.type === selectedType
    const statusMatch = selectedStatus === 'all' || project.status === selectedStatus
    const searchMatch = !searchQuery.trim() || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return typeMatch && statusMatch && searchMatch
  })

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsReaderOpen(true)
  }

  const handleCloseReader = () => {
    setIsReaderOpen(false)
    setSelectedProject(null)
  }

  if (isLoading) {
    return (
      <div style={{ padding: compact ? `80px ${px} 80px` : `120px ${px} 80px`, maxWidth: '1400px', margin: '0 auto', color: 'var(--color-text-primary)' }}>
        <h2 className="magazine-headline" style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 'bold', marginBottom: '48px', fontFamily: 'var(--font-space-mono), monospace', textTransform: 'uppercase', letterSpacing: '4px', color: 'var(--color-headline)' }}>
          项目作品集
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-cyan-30)', borderTopColor: 'var(--color-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: compact ? `80px ${px} 80px` : `120px ${px} 80px`,
        maxWidth: '1400px',
        margin: '0 auto',
        color: 'var(--color-text-primary)',
      }}
    >
      <motion.h2
        id="projects"
        className="magazine-headline"
        style={{
          fontSize: 'clamp(40px, 6vw, 64px)',
          fontWeight: 'bold',
          marginBottom: '48px',
          fontFamily: 'var(--font-space-mono), monospace',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          color: 'var(--color-headline)',
          textShadow: 'var(--color-headline-shadow)',
          scrollMarginTop: '100px',
        }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
      >
        项目作品集
      </motion.h2>

      {/* 筛选器模块与操作按钮 */}
      <motion.div
        style={{
          marginBottom: '48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px',
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div style={{ flex: 1, minWidth: '300px' }}>
          {/* 综合搜索 */}
          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索项目名称、描述或技术栈..."
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '12px 16px',
                fontSize: '14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--color-btn-inactive-border)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-cyan-50)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-btn-inactive-border)'}
            />
          </div>

          {/* 类型筛选 */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-space-mono), monospace',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              类型：
            </span>
            {projectTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as ProjectType | 'all')}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-space-mono), monospace',
                  fontWeight: selectedType === type ? 'bold' : 'normal',
                  color: selectedType === type ? 'var(--color-cyan)' : 'var(--color-btn-inactive-text)',
                  backgroundColor: selectedType === type ? 'var(--color-cyan-10)' : 'transparent',
                  border: `1px solid ${selectedType === type ? 'var(--color-cyan-50)' : 'var(--color-btn-inactive-border)'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.2s ease',
                }}
              >
                {type === 'all' ? '全部' : type}
              </button>
            ))}
          </div>

          {/* 状态筛选 */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-space-mono), monospace',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              状态：
            </span>
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-space-mono), monospace',
                  fontWeight: selectedStatus === status ? 'bold' : 'normal',
                  color: selectedStatus === status ? 'var(--color-cyan)' : 'var(--color-btn-inactive-text)',
                  backgroundColor: selectedStatus === status ? 'var(--color-cyan-10)' : 'transparent',
                  border: `1px solid ${selectedStatus === status ? 'var(--color-cyan-50)' : 'var(--color-btn-inactive-border)'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.2s ease',
                }}
              >
                {status === 'all' ? '全部' : status === 'completed' ? '已完成' : status === 'in-progress' ? '进行中' : '已归档'}
              </button>
            ))}
          </div>
        </div>
        
        {/* 新增操作 */}
        <div>
          <button
            onClick={() => setIsAddModalOpen(true)}
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
      {filteredProjects.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '260px' : '320px'}, 1fr))`,
            gap: isMobile ? '20px' : '32px',
          }}
        >
          {filteredProjects.map((project, index) => (
            <ClipCard
              key={project.id}
              delay={index * 0.1}
              onClick={() => handleProjectClick(project)}
              style={{
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  color: '#0a0a0a',
                }}
              >
                <h3
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    lineHeight: '1.3',
                  }}
                >
                  <SearchHighlight text={project.title} query={searchQuery} />
                </h3>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                      color: '#0a0a0a',
                      border: '1px solid rgba(0, 0, 0, 0.2)',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {project.type}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-space-mono), monospace',
                      color: project.status === 'completed' ? '#22c55e' : project.status === 'in-progress' ? '#00b8d9' : 'rgba(0, 0, 0, 0.6)',
                      border: `1px solid ${project.status === 'completed' ? 'rgba(34, 197, 94, 0.3)' : project.status === 'in-progress' ? 'rgba(0, 184, 217, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
                      backgroundColor: project.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : project.status === 'in-progress' ? 'rgba(0, 184, 217, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {project.status === 'completed' ? '已完成' : project.status === 'in-progress' ? '进行中' : '已归档'}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'rgba(0, 0, 0, 0.8)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    marginBottom: '16px',
                    flex: 1,
                  }}
                >
                  <SearchHighlight text={project.description} query={searchQuery} />
                </p>

                {project.technologies && project.technologies.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom: '16px',
                    }}
                  >
                    {project.technologies.slice(0, 4).map((tech, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-jetbrains-mono), monospace',
                          color: 'rgba(0, 0, 0, 0.7)',
                          border: '1px solid rgba(0, 0, 0, 0.15)',
                          backgroundColor: 'rgba(0, 0, 0, 0.03)',
                          padding: '3px 8px',
                          borderRadius: '3px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-jetbrains-mono), monospace',
                          color: 'rgba(0, 0, 0, 0.5)',
                          padding: '3px 8px',
                        }}
                      >
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {project.startDate && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'rgba(0, 0, 0, 0.5)',
                      fontFamily: 'var(--font-space-mono), monospace',
                      marginTop: 'auto',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {project.startDate} {project.endDate ? `- ${project.endDate}` : ''}
                  </div>
                )}
              </div>
            </ClipCard>
          ))}
        </div>
      ) : (
        <motion.p
          style={{
            fontSize: '18px',
            lineHeight: '1.8',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            textAlign: 'center',
            padding: '60px 20px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          暂无匹配的项目
        </motion.p>
      )}

      {/* 项目详情弹窗 */}
      <ProjectReader
        project={selectedProject}
        isOpen={isReaderOpen}
        onClose={handleCloseReader}
      />

      {/* 新增项目弹窗 */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  )
}
