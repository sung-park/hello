'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const PINK = 0xf0a0b0
const PINK_DARK = 0xd07888
const DARK = 0x2a2a2a

function addBox(
  parent: THREE.Group,
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  y: number,
  z: number,
  rx = 0,
  ry = 0,
  rz = 0,
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color }),
  )
  mesh.position.set(x, y, z)
  mesh.rotation.set(rx, ry, rz)
  parent.add(mesh)
}

export function MinecraftPig() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const W = 208
    const H = 192
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    camera.position.set(0, 0.4, 3.6)

    scene.add(new THREE.AmbientLight(0xffffff, 1.4))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
    dirLight.position.set(3, 5, 3)
    scene.add(dirLight)

    // Pig root group — bobs up and down
    const pigGroup = new THREE.Group()
    pigGroup.rotation.set(0.08, 0.5, 0)
    scene.add(pigGroup)

    // Body group
    const bodyGroup = new THREE.Group()
    pigGroup.add(bodyGroup)

    addBox(bodyGroup, 0.9, 0.65, 1.4, PINK, 0, 0, 0)
    for (const [x, z] of [[-0.28, 0.42], [0.28, 0.42], [-0.28, -0.42], [0.28, -0.42]]) {
      addBox(bodyGroup, 0.22, 0.5, 0.22, PINK, x, -0.58, z)
    }
    addBox(bodyGroup, 0.08, 0.24, 0.08, PINK_DARK, 0, 0.1, -0.74, 0.4, 0, 0.3)

    // Head group — rotates to follow cursor
    const headGroup = new THREE.Group()
    headGroup.position.set(0, 0.56, 0.73)
    pigGroup.add(headGroup)

    addBox(headGroup, 0.72, 0.72, 0.72, PINK, 0, 0, 0)
    addBox(headGroup, 0.36, 0.26, 0.06, PINK_DARK, 0, -0.1, 0.39)
    addBox(headGroup, 0.09, 0.09, 0.02, 0x7a3030, -0.09, -0.1, 0.425)
    addBox(headGroup, 0.09, 0.09, 0.02, 0x7a3030, 0.09, -0.1, 0.425)
    addBox(headGroup, 0.15, 0.15, 0.02, DARK, -0.2, 0.12, 0.375)
    addBox(headGroup, 0.15, 0.15, 0.02, DARK, 0.2, 0.12, 0.375)
    addBox(headGroup, 0.22, 0.22, 0.07, PINK_DARK, -0.26, 0.43, 0.08, 0.25, 0, 0.15)
    addBox(headGroup, 0.22, 0.22, 0.07, PINK_DARK, 0.26, 0.43, 0.08, 0.25, 0, -0.15)

    const mouse = { x: 0, y: 0 }
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('mousemove', onMouseMove)

    let animId: number
    let prevTime = performance.now()

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t
    }

    const headWorldPos = new THREE.Vector3()

    function animate() {
      animId = requestAnimationFrame(animate)
      const now = performance.now()
      const delta = Math.min((now - prevTime) / 1000, 0.1)
      prevTime = now

      headGroup.getWorldPosition(headWorldPos)
      headWorldPos.project(camera)
      const rect = canvas.getBoundingClientRect()
      const headScreenX = rect.left + ((headWorldPos.x + 1) / 2) * rect.width
      const headScreenY = rect.top + ((1 - headWorldPos.y) / 2) * rect.height

      const dx = mouse.x - headScreenX
      const dy = mouse.y - headScreenY

      const tY = Math.max(-0.7, Math.min(0.7, (dx / window.innerWidth) * 2.2))
      const tX = Math.max(-0.45, Math.min(0.5, (dy / window.innerHeight) * 1.6))

      const s = delta * 4
      headGroup.rotation.y = lerp(headGroup.rotation.y, tY, s)
      headGroup.rotation.x = lerp(headGroup.rotation.x, tX, s)

      pigGroup.position.y = Math.sin(now * 0.0015) * 0.04

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      renderer.dispose()
    }
  }, [])

  return (
    <div className="pointer-events-none">
      <canvas ref={canvasRef} width={208} height={192} />
    </div>
  )
}
