import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { AwardForm } from '@/components/admin/AwardForm'
import { updateAward } from '@/lib/actions/award'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditAwardPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const award = await db.award.findUnique({ where: { id } })
  if (!award) notFound()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">수상 편집</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <AwardForm award={award} action={updateAward.bind(null, id)} />
      </div>
    </div>
  )
}
