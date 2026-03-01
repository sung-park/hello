'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { translateToEnglish } from '@/lib/translate'

async function translateAndSave(id: string, company: string, role: string, description: string) {
  try {
    const translated = await translateToEnglish({ company, role, description })
    if (Object.keys(translated).length > 0) {
      await db.experience.update({
        where: { id },
        data: {
          companyEn: translated.company ?? '',
          roleEn: translated.role ?? '',
          descriptionEn: translated.description ?? '',
        },
      })
    }
  } catch (e) {
    console.error('번역 실패:', e)
  }
}

export async function createExperience(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const company = formData.get('company') as string
  const role = formData.get('role') as string
  const description = formData.get('description') as string

  const count = await db.experience.count()
  const created = await db.experience.create({
    data: {
      company,
      role,
      startDate: formData.get('startDate') as string,
      endDate: (formData.get('endDate') as string) || null,
      description,
      techStack: formData.get('techStack') as string,
      published: formData.get('published') === 'true',
      order: count,
    },
  })

  await translateAndSave(created.id, company, role, description)

  revalidatePath('/')
  redirect('/admin/experience')
}

export async function updateExperience(id: string, formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const company = formData.get('company') as string
  const role = formData.get('role') as string
  const description = formData.get('description') as string

  await db.experience.update({
    where: { id },
    data: {
      company,
      role,
      startDate: formData.get('startDate') as string,
      endDate: (formData.get('endDate') as string) || null,
      description,
      techStack: formData.get('techStack') as string,
      published: formData.get('published') === 'true',
    },
  })

  await translateAndSave(id, company, role, description)

  revalidatePath('/')
  redirect('/admin/experience')
}

export async function deleteExperience(id: string) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.experience.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin/experience')
}

export async function moveExperience(id: string, direction: 'up' | 'down') {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const experiences = await db.experience.findMany({ orderBy: { order: 'asc' } })
  const idx = experiences.findIndex((e) => e.id === id)
  if (idx === -1) return

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= experiences.length) return

  const a = experiences[idx]
  const b = experiences[swapIdx]

  await db.$transaction([
    db.experience.update({ where: { id: a.id }, data: { order: b.order } }),
    db.experience.update({ where: { id: b.id }, data: { order: a.order } }),
  ])

  revalidatePath('/')
  revalidatePath('/admin/experience')
}
