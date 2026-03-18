'use client'

import { useState, useEffect } from 'react'

interface Breakpoint {
  isMobile: boolean   // ≤ 768px
  isTablet: boolean   // 769px - 1024px
  isDesktop: boolean  // > 1024px
}

function getBreakpointByWidth(width: number): Breakpoint {
  return {
    isMobile: width <= 768,
    isTablet: width > 768 && width <= 1024,
    isDesktop: width > 1024,
  }
}

function getInitialBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    }
  }
  return getBreakpointByWidth(window.innerWidth)
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getInitialBreakpoint)

  useEffect(() => {
    const update = () => {
      const next = getBreakpointByWidth(window.innerWidth)
      setBreakpoint((prev) => {
        if (
          prev.isMobile === next.isMobile &&
          prev.isTablet === next.isTablet &&
          prev.isDesktop === next.isDesktop
        ) {
          return prev
        }
        return next
      })
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return breakpoint
}
