'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function createPlayground(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const count = await db.playground.count()
  await db.playground.create({
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
  redirect('/admin/playground')
}

export async function updatePlayground(id: string, formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.playground.update({
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
  redirect('/admin/playground')
}

export async function deletePlayground(id: string) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.playground.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin/playground')
}
