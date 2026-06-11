'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/home/shell/Navigation'
import { SITE_ROUTES } from '@/lib/site/routes'

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

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === SITE_ROUTES.home

  return (
    <div className={`spirit-garden-shell${isHome ? ' spirit-garden-shell--home' : ''}`}>
      {isHome ? (
        <>
          <SpiritCursorTrail />
          <SpiritCursor />
        </>
      ) : null}
      <Navigation transparent={isHome} />
      {children}
      {isHome ? <FloatingAssistant /> : null}
    </div>
  )
}
