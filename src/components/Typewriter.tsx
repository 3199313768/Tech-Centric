'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TypewriterProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  onComplete?: () => void
}

export function Typewriter({ text, speed = 50, delay = 0, className = '', onComplete }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => {
        startTyping()
      }, delay)
      return () => clearTimeout(delayTimer)
    } else {
      startTyping()
    }
  }, [text, delay])

  const startTyping = () => {
    let currentIndex = 0
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(timer)
        setIsComplete(true)
        if (onComplete) {
          onComplete()
        }
      }
    }, speed)

    return () => clearInterval(timer)
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ marginLeft: '2px' }}
        >
          |
        </motion.span>
      )}
    </motion.span>
  )
}
