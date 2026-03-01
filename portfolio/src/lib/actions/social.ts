'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function createSocialLink(formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const count = await db.socialLink.count()
  await db.socialLink.create({
    data: {
      platform: formData.get('platform') as string,
      url: formData.get('url') as string,
      icon: formData.get('icon') as string,
      order: count,
    },
  })

  revalidatePath('/')
  revalidatePath('/admin/social')
}

export async function updateSocialLink(id: string, formData: FormData) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.socialLink.update({
    where: { id },
    data: {
      platform: formData.get('platform') as string,
      url: formData.get('url') as string,
      icon: formData.get('icon') as string,
    },
  })

  revalidatePath('/')
  revalidatePath('/admin/social')
}

export async function deleteSocialLink(id: string) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  await db.socialLink.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin/social')
}
