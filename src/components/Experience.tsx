'use client'

import { useState } from 'react'
import { workExperience } from '@/data/personal'
import { ClipCard } from './ClipCard'
import { motion, AnimatePresence } from 'framer-motion'

interface ExperienceProps {
  compact?: boolean
}

export function Experience({ compact = false }: ExperienceProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div
      style={{
        padding: compact ? '0 40px 120px' : '120px 40px 120px',
        maxWidth: '1400px',
        margin: '0 auto',
        color: '#fff',
      }}
    >
      {/* 杂志式标题 */}
      <motion.h2
        id="experience"
        className="magazine-headline"
        style={{
          fontSize: 'clamp(40px, 6vw, 64px)',
          fontWeight: 'bold',
          marginBottom: '64px',
          fontFamily: 'var(--font-space-mono), monospace',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          color: '#00d9ff',
          textShadow: '0 0 30px rgba(0, 217, 255, 0.6)',
          scrollMarginTop: compact ? '100px' : '140px',
        }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
      >
        工作经历
      </motion.h2>

      <div
        style={{
          position: 'relative',
          paddingLeft: '48px',
        }}
      >
        {/* 杂志式时间轴线 */}
        <motion.div
          style={{
            position: 'absolute',
            left: '0',
            top: '0',
            bottom: '0',
            width: '3px',
            background: 'linear-gradient(to bottom, #00d9ff, rgba(0, 217, 255, 0.3))',
            borderRadius: '2px',
          }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {workExperience.map((exp, index) => {
          const isExpanded = expandedId === exp.id

          return (
            <motion.div
              key={exp.id}
              style={{
                position: 'relative',
                marginBottom: '48px',
                paddingLeft: '64px',
              }}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
            >
              {/* 时间轴节点 - 脉冲动画 */}
              <motion.div
                style={{
                  position: 'absolute',
                  left: '-10px',
                  top: '12px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#00d9ff',
                  border: '4px solid #0a0a0a',
                  boxShadow: '0 0 20px rgba(0, 217, 255, 0.6)',
                  zIndex: 10,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    '0 0 20px rgba(0, 217, 255, 0.6)',
                    '0 0 30px rgba(0, 217, 255, 0.9)',
                    '0 0 20px rgba(0, 217, 255, 0.6)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* 剪报卡片 */}
              <ClipCard
                rotation={index % 2 === 0 ? -0.5 : 0.5}
                delay={index * 0.1}
                onClick={() => setExpandedId(isExpanded ? null : exp.id)}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#0a0a0a',
                        fontFamily: 'var(--font-space-mono), monospace',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      {exp.position}
                    </h3>
                    <p
                      style={{
                        fontSize: '18px',
                        color: 'rgba(10, 10, 10, 0.8)',
                        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                        marginBottom: '4px',
                      }}
                    >
                      {exp.company}
                      {exp.location && ` · ${exp.location}`}
                    </p>
                  </div>
                  <span
                    className="magazine-date-label"
                    style={{
                      backgroundColor: 'rgba(0, 217, 255, 0.15)',
                      color: '#0a0a0a',
                      borderColor: 'rgba(0, 217, 255, 0.4)',
                    }}
                  >
                    {exp.period}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: 'rgba(10, 10, 10, 0.75)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    marginBottom: '20px',
                  }}
                >
                  {exp.description}
                </p>

                {/* 展开的详细信息 - 翻页效果 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        marginTop: '20px',
                        paddingTop: '20px',
                        borderTop: '2px solid rgba(0, 217, 255, 0.2)',
                        overflow: 'hidden',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#0a0a0a',
                          fontFamily: 'var(--font-space-mono), monospace',
                          marginBottom: '16px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}
                      >
                        主要成就
                      </h4>
                      <ul
                        style={{
                          listStyle: 'none',
                          padding: 0,
                          marginBottom: '24px',
                        }}
                      >
                        {exp.achievements.map((achievement, idx) => (
                          <motion.li
                            key={idx}
                            style={{
                              fontSize: '14px',
                              lineHeight: '1.8',
                              color: 'rgba(10, 10, 10, 0.8)',
                              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                              marginBottom: '12px',
                              paddingLeft: '24px',
                              position: 'relative',
                            }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.4 }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                left: '0',
                                color: '#00d9ff',
                                fontSize: '18px',
                              }}
                            >
                              ▸
                            </span>
                            {achievement}
                          </motion.li>
                        ))}
                      </ul>

                      <h4
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#0a0a0a',
                          fontFamily: 'var(--font-space-mono), monospace',
                          marginBottom: '16px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}
                      >
                        技术栈
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '10px',
                        }}
                      >
                        {exp.technologies.map((tech, idx) => (
                          <motion.span
                            key={idx}
                            style={{
                              fontSize: '12px',
                              fontFamily: 'var(--font-jetbrains-mono), monospace',
                              color: '#0a0a0a',
                              border: '1px solid rgba(0, 217, 255, 0.4)',
                              backgroundColor: 'rgba(0, 217, 255, 0.1)',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05, duration: 0.3 }}
                            whileHover={{
                              scale: 1.1,
                              backgroundColor: 'rgba(0, 217, 255, 0.2)',
                            }}
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 展开/收起提示 */}
                <div
                  style={{
                    marginTop: '16px',
                    fontSize: '12px',
                    color: 'rgba(10, 10, 10, 0.5)',
                    fontFamily: 'var(--font-space-mono), monospace',
                    textAlign: 'right',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {isExpanded ? '点击收起 ↑' : '点击展开详情 ↓'}
                </div>
              </ClipCard>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
