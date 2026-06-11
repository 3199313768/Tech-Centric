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

  useEffect(() => {
    let delayTimer: ReturnType<typeof setTimeout> | null = null
    let typingTimer: ReturnType<typeof setInterval> | null = null

    if (text.length === 0) {
      delayTimer = setTimeout(() => {
        setDisplayedText('')
        onComplete?.()
      }, 0)
      return
    }

    const startTyping = () => {
      let currentIndex = 0
      setDisplayedText('')
      typingTimer = setInterval(() => {
        if (currentIndex < text.length) {
          currentIndex += 1
          setDisplayedText(text.slice(0, currentIndex))
          return
        }

        if (typingTimer) {
          clearInterval(typingTimer)
          typingTimer = null
        }
        onComplete?.()
      }, speed)
    }

    if (delay > 0) {
      delayTimer = setTimeout(startTyping, delay)
    } else {
      startTyping()
    }

    return () => {
      if (delayTimer) {
        clearTimeout(delayTimer)
      }
      if (typingTimer) {
        clearInterval(typingTimer)
      }
    }
  }, [text, speed, delay, onComplete])

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayedText}
      {displayedText.length < text.length && (
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
