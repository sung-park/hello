import { db } from '@/lib/db'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Mail, Phone, MapPin, Globe, Github, Linkedin } from 'lucide-react'
import { PrintButton } from '@/components/documents/PrintButton'
import { DocLanguageToggle } from '@/components/documents/DocLanguageToggle'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}): Promise<Metadata> {
  const { lang = 'ko' } = await searchParams
  const isEn = lang === 'en'
  const about = await db.about.findUnique({ where: { id: 'singleton' } })
  const name = isEn ? about?.nameEn || about?.name : about?.name
  return {
    title: isEn ? `${name} — CV` : `${name} — 경력기술서`,
  }
}

interface PageProps {
  searchParams: Promise<{ lang?: string }>
}

export default async function CvPage({ searchParams }: PageProps) {
  const { lang = 'ko' } = await searchParams
  const isEn = lang === 'en'
  const t = (ko: string, en: string) => (isEn ? en : ko)

  const [
    about,
    experiences,
    education,
    certifications,
    awards,
    skillCategories,
    projects,
    socialLinks,
    patents,
    languages,
    publications,
  ] = await Promise.all([
    db.about.findUnique({ where: { id: 'singleton' } }),
    db.experience.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.education.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.certification.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.award.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.skillCategory.findMany({
      orderBy: { order: 'asc' },
      include: { skills: { orderBy: { order: 'asc' } } },
    }),
    db.project.findMany({
      where: { published: true },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    }),
    db.socialLink.findMany({ orderBy: { order: 'asc' } }),
    db.patent.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.language.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.publication.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
  ])

  if (!about) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center text-slate-500">
        About 정보를 먼저 입력해 주세요.
      </div>
    )
  }

  const name = (isEn && about.nameEn) || about.name
  const subName = isEn ? about.name : about.nameEn
  const title = (isEn && about.titleEn) || about.title
  const summary = (isEn && about.summaryEn) || about.summary
  const location = (isEn && about.locationEn) || about.location

  const githubLink = socialLinks.find((s) => s.platform.toLowerCase() === 'github')
  const linkedinLink = socialLinks.find((s) => s.platform.toLowerCase() === 'linkedin')
  const websiteLink = socialLinks.find((s) =>
    ['website', 'site', 'blog', 'homepage'].includes(s.platform.toLowerCase()),
  )

  return (
    <>
      <DocLanguageToggle lang={lang} />
      <PrintButton lang={lang} />

      <article className="doc-paper mx-auto max-w-[210mm] bg-white p-12 shadow-sm print:p-0 print:shadow-none">
        {/* Header */}
        <header className="mb-6 doc-section">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold leading-tight text-slate-900">{name}</h1>
              {subName && <div className="mt-0.5 text-sm text-slate-500">{subName}</div>}
              <div className="mt-1.5 text-sm font-medium text-slate-700">{title}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            {about.email && (
              <span className="flex items-center gap-1.5">
                <Mail size={12} />
                <a href={`mailto:${about.email}`}>{about.email}</a>
              </span>
            )}
            {about.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={12} />
                {about.phone}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={12} />
                {location}
              </span>
            )}
            {githubLink && (
              <span className="flex items-center gap-1.5">
                <Github size={12} />
                <a href={githubLink.url}>
                  {githubLink.url.replace(/^https?:\/\/(www\.)?github\.com\//, 'github.com/')}
                </a>
              </span>
            )}
            {linkedinLink && (
              <span className="flex items-center gap-1.5">
                <Linkedin size={12} />
                <a href={linkedinLink.url}>
                  {linkedinLink.url.replace(
                    /^https?:\/\/(www\.)?linkedin\.com\/in\//,
                    'linkedin.com/in/',
                  )}
                </a>
              </span>
            )}
            {websiteLink && (
              <span className="flex items-center gap-1.5">
                <Globe size={12} />
                <a href={websiteLink.url}>
                  {websiteLink.url.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </span>
            )}
          </div>
        </header>

        {/* Summary */}
        {summary && (
          <section className="doc-section mb-6">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('자기소개', 'Summary')}
            </h2>
            <div className="prose prose-sm max-w-none text-sm leading-relaxed text-slate-700 [&_p]:my-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* Skills */}
        {skillCategories.length > 0 && (
          <section className="doc-section mb-6">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('핵심 역량', 'Core Skills')}
            </h2>
            <dl className="space-y-1.5 text-sm">
              {skillCategories.map((cat) => {
                if (cat.skills.length === 0) return null
                const catName = (isEn && cat.nameEn) || cat.name
                return (
                  <div key={cat.id} className="flex gap-3">
                    <dt className="w-32 shrink-0 font-semibold text-slate-700">{catName}</dt>
                    <dd className="flex-1 text-slate-600">
                      {cat.skills.map((s) => (isEn && s.nameEn) || s.name).join(' · ')}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </section>
        )}

        {/* Experience — full detail */}
        {experiences.length > 0 && (
          <section className="doc-section mb-6">
            <h2 className="mb-3 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('경력', 'Experience')}
            </h2>
            <ol className="space-y-6">
              {experiences.map((exp) => {
                const company = (isEn && exp.companyEn) || exp.company
                const role = (isEn && exp.roleEn) || exp.role
                const expSummary = (isEn && exp.summaryEn) || exp.summary
                const expDescription = (isEn && exp.descriptionEn) || exp.description
                const expAchievements = (isEn && exp.achievementsEn) || exp.achievements
                const expLocation = (isEn && exp.locationEn) || exp.location
                const endLabel = exp.endDate ?? t('현재', 'Present')
                const techList = exp.techStack
                  ? exp.techStack.split(',').map((s) => s.trim()).filter(Boolean)
                  : []
                return (
                  <li key={exp.id} className="doc-experience">
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {role}
                          <span className="text-slate-700"> · {company}</span>
                        </h3>
                        {expLocation && (
                          <div className="text-xs text-slate-500">{expLocation}</div>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">
                        {exp.startDate} — {endLabel}
                      </span>
                    </div>
                    {expSummary && (
                      <p className="mt-1 text-sm italic text-slate-700">{expSummary}</p>
                    )}
                    {expDescription && (
                      <div className="prose prose-sm max-w-none mt-2 text-sm text-slate-700 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_li]:my-0.5 [&_p]:my-1 [&_strong]:text-slate-900 [&_ul]:my-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {expDescription}
                        </ReactMarkdown>
                      </div>
                    )}
                    {expAchievements && (
                      <div className="mt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {t('핵심 성과', 'Key Achievements')}
                        </h4>
                        <div className="prose prose-sm max-w-none mt-1 text-sm text-slate-700 [&_li]:my-0.5 [&_p]:my-1 [&_ul]:my-1">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {expAchievements}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {techList.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {techList.map((tech) => (
                          <span key={tech} className="doc-badge">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
        )}

        {/* Patents */}
        {patents.length > 0 && (
          <section className="doc-section mb-6">
            <h2 className="mb-3 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('특허', 'Patents')}
              <span className="ml-2 font-normal normal-case text-slate-400">
                ({patents.reduce((acc, p) => acc + (p.count || 1), 0)}
                {t('건', '')})
              </span>
            </h2>
            <ol className="space-y-2">
              {patents.map((p) => {
                const ptitle = (isEn && p.titleEn) || p.title
                const inventors = (isEn && p.inventorsEn) || p.inventors
                const psummary = (isEn && p.summaryEn) || p.summary
                const statusLabel =
                  p.status === 'mixed'
                    ? t('출원/등록', 'Filed/Granted')
                    : p.status === 'filed'
                      ? t('출원', 'Filed')
                      : t('등록', 'Granted')
                const isGroup = p.count > 1
                return (
                  <li key={p.id} className="doc-entry">
                    {isGroup ? (
                      <>
                        <span className="font-semibold text-slate-800">{ptitle}:</span>{' '}
                        {psummary && <span className="text-slate-700">{psummary} </span>}
                        <span className="text-slate-600">
                          ({p.count}
                          {t('건', '')} {statusLabel})
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-between gap-3">
                          <div>
                            <span className="font-semibold text-slate-800">
                              {p.url ? <a href={p.url}>{ptitle}</a> : ptitle}
                            </span>
                            {p.country && <span className="text-slate-500"> · {p.country}</span>}
                            {p.patentNumber && (
                              <span className="text-slate-500"> · {p.patentNumber}</span>
                            )}
                            <span className="text-slate-500"> · {statusLabel}</span>
                          </div>
                          <span className="shrink-0 text-xs text-slate-500">
                            {p.grantDate || p.filingDate}
                          </span>
                        </div>
                        {inventors && (
                          <div className="mt-0.5 text-xs text-slate-500">
                            {t('공동 발명자', 'Inventors')}: {inventors}
                          </div>
                        )}
                        {psummary && (
                          <div className="prose prose-sm max-w-none mt-1 text-sm text-slate-700 [&_p]:my-1">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{psummary}</ReactMarkdown>
                          </div>
                        )}
                      </>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
        )}

        {/* Projects — full detail */}
        {projects.length > 0 && (
          <section className="doc-section mb-6">
            <h2 className="mb-3 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('프로젝트', 'Projects')}
            </h2>
            <ol className="space-y-4">
              {projects.map((p) => {
                const ptitle = (isEn && p.titleEn) || p.title
                const pdesc = (isEn && p.descriptionEn) || p.description
                const techList = p.techStack
                  ? p.techStack.split(',').map((s) => s.trim()).filter(Boolean)
                  : []
                return (
                  <li key={p.id} className="doc-project">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{ptitle}</h3>
                      <div className="flex shrink-0 gap-3 text-xs text-slate-500">
                        {p.repoUrl && <a href={p.repoUrl}>repo</a>}
                        {p.liveUrl && <a href={p.liveUrl}>live</a>}
                      </div>
                    </div>
                    {pdesc && (
                      <div className="prose prose-sm max-w-none mt-1.5 text-sm text-slate-700 [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_li]:my-0.5 [&_p]:my-1 [&_ul]:my-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{pdesc}</ReactMarkdown>
                      </div>
                    )}
                    {techList.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {techList.map((tech) => (
                          <span key={tech} className="doc-badge">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
        )}

        {/* Publications */}
        {publications.length > 0 && (
          <section className="doc-section mb-6">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('발표 및 출판', 'Publications & Talks')}
            </h2>
            <ul className="space-y-2 text-sm">
              {publications.map((p) => {
                const ptitle = (isEn && p.titleEn) || p.title
                const venue = (isEn && p.venueEn) || p.venue
                const desc = (isEn && p.descriptionEn) || p.description
                return (
                  <li key={p.id} className="doc-entry">
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <span className="text-xs uppercase tracking-wide text-slate-400 mr-2">
                          [{p.type}]
                        </span>
                        <span className="font-semibold text-slate-800">
                          {p.url ? <a href={p.url}>{ptitle}</a> : ptitle}
                        </span>
                        {venue && <span className="text-slate-600"> · {venue}</span>}
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">{p.date}</span>
                    </div>
                    {desc && (
                      <div className="prose prose-sm max-w-none mt-1 text-sm text-slate-700 [&_p]:my-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{desc}</ReactMarkdown>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="doc-section mb-6">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('학력', 'Education')}
            </h2>
            <ul className="space-y-2 text-sm">
              {education.map((e) => {
                const school = (isEn && e.schoolEn) || e.school
                const degree = (isEn && e.degreeEn) || e.degree
                const field = (isEn && e.fieldEn) || e.field
                const desc = (isEn && e.descriptionEn) || e.description
                return (
                  <li key={e.id} className="doc-entry">
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <span className="font-semibold text-slate-800">{school}</span>
                        <span className="text-slate-600"> · {degree} · {field}</span>
                        {e.gpa && <span className="text-slate-500"> · GPA {e.gpa}</span>}
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">
                        {e.startDate} — {e.endDate ?? t('재학중', 'Present')}
                      </span>
                    </div>
                    {desc && (
                      <div className="prose prose-sm max-w-none mt-1 text-sm text-slate-700 [&_p]:my-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{desc}</ReactMarkdown>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section className="doc-section mb-6">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('어학', 'Languages')}
            </h2>
            <ul className="space-y-1 text-sm">
              {languages.map((l) => {
                const lname = (isEn && l.nameEn) || l.name
                return (
                  <li key={l.id} className="doc-entry flex items-baseline justify-between gap-3">
                    <div>
                      <span className="font-semibold text-slate-800">{lname}</span>
                      <span className="text-slate-600"> · {l.proficiency}</span>
                    </div>
                    {(l.testName || l.score) && (
                      <span className="shrink-0 text-xs text-slate-500">
                        {l.testName} {l.score && ` · ${l.score}`}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section className="doc-section mb-6">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('자격증', 'Certifications')}
            </h2>
            <ul className="space-y-1.5 text-sm">
              {certifications.map((c) => {
                const cname = (isEn && c.nameEn) || c.name
                const issuer = (isEn && c.issuerEn) || c.issuer
                return (
                  <li key={c.id} className="doc-entry flex items-baseline justify-between gap-3">
                    <div>
                      <span className="font-semibold text-slate-800">{cname}</span>
                      <span className="text-slate-600"> · {issuer}</span>
                      {c.credentialId && (
                        <span className="text-slate-500"> · #{c.credentialId}</span>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-slate-500">
                      {c.issueDate}
                      {c.expiryDate && ` — ${c.expiryDate}`}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <section className="doc-section mb-6">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('수상', 'Awards')}
            </h2>
            <ul className="space-y-2 text-sm">
              {awards.map((a) => {
                const aTitle = (isEn && a.titleEn) || a.title
                const issuer = (isEn && a.issuerEn) || a.issuer
                const desc = (isEn && a.descriptionEn) || a.description
                return (
                  <li key={a.id} className="doc-entry">
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <span className="font-semibold text-slate-800">{aTitle}</span>
                        <span className="text-slate-600"> · {issuer}</span>
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">{a.date}</span>
                    </div>
                    {desc && (
                      <div className="prose prose-sm max-w-none mt-1 text-sm text-slate-700 [&_p]:my-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{desc}</ReactMarkdown>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </article>
    </>
  )
}
