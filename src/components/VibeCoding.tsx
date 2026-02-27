'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface VibeProject {
  id: string
  name: string
  description: string
  url: string
  icon: string
}

const projects: VibeProject[] = [
  {
    id: 'ai-table',
    name: 'AI思维圆桌',
    description: '让思想，在分歧中变得完整。多角色 AI 圆桌讨论，支持主持人、逻辑审查者、创新者等角色。',
    url: 'https://ai-table-eosin.vercel.app/',
    icon: '🪑',
  },
  {
    id: 'ai-news',
    name: '每日简报',
    description: 'AI 驱动的每日新闻简报，聚合重要资讯。',
    url: 'https://ai-news-ochre-sigma.vercel.app/',
    icon: '📰',
  },
]

export function VibeCoding() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 12 },
    },
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
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {projects.map((project) => (
          <motion.a
            key={project.id}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            variants={cardVariants}
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
        ))}
      </motion.div>
    </div>
  )
}
