'use client'

import { useEffect, useState } from 'react'
import { stats } from '@/data/personal'
import { PaperCard } from './PaperCard'
import { motion } from 'framer-motion'
import { useBreakpoint } from '@/utils/useBreakpoint'

function AnimatedNumber({ value, unit }: { value: number; unit?: string }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const newValue = Math.min(Math.floor(increment * currentStep), value)
      setDisplayValue(newValue)

      if (currentStep >= steps) {
        setDisplayValue(value)
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value])

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toLocaleString()
  }

  return (
    <span>
      {formatNumber(displayValue)}
      {unit && <span style={{ fontSize: '0.7em', marginLeft: '4px' }}>{unit}</span>}
    </span>
  )
}

interface StatsProps {
  compact?: boolean
}

export function Stats({ compact = false }: StatsProps) {
  const { isMobile, isTablet } = useBreakpoint()
  const px = isMobile ? '20px' : isTablet ? '24px' : '40px'

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
        id="stats"
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
        统计数据
      </motion.h2>

      {/* 杂志式信息图表网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '240px' : '280px'}, 1fr))`,
          gap: isMobile ? '20px' : '40px',
        }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50, rotate: -5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              delay: index * 0.15,
              duration: 0.6,
              type: 'spring',
              stiffness: 100,
            }}
          >
            <PaperCard
              delay={index * 0.1}
              hover={true}
            >
              {/* 图标区域 */}
              {stat.icon && (
                <motion.div
                  style={{
                    fontSize: '64px',
                    marginBottom: '24px',
                    textAlign: 'center',
                  }}
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'easeInOut',
                  }}
                >
                  {stat.icon}
                </motion.div>
              )}

              {/* 大数字展示 */}
              <motion.div
                style={{
                  fontSize: 'clamp(48px, 6vw, 72px)',
                  fontWeight: 'bold',
                  color: 'var(--color-cyan)',
                  fontFamily: 'var(--font-space-mono), monospace',
                  marginBottom: '16px',
                  textAlign: 'center',
                  textShadow: '0 0 25px var(--color-cyan-glow-strong)',
                  lineHeight: '1.2',
                }}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1 + 0.3,
                  duration: 0.6,
                  type: 'spring',
                  stiffness: 150,
                }}
              >
                <AnimatedNumber value={stat.value} unit={stat.unit} />
              </motion.div>

              {/* 标签 */}
              <motion.p
                style={{
                  fontSize: '18px',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  textAlign: 'center',
                  fontWeight: '300',
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
              >
                {stat.label}
              </motion.p>

              {/* 装饰性分割线 */}
              <motion.div
                className="magazine-divider"
                style={{
                  marginTop: '24px',
                  height: '1px',
                  background: 'linear-gradient(to right, transparent, var(--color-cyan-40), transparent)',
                }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.7, duration: 0.6 }}
              />
            </PaperCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
