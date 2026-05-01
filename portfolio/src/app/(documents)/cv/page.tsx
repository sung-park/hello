import { db } from '@/lib/db'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Mail, Phone, MapPin, Globe, Github, Linkedin } from 'lucide-react'
import { PrintButton } from '@/components/documents/PrintButton'
import { DocLanguageToggle } from '@/components/documents/DocLanguageToggle'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface ProjectBlock {
  header: string | null
  body: string
}

function parseProjectBlocks(description: string): ProjectBlock[] {
  const trimmed = description.trim()
  if (!trimmed) return []
  if (!/^###\s/m.test(trimmed)) {
    return [{ header: null, body: trimmed }]
  }
  const parts = trimmed.split(/\n(?=###\s)/g)
  return parts.map((part) => {
    const match = part.match(/^###\s*(.+?)(?:\n|$)([\s\S]*)$/)
    if (match) {
      return { header: match[1].trim(), body: match[2].trim() }
    }
    return { header: null, body: part.trim() }
  })
}

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
    certifications,
    awards,
    skillCategories,
    socialLinks,
    patents,
    languages,
    publications,
  ] = await Promise.all([
    db.about.findUnique({ where: { id: 'singleton' } }),
    db.experience.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.certification.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.award.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    db.skillCategory.findMany({
      orderBy: { order: 'asc' },
      include: { skills: { orderBy: { order: 'asc' } } },
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
        {/* Compact header */}
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

        {/* Experience — project-centric */}
        {experiences.length > 0 && (
          <section className="doc-section mb-6">
            <h2 className="mb-3 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('주요 프로젝트 / 업무', 'Projects & Work')}
            </h2>
            <div className="space-y-7">
              {experiences.map((exp) => {
                const company = (isEn && exp.companyEn) || exp.company
                const description = (isEn && exp.descriptionEn) || exp.description
                const achievements = (isEn && exp.achievementsEn) || exp.achievements
                const blocks = parseProjectBlocks(description)
                const endLabel = exp.endDate ?? t('현재', 'Present')
                return (
                  <section key={exp.id}>
                    <header className="mb-3 flex items-baseline justify-between gap-3 border-b border-slate-300 pb-1.5">
                      <h3 className="text-base font-bold text-slate-900">{company}</h3>
                      <span className="shrink-0 text-xs text-slate-500">
                        {exp.startDate} — {endLabel}
                      </span>
                    </header>

                    <div className="space-y-5">
                      {blocks.map((b, i) => (
                        <div key={i} className="doc-experience">
                          {b.header && (
                            <h4 className="mb-1.5 text-sm font-semibold text-slate-800">
                              {b.header}
                            </h4>
                          )}
                          {b.body && (
                            <div className="prose prose-sm max-w-none text-sm text-slate-700 [&_li]:my-0.5 [&_p]:my-1 [&_strong]:text-slate-900 [&_ul]:my-1">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{b.body}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {achievements && (
                      <div className="mt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {t('핵심 성과', 'Key Achievements')}
                        </h4>
                        <div className="prose prose-sm max-w-none mt-1 text-sm text-slate-700 [&_li]:my-0.5 [&_p]:my-1 [&_ul]:my-1">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{achievements}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
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
