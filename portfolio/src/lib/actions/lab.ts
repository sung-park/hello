'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getPigEnabled(): Promise<boolean> {
  const setting = await db.setting.findUnique({ where: { key: 'pig.enabled' } })
  return setting?.value === 'true'
}

export async function setPigEnabled(enabled: boolean): Promise<void> {
  await db.setting.upsert({
    where: { key: 'pig.enabled' },
    update: { value: String(enabled) },
    create: { key: 'pig.enabled', value: String(enabled) },
  })
  revalidatePath('/')
  revalidatePath('/admin/lab')
}
