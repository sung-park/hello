'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { translateToEnglish } from '@/lib/translate'

async function translateAndSave(id: string, fields: Record<string, string>) {
  try {
    const translated = await translateToEnglish(fields)
    if (Object.keys(translated).length > 0) {
      await db.award.update({
        where: { id },
        data: {
          titleEn: translated.title ?? '',
          issuerEn: translated.issuer ?? '',
          descriptionEn: translated.description ?? '',
        },
      })
    }
  } catch (e) {
    console.error('번역 실패:', e)
  }
}

function readForm(formData: FormData) {
  return {
    title: formData.get('title') as string,
    issuer: formData.get('issuer') as string,
    date: formData.get('date') as string,
    description: (formData.get('description') as string) || '',
    published: formData.get('published') === 'true',
  }
}

export async function createAward(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)
  const count = await db.award.count()

  const created = await db.award.create({ data: { ...f, order: count } })

  await translateAndSave(created.id, {
    title: f.title,
    issuer: f.issuer,
    description: f.description,
  })

  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/awards')
}

export async function updateAward(id: string, formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)

  await db.award.update({ where: { id }, data: f })

  await translateAndSave(id, {
    title: f.title,
    issuer: f.issuer,
    description: f.description,
  })

  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/awards')
}

export async function deleteAward(id: string) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.award.delete({ where: { id } })
  revalidatePath('/resume')
  revalidatePath('/cv')
  revalidatePath('/admin/awards')
}

export async function moveAward(id: string, direction: 'up' | 'down') {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const items = await db.award.findMany({ orderBy: { order: 'asc' } })
  const idx = items.findIndex((e) => e.id === id)
  if (idx === -1) return

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return

  await db.$transaction([
    db.award.update({ where: { id: items[idx].id }, data: { order: items[swapIdx].order } }),
    db.award.update({ where: { id: items[swapIdx].id }, data: { order: items[idx].order } }),
  ])

  revalidatePath('/admin/awards')
}
