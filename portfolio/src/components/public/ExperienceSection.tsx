import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Experience } from '@/generated/prisma'

interface Props {
  experiences: Experience[]
  lang?: string
}

export function ExperienceSection({ experiences, lang }: Props) {
  if (experiences.length === 0) return null

  const label = lang === 'en' ? 'Experience' : '경력'
  const present = lang === 'en' ? 'Present' : '현재'

  return (
    <section
      id="experience"
      className="mb-24 scroll-mt-24 lg:scroll-mt-0"
      aria-label={label}
    >
      <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-slate-200 lg:sr-only">
        {label}
      </h2>
      <ol className="group/list space-y-4">
        {experiences.map((exp) => (
          <li key={exp.id}>
            <div className="group relative rounded-xl p-6 transition-all hover:bg-slate-800/50">
              <div className="lg:flex lg:gap-8">
                <div className="mb-2 mt-0.5 shrink-0 text-xs font-medium uppercase tracking-widest text-slate-500 lg:w-32 lg:text-right">
                  <span>{exp.startDate}</span>
                  <span className="mx-1">—</span>
                  <span>{exp.endDate ?? present}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium leading-snug text-slate-200">
                    {exp.role}
                    <span className="text-slate-400"> · {exp.company}</span>
                  </h3>
                  {exp.description && (
                    <div className="prose prose-slate prose-invert mt-2 text-sm text-slate-400 [&_a]:text-[#64ffda]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {exp.description}
                      </ReactMarkdown>
                    </div>
                  )}
                  {exp.techStack && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {exp.techStack.split(',').map((tech) => (
                        <li
                          key={tech.trim()}
                          className="rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-[#64ffda]"
                        >
                          {tech.trim()}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
