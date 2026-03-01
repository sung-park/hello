import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deletePlayground } from '@/lib/actions/playground'

export default async function PlaygroundAdminPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const items = await db.playground.findMany({
    orderBy: [{ featured: 'desc' }, { order: 'asc' }],
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">플레이그라운드</h1>
        <Button asChild>
          <Link href="/admin/playground/new">
            <Plus size={16} className="mr-2" />
            추가
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
          플레이그라운드 항목이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {item.featured && <Star size={14} className="text-amber-400" />}
                  <span className="font-medium text-slate-200">{item.title}</span>
                </div>
                <div className="mt-1 text-sm text-slate-500">{item.techStack}</div>
                {!item.published && (
                  <span className="text-xs text-amber-400">비공개</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/playground/${item.id}`}>
                    <Pencil size={14} />
                  </Link>
                </Button>
                <form action={deletePlayground.bind(null, item.id)}>
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
