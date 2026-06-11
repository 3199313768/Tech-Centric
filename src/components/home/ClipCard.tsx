'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ClipCardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  rotation?: number
  delay?: number
  onClick?: () => void
}

export function ClipCard({ 
  children, 
  className = '', 
  style = {}, 
  rotation,
  delay = 0,
  onClick 
}: ClipCardProps) {
  const randomRotation = (() => {
    if (rotation !== undefined) return rotation
    const seed = `${className}:${delay}`
    let hash = 0
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash << 5) - hash + seed.charCodeAt(i)
      hash |= 0
    }
    return ((Math.abs(hash) % 600) - 300) / 100 // -3 到 3 度（稳定值）
  })()
  
  return (
    <motion.div
      className={`clip-card ${className}`}
      style={{
        padding: '20px',
        backgroundColor: 'var(--color-card-bg)',
        borderRadius: '14px',
        boxShadow: `
          0 16px 36px var(--color-card-shadow),
          0 0 0 1px var(--color-card-border),
          inset 0 1px 0 rgba(255, 255, 255, 0.36)
        `,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: randomRotation - 10 }}
      whileInView={{ opacity: 1, scale: 1, rotate: randomRotation }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: 'spring',
        stiffness: 100
      }}
      whileHover={{
        rotate: randomRotation + 2,
        scale: 1.05,
        zIndex: 10,
        boxShadow: `
          0 24px 52px var(--color-card-shadow-hover),
          0 0 0 1px var(--color-cyan-20),
          inset 0 1px 0 rgba(255, 255, 255, 0.42)
        `,
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
    >
      {/* 撕边效果 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 L100,0 L100,100 L0,100 Z' fill='none' stroke='rgba(180,58,36,0.12)' stroke-width='0.5' stroke-dasharray='3,3'/%3E%3C/svg%3E"),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(122,85,58,0.026) 2px, rgba(122,85,58,0.026) 4px)
          `,
          pointerEvents: 'none',
          borderRadius: '14px',
          opacity: 0.5,
        }}
      />
      {children}
    </motion.div>
  )
}
