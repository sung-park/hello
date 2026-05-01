'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { translateToEnglish } from '@/lib/translate'

async function requireSession() {
  const session = await auth()
  if (!session) redirect('/admin/login')
}

function bumpRevalidate() {
  revalidatePath('/resume')
  revalidatePath('/cv')
  revalidatePath('/admin/skills')
}

// ===== SkillCategory =====

export async function createSkillCategory(formData: FormData) {
  await requireSession()
  const name = formData.get('name') as string
  if (!name?.trim()) return

  const count = await db.skillCategory.count()
  const created = await db.skillCategory.create({ data: { name, order: count } })

  try {
    const translated = await translateToEnglish({ name })
    if (translated.name) {
      await db.skillCategory.update({
        where: { id: created.id },
        data: { nameEn: translated.name },
      })
    }
  } catch (e) {
    console.error('번역 실패:', e)
  }

  bumpRevalidate()
}

export async function updateSkillCategory(id: string, formData: FormData) {
  await requireSession()
  const name = formData.get('name') as string
  if (!name?.trim()) return

  await db.skillCategory.update({ where: { id }, data: { name } })

  try {
    const translated = await translateToEnglish({ name })
    if (translated.name) {
      await db.skillCategory.update({ where: { id }, data: { nameEn: translated.name } })
    }
  } catch (e) {
    console.error('번역 실패:', e)
  }

  bumpRevalidate()
}

export async function deleteSkillCategory(id: string) {
  await requireSession()
  await db.skillCategory.delete({ where: { id } })
  bumpRevalidate()
}

export async function moveSkillCategory(id: string, direction: 'up' | 'down') {
  await requireSession()
  const items = await db.skillCategory.findMany({ orderBy: { order: 'asc' } })
  const idx = items.findIndex((e) => e.id === id)
  if (idx === -1) return
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return
  await db.$transaction([
    db.skillCategory.update({
      where: { id: items[idx].id },
      data: { order: items[swapIdx].order },
    }),
    db.skillCategory.update({
      where: { id: items[swapIdx].id },
      data: { order: items[idx].order },
    }),
  ])
  bumpRevalidate()
}

// ===== Skill =====

function readSkillForm(formData: FormData) {
  const levelRaw = formData.get('level') as string | null
  const yearsRaw = formData.get('years') as string | null
  return {
    name: formData.get('name') as string,
    level: levelRaw && levelRaw.trim() !== '' ? Number(levelRaw) : null,
    years: yearsRaw && yearsRaw.trim() !== '' ? Number(yearsRaw) : null,
  }
}

export async function createSkill(categoryId: string, formData: FormData) {
  await requireSession()
  const f = readSkillForm(formData)
  if (!f.name?.trim()) return

  const count = await db.skill.count({ where: { categoryId } })
  const created = await db.skill.create({
    data: {
      categoryId,
      name: f.name,
      level: f.level !== null && Number.isFinite(f.level) ? f.level : null,
      years: f.years !== null && Number.isFinite(f.years) ? f.years : null,
      order: count,
    },
  })

  try {
    const translated = await translateToEnglish({ name: f.name })
    if (translated.name) {
      await db.skill.update({ where: { id: created.id }, data: { nameEn: translated.name } })
    }
  } catch (e) {
    console.error('번역 실패:', e)
  }

  bumpRevalidate()
}

export async function updateSkill(id: string, formData: FormData) {
  await requireSession()
  const f = readSkillForm(formData)
  if (!f.name?.trim()) return

  await db.skill.update({
    where: { id },
    data: {
      name: f.name,
      level: f.level !== null && Number.isFinite(f.level) ? f.level : null,
      years: f.years !== null && Number.isFinite(f.years) ? f.years : null,
    },
  })

  try {
    const translated = await translateToEnglish({ name: f.name })
    if (translated.name) {
      await db.skill.update({ where: { id }, data: { nameEn: translated.name } })
    }
  } catch (e) {
    console.error('번역 실패:', e)
  }

  bumpRevalidate()
}

export async function deleteSkill(id: string) {
  await requireSession()
  await db.skill.delete({ where: { id } })
  bumpRevalidate()
}

export async function moveSkill(id: string, direction: 'up' | 'down') {
  await requireSession()
  const skill = await db.skill.findUnique({ where: { id } })
  if (!skill) return
  const items = await db.skill.findMany({
    where: { categoryId: skill.categoryId },
    orderBy: { order: 'asc' },
  })
  const idx = items.findIndex((e) => e.id === id)
  if (idx === -1) return
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return
  await db.$transaction([
    db.skill.update({ where: { id: items[idx].id }, data: { order: items[swapIdx].order } }),
    db.skill.update({ where: { id: items[swapIdx].id }, data: { order: items[idx].order } }),
  ])
  bumpRevalidate()
}
