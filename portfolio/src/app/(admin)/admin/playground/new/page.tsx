import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { PlaygroundForm } from '@/components/admin/PlaygroundForm'
import { createPlayground } from '@/lib/actions/playground'

export default async function NewPlaygroundPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">플레이그라운드 추가</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <PlaygroundForm action={createPlayground} />
      </div>
    </div>
  )
}
