import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { updateProject } from '@/lib/actions/project'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const project = await db.project.findUnique({ where: { id } })
  if (!project) notFound()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">프로젝트 편집</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <ProjectForm project={project} action={updateProject.bind(null, id)} />
      </div>
    </div>
  )
}
