'use client'

import { useEffect, useRef, useState } from 'react'
import { Github, Linkedin, Mail, Twitter, ExternalLink } from 'lucide-react'
import type { SocialLink } from '@/generated/prisma'
import { MinecraftPig } from './MinecraftPig'

const SECTIONS = [
  { id: 'about', label: '소개' },
  { id: 'experience', label: '경력' },
  { id: 'projects', label: '프로젝트' },
  { id: 'playground', label: '플레이그라운드' },
] as const

const ICON_MAP: Record<string, React.ReactNode> = {
  github: <Github size={20} />,
  linkedin: <Linkedin size={20} />,
  mail: <Mail size={20} />,
  twitter: <Twitter size={20} />,
}

interface NavProps {
  name: string
  title: string
  tagline: string
  socialLinks: SocialLink[]
  pigEnabled?: boolean
  lang?: string
}

export function Nav({ name, title, tagline, socialLinks, pigEnabled }: NavProps) {
  const [activeSection, setActiveSection] = useState<string>('about')
  const clickLockRef = useRef(false)
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onScroll() {
      if (clickLockRef.current) return
      const threshold = window.innerHeight * 0.25
      let current: string = SECTIONS[0].id
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= threshold) current = id
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleNavClick(id: string) {
    setActiveSection(id)
    clickLockRef.current = true
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
    lockTimerRef.current = setTimeout(() => {
      clickLockRef.current = false
    }, 1000)
  }

  return (
    <header className="pt-16 lg:pt-0 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[300px] lg:flex-shrink-0 lg:flex-col lg:justify-between lg:py-24">
      <div>
        <div className="mb-8">
          {name && (
            <h1 className="text-4xl font-bold tracking-tight text-slate-200">
              {name}
            </h1>
          )}
          {title && (
            <h2 className="mt-3 text-lg font-medium text-slate-200">{title}</h2>
          )}
          {tagline && (
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {tagline}
            </p>
          )}
        </div>

        <nav className="hidden lg:block">
          <ul className="space-y-1">
            {SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => handleNavClick(id)}
                  className={`group flex items-center gap-4 py-2 text-sm font-medium transition-colors ${
                    activeSection === id
                      ? 'text-[#64ffda]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`block h-px transition-all ${
                      activeSection === id
                        ? 'w-16 bg-[#64ffda]'
                        : 'w-8 bg-slate-600 group-hover:w-16 group-hover:bg-slate-300'
                    }`}
                  />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div>
        {pigEnabled && (
          <div className="hidden lg:block mb-4">
            <MinecraftPig />
          </div>
        )}
        {socialLinks.length > 0 && (
          <div className="mt-8 flex items-center gap-4 lg:mt-0">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
                className="text-slate-400 transition-colors hover:text-[#64ffda]"
              >
                {ICON_MAP[link.icon] ?? <ExternalLink size={20} />}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
