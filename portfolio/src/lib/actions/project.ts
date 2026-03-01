'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const count = await db.project.count()
  await db.project.create({
    data: {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      techStack: formData.get('techStack') as string,
      repoUrl: (formData.get('repoUrl') as string) || null,
      liveUrl: (formData.get('liveUrl') as string) || null,
      imageUrl: (formData.get('imageUrl') as string) || null,
      featured: formData.get('featured') === 'true',
      published: formData.get('published') === 'true',
      order: count,
    },
  })

  revalidatePath('/')
  redirect('/admin/projects')
}

export async function updateProject(id: string, formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.project.update({
    where: { id },
    data: {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      techStack: formData.get('techStack') as string,
      repoUrl: (formData.get('repoUrl') as string) || null,
      liveUrl: (formData.get('liveUrl') as string) || null,
      imageUrl: (formData.get('imageUrl') as string) || null,
      featured: formData.get('featured') === 'true',
      published: formData.get('published') === 'true',
    },
  })

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
