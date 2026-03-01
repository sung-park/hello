'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { translateToEnglish } from '@/lib/translate'

async function translateAndSave(id: string, title: string, description: string) {
  try {
    const translated = await translateToEnglish({ title, description })
    if (Object.keys(translated).length > 0) {
      await db.project.update({
        where: { id },
        data: {
          titleEn: translated.title ?? '',
          descriptionEn: translated.description ?? '',
        },
      })
    }
  } catch (e) {
    console.error('번역 실패:', e)
  }
}

export async function createProject(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const count = await db.project.count()
  const created = await db.project.create({
    data: {
      title,
      description,
      techStack: formData.get('techStack') as string,
      repoUrl: (formData.get('repoUrl') as string) || null,
      liveUrl: (formData.get('liveUrl') as string) || null,
      imageUrl: (formData.get('imageUrl') as string) || null,
      featured: formData.get('featured') === 'true',
      published: formData.get('published') === 'true',
      order: count,
    },
  })

  await translateAndSave(created.id, title, description)

  revalidatePath('/')
  redirect('/admin/projects')
}

export async function updateProject(id: string, formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string

  await db.project.update({
    where: { id },
    data: {
      title,
      description,
      techStack: formData.get('techStack') as string,
      repoUrl: (formData.get('repoUrl') as string) || null,
      liveUrl: (formData.get('liveUrl') as string) || null,
      imageUrl: (formData.get('imageUrl') as string) || null,
      featured: formData.get('featured') === 'true',
      published: formData.get('published') === 'true',
    },
  })

  await translateAndSave(id, title, description)

  revalidatePath('/')
  redirect('/admin/projects')
}

export async function deleteProject(id: string) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.project.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin/projects')
}
