import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { PatentForm } from '@/components/admin/PatentForm'
import { updatePatent } from '@/lib/actions/patent'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPatentPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const patent = await db.patent.findUnique({ where: { id } })
  if (!patent) notFound()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">특허 편집</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <PatentForm patent={patent} action={updatePatent.bind(null, id)} />
      </div>
    </div>
  )
}
