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
      await db.publication.update({
        where: { id },
        data: {
          titleEn: translated.title ?? '',
          venueEn: translated.venue ?? '',
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
    type: (formData.get('type') as string) || 'talk',
    venue: (formData.get('venue') as string) || '',
    date: formData.get('date') as string,
    description: (formData.get('description') as string) || '',
    url: (formData.get('url') as string) || '',
    published: formData.get('published') === 'true',
  }
}

export async function createPublication(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)
  const count = await db.publication.count()
  const created = await db.publication.create({ data: { ...f, order: count } })

  await translateAndSave(created.id, {
    title: f.title,
    venue: f.venue,
    description: f.description,
  })

  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/publications')
}

export async function updatePublication(id: string, formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)
  await db.publication.update({ where: { id }, data: f })

  await translateAndSave(id, {
    title: f.title,
    venue: f.venue,
    description: f.description,
  })

  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/publications')
}

export async function deletePublication(id: string) {
  const session = await auth()
  if (!session) redirect('/admin/login')
  await db.publication.delete({ where: { id } })
  revalidatePath('/resume')
  revalidatePath('/cv')
  revalidatePath('/admin/publications')
}

export async function movePublication(id: string, direction: 'up' | 'down') {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const items = await db.publication.findMany({ orderBy: { order: 'asc' } })
  const idx = items.findIndex((e) => e.id === id)
  if (idx === -1) return
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return

  await db.$transaction([
    db.publication.update({ where: { id: items[idx].id }, data: { order: items[swapIdx].order } }),
    db.publication.update({ where: { id: items[swapIdx].id }, data: { order: items[idx].order } }),
  ])

  revalidatePath('/admin/publications')
}
