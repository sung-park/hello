import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { ExperienceForm } from '@/components/admin/ExperienceForm'
import { updateExperience } from '@/lib/actions/experience'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditExperiencePage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const experience = await db.experience.findUnique({ where: { id } })
  if (!experience) notFound()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">경력 편집</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <ExperienceForm
          experience={experience}
          action={updateExperience.bind(null, id)}
        />
      </div>
    </div>
  )
}
