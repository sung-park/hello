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
      await db.education.update({
        where: { id },
        data: {
          schoolEn: translated.school ?? '',
          degreeEn: translated.degree ?? '',
          fieldEn: translated.field ?? '',
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
    school: formData.get('school') as string,
    degree: formData.get('degree') as string,
    field: formData.get('field') as string,
    startDate: formData.get('startDate') as string,
    endDate: (formData.get('endDate') as string) || null,
    gpa: (formData.get('gpa') as string) || '',
    description: (formData.get('description') as string) || '',
    published: formData.get('published') === 'true',
  }
}

export async function createEducation(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)
  const count = await db.education.count()

  const created = await db.education.create({
    data: { ...f, order: count },
  })

  await translateAndSave(created.id, {
    school: f.school,
    degree: f.degree,
    field: f.field,
    description: f.description,
  })

  revalidatePath('/')
  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/education')
}

export async function updateEducation(id: string, formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)

  await db.education.update({ where: { id }, data: f })

  await translateAndSave(id, {
    school: f.school,
    degree: f.degree,
    field: f.field,
    description: f.description,
  })

  revalidatePath('/')
  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/education')
}

export async function deleteEducation(id: string) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.education.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/resume')
  revalidatePath('/cv')
  revalidatePath('/admin/education')
}

export async function moveEducation(id: string, direction: 'up' | 'down') {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const items = await db.education.findMany({ orderBy: { order: 'asc' } })
  const idx = items.findIndex((e) => e.id === id)
  if (idx === -1) return

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return

  await db.$transaction([
    db.education.update({ where: { id: items[idx].id }, data: { order: items[swapIdx].order } }),
    db.education.update({ where: { id: items[swapIdx].id }, data: { order: items[idx].order } }),
  ])

  revalidatePath('/admin/education')
}
