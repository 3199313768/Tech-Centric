'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useBreakpoint } from '@/utils/useBreakpoint'
import { isSiteNavActive, SITE_NAV_TABS, SITE_ROUTES } from '@/lib/site/routes'

interface NavigationProps {
  transparent?: boolean
}

export function Navigation({ transparent = false }: NavigationProps) {
  const pathname = usePathname()
  const { isMobile, isTablet } = useBreakpoint()
  const [menuOpen, setMenuOpen] = useState(false)
  const showCompactNav = isMobile || isTablet

  useEffect(() => {
    document.body.style.overflow = showCompactNav && menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [showCompactNav, menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className={`sg-nav ${transparent ? 'sg-nav--transparent' : ''} ${transparent ? 'sg-enter sg-enter--0' : ''}`}>
      <div className="sg-nav-inner">
        <Link
          href={SITE_ROUTES.home}
          className="sg-nav-brand"
          aria-label="返回首页"
          onClick={closeMenu}
        >
          <Image src="/spirit-garden/logo.png" alt="" width={40} height={40} />
          {!isMobile ? <span>SpiritGarden</span> : null}
        </Link>

        {showCompactNav ? (
          <div className="sg-nav-actions sg-nav-actions--compact">
            <ThemeToggle />
            <button
              type="button"
              className="sg-nav-menu-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="sg-nav-drawer"
              aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
            >
              {menuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
            </button>
          </div>
        ) : (
          <>
            <div className="sg-nav-links">
              {SITE_NAV_TABS.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`sg-nav-link${isSiteNavActive(pathname, tab.href) ? ' sg-nav-link--active' : ''}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
            <div className="sg-nav-actions">
              <ThemeToggle />
            </div>
          </>
        )}
      </div>

      {showCompactNav ? (
        <>
          <div
            className={`sg-nav-overlay${menuOpen ? ' sg-nav-overlay--open' : ''}`}
            onClick={closeMenu}
            aria-hidden={!menuOpen}
          />
          <div
            id="sg-nav-drawer"
            className={`sg-nav-drawer${menuOpen ? ' sg-nav-drawer--open' : ''}`}
            role="dialog"
            aria-modal={menuOpen}
            aria-label="站点导航"
            aria-hidden={!menuOpen}
          >
            <div className="sg-nav-drawer-links">
              {SITE_NAV_TABS.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`sg-nav-drawer-link${isSiteNavActive(pathname, tab.href) ? ' sg-nav-drawer-link--active' : ''}`}
                  onClick={closeMenu}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </nav>
  )
}
