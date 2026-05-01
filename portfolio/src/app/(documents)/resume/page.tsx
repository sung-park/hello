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
    title: isEn ? `${name} — Resume` : `${name} — 이력서`,
  }
}

interface PageProps {
  searchParams: Promise<{ lang?: string }>
}

export default async function ResumePage({ searchParams }: PageProps) {
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
    featuredProjects,
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
      where: { published: true, featured: true },
      orderBy: { order: 'asc' },
      take: 3,
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

  // i18n field selection
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
              <h1 className="text-3xl font-bold leading-tight text-slate-900">{name}</h1>
              {subName && <div className="mt-0.5 text-sm text-slate-500">{subName}</div>}
              <div className="mt-2 text-base font-medium text-slate-700">{title}</div>
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
          <section className="doc-section mb-5">
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
          <section className="doc-section mb-5">
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
                      {cat.skills
                        .map((s) => (isEn && s.nameEn) || s.name)
                        .join(' · ')}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </section>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <section className="doc-section mb-5">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('경력', 'Experience')}
            </h2>
            <ol className="space-y-4">
              {experiences.map((exp) => {
                const company = (isEn && exp.companyEn) || exp.company
                const role = (isEn && exp.roleEn) || exp.role
                const expSummary = (isEn && exp.summaryEn) || exp.summary
                const expAchievements = (isEn && exp.achievementsEn) || exp.achievements
                const expLocation = (isEn && exp.locationEn) || exp.location
                const endLabel = exp.endDate ?? t('현재', 'Present')
                return (
                  <li key={exp.id} className="doc-entry">
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <span className="font-semibold text-slate-900">{role}</span>
                        <span className="text-slate-700"> · {company}</span>
                        {expLocation && (
                          <span className="text-slate-500"> · {expLocation}</span>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">
                        {exp.startDate} — {endLabel}
                      </span>
                    </div>
                    {expSummary && (
                      <p className="mt-1 text-sm italic text-slate-700">{expSummary}</p>
                    )}
                    {expAchievements && (
                      <div className="prose prose-sm max-w-none mt-1.5 text-sm text-slate-700 [&_li]:my-0.5 [&_p]:my-1 [&_ul]:my-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {expAchievements}
                        </ReactMarkdown>
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
          <section className="doc-section mb-5">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('특허', 'Patents')}
              <span className="ml-2 font-normal normal-case text-slate-400">
                ({patents.reduce((acc, p) => acc + (p.count || 1), 0)}
                {t('건', '')})
              </span>
            </h2>
            <ul className="space-y-1 text-sm">
              {patents.map((p) => {
                const ptitle = (isEn && p.titleEn) || p.title
                const psummary = (isEn && p.summaryEn) || p.summary
                const statusLabel =
                  p.status === 'mixed'
                    ? t('출원/등록', 'Filed/Granted')
                    : p.status === 'filed'
                      ? t('출원', 'Filed')
                      : t('등록', 'Granted')
                return (
                  <li key={p.id} className="doc-entry">
                    <span className="font-semibold text-slate-800">{ptitle}:</span>{' '}
                    {psummary && <span className="text-slate-700">{psummary} </span>}
                    <span className="text-slate-600">
                      ({p.count}
                      {t('건', '')} {statusLabel}
                      {p.country && ` · ${p.country}`}
                      {p.patentNumber && ` · ${p.patentNumber}`}
                      {(p.grantDate || p.filingDate) && ` · ${p.grantDate || p.filingDate}`}
                      )
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Selected Projects */}
        {featuredProjects.length > 0 && (
          <section className="doc-section mb-5">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('대표 프로젝트', 'Selected Projects')}
            </h2>
            <ul className="space-y-1.5 text-sm">
              {featuredProjects.map((p) => {
                const ptitle = (isEn && p.titleEn) || p.title
                const pdesc = (isEn && p.descriptionEn) || p.description
                const firstLine = pdesc
                  .replace(/^>\s*/gm, '')
                  .split(/\n/)
                  .find((l) => l.trim() !== '') ?? ''
                return (
                  <li key={p.id} className="doc-entry">
                    <span className="font-semibold text-slate-800">{ptitle}</span>
                    {firstLine && <span className="text-slate-600"> — {firstLine}</span>}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Publications */}
        {publications.length > 0 && (
          <section className="doc-section mb-5">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('발표 및 출판', 'Publications & Talks')}
            </h2>
            <ul className="space-y-1.5 text-sm">
              {publications.slice(0, 5).map((p) => {
                const ptitle = (isEn && p.titleEn) || p.title
                const venue = (isEn && p.venueEn) || p.venue
                return (
                  <li key={p.id} className="doc-entry flex items-baseline justify-between gap-3">
                    <div>
                      <span className="font-semibold text-slate-800">{ptitle}</span>
                      {venue && <span className="text-slate-600"> · {venue}</span>}
                    </div>
                    <span className="shrink-0 text-xs text-slate-500">{p.date}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="doc-section mb-5">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('학력', 'Education')}
            </h2>
            <ul className="space-y-1.5 text-sm">
              {education.map((e) => {
                const school = (isEn && e.schoolEn) || e.school
                const degree = (isEn && e.degreeEn) || e.degree
                const field = (isEn && e.fieldEn) || e.field
                return (
                  <li key={e.id} className="doc-entry flex items-baseline justify-between gap-3">
                    <div>
                      <span className="font-semibold text-slate-800">{school}</span>
                      <span className="text-slate-600">
                        {' '}
                        · {degree} · {field}
                      </span>
                      {e.gpa && <span className="text-slate-500"> · GPA {e.gpa}</span>}
                    </div>
                    <span className="shrink-0 text-xs text-slate-500">
                      {e.startDate} — {e.endDate ?? t('재학중', 'Present')}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section className="doc-section mb-5">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('어학', 'Languages')}
            </h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {languages.map((l) => {
                const lname = (isEn && l.nameEn) || l.name
                const detail = [l.proficiency, l.testName, l.score].filter(Boolean).join(' · ')
                return (
                  <li key={l.id} className="doc-entry">
                    <span className="font-semibold text-slate-800">{lname}</span>
                    {detail && <span className="text-slate-600"> · {detail}</span>}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Certifications + Awards */}
        {(certifications.length > 0 || awards.length > 0) && (
          <section className="doc-section mb-5">
            <h2 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {certifications.length > 0 && awards.length > 0
                ? t('자격증 및 수상', 'Certifications & Awards')
                : certifications.length > 0
                  ? t('자격증', 'Certifications')
                  : t('수상', 'Awards')}
            </h2>
            <ul className="space-y-1 text-sm">
              {certifications.map((c) => {
                const cname = (isEn && c.nameEn) || c.name
                const issuer = (isEn && c.issuerEn) || c.issuer
                return (
                  <li key={c.id} className="doc-entry flex items-baseline justify-between gap-3">
                    <div>
                      <span className="font-semibold text-slate-800">{cname}</span>
                      <span className="text-slate-600"> · {issuer}</span>
                    </div>
                    <span className="shrink-0 text-xs text-slate-500">{c.issueDate}</span>
                  </li>
                )
              })}
              {awards.map((a) => {
                const aTitle = (isEn && a.titleEn) || a.title
                const issuer = (isEn && a.issuerEn) || a.issuer
                return (
                  <li key={a.id} className="doc-entry flex items-baseline justify-between gap-3">
                    <div>
                      <span className="font-semibold text-slate-800">{aTitle}</span>
                      <span className="text-slate-600"> · {issuer}</span>
                    </div>
                    <span className="shrink-0 text-xs text-slate-500">{a.date}</span>
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
