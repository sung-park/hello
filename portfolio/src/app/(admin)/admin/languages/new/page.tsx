import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { LanguageForm } from '@/components/admin/LanguageForm'
import { createLanguage } from '@/lib/actions/language'

export default async function NewLanguagePage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">어학 추가</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <LanguageForm action={createLanguage} />
      </div>
    </div>
  )
}
