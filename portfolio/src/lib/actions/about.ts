'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { translateToEnglish } from '@/lib/translate'

export async function updateAbout(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const data = {
    name: formData.get('name') as string,
    title: formData.get('title') as string,
    tagline: formData.get('tagline') as string,
    bio: formData.get('bio') as string,
    avatarUrl: (formData.get('avatarUrl') as string) || null,
    resumeUrl: (formData.get('resumeUrl') as string) || null,
  }

  await db.about.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  })

  try {
    const translated = await translateToEnglish({
      name: data.name,
      title: data.title,
      tagline: data.tagline,
      bio: data.bio,
    })
    if (Object.keys(translated).length > 0) {
      await db.about.update({
        where: { id: 'singleton' },
        data: {
          nameEn: translated.name ?? '',
          titleEn: translated.title ?? '',
          taglineEn: translated.tagline ?? '',
          bioEn: translated.bio ?? '',
        },
      })
    }
  } catch (e) {
    console.error('번역 실패:', e)
  }

  revalidatePath('/')
}
