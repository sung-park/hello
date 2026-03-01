import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { About } from '@/generated/prisma'

interface Props {
  about: About | null
}

export function AboutSection({ about }: Props) {
  if (!about?.bio) return null

  return (
    <section
      id="about"
      className="mb-24 scroll-mt-24 lg:scroll-mt-0"
      aria-label="소개"
    >
      <h2 className="mb-8 text-xs font-semibold uppercase tracking-widest text-slate-200 lg:sr-only">
        소개
      </h2>
      <div className="prose prose-slate prose-invert max-w-none text-slate-400 [&_a]:text-[#64ffda] [&_a]:no-underline [&_a:hover]:underline [&_strong]:text-slate-200">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{about.bio}</ReactMarkdown>
      </div>
    </section>
  )
}
