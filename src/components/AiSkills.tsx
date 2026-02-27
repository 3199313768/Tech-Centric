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

const mockSkills: AgentSkill[] = [
  {
    id: '1',
    name: '代码审查专家 (Code Reviewer)',
    icon: '🔍',
    description: '专注于发现潜在的代码缺陷、性能瓶颈以及安全漏洞，并提供详细的重构建议。',
    tags: ['Code', 'Review', 'Best Practices'],
    platform: 'Dify',
  },
  {
    id: '2',
    name: '架构设计助手 (Architect)',
    icon: '🏗️',
    description: '辅助进行系统级架构设计，提供高阶技术选型、数据库建模及微服务设计思路。',
    tags: ['Architecture', 'System Design'],
    platform: 'Coze',
  },
  {
    id: '3',
    name: '数据分析分析师 (Data Analyst)',
    icon: '📊',
    description: '用于快速清洗、整理数据，并能通过内置的 code interpreter 生成商业洞察和可视化图表。',
    tags: ['Data', 'Python', 'Analysis'],
    platform: 'OpenAI GPTs',
  },
  {
    id: '4',
    name: '技术文档撰写者 (Doc Writer)',
    icon: '📝',
    description: '根据代码或口述逻辑，自动生成结构清晰、带示例代码的 API 文档和开发指南。',
    tags: ['Documentation', 'Markdown'],
  },
  {
    id: '5',
    name: '面试官 Agent (Interviewer)',
    icon: '👔',
    description: '模拟真实的前端/后端技术面试，提供追问环节以及最后的总结反馈。',
    tags: ['Interview', 'Frontend', 'Backend'],
    platform: 'LangChain',
  },
  {
    id: '6',
    name: 'SEO 与文案助手 (Copywriter)',
    icon: '✍️',
    description: '生成针对搜素引擎优化的网站文案、博客标题及长尾词策略分析。',
    tags: ['SEO', 'Content', 'Marketing'],
  }
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
      color: '#fff',
      fontFamily: 'var(--font-inter), sans-serif',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: '60px', textAlign: 'center' }}
      >

        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '1.2rem',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          构建智能与自动化工作流 | 探索我开发的各类 AI 代理与专属技能
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
        {mockSkills.map((skill) => (
          <motion.div
            key={skill.id}
            variants={cardVariants}
            onHoverStart={() => setHoveredId(skill.id)}
            onHoverEnd={() => setHoveredId(null)}
            onClick={() => {
              const url = skill.link || 'https://github.com/3199313768/SKILL'
              window.open(url, '_blank', 'noopener,noreferrer')
            }}
            style={{
              background: 'rgba(20, 20, 20, 0.6)',
              border: `1px solid ${hoveredId === skill.id ? 'rgba(0, 217, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '16px',
              padding: '32px 24px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: hoveredId === skill.id ? 'translateY(-8px)' : 'translateY(0)',
              boxShadow: hoveredId === skill.id ? '0 15px 30px rgba(0, 217, 255, 0.1)' : '0 5px 15px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* 赛博朋克风格的装饰元素 - Hover 才完全显示 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #00d9ff, transparent)',
              opacity: hoveredId === skill.id ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }} />
            
            {/* 角落装饰 */}
            <div style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              width: '20px',
              height: '20px',
              borderTop: `2px solid ${hoveredId === skill.id ? '#00d9ff' : 'transparent'}`,
              borderRight: `2px solid ${hoveredId === skill.id ? '#00d9ff' : 'transparent'}`,
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
                background: 'rgba(255, 255, 255, 0.05)',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                {skill.icon}
              </div>
              
              {skill.platform && (
                <span style={{
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  background: 'rgba(0, 217, 255, 0.1)',
                  color: '#00d9ff',
                  borderRadius: '20px',
                  fontFamily: 'var(--font-space-mono), monospace',
                  letterSpacing: '0.5px',
                  border: '1px solid rgba(0, 217, 255, 0.2)'
                }}>
                  {skill.platform}
                </span>
              )}
            </div>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '12px',
              color: hoveredId === skill.id ? '#fff' : 'rgba(255, 255, 255, 0.9)',
              transition: 'color 0.3s ease',
            }}>
              {skill.name}
            </h3>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.5)',
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
                  color: 'rgba(255, 255, 255, 0.4)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.2s ease',
                  ...(hoveredId === skill.id ? {
                    color: 'rgba(0, 217, 255, 0.8)',
                    borderColor: 'rgba(0, 217, 255, 0.2)',
                    background: 'rgba(0, 217, 255, 0.05)'
                  } : {})
                }}>
                  #{tag}
                </span>
              ))}
            </div>

            {/* Hover 时发光的底部背景 */}
            <div style={{
              position: 'absolute',
              bottom: '-50%',
              left: '-20%',
              width: '140%',
              height: '100%',
              background: 'radial-gradient(ellipse at bottom, rgba(0, 217, 255, 0.15) 0%, transparent 70%)',
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
