import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { About } from '@/generated/prisma'

interface Props {
  about: About | null
  lang?: string
}

export function AboutSection({ about, lang }: Props) {
  if (!about?.bio) return null

  const label = lang === 'en' ? 'About' : '소개'

  return (
    <section
      id="about"
      className="mb-24 scroll-mt-24 lg:scroll-mt-0"
      aria-label={label}
    >
      <h2 className="mb-8 text-xs font-semibold uppercase tracking-widest text-slate-200 lg:sr-only">
        {label}
      </h2>
      <div className="prose prose-slate prose-invert max-w-none text-slate-400 [&_a]:text-[#64ffda] [&_a]:no-underline [&_a:hover]:underline [&_strong]:text-slate-200">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{about.bio}</ReactMarkdown>
      </div>
    </section>
  )
}
