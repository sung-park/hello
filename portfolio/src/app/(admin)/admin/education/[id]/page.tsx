import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { EducationForm } from '@/components/admin/EducationForm'
import { updateEducation } from '@/lib/actions/education'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditEducationPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const education = await db.education.findUnique({ where: { id } })
  if (!education) notFound()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">학력 편집</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <EducationForm education={education} action={updateEducation.bind(null, id)} />
      </div>
    </div>
  )
}
