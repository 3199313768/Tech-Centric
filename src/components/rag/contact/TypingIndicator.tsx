'use client'

import { motion } from 'framer-motion'

export function TypingIndicator() {
  return (
    <div className="sg-rag-row sg-rag-row--assistant" aria-label="正在输入" role="status">
      <motion.div
        className="sg-rag-bubble sg-rag-bubble--contact sg-rag-typing"
        initial={{ opacity: 0, y: 10, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      >
        <span className="sg-rag-typing__dot" />
        <span className="sg-rag-typing__dot" />
        <span className="sg-rag-typing__dot" />
      </motion.div>
    </div>
  )
}
