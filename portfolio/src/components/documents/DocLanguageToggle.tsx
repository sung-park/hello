'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  lang: string
}

export function DocLanguageToggle({ lang }: Props) {
  const pathname = usePathname()
  const isEn = lang === 'en'

  return (
    <div className="no-print fixed top-6 right-6 z-50 flex gap-1 rounded-full bg-white shadow ring-1 ring-slate-200">
      <Link
        href={`${pathname}?lang=ko`}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
          !isEn ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        KO
      </Link>
      <Link
        href={`${pathname}?lang=en`}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
          isEn ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        EN
      </Link>
    </div>
  )
}
