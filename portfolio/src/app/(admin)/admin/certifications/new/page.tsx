import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { CertificationForm } from '@/components/admin/CertificationForm'
import { createCertification } from '@/lib/actions/certification'

export default async function NewCertificationPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">자격증 추가</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <CertificationForm action={createCertification} />
      </div>
    </div>
  )
}
