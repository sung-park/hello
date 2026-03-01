import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { GoogleSignInButton } from '@/components/admin/GoogleSignInButton'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/admin/dashboard')

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="mb-2 text-xl font-bold text-slate-100">어드민 로그인</h1>
        <p className="mb-8 text-sm text-slate-400">
          포트폴리오 관리자 전용 페이지입니다.
        </p>
        <GoogleSignInButton />
      </div>
    </div>
  )
}
