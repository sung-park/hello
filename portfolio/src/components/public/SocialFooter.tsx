import { Github, Linkedin, Mail, Twitter, ExternalLink } from 'lucide-react'
import type { SocialLink } from '@/generated/prisma'

const ICON_MAP: Record<string, React.ReactNode> = {
  github: <Github size={20} />,
  linkedin: <Linkedin size={20} />,
  mail: <Mail size={20} />,
  twitter: <Twitter size={20} />,
}

interface Props {
  socialLinks: SocialLink[]
}

export function SocialFooter({ socialLinks }: Props) {
  return (
    <footer className="py-12 text-center">
      {socialLinks.length > 0 && (
        <div className="mb-6 flex justify-center gap-6">
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
      <p className="text-xs text-slate-600">
        Built with Next.js &amp; Tailwind CSS &middot;{' '}
        <a href="/admin/login" className="hover:text-slate-400 transition-colors">
          admin
        </a>
      </p>
    </footer>
  )
}
