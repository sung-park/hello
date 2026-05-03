'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface Props {
  page: 'resume' | 'cv' | 'combined'
  lang: string
}

export function PdfDownloadButton({ page, lang }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const isEn = lang === 'en'

  async function handleDownload() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/pdf?page=${page}&lang=${lang}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = ''  // filename comes from Content-Disposition header
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setError(true)
      setTimeout(() => setError(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-slate-700 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {error
        ? (isEn ? 'Error — retry?' : '오류 — 재시도?')
        : loading
          ? (isEn ? 'Generating…' : '생성 중…')
          : (isEn ? 'Save PDF' : 'PDF 저장')}
    </button>
  )
}
