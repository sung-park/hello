import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ExternalLink, Github } from 'lucide-react'
import type { Playground } from '@/generated/prisma'

interface Props {
  items: Playground[]
  lang?: string
}

export function PlaygroundSection({ items, lang }: Props) {
  if (items.length === 0) return null

  const label = lang === 'en' ? 'Playground' : '플레이그라운드'

  return (
    <section
      id="playground"
      className="mb-24 scroll-mt-24 lg:scroll-mt-0"
      aria-label={label}
    >
      <h2 className="mb-8 text-xs font-semibold uppercase tracking-widest text-slate-200 lg:sr-only">
        {label}
      </h2>
      <ol className="space-y-4">
        {items.map((item) => (
          <li key={item.id}>
            <div className="group relative rounded-xl p-6 transition-all hover:bg-slate-800/50">
              <div className="lg:flex lg:gap-6">
                {item.imageUrl && (
                  <div className="mb-4 shrink-0 lg:mb-0 lg:w-40">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="rounded border border-slate-700/50 object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium leading-snug text-slate-200">
                    {item.liveUrl || item.repoUrl ? (
                      <a
                        href={item.liveUrl ?? item.repoUrl ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-baseline gap-1 hover:text-[#64ffda]"
                      >
                        {item.title}
                        <ExternalLink
                          size={14}
                          className="translate-y-px opacity-0 transition-all group-hover/link:opacity-100"
                        />
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>
                  {item.description && (
                    <div className="prose prose-slate prose-invert mt-2 text-sm text-slate-400 [&_a]:text-[#64ffda]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item.description}
                      </ReactMarkdown>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    {item.techStack && (
                      <ul className="flex flex-wrap gap-2">
                        {item.techStack.split(',').map((tech) => (
                          <li
                            key={tech.trim()}
                            className="rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-[#64ffda]"
                          >
                            {tech.trim()}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.repoUrl && (
                      <a
                        href={item.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub 레포지토리"
                        className="text-slate-400 hover:text-[#64ffda]"
                      >
                        <Github size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
