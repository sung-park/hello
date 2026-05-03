import { db } from '@/lib/db'
import { PdfDownloadButton } from '@/components/documents/PdfDownloadButton'
import { DocLanguageToggle } from '@/components/documents/DocLanguageToggle'
import { ResumeContent } from '@/components/documents/ResumeContent'
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

  return (
    <>
      <DocLanguageToggle lang={lang} />
      <PdfDownloadButton page="resume" lang={lang} />
      <ResumeContent
        about={about}
        experiences={experiences}
        education={education}
        certifications={certifications}
        awards={awards}
        skillCategories={skillCategories}
        featuredProjects={featuredProjects}
        socialLinks={socialLinks}
        patents={patents}
        languages={languages}
        publications={publications}
        isEn={isEn}
      />
    </>
  )
}
