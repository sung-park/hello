import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { createProject } from '@/lib/actions/project'

export default async function NewProjectPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">프로젝트 추가</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <ProjectForm action={createProject} />
      </div>
    </div>
  )
}
