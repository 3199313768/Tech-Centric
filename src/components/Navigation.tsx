'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useBreakpoint } from '@/utils/useBreakpoint'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  transparent?: boolean
}

const tabs = [
  { id: 'home', label: '庭院' },
  { id: 'all-projects', label: '归档' },
  { id: 'ai-skills', label: '技能工坊' },
  { id: 'vibe-coding', label: '草本集' },
  { id: 'resources', label: '资源' },
] as const

export function Navigation({ activeTab, onTabChange, transparent = false }: NavigationProps) {
  const { isMobile, isTablet } = useBreakpoint()
  const [menuOpen, setMenuOpen] = useState(false)
  const showCompactNav = isMobile || isTablet

  useEffect(() => {
    document.body.style.overflow = showCompactNav && menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [showCompactNav, menuOpen])

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    setMenuOpen(false)
  }

  return (
    <nav className={`sg-nav ${transparent ? 'sg-nav--transparent' : ''} ${transparent ? 'sg-enter sg-enter--0' : ''}`}>
      <div className="sg-nav-inner">
        <button
          type="button"
          className="sg-nav-brand"
          onClick={() => handleTabChange('home')}
          aria-label="返回首页"
        >
          <Image src="/spirit-garden/logo.png" alt="" width={40} height={40} />
          {!isMobile ? <span>SpiritGarden</span> : null}
        </button>

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
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`sg-nav-link ${activeTab === tab.id ? 'sg-nav-link--active' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
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
            onClick={() => setMenuOpen(false)}
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
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`sg-nav-drawer-link ${activeTab === tab.id ? 'sg-nav-drawer-link--active' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </nav>
  )
}
