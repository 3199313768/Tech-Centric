'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PaperCardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  hover?: boolean
  delay?: number
}

export function PaperCard({ children, className = '', style = {}, hover = true, delay = 0 }: PaperCardProps) {
  return (
    <motion.div
      className={`paper-card ${className}`}
      style={{
        padding: '24px',
        border: '1px solid var(--color-card-border)',
        backgroundColor: 'var(--color-card-bg)',
        borderRadius: '8px',
        boxShadow: `0 4px 20px var(--color-card-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
        position: 'relative',
        backgroundImage: `
          linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 0%, transparent 100%),
          url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='paper' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='10' cy='10' r='0.5' fill='rgba(255,255,255,0.02)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23paper)'/%3E%3C/svg%3E")
        `,
        ...style,
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay }}
      whileHover={hover ? {
        rotateY: 2,
        rotateX: -2,
        scale: 1.02,
        boxShadow: `0 8px 30px var(--color-card-shadow-hover), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
        transition: { duration: 0.3 }
      } : {}}
    >
      {children}
    </motion.div>
  )
}
