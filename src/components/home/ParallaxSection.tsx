'use client'

import { ReactNode, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ParallaxSectionProps {
  children: ReactNode
  speed?: number
  className?: string
  style?: React.CSSProperties
}

export function ParallaxSection({ children, speed = 0.5, className = '', style = {} }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed])

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, y }}
    >
      {children}
    </motion.div>
  )
}
