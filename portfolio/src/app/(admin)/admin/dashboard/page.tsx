import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Briefcase, FolderOpen, Link2, User } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const [experienceCount, projectCount, socialCount, about] = await Promise.all([
    db.experience.count(),
    db.project.count(),
    db.socialLink.count(),
    db.about.findUnique({ where: { id: 'singleton' } }),
  ])

  const stats = [
    { label: '자기소개', value: about?.name ? '설정됨' : '미설정', icon: User, href: '/admin/about' },
    { label: '경력', value: `${experienceCount}개`, icon: Briefcase, href: '/admin/experience' },
    { label: '프로젝트', value: `${projectCount}개`, icon: FolderOpen, href: '/admin/projects' },
    { label: '소셜 링크', value: `${socialCount}개`, icon: Link2, href: '/admin/social' },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">대시보드</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <a
            key={label}
            href={href}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-slate-700"
          >
            <Icon size={20} className="mb-3 text-slate-400" />
            <div className="text-2xl font-bold text-slate-100">{value}</div>
            <div className="mt-1 text-sm text-slate-400">{label}</div>
          </a>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-2 text-sm font-medium text-slate-300">빠른 접근</h2>
        <p className="text-sm text-slate-400">
          왼쪽 사이드바에서 각 섹션을 선택하여 포트폴리오 콘텐츠를 관리하세요.
          변경사항은 저장 즉시 공개 사이트에 반영됩니다.
        </p>
      </div>
    </div>
  )
}
