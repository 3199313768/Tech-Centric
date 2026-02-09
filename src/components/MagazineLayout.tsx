'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface MagazineLayoutProps {
  children: ReactNode
  columns?: 1 | 2 | 3
  className?: string
  gap?: number
}

export function MagazineLayout({ children, columns = 2, className = '', gap = 32 }: MagazineLayoutProps) {
  const gridTemplateColumns = {
    1: '1fr',
    2: '1fr 1fr',
    3: '1fr 1fr 1fr'
  }[columns]

  return (
    <motion.div
      className={`magazine-layout ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap: `${gap}px`,
        width: '100%',
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  )
}
