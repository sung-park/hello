'use client'

import dynamicImport from 'next/dynamic'

const MinecraftPig = dynamicImport(
  () => import('./MinecraftPig').then((m) => m.MinecraftPig),
  { ssr: false },
)

export function PigWrapper() {
  return <MinecraftPig />
}
