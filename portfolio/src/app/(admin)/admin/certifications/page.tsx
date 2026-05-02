import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil, ChevronUp, ChevronDown } from 'lucide-react'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { Button } from '@/components/ui/button'
import { deleteCertification, moveCertification } from '@/lib/actions/certification'

export default async function CertificationAdminPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const items = await db.certification.findMany({ orderBy: { order: 'asc' } })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">자격증</h1>
        <Button asChild>
          <Link href="/admin/certifications/new">
            <Plus size={16} className="mr-2" />
            추가
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
          자격증 항목이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              <div className="flex flex-col gap-1">
                <form action={moveCertification.bind(null, item.id, 'up')}>
                  <button
                    type="submit"
                    disabled={idx === 0}
                    className="text-slate-500 hover:text-slate-300 disabled:opacity-30"
                  >
                    <ChevronUp size={16} />
                  </button>
                </form>
                <form action={moveCertification.bind(null, item.id, 'down')}>
                  <button
                    type="submit"
                    disabled={idx === items.length - 1}
                    className="text-slate-500 hover:text-slate-300 disabled:opacity-30"
                  >
                    <ChevronDown size={16} />
                  </button>
                </form>
              </div>

              <div className="flex-1">
                <div className="font-medium text-slate-200">
                  {item.name}
                  <span className="text-slate-400"> · {item.issuer}</span>
                </div>
                <div className="text-sm text-slate-500">
                  {item.issueDate}
                  {item.expiryDate && ` — ${item.expiryDate}`}
                </div>
                {!item.published && <span className="text-xs text-amber-400">비공개</span>}
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/certifications/${item.id}`}>
                    <Pencil size={14} />
                  </Link>
                </Button>
                <DeleteButton action={deleteCertification.bind(null, item.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
