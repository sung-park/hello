import { db } from '@/lib/db'
import { Nav } from '@/components/public/Nav'
import { AboutSection } from '@/components/public/AboutSection'
import { ExperienceSection } from '@/components/public/ExperienceSection'
import { ProjectsSection } from '@/components/public/ProjectsSection'
import { PlaygroundSection } from '@/components/public/PlaygroundSection'
import { SocialFooter } from '@/components/public/SocialFooter'
import { getPigEnabled } from '@/lib/actions/lab'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const about = await db.about.findUnique({ where: { id: 'singleton' } })
  return {
    title: about?.name ? `${about.name} — Portfolio` : 'Portfolio',
    description: about?.tagline ?? 'Personal portfolio',
  }
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const { lang = 'ko' } = await searchParams
  const isEn = lang === 'en'

  const [about, experiences, projects, playgrounds, socialLinks, pigEnabled] = await Promise.all([
    db.about.findUnique({ where: { id: 'singleton' } }),
    db.experience.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    }),
    db.project.findMany({
      where: { published: true },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    }),
    db.playground.findMany({
      where: { published: true },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    }),
    db.socialLink.findMany({ orderBy: { order: 'asc' } }),
    getPigEnabled(),
  ])

  const aboutDisplay = about && isEn ? {
    ...about,
    name: about.nameEn || about.name,
    title: about.titleEn || about.title,
    tagline: about.taglineEn || about.tagline,
    bio: about.bioEn || about.bio,
  } : about

  const experiencesDisplay = isEn
    ? experiences.map((e) => ({
        ...e,
        role: e.roleEn || e.role,
        company: e.companyEn || e.company,
        description: e.descriptionEn || e.description,
      }))
    : experiences

  const projectsDisplay = isEn
    ? projects.map((p) => ({
        ...p,
        title: p.titleEn || p.title,
        description: p.descriptionEn || p.description,
      }))
    : projects

  const playgroundsDisplay = isEn
    ? playgrounds.map((p) => ({
        ...p,
        title: p.titleEn || p.title,
        description: p.descriptionEn || p.description,
      }))
    : playgrounds

  return (
    <div className="mx-auto min-h-screen max-w-screen-xl px-6 lg:px-12">
      <div className="lg:flex lg:gap-16">
        <Nav
          name={aboutDisplay?.name ?? ''}
          title={aboutDisplay?.title ?? ''}
          tagline={aboutDisplay?.tagline ?? ''}
          socialLinks={socialLinks}
          pigEnabled={pigEnabled}
          lang={lang}
        />
        <main className="flex-1 pt-24 pb-24 lg:pt-24">
          <AboutSection about={aboutDisplay} lang={lang} />
          <ExperienceSection experiences={experiencesDisplay} lang={lang} />
          <ProjectsSection projects={projectsDisplay} lang={lang} />
          <PlaygroundSection items={playgroundsDisplay} lang={lang} />
          <SocialFooter />
        </main>
      </div>
    </div>
  )
}
