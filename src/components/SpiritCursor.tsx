'use client'

import { useEffect, useRef, useState } from 'react'

export function SpiritCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: -100, y: -100 })
  const targetRef = useRef({ x: -100, y: -100 })
  const visibleRef = useRef(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (reducedMotion || coarsePointer) return

    setActive(true)
    document.documentElement.classList.add('sg-spirit-cursor-active')

    const onMove = (event: MouseEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY }
      visibleRef.current = true
    }

    const onLeave = () => {
      visibleRef.current = false
    }

    let frame = 0
    let paused = false

    const tick = () => {
      if (paused) return

      const pos = posRef.current
      const target = targetRef.current
      pos.x += (target.x - pos.x) * 0.38
      pos.y += (target.y - pos.y) * 0.38

      const el = cursorRef.current
      if (el) {
        el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
        el.style.opacity = visibleRef.current ? '1' : '0'
      }

      frame = requestAnimationFrame(tick)
    }

    const onVisibility = () => {
      if (document.hidden) {
        paused = true
        cancelAnimationFrame(frame)
        frame = 0
        return
      }
      paused = false
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    frame = requestAnimationFrame(tick)

    return () => {
      paused = true
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      document.documentElement.classList.remove('sg-spirit-cursor-active')
    }
  }, [])

  if (!active) return null

  return (
    <div ref={cursorRef} className="sg-spirit-cursor sg-spirit-cursor--wand" aria-hidden>
      <svg
        className="sg-spirit-cursor__sprite"
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="sg-spirit-cursor__wand">
          <circle className="sg-spirit-cursor__wand-glow" cx="10" cy="9" r="7" fill="url(#sg-wand-glow)" />
          <path
            className="sg-spirit-cursor__wand-star"
            d="M10 3.5L11.2 7.2L15 7.2L11.9 9.4L12.9 13L10 10.8L7.1 13L8.1 9.4L5 7.2L8.8 7.2L10 3.5Z"
            fill="url(#sg-wand-star)"
            stroke="#fff8f3"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
          <path
            d="M11.8 10.8L22.2 21.8"
            stroke="url(#sg-wand-wood)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M11.8 10.8L22.2 21.8"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="23" cy="22.5" r="2.5" fill="#154212" stroke="#bcf0ae" strokeWidth="0.8" />
          <circle className="sg-spirit-cursor__wand-spark" cx="10" cy="9" r="1.2" fill="#fff8f3" />
        </g>
        <defs>
          <radialGradient
            id="sg-wand-glow"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(10 9) rotate(90) scale(7)"
          >
            <stop stopColor="#bcf0ae" stopOpacity="0.85" />
            <stop offset="0.55" stopColor="#81c1fd" stopOpacity="0.35" />
            <stop offset="1" stopColor="#c7812f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sg-wand-star" x1="5" y1="3.5" x2="15" y2="13" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffe7a8" />
            <stop offset="0.5" stopColor="#c7812f" />
            <stop offset="1" stopColor="#a1d494" />
          </linearGradient>
          <linearGradient id="sg-wand-wood" x1="11.8" y1="10.8" x2="22.2" y2="21.8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5a2b" />
            <stop offset="0.55" stopColor="#c7812f" />
            <stop offset="1" stopColor="#5c3d1e" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
