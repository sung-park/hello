import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteProject } from '@/lib/actions/project'

export default async function ProjectsAdminPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const projects = await db.project.findMany({
    orderBy: [{ featured: 'desc' }, { order: 'asc' }],
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">프로젝트</h1>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus size={16} className="mr-2" />
            추가
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
          프로젝트가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {project.featured && (
                    <Star size={14} className="text-amber-400" />
                  )}
                  <span className="font-medium text-slate-200">
                    {project.title}
                  </span>
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {project.techStack}
                </div>
                {!project.published && (
                  <span className="text-xs text-amber-400">비공개</span>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/projects/${project.id}`}>
                    <Pencil size={14} />
                  </Link>
                </Button>
                <form action={deleteProject.bind(null, project.id)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="submit"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
