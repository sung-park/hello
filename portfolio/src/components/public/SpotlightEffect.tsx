'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function SpotlightEffect() {
  const pathname = usePathname()
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  if (pathname === '/resume' || pathname === '/cv' || pathname === '/combined' || pathname.startsWith('/admin')) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition duration-300"
      style={{
        background: `radial-gradient(600px at ${pos.x}px ${pos.y}px, rgba(29, 78, 216, 0.10), transparent 80%)`,
      }}
    />
  )
}
