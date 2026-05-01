import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { PatentForm } from '@/components/admin/PatentForm'
import { createPatent } from '@/lib/actions/patent'

export default async function NewPatentPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">특허 추가</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <PatentForm action={createPatent} />
      </div>
    </div>
  )
}
