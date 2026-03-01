'use client'

import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PINK = '#f0a0b0'
const PINK_DARK = '#d07888'
const DARK = '#2a2a2a'

type MouseRef = React.MutableRefObject<{ x: number; y: number }>

function PigBody() {
  return (
    <>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.9, 0.65, 1.4]} />
        <meshLambertMaterial color={PINK} />
      </mesh>

      {(
        [
          [-0.28, -0.58, 0.42],
          [0.28, -0.58, 0.42],
          [-0.28, -0.58, -0.42],
          [0.28, -0.58, -0.42],
        ] as [number, number, number][]
      ).map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.22, 0.5, 0.22]} />
          <meshLambertMaterial color={PINK} />
        </mesh>
      ))}

      <mesh position={[0, 0.1, -0.74]} rotation={[0.4, 0, 0.3]}>
        <boxGeometry args={[0.08, 0.24, 0.08]} />
        <meshLambertMaterial color={PINK_DARK} />
      </mesh>
    </>
  )
}

function PigHead({ mouseRef }: { mouseRef: MouseRef }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const nx = (mouseRef.current.x / window.innerWidth) * 2 - 1
    const ny = -((mouseRef.current.y / window.innerHeight) * 2 - 1)
    const targetY = nx * 0.65
    const targetX = ny * 0.3
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetY,
      delta * 4,
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetX,
      delta * 4,
    )
  })

  return (
    <group ref={groupRef} position={[0, 0.56, 0.73]}>
      <mesh>
        <boxGeometry args={[0.72, 0.72, 0.72]} />
        <meshLambertMaterial color={PINK} />
      </mesh>

      <mesh position={[0, -0.1, 0.39]}>
        <boxGeometry args={[0.36, 0.26, 0.06]} />
        <meshLambertMaterial color={PINK_DARK} />
      </mesh>
      <mesh position={[-0.09, -0.1, 0.425]}>
        <boxGeometry args={[0.09, 0.09, 0.02]} />
        <meshLambertMaterial color="#7a3030" />
      </mesh>
      <mesh position={[0.09, -0.1, 0.425]}>
        <boxGeometry args={[0.09, 0.09, 0.02]} />
        <meshLambertMaterial color="#7a3030" />
      </mesh>

      <mesh position={[-0.2, 0.12, 0.375]}>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshLambertMaterial color={DARK} />
      </mesh>
      <mesh position={[0.2, 0.12, 0.375]}>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshLambertMaterial color={DARK} />
      </mesh>

      <mesh position={[-0.26, 0.43, 0.08]} rotation={[0.25, 0, 0.15]}>
        <boxGeometry args={[0.22, 0.22, 0.07]} />
        <meshLambertMaterial color={PINK_DARK} />
      </mesh>
      <mesh position={[0.26, 0.43, 0.08]} rotation={[0.25, 0, -0.15]}>
        <boxGeometry args={[0.22, 0.22, 0.07]} />
        <meshLambertMaterial color={PINK_DARK} />
      </mesh>
    </group>
  )
}

function PigScene({ mouseRef }: { mouseRef: MouseRef }) {
  const pigRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!pigRef.current) return
    pigRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.04
  })

  return (
    <group ref={pigRef} rotation={[0.08, 0.5, 0]}>
      <PigBody />
      <PigHead mouseRef={mouseRef} />
    </group>
  )
}

export function MinecraftPig() {
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 z-40 h-48 w-52">
      <Canvas
        camera={{ position: [0, 0.4, 3.6], fov: 45 }}
        gl={{ alpha: true, antialias: false }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight position={[3, 5, 3]} intensity={0.5} />
        <PigScene mouseRef={mouseRef} />
      </Canvas>
    </div>
  )
}
