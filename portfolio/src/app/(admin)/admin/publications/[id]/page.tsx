import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { PublicationForm } from '@/components/admin/PublicationForm'
import { updatePublication } from '@/lib/actions/publication'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPublicationPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const publication = await db.publication.findUnique({ where: { id } })
  if (!publication) notFound()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">발표/출판 편집</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <PublicationForm
          publication={publication}
          action={updatePublication.bind(null, id)}
        />
      </div>
    </div>
  )
}
