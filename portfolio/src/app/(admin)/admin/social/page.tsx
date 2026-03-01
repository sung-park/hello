import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SocialLinkForm } from '@/components/admin/SocialLinkForm'
import {
  createSocialLink,
  deleteSocialLink,
  updateSocialLink,
} from '@/lib/actions/social'

export default async function SocialAdminPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const links = await db.socialLink.findMany({ orderBy: { order: 'asc' } })

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">소셜 링크</h1>

      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-sm font-medium text-slate-300">새 링크 추가</h2>
        <SocialLinkForm action={createSocialLink} />
      </div>

      {links.length > 0 && (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              <SocialLinkForm
                link={link}
                action={updateSocialLink.bind(null, link.id)}
              />
              <div className="mt-3 border-t border-slate-800 pt-3">
                <form action={deleteSocialLink.bind(null, link.id)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="submit"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} className="mr-1" />
                    삭제
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
