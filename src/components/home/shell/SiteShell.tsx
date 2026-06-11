'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/home/shell/Navigation'
import { SpiritAtmosphereShell } from '@/components/spirit/shell/SpiritAtmosphereShell'
import { SITE_ROUTES } from '@/lib/site/routes'

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
    <SpiritAtmosphereShell
      variant={isHome ? 'home' : 'default'}
      nav={<Navigation transparent={isHome} />}
      homeEffects={
        isHome ? (
          <>
            <SpiritCursorTrail />
            <SpiritCursor />
          </>
        ) : null
      }
    >
      {children}
    </SpiritAtmosphereShell>
  )
}
