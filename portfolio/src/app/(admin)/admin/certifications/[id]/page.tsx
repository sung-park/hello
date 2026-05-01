import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { CertificationForm } from '@/components/admin/CertificationForm'
import { updateCertification } from '@/lib/actions/certification'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCertificationPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const certification = await db.certification.findUnique({ where: { id } })
  if (!certification) notFound()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">자격증 편집</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <CertificationForm
          certification={certification}
          action={updateCertification.bind(null, id)}
        />
      </div>
    </div>
  )
}
