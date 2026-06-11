import type { MouseEvent } from 'react'

const pendingFrame = new WeakMap<HTMLElement, number>()
const pendingCoords = new WeakMap<HTMLElement, { x: number; y: number }>()
let scrollLockUntil = 0

if (typeof window !== 'undefined') {
  window.addEventListener(
    'scroll',
    () => {
      scrollLockUntil = performance.now() + 150
    },
    { passive: true, capture: true },
  )
}

function applyHover(target: HTMLElement, x: number, y: number) {
  target.style.setProperty('--hover-x', `${x}%`)
  target.style.setProperty('--hover-y', `${y}%`)
}

export function handleWatercolorHover(event: MouseEvent<HTMLElement>) {
  if (performance.now() < scrollLockUntil) return

  const target = event.currentTarget
  const rect = target.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  pendingCoords.set(target, {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100,
  })

  if (pendingFrame.has(target)) return

  const frame = requestAnimationFrame(() => {
    pendingFrame.delete(target)
    const coords = pendingCoords.get(target)
    if (coords) applyHover(target, coords.x, coords.y)
  })
  pendingFrame.set(target, frame)
}
