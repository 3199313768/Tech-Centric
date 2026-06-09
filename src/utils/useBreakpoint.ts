'use client'

import { useState, useEffect } from 'react'

interface Breakpoint {
  isMobile: boolean   // ≤ 768px
  isTablet: boolean   // 769px - 1024px
  isDesktop: boolean  // > 1024px
  isLandscape: boolean
}

const MOBILE_MAX = 768
const TABLET_MAX = 1024

function getBreakpointByWidth(width: number): Omit<Breakpoint, 'isLandscape'> {
  return {
    isMobile: width <= MOBILE_MAX,
    isTablet: width > MOBILE_MAX && width <= TABLET_MAX,
    isDesktop: width > TABLET_MAX,
  }
}

function getInitialBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isLandscape: false,
    }
  }
  return {
    ...getBreakpointByWidth(window.innerWidth),
    isLandscape: window.matchMedia('(orientation: landscape)').matches,
  }
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getInitialBreakpoint)

  useEffect(() => {
    const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`)
    const tabletQuery = window.matchMedia(
      `(min-width: ${MOBILE_MAX + 1}px) and (max-width: ${TABLET_MAX}px)`,
    )
    const landscapeQuery = window.matchMedia('(orientation: landscape)')

    const update = () => {
      const next: Breakpoint = {
        isMobile: mobileQuery.matches,
        isTablet: tabletQuery.matches,
        isDesktop: !mobileQuery.matches && !tabletQuery.matches,
        isLandscape: landscapeQuery.matches,
      }
      setBreakpoint((prev) => {
        if (
          prev.isMobile === next.isMobile &&
          prev.isTablet === next.isTablet &&
          prev.isDesktop === next.isDesktop &&
          prev.isLandscape === next.isLandscape
        ) {
          return prev
        }
        return next
      })
    }

    update()
    mobileQuery.addEventListener('change', update)
    tabletQuery.addEventListener('change', update)
    landscapeQuery.addEventListener('change', update)
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)

    return () => {
      mobileQuery.removeEventListener('change', update)
      tabletQuery.removeEventListener('change', update)
      landscapeQuery.removeEventListener('change', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return breakpoint
}
