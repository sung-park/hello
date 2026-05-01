'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface FallingPetal {
  x: number
  y: number
  vy: number
  rotation: number
  rotationSpeed: number
  size: number
  opacity: number
  swayOffset: number
  swaySpeed: number
  swayAmplitude: number
  timeAlive: number
}

interface SettledPetal {
  x: number
  y: number
  rotation: number
  size: number
  opacity: number
  settledAt: number
}

const SPAWN_INTERVAL = 22
const MAX_FALLING = 90
const MAX_SETTLED = 375
const FADE_DELAY = 8000
const FADE_SPEED = 0.004

function drawPetal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  opacity: number,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.globalAlpha = opacity

  ctx.fillStyle = '#ffb7c5'
  ctx.beginPath()
  ctx.ellipse(-size * 0.15, 0, size * 0.4, size, 0.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(size * 0.15, 0, size * 0.4, size, -0.15, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 235, 242, 0.45)'
  ctx.beginPath()
  ctx.ellipse(0, -size * 0.2, size * 0.22, size * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

export function CherryBlossom() {
  const pathname = usePathname()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const skip = pathname === '/resume' || pathname === '/cv' || pathname.startsWith('/admin')

  useEffect(() => {
    if (skip) return
    if (!canvasRef.current) return
    const canvas: HTMLCanvasElement = canvasRef.current

    const rawCtx = canvas.getContext('2d')
    if (!rawCtx) return
    const ctx: CanvasRenderingContext2D = rawCtx

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const falling: FallingPetal[] = []
    const settled: SettledPetal[] = []
    let frame = 0
    let animId: number

    function spawnPetal() {
      falling.push({
        x: Math.random() * canvas.width,
        y: -20,
        vy: 0.8 + Math.random() * 1.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        size: 4 + Math.random() * 4,
        opacity: 0.7 + Math.random() * 0.3,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.01,
        swayAmplitude: 0.8 + Math.random() * 1.5,
        timeAlive: 0,
      })
    }

    function tick() {
      frame++
      const now = performance.now()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (frame % SPAWN_INTERVAL === 0 && falling.length < MAX_FALLING) {
        spawnPetal()
      }

      for (let i = falling.length - 1; i >= 0; i--) {
        const p = falling[i]
        p.timeAlive++
        p.vy = Math.min(p.vy + 0.02, 2.5)
        p.x += p.swayAmplitude * Math.sin(p.timeAlive * p.swaySpeed + p.swayOffset)
        p.y += p.vy
        p.rotation += p.rotationSpeed

        if (p.y > canvas.height - 15) {
          const pileHeight = Math.min(settled.length * 0.3, 60)
          settled.push({
            x: p.x,
            y: canvas.height - 5 - Math.random() * pileHeight,
            rotation: p.rotation,
            size: p.size,
            opacity: p.opacity,
            settledAt: now,
          })
          falling.splice(i, 1)
        } else {
          drawPetal(ctx, p.x, p.y, p.size, p.rotation, p.opacity)
        }
      }

      for (let i = settled.length - 1; i >= 0; i--) {
        const p = settled[i]
        const age = now - p.settledAt

        if (age > FADE_DELAY || settled.length > MAX_SETTLED) {
          p.opacity -= FADE_SPEED
          if (settled.length > MAX_SETTLED) p.opacity -= FADE_SPEED
        }

        if (p.opacity <= 0) {
          settled.splice(i, 1)
          continue
        }

        drawPetal(ctx, p.x, p.y, p.size, p.rotation, p.opacity)
      }

      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [skip])

  if (skip) return null
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-10" />
}
