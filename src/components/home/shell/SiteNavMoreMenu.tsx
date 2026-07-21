'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isSiteNavActive, SITE_NAV_SECONDARY } from '@/lib/site/routes'

type MenuCoords = { top: number; left: number }

export function SiteNavMoreMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<MenuCoords | null>(null)
  const [mounted, setMounted] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setCoords(null)
      return
    }

    const sync = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      setCoords({
        top: rect.bottom + 10,
        left: rect.left + rect.width / 2,
      })
    }

    sync()
    window.addEventListener('resize', sync)
    window.addEventListener('scroll', sync, true)
    return () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const menu =
    open && coords && mounted
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            className="sg-nav-more__menu"
            role="menu"
            aria-label="次级导航"
            style={{ top: coords.top, left: coords.left }}
          >
            {SITE_NAV_SECONDARY.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                role="menuitem"
                className={`sg-nav-more__item${isSiteNavActive(pathname, tab.href) ? ' sg-nav-more__item--active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {tab.label}
              </Link>
            ))}
          </div>,
          document.body,
        )
      : null

  return (
    <div className="sg-nav-more" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`sg-nav-link sg-nav-more__trigger${open ? ' sg-nav-more__trigger--open' : ''}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        更多
      </button>
      {menu}
    </div>
  )
}
