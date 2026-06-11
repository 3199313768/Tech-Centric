'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/home/shell/SiteFooter'

const FloatingAssistant = dynamic(
  () => import('@/components/rag/shell/FloatingAssistant').then((m) => ({ default: m.FloatingAssistant })),
  { ssr: false },
)
const SpiritCursorTrail = dynamic(
  () => import('@/components/home/shell/SpiritCursorTrail').then((m) => ({ default: m.SpiritCursorTrail })),
  { ssr: false },
)
const SpiritCursor = dynamic(
  () => import('@/components/home/shell/SpiritCursor').then((m) => ({ default: m.SpiritCursor })),
  { ssr: false },
)

interface SpiritAtmosphereShellProps {
  children: ReactNode
  nav: ReactNode
  variant?: 'home' | 'default'
}

export function SpiritAtmosphereShell({
  children,
  nav,
  variant = 'default',
}: SpiritAtmosphereShellProps) {
  const isHome = variant === 'home'

  return (
    <div className={`spirit-garden-shell${isHome ? ' spirit-garden-shell--home' : ''}`}>
      {!isHome ? <div className="sg-atmosphere sg-atmosphere--animated" aria-hidden /> : null}
      {isHome ? (
        <>
          <SpiritCursorTrail />
          <SpiritCursor />
        </>
      ) : null}
      {nav}
      {children}
      <SiteFooter />
      <FloatingAssistant />
    </div>
  )
}
