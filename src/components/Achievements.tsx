'use client'

import { achievements } from '@/data/personal'
import { ClipCard } from './ClipCard'
import { motion } from 'framer-motion'

const typeLabels: Record<string, string> = {
  award: '奖项',
  certification: '认证',
  contribution: '贡献'
}

interface AchievementsProps {
  compact?: boolean
}

export function Achievements({ compact = false }: AchievementsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + '-01')
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
  }

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
        id="achievements"
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
        成就
      </motion.h2>

      {/* 剪报墙布局 - 不规则网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '32px',
          position: 'relative',
        }}
      >
        {achievements.map((achievement, index) => {
          // 为每个剪报生成不同的旋转角度和位置偏移
          const rotation = (index % 5) * 2 - 4 // -4 到 4 度
          const xOffset = (index % 3) * 10 - 10 // -10 到 10px
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 100, rotate: rotation - 10, x: xOffset }}
              whileInView={{ opacity: 1, y: 0, rotate: rotation, x: xOffset }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                delay: index * 0.1,
                duration: 0.6,
                type: 'spring',
                stiffness: 80,
              }}
              whileHover={{
                zIndex: 10,
                scale: 1.05,
                rotate: rotation + (Math.random() > 0.5 ? 3 : -3),
                transition: { duration: 0.3 },
              }}
            >
              <ClipCard
                rotation={rotation}
                delay={index * 0.1}
                onClick={() => {
                  if (achievement.link && achievement.link !== '#') {
                    window.open(achievement.link, '_blank', 'noopener,noreferrer')
                  }
                }}
              >
                {/* 成就图片 - 纸张边框效果 */}
                {achievement.image && (
                  <motion.div
                    style={{
                      width: '100%',
                      height: '220px',
                      marginBottom: '20px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      backgroundColor: 'rgba(0, 217, 255, 0.05)',
                      border: '2px solid rgba(0, 217, 255, 0.2)',
                      position: 'relative',
                    }}
                    whileHover={{
                      scale: 1.05,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={achievement.image}
                      alt={achievement.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {/* 纸张阴影效果 */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        right: '-4px',
                        bottom: '-4px',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '4px',
                        zIndex: -1,
                      }}
                    />
                  </motion.div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#0a0a0a',
                        fontFamily: 'var(--font-space-mono), monospace',
                        padding: '6px 12px',
                        border: '2px solid rgba(0, 217, 255, 0.4)',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        display: 'inline-block',
                        marginBottom: '12px',
                        backgroundColor: 'rgba(0, 217, 255, 0.1)',
                        fontWeight: 'bold',
                      }}
                    >
                      {typeLabels[achievement.type] || achievement.type}
                    </span>
                    <h3
                      style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        color: '#0a0a0a',
                        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                        marginBottom: '8px',
                        lineHeight: '1.3',
                      }}
                    >
                      {achievement.title}
                    </h3>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'rgba(10, 10, 10, 0.6)',
                      fontFamily: 'var(--font-space-mono), monospace',
                      whiteSpace: 'nowrap',
                      backgroundColor: 'rgba(0, 217, 255, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                    }}
                  >
                    {formatDate(achievement.date)}
                  </span>
                </div>

                {achievement.issuer && (
                  <p
                    style={{
                      fontSize: '14px',
                      color: 'rgba(10, 10, 10, 0.7)',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                      marginBottom: '16px',
                      fontWeight: '500',
                    }}
                  >
                    颁发机构: {achievement.issuer}
                  </p>
                )}

                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.7',
                    color: 'rgba(10, 10, 10, 0.8)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    marginBottom: achievement.link && achievement.link !== '#' ? '16px' : '0',
                  }}
                >
                  {achievement.description}
                </p>

                {achievement.link && achievement.link !== '#' && (
                  <motion.div
                    style={{
                      marginTop: '16px',
                      fontSize: '12px',
                      color: '#0a0a0a',
                      fontFamily: 'var(--font-space-mono), monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    whileHover={{
                      x: 5,
                    }}
                  >
                    查看详情
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      →
                    </motion.span>
                  </motion.div>
                )}
              </ClipCard>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
