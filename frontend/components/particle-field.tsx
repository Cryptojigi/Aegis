'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  baseAlpha: number
  twinkle: number
  speed: number
  square: boolean
}

export function ParticleField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let raf = 0
    let t = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const build = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      width = rect?.width ?? window.innerWidth
      height = rect?.height ?? window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(220, Math.floor((width * height) / 7000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.4 + 0.6,
        baseAlpha: Math.random() * 0.5 + 0.15,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.25 + 0.05,
        square: Math.random() > 0.55,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      t += 0.012
      for (const p of particles) {
        p.y -= p.speed
        if (p.y < -4) {
          p.y = height + 4
          p.x = Math.random() * width
        }
        const alpha = reduce
          ? p.baseAlpha
          : p.baseAlpha * (0.55 + 0.45 * Math.sin(t + p.twinkle))
        ctx.fillStyle = `rgba(56, 211, 245, ${alpha})`
        if (p.square) {
          ctx.fillRect(p.x, p.y, p.size, p.size)
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      raf = requestAnimationFrame(draw)
    }

    build()
    if (reduce) {
      draw()
      cancelAnimationFrame(raf)
    } else {
      draw()
    }

    const onResize = () => {
      cancelAnimationFrame(raf)
      build()
      if (!reduce) draw()
      else draw()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
    />
  )
}
