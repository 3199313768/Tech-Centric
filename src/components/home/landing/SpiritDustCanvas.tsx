'use client'

import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 280

const VERTEX_SHADER = `
attribute vec2 a_xy;
attribute float a_phase;
attribute float a_size;
attribute float a_speed;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_breath;

varying float v_alpha;

void main() {
  vec2 p = a_xy;
  float t = u_time * a_speed;
  p += vec2(sin(t + a_phase), cos(t * 0.81 + a_phase * 1.6)) * 0.042;
  vec2 m = u_mouse * 2.0 - 1.0;
  vec2 d = m - p;
  p += d * 0.055 * exp(-dot(d, d) * 2.2);
  p += vec2(sin(u_breath + a_phase), cos(u_breath * 0.9 + a_phase)) * 0.014;

  gl_Position = vec4(p, 0.0, 1.0);
  gl_PointSize = a_size * u_resolution.y * (0.62 + 0.38 * sin(u_time * 1.35 + a_phase));
  v_alpha = 0.22 + 0.58 * (0.5 + 0.5 * sin(u_time * 1.05 + a_phase * 2.1));
}
`

const FRAGMENT_SHADER = `
precision mediump float;
varying float v_alpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  if (dist > 0.5) discard;
  float glow = smoothstep(0.5, 0.0, dist);
  float core = smoothstep(0.16, 0.0, dist);
  vec3 spore = mix(vec3(0.72, 0.9, 0.58), vec3(1.0, 0.96, 0.84), core);
  gl_FragColor = vec4(spore, glow * v_alpha);
}
`

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vs || !fs) return null

  const program = gl.createProgram()
  if (!program) return null

  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }

  return program
}

interface SpiritDustCanvasProps {
  className?: string
}

export function SpiritDustCanvas({ className }: SpiritDustCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true })
    if (!gl) return

    const program = createProgram(gl)
    if (!program) return

    gl.useProgram(program)

    const positions = new Float32Array(PARTICLE_COUNT * 2)
    const phases = new Float32Array(PARTICLE_COUNT)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const speeds = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      positions[i * 2] = Math.random() * 2 - 1
      positions[i * 2 + 1] = Math.random() * 2 - 1
      phases[i] = Math.random() * Math.PI * 2
      sizes[i] = 0.002 + Math.random() * 0.007
      speeds[i] = 0.25 + Math.random() * 0.85
    }

    const bindBuffer = (location: number, data: Float32Array, size: number) => {
      const buffer = gl.createBuffer()
      if (!buffer || location < 0) return
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
    }

    bindBuffer(gl.getAttribLocation(program, 'a_xy'), positions, 2)
    bindBuffer(gl.getAttribLocation(program, 'a_phase'), phases, 1)
    bindBuffer(gl.getAttribLocation(program, 'a_size'), sizes, 1)
    bindBuffer(gl.getAttribLocation(program, 'a_speed'), speeds, 1)

    const uTime = gl.getUniformLocation(program, 'u_time')
    const uMouse = gl.getUniformLocation(program, 'u_mouse')
    const uResolution = gl.getUniformLocation(program, 'u_resolution')
    const uBreath = gl.getUniformLocation(program, 'u_breath')

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const onMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      mouseRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: 1 - (event.clientY - rect.top) / rect.height,
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const start = performance.now()
    let frame = 0
    let paused = false

    const render = (now: number) => {
      if (paused) return

      const time = (now - start) * 0.001
      const breath = time * 0.65

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program)
      gl.uniform1f(uTime, time)
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform1f(uBreath, breath)
      gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT)

      frame = requestAnimationFrame(render)
    }

    const pause = () => {
      if (paused) return
      paused = true
      cancelAnimationFrame(frame)
      frame = 0
    }

    const resume = () => {
      if (!paused) return
      paused = false
      frame = requestAnimationFrame(render)
    }

    const onVisibility = () => {
      if (document.hidden) pause()
      else resume()
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (document.hidden) return
        if (entry?.isIntersecting) resume()
        else pause()
      },
      { threshold: 0.01 },
    )
    intersectionObserver.observe(canvas)

    document.addEventListener('visibilitychange', onVisibility)
    frame = requestAnimationFrame(render)

    return () => {
      paused = true
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibility)
      intersectionObserver.disconnect()
      window.removeEventListener('mousemove', onMove)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
