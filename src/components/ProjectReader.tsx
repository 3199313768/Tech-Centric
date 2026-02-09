'use client'

import { useEffect } from 'react'
import { Project } from '@/data/projects'

interface ProjectReaderProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectReader({ project, isOpen, onClose }: ProjectReaderProps) {
  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !project) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(0px)', // 背景模糊在父组件处理
      }}
      onClick={(e) => {
        // 点击背景关闭
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {/* 内容容器 */}
      <div
        className="relative w-full h-full overflow-y-auto"
        style={{
          maxWidth: '900px',
          padding: '80px 40px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="fixed top-8 right-8 z-10 text-white hover:text-gray-300 transition-colors"
          style={{
            fontSize: '32px',
            lineHeight: '1',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: '8px',
            fontFamily: 'monospace',
          }}
          aria-label="关闭"
        >
          ×
        </button>

        {/* 项目标题 */}
        <h1
          className="text-white mb-8"
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            lineHeight: '1.2',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            marginBottom: '32px',
          }}
        >
          {project.title}
        </h1>

        {/* 项目元信息 */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '32px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              border: '2px solid rgba(0, 217, 255, 0.5)',
              backgroundColor: 'rgba(0, 217, 255, 0.1)',
              fontSize: '14px',
              color: '#00d9ff',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            {project.type}
          </div>
          {project.status && (
            <span
              style={{
                fontSize: '12px',
                color: project.status === 'completed' ? '#22c55e' : project.status === 'in-progress' ? '#00d9ff' : 'rgba(255, 255, 255, 0.6)',
                fontFamily: 'var(--font-space-mono), monospace',
                padding: '4px 12px',
                border: `1px solid ${project.status === 'completed' ? 'rgba(34, 197, 94, 0.3)' : project.status === 'in-progress' ? 'rgba(0, 217, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              {project.status === 'completed' ? '已完成' : project.status === 'in-progress' ? '进行中' : '已归档'}
            </span>
          )}
          {project.startDate && project.endDate && (
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontFamily: 'var(--font-space-mono), monospace',
              }}
            >
              {project.startDate} - {project.endDate}
            </span>
          )}
        </div>

        {/* 项目链接 */}
        {(project.demoUrl || project.githubUrl) && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '32px',
              flexWrap: 'wrap',
            }}
          >
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontFamily: 'var(--font-space-mono), monospace',
                  fontWeight: 'bold',
                  color: '#0a0a0a',
                  backgroundColor: '#00d9ff',
                  border: '2px solid #00d9ff',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00b8d9'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#00d9ff'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                查看演示
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontFamily: 'var(--font-space-mono), monospace',
                  fontWeight: 'bold',
                  color: '#00d9ff',
                  backgroundColor: 'transparent',
                  border: '2px solid #00d9ff',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)'
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                GitHub
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            )}
          </div>
        )}

        {/* 项目截图 */}
        {project.image && (
          <div
            style={{
              width: '100%',
              marginBottom: '32px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(0, 217, 255, 0.3)',
            }}
          >
            <img
              src={project.image}
              alt={project.title}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* 项目描述 */}
        <div style={{ marginBottom: '32px' }}>
          <p
            style={{
              fontSize: '18px',
              lineHeight: '1.8',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '16px',
            }}
          >
            {project.description}
          </p>
          {project.detailedDescription && (
            <p
              style={{
                fontSize: '16px',
                lineHeight: '1.8',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                color: 'rgba(255, 255, 255, 0.75)',
              }}
            >
              {project.detailedDescription}
            </p>
          )}
        </div>

        {/* 项目亮点 */}
        {project.highlights && project.highlights.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#00d9ff',
                fontFamily: 'var(--font-space-mono), monospace',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              项目亮点
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
              }}
            >
              {project.highlights.map((highlight, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    marginBottom: '12px',
                    paddingLeft: '24px',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: '0',
                      color: '#00d9ff',
                      fontSize: '20px',
                    }}
                  >
                    ▸
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 技术栈 */}
        {project.technologies && project.technologies.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#00d9ff',
                fontFamily: 'var(--font-space-mono), monospace',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              技术栈
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              {project.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    color: '#00d9ff',
                    border: '1px solid rgba(0, 217, 255, 0.3)',
                    backgroundColor: 'rgba(0, 217, 255, 0.05)',
                    padding: '6px 14px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}