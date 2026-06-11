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

/** SSR 与 hydrate 首屏共用，避免服务端/客户端 DOM 不一致 */
const DESKTOP_BREAKPOINT: Breakpoint = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isLandscape: false,
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(DESKTOP_BREAKPOINT)

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
