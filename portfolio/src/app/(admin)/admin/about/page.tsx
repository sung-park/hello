import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AboutForm } from '@/components/admin/AboutForm'

export default async function AboutAdminPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const about = await db.about.findUnique({ where: { id: 'singleton' } })

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">자기소개 편집</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <AboutForm about={about} />
      </div>
    </div>
  )
}
