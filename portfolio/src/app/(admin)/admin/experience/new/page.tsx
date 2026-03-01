import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ExperienceForm } from '@/components/admin/ExperienceForm'
import { createExperience } from '@/lib/actions/experience'

export default async function NewExperiencePage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">경력 추가</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <ExperienceForm action={createExperience} />
      </div>
    </div>
  )
}
