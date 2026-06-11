'use client'

import { motion } from 'framer-motion'

interface ResourceConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ResourceConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ResourceConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="sg-modal-backdrop" style={{ zIndex: 2000 }} onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="sg-modal-panel"
        style={{ maxWidth: '400px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="sg-modal-title">{title}</h3>
        <p className="sg-page-lead" style={{ marginBottom: '24px', textAlign: 'left' }}>
          {message}
        </p>
        <div className="sg-modal-actions" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <button type="button" className="sg-btn sg-btn--ghost" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="sg-btn sg-btn--primary" onClick={onConfirm}>
            确认
          </button>
        </div>
      </motion.div>
    </div>
  )
}
