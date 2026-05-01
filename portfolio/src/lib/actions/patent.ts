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
      await db.patent.update({
        where: { id },
        data: {
          titleEn: translated.title ?? '',
          inventorsEn: translated.inventors ?? '',
          summaryEn: translated.summary ?? '',
        },
      })
    }
  } catch (e) {
    console.error('번역 실패:', e)
  }
}

function readForm(formData: FormData) {
  const countRaw = formData.get('count') as string | null
  const count = countRaw && countRaw.trim() !== '' ? Number(countRaw) : 1
  return {
    title: formData.get('title') as string,
    patentNumber: (formData.get('patentNumber') as string) || '',
    country: (formData.get('country') as string) || '',
    status: (formData.get('status') as string) || 'granted',
    count: Number.isFinite(count) && count > 0 ? count : 1,
    filingDate: (formData.get('filingDate') as string) || '',
    grantDate: (formData.get('grantDate') as string) || '',
    inventors: (formData.get('inventors') as string) || '',
    url: (formData.get('url') as string) || '',
    summary: (formData.get('summary') as string) || '',
    published: formData.get('published') === 'true',
  }
}

export async function createPatent(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)
  const count = await db.patent.count()

  const created = await db.patent.create({ data: { ...f, order: count } })

  await translateAndSave(created.id, {
    title: f.title,
    inventors: f.inventors,
    summary: f.summary,
  })

  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/patents')
}

export async function updatePatent(id: string, formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)
  await db.patent.update({ where: { id }, data: f })

  await translateAndSave(id, {
    title: f.title,
    inventors: f.inventors,
    summary: f.summary,
  })

  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/patents')
}

export async function deletePatent(id: string) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.patent.delete({ where: { id } })
  revalidatePath('/resume')
  revalidatePath('/cv')
  revalidatePath('/admin/patents')
}

export async function movePatent(id: string, direction: 'up' | 'down') {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const items = await db.patent.findMany({ orderBy: { order: 'asc' } })
  const idx = items.findIndex((e) => e.id === id)
  if (idx === -1) return

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return

  await db.$transaction([
    db.patent.update({ where: { id: items[idx].id }, data: { order: items[swapIdx].order } }),
    db.patent.update({ where: { id: items[swapIdx].id }, data: { order: items[idx].order } }),
  ])

  revalidatePath('/admin/patents')
}
