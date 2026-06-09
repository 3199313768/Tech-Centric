'use client'

import { motion } from 'framer-motion'

interface SpiritSubpageHeaderProps {
  title?: string
  lead?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  titleUppercase?: boolean
}

export function SpiritSubpageHeader({
  title,
  lead,
  actions,
  className = '',
  titleUppercase = false,
}: SpiritSubpageHeaderProps) {
  return (
    <motion.header
      className={`sg-page-header sg-enter ${className}`.trim()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {title ? (
        <h1 className={`sg-page-title${titleUppercase ? ' sg-page-title--upper' : ''}`}>{title}</h1>
      ) : null}
      {lead ? <p className="sg-page-lead">{lead}</p> : null}
      {actions ? <div className="sg-page-actions">{actions}</div> : null}
    </motion.header>
  )
}
