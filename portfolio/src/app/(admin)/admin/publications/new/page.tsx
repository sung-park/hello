import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { PublicationForm } from '@/components/admin/PublicationForm'
import { createPublication } from '@/lib/actions/publication'

export default async function NewPublicationPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">발표/출판 추가</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <PublicationForm action={createPublication} />
      </div>
    </div>
  )
}
