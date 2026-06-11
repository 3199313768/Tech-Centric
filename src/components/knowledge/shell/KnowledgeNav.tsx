'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/spirit/theme/ThemeToggle'
import { isSiteNavActive, SITE_NAV_TABS, SITE_ROUTES } from '@/lib/site/routes'

const COMPACT_NAV_MAX = 1024

export function KnowledgeNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${COMPACT_NAV_MAX}px)`)
    const syncBodyOverflow = () => {
      document.body.style.overflow = mq.matches && menuOpen ? 'hidden' : ''
    }
    syncBodyOverflow()
    mq.addEventListener('change', syncBodyOverflow)
    return () => {
      mq.removeEventListener('change', syncBodyOverflow)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="sg-nav">
      <div className="sg-nav-inner">
        <Link href={SITE_ROUTES.home} className="sg-nav-brand" aria-label="返回首页" onClick={closeMenu}>
          <Image src="/spirit-garden/logo.png" alt="" width={40} height={40} />
          <span className="max-md:hidden">SpiritGarden</span>
        </Link>

        <div className="sg-nav-links sg-nav-desktop-only">
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

        <div className="sg-nav-actions sg-nav-desktop-only">
          <Link
            href={SITE_ROUTES.search}
            className="sg-nav-search"
            aria-label="搜索站点"
          >
            <Search size={18} aria-hidden />
          </Link>
          <ThemeToggle />
        </div>

        <div className="sg-nav-actions sg-nav-actions--compact sg-nav-compact-only">
          <Link
            href={SITE_ROUTES.search}
            className="sg-nav-search"
            aria-label="搜索站点"
          >
            <Search size={18} aria-hidden />
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="sg-nav-menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="sg-knowledge-nav-drawer"
            aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
          >
            {menuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>

      <div
        className={`sg-nav-overlay sg-nav-compact-only${menuOpen ? ' sg-nav-overlay--open' : ''}`}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      />
      <div
        id="sg-knowledge-nav-drawer"
        className={`sg-nav-drawer sg-nav-compact-only${menuOpen ? ' sg-nav-drawer--open' : ''}`}
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
    </nav>
  )
}
