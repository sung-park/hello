import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { EducationForm } from '@/components/admin/EducationForm'
import { createEducation } from '@/lib/actions/education'

export default async function NewEducationPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">학력 추가</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <EducationForm action={createEducation} />
      </div>
    </div>
  )
}
