import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { LanguageForm } from '@/components/admin/LanguageForm'
import { updateLanguage } from '@/lib/actions/language'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditLanguagePage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const language = await db.language.findUnique({ where: { id } })
  if (!language) notFound()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">어학 편집</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <LanguageForm language={language} action={updateLanguage.bind(null, id)} />
      </div>
    </div>
  )
}
