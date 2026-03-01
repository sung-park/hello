import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ExternalLink, Github } from 'lucide-react'
import type { Project } from '@/generated/prisma'

interface Props {
  projects: Project[]
  lang?: string
}

export function ProjectsSection({ projects, lang }: Props) {
  if (projects.length === 0) return null

  const label = lang === 'en' ? 'Projects' : '프로젝트'

  return (
    <section
      id="projects"
      className="mb-24 scroll-mt-24 lg:scroll-mt-0"
      aria-label={label}
    >
      <h2 className="mb-8 text-xs font-semibold uppercase tracking-widest text-slate-200 lg:sr-only">
        {label}
      </h2>
      <ol className="space-y-4">
        {projects.map((project) => (
          <li key={project.id}>
            <div className="group relative rounded-xl p-6 transition-all hover:bg-slate-800/50">
              <div className="lg:flex lg:gap-6">
                {project.imageUrl && (
                  <div className="mb-4 shrink-0 lg:mb-0 lg:w-40">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="rounded border border-slate-700/50 object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium leading-snug text-slate-200">
                    {project.liveUrl || project.repoUrl ? (
                      <a
                        href={project.liveUrl ?? project.repoUrl ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-baseline gap-1 hover:text-[#64ffda]"
                      >
                        {project.title}
                        <ExternalLink
                          size={14}
                          className="translate-y-px opacity-0 transition-all group-hover/link:opacity-100"
                        />
                      </a>
                    ) : (
                      project.title
                    )}
                  </h3>
                  {project.description && (
                    <div className="prose prose-slate prose-invert mt-2 text-sm text-slate-400 [&_a]:text-[#64ffda]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {project.description}
                      </ReactMarkdown>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    {project.techStack && (
                      <ul className="flex flex-wrap gap-2">
                        {project.techStack.split(',').map((tech) => (
                          <li
                            key={tech.trim()}
                            className="rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-[#64ffda]"
                          >
                            {tech.trim()}
                          </li>
                        ))}
                      </ul>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
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
