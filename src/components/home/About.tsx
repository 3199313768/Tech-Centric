'use client'

import { useState } from 'react'
import { aboutInfo, education } from '@/data/personal'
import { PaperCard } from './PaperCard'
import { ClipCard } from './ClipCard'
import { MagazineLayout } from './MagazineLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { highlightKeywords } from '@/utils/textHighlight'
import { useBreakpoint } from '@/utils/useBreakpoint'

interface AboutProps {
  compact?: boolean
}

export function About({ compact = false }: AboutProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const { isMobile, isTablet } = useBreakpoint()
  const px = isMobile ? '20px' : isTablet ? '24px' : '40px'
  return (
    <div
      style={{
        padding: compact ? `40px ${px} 80px` : `120px ${px} 120px`,
        maxWidth: '1400px',
        margin: '0 auto',
        color: 'var(--color-text-primary)',
        position: 'relative',
      }}
    >
      {/* 杂志式标题 */}
      <motion.h2
        id="about"
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
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        关于我
      </motion.h2>

      {/* 引用块 */}
      <motion.div
        className="magazine-quote"
        style={{ marginBottom: '64px' }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.p
          style={{
            fontSize: '22px',
            lineHeight: '1.6',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          技术应该服务于人，通过创新的解决方案解决实际问题。在代码与设计的交汇处，我找到了创造力的源泉。
        </motion.p>
      </motion.div>

      {/* 个人简介 - 手风琴展示 */}
      <motion.section
        style={{ marginBottom: '80px' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="bio-accordion-container"
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            overflowX: 'auto',
            minHeight: '300px',
            paddingBottom: '10px',
          }}
        >
          {aboutInfo.detailedBio.map((paragraph, index) => {
            const paragraphMeta = [
              {
                title: '技术专长',
                icon: '⚡',
                shortDescription: '3-5年Web开发经验，专注于React/Next.js生态系统',
              },
              {
                title: '项目实践',
                icon: '🚀',
                shortDescription: '注重用户体验细节，通过性能优化和动画交互提升产品体验',
              },
              {
                title: '设计思维',
                icon: '🎨',
                shortDescription: '理解用户需求，把握视觉节奏，创造情感连接',
              },
              {
                title: '持续学习',
                icon: '📚',
                shortDescription: '探索新技术边界，通过技术博客和开源项目分享学习心得',
              },
              {
                title: '个人标识',
                icon: '💫',
                shortDescription: 'Oxygen（氧气）代表让产品"呼吸"得更自然、更流畅',
              },
            ][index]

            const isHovered = hoveredIndex === index

            return (
              <motion.div
                layout
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                  opacity: { delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  y: { delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                }}
                whileHover={{
                  flex: '1 1 450px',
                }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                style={{
                  flex: '1 1 180px',
                  minWidth: '180px',
                  maxWidth: '500px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <PaperCard
                  hover={false}
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: isHovered
                      ? '1px solid var(--color-cyan-40)'
                      : '1px solid var(--color-card-border)',
                    boxShadow: isHovered
                      ? '0 8px 32px var(--color-card-shadow-hover), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                      : '0 4px 16px var(--color-card-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border-color 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {/* 左侧高亮条 */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '3px',
                          backgroundColor: 'var(--color-cyan)',
                          boxShadow: '0 0 10px var(--color-cyan-glow-strong)',
                          transformOrigin: 'left center',
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* 左右布局容器 */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: '20px',
                      alignItems: 'stretch',
                      minHeight: '200px',
                    }}
                  >
                    {/* 左侧：图标和标题 */}
                    <div
                      style={{
                        width: '120px',
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px 0',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '48px',
                          lineHeight: '1',
                          marginBottom: '16px',
                        }}
                      >
                        {paragraphMeta.icon}
                      </span>
                      <h4
                        className="magazine-subheadline"
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          fontFamily: 'var(--font-space-mono), monospace',
                          color: 'var(--color-cyan)',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          margin: 0,
                          textAlign: 'center',
                        }}
                      >
                        {paragraphMeta.title}
                      </h4>
                    </div>

                    {/* 右侧：详细内容（原生结构流式布局并简化动画链） */}
                    <div
                        style={{
                          flex: isHovered ? 1 : 0,
                          overflow: 'hidden',
                          opacity: isHovered ? 1 : 0,
                          paddingLeft: isHovered ? '20px' : '0',
                          borderLeft: isHovered ? '1px solid var(--color-cyan-20)' : 'none',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '17px',
                            lineHeight: '1.9',
                            color: 'var(--color-text-secondary)',
                            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                            margin: 0,
                            minWidth: '260px', /* 防止展开时文字过度换行跳动 */
                          }}
                        >
                          {highlightKeywords(paragraph)}
                        </p>
                      </div>
                  </div>
                </PaperCard>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* 个人价值观 - 剪报卡片网格 */}
      <motion.section
        style={{ marginBottom: '80px' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h3
          className="magazine-subheadline"
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '40px',
            fontFamily: 'var(--font-space-mono), monospace',
            color: 'var(--color-cyan)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          价值观
        </h3>
        <MagazineLayout columns={2} gap={32}>
          {aboutInfo.values.map((value, index) => (
            <ClipCard
              key={index}
              rotation={index % 2 === 0 ? -1 : 1.5}
              delay={index * 0.1}
            >
              <h4
                style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  color: '#0a0a0a',
                  fontFamily: 'var(--font-space-mono), monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {value.title}
              </h4>
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: 'rgba(10, 10, 10, 0.8)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {value.description}
              </p>
            </ClipCard>
          ))}
        </MagazineLayout>
      </motion.section>

      {/* 教育背景 - 杂志式时间线 */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h3
          className="magazine-subheadline"
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '40px',
            fontFamily: 'var(--font-space-mono), monospace',
            color: 'var(--color-cyan)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          教育背景
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {education.map((edu, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <PaperCard delay={index * 0.1}>
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
                    <h4
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: 'var(--color-cyan)',
                        fontFamily: 'var(--font-space-mono), monospace',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {edu.school}
                    </h4>
                    <p
                      style={{
                        fontSize: '18px',
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                      }}
                    >
                      {edu.degree} · {edu.major}
                    </p>
                  </div>
                  <span className="magazine-date-label">
                    {edu.period}
                  </span>
                </div>
                {edu.description && (
                  <p
                    style={{
                      fontSize: '15px',
                      lineHeight: '1.7',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                      marginTop: '16px',
                    }}
                  >
                    {edu.description}
                  </p>
                )}
              </PaperCard>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
