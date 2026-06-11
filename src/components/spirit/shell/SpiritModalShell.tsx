'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface SpiritModalShellProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: number
  backdropClassName?: string
  panelClassName?: string
}

export function SpiritModalShell({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 520,
  backdropClassName = 'sg-modal-backdrop',
  panelClassName = 'sg-modal-panel',
}: SpiritModalShellProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={backdropClassName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={panelClassName}
            style={{ maxWidth }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="sg-modal-title">{title}</h2>
            {subtitle ? <p className="sg-modal-subtitle">{subtitle}</p> : null}
            {children}
            {footer ? <div className="sg-modal-actions">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
