import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AwardForm } from '@/components/admin/AwardForm'
import { createAward } from '@/lib/actions/award'

export default async function NewAwardPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">수상 추가</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <AwardForm action={createAward} />
      </div>
    </div>
  )
}
