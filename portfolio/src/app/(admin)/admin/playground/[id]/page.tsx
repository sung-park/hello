import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { PlaygroundForm } from '@/components/admin/PlaygroundForm'
import { updatePlayground } from '@/lib/actions/playground'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPlaygroundPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const item = await db.playground.findUnique({ where: { id } })
  if (!item) notFound()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">플레이그라운드 편집</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <PlaygroundForm playground={item} action={updatePlayground.bind(null, id)} />
      </div>
    </div>
  )
}
