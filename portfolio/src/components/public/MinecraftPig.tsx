'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const PINK = 0xf0a0b0
const PINK_DARK = 0xd07888
const DARK = 0x2a2a2a

function box(
  scene: THREE.Scene,
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
  scene.add(parent)
  return mesh
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

    const pigGroup = new THREE.Group()
    pigGroup.rotation.set(0.08, 0.5, 0)
    scene.add(pigGroup)

    const bodyGroup = new THREE.Group()
    pigGroup.add(bodyGroup)

    // body
    box(scene, bodyGroup, 0.9, 0.65, 1.4, PINK, 0, 0, 0)
    // legs
    for (const [x, z] of [[-0.28, 0.42], [0.28, 0.42], [-0.28, -0.42], [0.28, -0.42]]) {
      box(scene, bodyGroup, 0.22, 0.5, 0.22, PINK, x, -0.58, z)
    }
    // tail
    box(scene, bodyGroup, 0.08, 0.24, 0.08, PINK_DARK, 0, 0.1, -0.74, 0.4, 0, 0.3)

    const headGroup = new THREE.Group()
    headGroup.position.set(0, 0.56, 0.73)
    pigGroup.add(headGroup)

    // head
    box(scene, headGroup, 0.72, 0.72, 0.72, PINK, 0, 0, 0)
    // snout
    box(scene, headGroup, 0.36, 0.26, 0.06, PINK_DARK, 0, -0.1, 0.39)
    // nostrils
    box(scene, headGroup, 0.09, 0.09, 0.02, 0x7a3030, -0.09, -0.1, 0.425)
    box(scene, headGroup, 0.09, 0.09, 0.02, 0x7a3030, 0.09, -0.1, 0.425)
    // eyes
    box(scene, headGroup, 0.15, 0.15, 0.02, DARK, -0.2, 0.12, 0.375)
    box(scene, headGroup, 0.15, 0.15, 0.02, DARK, 0.2, 0.12, 0.375)
    // ears
    box(scene, headGroup, 0.22, 0.22, 0.07, PINK_DARK, -0.26, 0.43, 0.08, 0.25, 0, 0.15)
    box(scene, headGroup, 0.22, 0.22, 0.07, PINK_DARK, 0.26, 0.43, 0.08, 0.25, 0, -0.15)

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

    function animate() {
      animId = requestAnimationFrame(animate)
      const now = performance.now()
      const delta = Math.min((now - prevTime) / 1000, 0.1)
      prevTime = now

      const nx = (mouse.x / window.innerWidth) * 2 - 1
      const ny = -((mouse.y / window.innerHeight) * 2 - 1)
      const speed = delta * 4
      headGroup.rotation.y = lerp(headGroup.rotation.y, nx * 0.65, speed)
      headGroup.rotation.x = lerp(headGroup.rotation.x, ny * 0.3, speed)

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
    <div className="pointer-events-none fixed bottom-0 left-0 z-40">
      <canvas ref={canvasRef} width={208} height={192} />
    </div>
  )
}
