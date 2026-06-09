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
        borderRadius: '18px',
        boxShadow: `0 18px 46px var(--color-card-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.34)`,
        position: 'relative',
        backdropFilter: 'blur(12px)',
        backgroundImage: `
          linear-gradient(135deg, rgba(255, 243, 226, 0.64) 0%, rgba(244, 216, 182, 0.24) 100%),
          url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='paper' x='0' y='0' width='24' height='24' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='8' cy='9' r='0.45' fill='rgba(122,85,58,0.04)'/%3E%3Ccircle cx='19' cy='17' r='0.32' fill='rgba(180,58,36,0.032)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='120' height='120' fill='url(%23paper)'/%3E%3C/svg%3E")
        `,
        ...style,
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay }}
      whileHover={hover ? {
        y: -4,
        scale: 1.01,
        boxShadow: `0 24px 58px var(--color-card-shadow-hover), inset 0 1px 0 rgba(255, 255, 255, 0.42)`,
        transition: { duration: 0.3 }
      } : {}}
    >
      {children}
    </motion.div>
  )
}
