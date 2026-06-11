'use client'

import { scrollRevealClass, useScrollReveal } from '@/utils/useScrollReveal'

interface ScrollRevealProps {
  children: React.ReactNode
  index?: number
  className?: string
}

export function ScrollReveal({ children, index = 0, className = '' }: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <div ref={ref} className={`${scrollRevealClass(isVisible, index)} ${className}`.trim()}>
      {children}
    </div>
  )
}
