import '../print.css'
import type { ReactNode } from 'react'

export default function DocumentsLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-100 py-8 print:py-0 print:min-h-0 print:bg-transparent">{children}</div>
}
