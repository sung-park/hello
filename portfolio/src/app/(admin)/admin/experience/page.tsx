import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteExperience, moveExperience } from '@/lib/actions/experience'

export default async function ExperienceAdminPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const experiences = await db.experience.findMany({
    orderBy: { order: 'asc' },
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">경력</h1>
        <Button asChild>
          <Link href="/admin/experience/new">
            <Plus size={16} className="mr-2" />
            추가
          </Link>
        </Button>
      </div>

      {experiences.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
          경력 항목이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp, idx) => (
            <div
              key={exp.id}
              className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              <div className="flex flex-col gap-1">
                <form action={moveExperience.bind(null, exp.id, 'up')}>
                  <button
                    type="submit"
                    disabled={idx === 0}
                    className="text-slate-500 hover:text-slate-300 disabled:opacity-30"
                  >
                    <ChevronUp size={16} />
                  </button>
                </form>
                <form action={moveExperience.bind(null, exp.id, 'down')}>
                  <button
                    type="submit"
                    disabled={idx === experiences.length - 1}
                    className="text-slate-500 hover:text-slate-300 disabled:opacity-30"
                  >
                    <ChevronDown size={16} />
                  </button>
                </form>
              </div>

              <div className="flex-1">
                <div className="font-medium text-slate-200">
                  {exp.role}
                  <span className="text-slate-400"> · {exp.company}</span>
                </div>
                <div className="text-sm text-slate-500">
                  {exp.startDate} — {exp.endDate ?? '현재'}
                </div>
                {!exp.published && (
                  <span className="text-xs text-amber-400">비공개</span>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/experience/${exp.id}`}>
                    <Pencil size={14} />
                  </Link>
                </Button>
                <form action={deleteExperience.bind(null, exp.id)}>
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
