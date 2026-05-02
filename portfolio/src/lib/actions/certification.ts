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
      await db.certification.update({
        where: { id },
        data: {
          nameEn: translated.name ?? '',
          issuerEn: translated.issuer ?? '',
        },
      })
    }
  } catch (e) {
    console.error('번역 실패:', e)
  }
}

function readForm(formData: FormData) {
  return {
    name: formData.get('name') as string,
    issuer: formData.get('issuer') as string,
    issueDate: formData.get('issueDate') as string,
    expiryDate: (formData.get('expiryDate') as string) || null,
    credentialId: (formData.get('credentialId') as string) || '',
    credentialUrl: (formData.get('credentialUrl') as string) || '',
    published: formData.get('published') === 'true',
  }
}

export async function createCertification(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)
  const maxOrder = await db.certification.aggregate({ _max: { order: true } })
  const order = (maxOrder._max.order ?? -1) + 1

  const created = await db.certification.create({
    data: { ...f, order },
  })

  await translateAndSave(created.id, { name: f.name, issuer: f.issuer })

  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/certifications')
}

export async function updateCertification(id: string, formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)

  await db.certification.update({ where: { id }, data: f })

  await translateAndSave(id, { name: f.name, issuer: f.issuer })

  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/certifications')
}

export async function deleteCertification(id: string) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.certification.delete({ where: { id } })
  revalidatePath('/resume')
  revalidatePath('/cv')
  revalidatePath('/admin/certifications')
}

export async function moveCertification(id: string, direction: 'up' | 'down') {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const items = await db.certification.findMany({ orderBy: { order: 'asc' } })
  const idx = items.findIndex((e) => e.id === id)
  if (idx === -1) return

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return

  await db.$transaction([
    db.certification.update({ where: { id: items[idx].id }, data: { order: items[swapIdx].order } }),
    db.certification.update({ where: { id: items[swapIdx].id }, data: { order: items[idx].order } }),
  ])

  revalidatePath('/admin/certifications')
}
