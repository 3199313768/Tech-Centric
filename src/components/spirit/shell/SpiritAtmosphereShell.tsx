'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

const FloatingAssistant = dynamic(
  () => import('@/components/rag/shell/FloatingAssistant').then((m) => ({ default: m.FloatingAssistant })),
  { ssr: false },
)

interface SpiritAtmosphereShellProps {
  children: ReactNode
  nav: ReactNode
  variant?: 'home' | 'default'
  homeEffects?: ReactNode
}

export function SpiritAtmosphereShell({
  children,
  nav,
  variant = 'default',
  homeEffects,
}: SpiritAtmosphereShellProps) {
  const isHome = variant === 'home'

  return (
    <div className={`spirit-garden-shell${isHome ? ' spirit-garden-shell--home' : ''}`}>
      {!isHome ? <div className="sg-atmosphere sg-atmosphere--animated" aria-hidden /> : null}
      {homeEffects}
      {nav}
      {children}
      <FloatingAssistant />
    </div>
  )
}
