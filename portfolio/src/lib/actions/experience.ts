'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function createExperience(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const count = await db.experience.count()
  await db.experience.create({
    data: {
      company: formData.get('company') as string,
      role: formData.get('role') as string,
      startDate: formData.get('startDate') as string,
      endDate: (formData.get('endDate') as string) || null,
      description: formData.get('description') as string,
      techStack: formData.get('techStack') as string,
      published: formData.get('published') === 'true',
      order: count,
    },
  })

  revalidatePath('/')
  redirect('/admin/experience')
}

export async function updateExperience(id: string, formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.experience.update({
    where: { id },
    data: {
      company: formData.get('company') as string,
      role: formData.get('role') as string,
      startDate: formData.get('startDate') as string,
      endDate: (formData.get('endDate') as string) || null,
      description: formData.get('description') as string,
      techStack: formData.get('techStack') as string,
      published: formData.get('published') === 'true',
    },
  })

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
