'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  User,
  Briefcase,
  FolderOpen,
  Link2,
  FlaskConical,
  LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/about', label: '자기소개', icon: User },
  { href: '/admin/experience', label: '경력', icon: Briefcase },
  { href: '/admin/projects', label: '프로젝트', icon: FolderOpen },
  { href: '/admin/social', label: '소셜 링크', icon: Link2 },
  { href: '/admin/lab', label: '실험실', icon: FlaskConical },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-60 flex-col border-r border-slate-800 bg-slate-900">
      <div className="p-6">
        <Link href="/admin/dashboard">
          <h1 className="text-lg font-bold text-slate-100">어드민</h1>
        </Link>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-slate-800 text-slate-100'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-3">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-slate-200"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
