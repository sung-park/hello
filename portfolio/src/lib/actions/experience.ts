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
      await db.experience.update({
        where: { id },
        data: {
          companyEn: translated.company ?? '',
          roleEn: translated.role ?? '',
          descriptionEn: translated.description ?? '',
          locationEn: translated.location ?? '',
          summaryEn: translated.summary ?? '',
          achievementsEn: translated.achievements ?? '',
        },
      })
    }
  } catch (e) {
    console.error('번역 실패:', e)
  }
}

function readForm(formData: FormData) {
  return {
    company: formData.get('company') as string,
    role: formData.get('role') as string,
    description: formData.get('description') as string,
    techStack: formData.get('techStack') as string,
    startDate: formData.get('startDate') as string,
    endDate: (formData.get('endDate') as string) || null,
    location: (formData.get('location') as string) || '',
    current: formData.get('current') === 'true',
    summary: (formData.get('summary') as string) || '',
    achievements: (formData.get('achievements') as string) || '',
    published: formData.get('published') === 'true',
  }
}

export async function createExperience(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)
  const count = await db.experience.count()

  const created = await db.experience.create({
    data: {
      company: f.company,
      role: f.role,
      startDate: f.startDate,
      endDate: f.current ? null : f.endDate,
      description: f.description,
      techStack: f.techStack,
      location: f.location,
      current: f.current,
      summary: f.summary,
      achievements: f.achievements,
      published: f.published,
      order: count,
    },
  })

  await translateAndSave(created.id, {
    company: f.company,
    role: f.role,
    description: f.description,
    location: f.location,
    summary: f.summary,
    achievements: f.achievements,
  })

  revalidatePath('/')
  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/experience')
}

export async function updateExperience(id: string, formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const f = readForm(formData)

  await db.experience.update({
    where: { id },
    data: {
      company: f.company,
      role: f.role,
      startDate: f.startDate,
      endDate: f.current ? null : f.endDate,
      description: f.description,
      techStack: f.techStack,
      location: f.location,
      current: f.current,
      summary: f.summary,
      achievements: f.achievements,
      published: f.published,
    },
  })

  await translateAndSave(id, {
    company: f.company,
    role: f.role,
    description: f.description,
    location: f.location,
    summary: f.summary,
    achievements: f.achievements,
  })

  revalidatePath('/')
  revalidatePath('/resume')
  revalidatePath('/cv')
  redirect('/admin/experience')
}

export async function deleteExperience(id: string) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.experience.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/resume')
  revalidatePath('/cv')
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
  revalidatePath('/resume')
  revalidatePath('/cv')
  revalidatePath('/admin/experience')
}
