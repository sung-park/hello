'use client'

import { Printer } from 'lucide-react'

interface Props {
  lang: string
}

export function PrintButton({ lang }: Props) {
  const isEn = lang === 'en'
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-slate-700"
    >
      <Printer size={16} />
      {isEn ? 'Save as PDF' : 'PDF로 저장'}
    </button>
  )
}
