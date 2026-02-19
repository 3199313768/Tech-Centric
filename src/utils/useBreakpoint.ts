'use client'

import { useState, useEffect } from 'react'

interface Breakpoint {
  isMobile: boolean   // ≤ 768px
  isTablet: boolean   // 769px - 1024px
  isDesktop: boolean  // > 1024px
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setBreakpoint({
        isMobile: w <= 768,
        isTablet: w > 768 && w <= 1024,
        isDesktop: w > 1024,
      })
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return breakpoint
}
