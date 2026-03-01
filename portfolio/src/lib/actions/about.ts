'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function updateAbout(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.about.upsert({
    where: { id: 'singleton' },
    update: {
      name: formData.get('name') as string,
      title: formData.get('title') as string,
      tagline: formData.get('tagline') as string,
      bio: formData.get('bio') as string,
      avatarUrl: (formData.get('avatarUrl') as string) || null,
      resumeUrl: (formData.get('resumeUrl') as string) || null,
    },
    create: {
      id: 'singleton',
      name: formData.get('name') as string,
      title: formData.get('title') as string,
      tagline: formData.get('tagline') as string,
      bio: formData.get('bio') as string,
      avatarUrl: (formData.get('avatarUrl') as string) || null,
      resumeUrl: (formData.get('resumeUrl') as string) || null,
    },
  })

  revalidatePath('/')
}
