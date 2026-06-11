'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/home/shell/Navigation'
import { SpiritAtmosphereShell } from '@/components/spirit/shell/SpiritAtmosphereShell'
import { SITE_ROUTES } from '@/lib/site/routes'

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === SITE_ROUTES.home

  return (
    <SpiritAtmosphereShell
      variant={isHome ? 'home' : 'default'}
      nav={<Navigation transparent={isHome} />}
    >
      {children}
    </SpiritAtmosphereShell>
  )
}
