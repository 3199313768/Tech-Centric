'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface AgentSkill {
  id: string
  name: string
  icon: string
  description: string
  tags: string[]
  platform?: string
  link?: string
}

const SKILL_REPO = 'https://github.com/3199313768/SKILL'

const skills: AgentSkill[] = [
  {
    id: 'auto-commit',
    name: '自动提交代码 (auto-commit)',
    icon: '⚡',
    description: '智能分析代码变更，自动生成符合 Conventional Commits 规范的提交信息，并完成提交和推送。',
    tags: ['Git', 'Conventional Commits', 'Shell'],
    platform: 'Shell',
    link: `${SKILL_REPO}/tree/main/auto-commit`,
  },
  {
    id: 'commit-convention',
    name: '提交规范校验 (commit-convention)',
    icon: '✅',
    description: '通过 Git commit-msg hook 自动校验提交信息格式，确保代码提交历史的一致性和可追溯性。',
    tags: ['Git', 'Hook', 'Conventional Commits'],
    platform: 'Git Hook',
    link: `${SKILL_REPO}/tree/main/commit-convention`,
  },
  {
    id: 'weekly-report',
    name: '周报生成 (weekly-report)',
    icon: '📊',
    description: '基于 Git 提交记录自动生成程序员周报，支持约定式提交分类，符合企业级周报标准。',
    tags: ['Python', 'Git', '周报'],
    platform: 'Python',
    link: `${SKILL_REPO}/tree/main/weekly-report`,
  },
  {
    id: 'ui-style-optimization',
    name: 'UI 样式优化 (ui-style-optimization)',
    icon: '🎨',
    description: '基于 Type Scale 字号阶梯规则优化 Web 字体、字号、排版。支持 Prompt 对话与脚本自动分析两种模式。',
    tags: ['Type Scale', 'Typography', 'Python'],
    platform: 'Python',
    link: `${SKILL_REPO}/tree/main/ui-style-optimization`,
  },
  {
    id: 'code-audit',
    name: '代码审计 (code-audit)',
    icon: '🔍',
    description: '从 Git 仓库提取提交记录，使用 AI 分析工程师工作表现，生成审计报告并通过 SMTP 发送邮件。',
    tags: ['Python', 'AI', '审计'],
    platform: 'Python',
    link: `${SKILL_REPO}/tree/main/code-audit`,
  },
]

export function AiSkills() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12
      }
    }
  }

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
        {skills.map((skill) => (
          <motion.div
            key={skill.id}
            variants={cardVariants}
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
                  border: '1px solid var(--color-ai-tag-border)',
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
        ))}
      </motion.div>
    </div>
  )
}
