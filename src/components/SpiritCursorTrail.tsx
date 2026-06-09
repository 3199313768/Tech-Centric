'use client'

import { useEffect, useRef } from 'react'

type ParticleKind = 'wisp' | 'dust' | 'spark'

interface SpiritParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  kind: ParticleKind
  phase: number
  spin: number
  tint: number
}

const MAX_PARTICLES = 96
const SPAWN_INTERVAL_MS = 28
const SIZE_SCALE = 0.65

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function spawnBurst(
  pool: SpiritParticle[],
  x: number,
  y: number,
  speed: number,
  count: number,
) {
  const boost = Math.min(speed * 0.018, 2.4)

  for (let i = 0; i < count; i += 1) {
    if (pool.length >= MAX_PARTICLES) pool.shift()

    const angle = rand(-Math.PI, Math.PI)
    const kindRoll = Math.random()
    const kind: ParticleKind =
      kindRoll > 0.92 ? 'wisp' : kindRoll > 0.72 ? 'spark' : 'dust'
    const baseSpeed = kind === 'wisp' ? rand(0.6, 1.4) : rand(0.8, 2.2)

    pool.push({
      x: x + rand(-10, 10),
      y: y + rand(-10, 10),
      vx: Math.cos(angle) * baseSpeed * (0.8 + boost * 0.35) + rand(-0.3, 0.3),
      vy: Math.sin(angle) * baseSpeed * (0.8 + boost * 0.35) - rand(0.4, 1.2),
      life: 0,
      maxLife: kind === 'wisp' ? rand(90, 130) : rand(48, 86),
      size:
        (kind === 'wisp'
          ? rand(5.5, 9)
          : kind === 'spark'
            ? rand(2, 4)
            : rand(1.5, 3.2)) * SIZE_SCALE,
      kind,
      phase: rand(0, Math.PI * 2),
      spin: rand(-0.04, 0.04),
      tint: rand(0, 1),
    })
  }
}

function drawWisp(ctx: CanvasRenderingContext2D, p: SpiritParticle, alpha: number) {
  const wing = p.size * (0.95 + Math.sin(p.phase * 2.2) * 0.12)
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(Math.sin(p.phase) * 0.45)
  ctx.globalAlpha = alpha * 0.55
  ctx.fillStyle = `rgba(161, 212, 148, ${alpha * 0.7})`
  ctx.beginPath()
  ctx.ellipse(-wing * 0.42, 0, wing * 0.55, wing * 0.22, -0.35, 0, Math.PI * 2)
  ctx.ellipse(wing * 0.42, 0, wing * 0.55, wing * 0.22, 0.35, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = alpha
  const body = ctx.createRadialGradient(0, 0, 0, 0, 0, wing * 0.55)
  body.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
  body.addColorStop(0.45, 'rgba(188, 240, 174, 0.82)')
  body.addColorStop(1, 'rgba(129, 193, 253, 0)')
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.arc(0, 0, wing * 0.38, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawSpark(ctx: CanvasRenderingContext2D, p: SpiritParticle, alpha: number) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.phase)
  ctx.globalAlpha = alpha
  ctx.strokeStyle = p.tint > 0.5 ? 'rgba(255, 231, 166, 0.95)' : 'rgba(161, 212, 148, 0.9)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(-p.size * 1.2, 0)
  ctx.lineTo(p.size * 1.2, 0)
  ctx.moveTo(0, -p.size * 1.2)
  ctx.lineTo(0, p.size * 1.2)
  ctx.stroke()
  ctx.restore()
}

function drawDust(ctx: CanvasRenderingContext2D, p: SpiritParticle, alpha: number) {
  const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.2)
  glow.addColorStop(0, `rgba(255, 248, 230, ${alpha * 0.95})`)
  glow.addColorStop(0.35, `rgba(161, 212, 148, ${alpha * 0.55})`)
  glow.addColorStop(1, 'rgba(129, 193, 253, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2)
  ctx.fill()
}

export function SpiritCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<SpiritParticle[]>([])
  const pointerRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, speed: 0, active: false })
  const lastSpawnRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (reducedMotion || coarsePointer) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let frame = 0
    let running = true
    let animating = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onMove = (event: MouseEvent) => {
      const prev = pointerRef.current
      const dx = event.clientX - prev.lastX
      const dy = event.clientY - prev.lastY
      const speed = Math.hypot(dx, dy)

      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        speed,
        active: true,
      }

      const now = performance.now()
      if (now - lastSpawnRef.current < SPAWN_INTERVAL_MS) return
      lastSpawnRef.current = now

      const count = speed > 18 ? 5 : speed > 8 ? 3 : 2
      spawnBurst(particlesRef.current, event.clientX, event.clientY, speed, count)

      if (speed > 24 && Math.random() > 0.55) {
        spawnBurst(particlesRef.current, event.clientX, event.clientY, speed, 1)
      }

      scheduleFrame()
    }

    const onLeave = () => {
      pointerRef.current.active = false
    }

    const scheduleFrame = () => {
      if (animating || document.hidden) return
      animating = true
      frame = requestAnimationFrame(tick)
    }

    const tick = () => {
      if (!running) {
        animating = false
        return
      }

      const pool = particlesRef.current
      if (pool.length === 0) {
        animating = false
        return
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (let i = pool.length - 1; i >= 0; i -= 1) {
        const p = pool[i]
        p.life += 1
        p.phase += p.spin
        p.vx *= 0.985
        p.vy = p.vy * 0.985 - 0.018
        p.x += p.vx + Math.sin(p.phase * 1.8) * 0.22
        p.y += p.vy + Math.cos(p.phase * 1.4) * 0.16

        const t = 1 - p.life / p.maxLife
        const alpha = t * t

        if (p.life >= p.maxLife || alpha <= 0.01) {
          pool.splice(i, 1)
          continue
        }

        if (p.kind === 'wisp') drawWisp(ctx, p, alpha)
        else if (p.kind === 'spark') drawSpark(ctx, p, alpha)
        else drawDust(ctx, p, alpha)
      }

      frame = requestAnimationFrame(tick)
    }

    const onVisibility = () => {
      if (document.hidden) {
        animating = false
        cancelAnimationFrame(frame)
        frame = 0
        return
      }
      if (particlesRef.current.length > 0) scheduleFrame()
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      animating = false
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      particlesRef.current = []
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="sg-spirit-cursor-trail"
      aria-hidden
    />
  )
}
