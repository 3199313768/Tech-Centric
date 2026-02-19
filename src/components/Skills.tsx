'use client'

import { useState } from 'react'
import { skillsDetail } from '@/data/personal'
import { ClipCard } from './ClipCard'
import { MagazineLayout } from './MagazineLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useBreakpoint } from '@/utils/useBreakpoint'

const categoryLabels: Record<string, string> = {
  frontend: '前端',
  backend: '后端',
  tools: '工具',
  other: '其他'
}

interface SkillsProps {
  compact?: boolean
}

export function Skills({ compact = false }: SkillsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { isMobile, isTablet } = useBreakpoint()
  const px = isMobile ? '20px' : isTablet ? '24px' : '40px'

  const categories = Array.from(new Set(skillsDetail.map(s => s.category)))
  const filteredSkills = selectedCategory
    ? skillsDetail.filter(s => s.category === selectedCategory)
    : skillsDetail

  return (
    <div
      style={{
        padding: compact ? `0 ${px} 80px` : `120px ${px} 120px`,
        maxWidth: '1400px',
        margin: '0 auto',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* 杂志式标题 */}
      <motion.h2
        id="skills"
        className="magazine-headline"
        style={{
          fontSize: 'clamp(40px, 6vw, 64px)',
          fontWeight: 'bold',
          marginBottom: '64px',
          fontFamily: 'var(--font-space-mono), monospace',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          color: 'var(--color-headline)',
          textShadow: 'var(--color-headline-shadow)',
          scrollMarginTop: compact ? '100px' : '140px',
        }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
      >
        技能
      </motion.h2>

      {/* 杂志式标签页 */}
      <motion.div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '48px',
          flexWrap: 'wrap',
          borderBottom: '2px solid var(--color-cyan-20)',
          paddingBottom: '16px',
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: isMobile ? '8px 14px' : '12px 24px',
            fontSize: isMobile ? '12px' : '14px',
            fontFamily: 'var(--font-space-mono), monospace',
            fontWeight: selectedCategory === null ? 'bold' : 'normal',
            color: selectedCategory === null ? 'var(--color-cyan)' : 'var(--color-btn-inactive-text)',
            backgroundColor: selectedCategory === null ? 'var(--color-cyan-15)' : 'transparent',
            border: `2px solid ${selectedCategory === null ? 'var(--color-cyan-50)' : 'var(--color-btn-inactive-border)'}`,
            borderRadius: '0',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            position: 'relative',
            transition: 'all 0.3s ease',
          }}
          whileHover={{
            scale: 1.05,
            borderColor: 'var(--color-cyan-50)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          全部
          {selectedCategory === null && (
            <motion.div
              style={{
                position: 'absolute',
                bottom: '-18px',
                left: '0',
                right: '0',
                height: '2px',
                backgroundColor: 'var(--color-cyan)',
              }}
              layoutId="activeTab"
            />
          )}
        </motion.button>
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontFamily: 'var(--font-space-mono), monospace',
              fontWeight: selectedCategory === category ? 'bold' : 'normal',
              color: selectedCategory === category ? 'var(--color-cyan)' : 'var(--color-btn-inactive-text)',
              backgroundColor: selectedCategory === category ? 'var(--color-cyan-15)' : 'transparent',
              border: `2px solid ${selectedCategory === category ? 'var(--color-cyan-50)' : 'var(--color-btn-inactive-border)'}`,
              borderRadius: '0',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
            whileHover={{
              scale: 1.05,
              borderColor: 'var(--color-cyan-50)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {categoryLabels[category] || category}
            {selectedCategory === category && (
              <motion.div
                style={{
                  position: 'absolute',
                  bottom: '-18px',
                  left: '0',
                  right: '0',
                  height: '2px',
                  backgroundColor: 'var(--color-cyan)',
                }}
                layoutId="activeTab"
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* 技能卡片网格 - 剪报风格 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MagazineLayout columns={3} gap={32}>
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.4,
                  type: 'spring',
                  stiffness: 100,
                }}
                layout
              >
                <ClipCard
                  rotation={index % 3 === 0 ? -1 : index % 3 === 1 ? 0.5 : -0.5}
                  delay={index * 0.05}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#0a0a0a',
                        fontFamily: 'var(--font-space-mono), monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      {skill.name}
                    </h3>
                    {skill.yearsOfExperience && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'rgba(10, 10, 10, 0.6)',
                          fontFamily: 'var(--font-space-mono), monospace',
                          backgroundColor: 'rgba(0, 217, 255, 0.1)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                        }}
                      >
                        {skill.yearsOfExperience}年
                      </span>
                    )}
                  </div>

                  {/* 熟练度进度条 */}
                  <div style={{ marginBottom: '20px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'rgba(10, 10, 10, 0.6)',
                          fontFamily: 'var(--font-space-mono), monospace',
                          textTransform: 'uppercase',
                        }}
                      >
                        熟练度
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#0a0a0a',
                          fontFamily: 'var(--font-space-mono), monospace',
                          fontWeight: 'bold',
                        }}
                      >
                        {skill.proficiency}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '10px',
                        backgroundColor: 'rgba(0, 217, 255, 0.15)',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                      }}
                    >
                      <motion.div
                        style={{
                          width: `${skill.proficiency}%`,
                          height: '100%',
                          backgroundColor: '#00d9ff',
                          borderRadius: '5px',
                          boxShadow: '0 0 10px rgba(0, 217, 255, 0.5)',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.proficiency}%` }}
                        transition={{
                          duration: 1,
                          delay: index * 0.1 + 0.3,
                          ease: 'easeOut',
                        }}
                      />
                    </div>
                  </div>

                  {/* 使用项目 */}
                  {skill.projects && skill.projects.length > 0 && (
                    <div>
                      <p
                        style={{
                          fontSize: '11px',
                          color: 'rgba(10, 10, 10, 0.5)',
                          fontFamily: 'var(--font-space-mono), monospace',
                          marginBottom: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}
                      >
                        相关项目
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        {skill.projects.map((project, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '11px',
                              color: 'rgba(10, 10, 10, 0.7)',
                              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                              padding: '4px 10px',
                              backgroundColor: 'rgba(0, 217, 255, 0.1)',
                              borderRadius: '4px',
                              border: '1px solid rgba(0, 217, 255, 0.2)',
                            }}
                          >
                            {project}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </ClipCard>
              </motion.div>
            ))}
          </MagazineLayout>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
