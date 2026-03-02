'use client'

import { useRouter } from 'next/navigation'

interface Props {
  lang: string
}

export function LanguageToggle({ lang }: Props) {
  const router = useRouter()

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-1">
      <button
        onClick={() => router.push('/?lang=ko')}
        className={`text-lg transition-opacity ${lang === 'ko' ? 'opacity-100' : 'opacity-35 hover:opacity-70'}`}
        aria-label="한국어"
      >
        🇰🇷
      </button>
      <button
        onClick={() => router.push('/?lang=en')}
        className={`text-lg transition-opacity ${lang === 'en' ? 'opacity-100' : 'opacity-35 hover:opacity-70'}`}
        aria-label="English"
      >
        🇺🇸
      </button>
    </div>
  )
}
