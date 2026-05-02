'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { translateToEnglish } from '@/lib/translate'

async function translateAndSave(id: string, fields: Record<string, string>) {
  try {
    const translated = await translateToEnglish(fields)
    if (translated.name) {
      await db.language.update({ where: { id }, data: { nameEn: translated.name } })
    }
  } catch (e) {
    console.error('번역 실패:', e)
  }
}

function readForm(formData: FormData) {
  return {
    name: formData.get('name') as string,
    proficiency: formData.get('proficiency') as string,
    testName: (formData.get('testName') as string) || '',
    score: (formData.get('score') as string) || '',
    published: formData.get('published') === 'true',
  }
}

export async function createLanguage(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)
  const maxOrder = await db.language.aggregate({ _max: { order: true } })
  const order = (maxOrder._max.order ?? -1) + 1
  const created = await db.language.create({ data: { ...f, order } })

  await translateAndSave(created.id, { name: f.name })

  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/languages')
}

export async function updateLanguage(id: string, formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)
  await db.language.update({ where: { id }, data: f })

  await translateAndSave(id, { name: f.name })

  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/languages')
}

export async function deleteLanguage(id: string) {
  const session = await auth()
  if (!session) redirect('/admin/login')
  await db.language.delete({ where: { id } })
  revalidatePath('/resume')
  revalidatePath('/cv')
  revalidatePath('/admin/languages')
}

export async function moveLanguage(id: string, direction: 'up' | 'down') {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const items = await db.language.findMany({ orderBy: { order: 'asc' } })
  const idx = items.findIndex((e) => e.id === id)
  if (idx === -1) return
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return

  await db.$transaction([
    db.language.update({ where: { id: items[idx].id }, data: { order: items[swapIdx].order } }),
    db.language.update({ where: { id: items[swapIdx].id }, data: { order: items[idx].order } }),
  ])

  revalidatePath('/admin/languages')
}
