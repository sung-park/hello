import { db } from '@/lib/db'
import { Nav } from '@/components/public/Nav'
import { AboutSection } from '@/components/public/AboutSection'
import { ExperienceSection } from '@/components/public/ExperienceSection'
import { ProjectsSection } from '@/components/public/ProjectsSection'
import { PlaygroundSection } from '@/components/public/PlaygroundSection'
import { SocialFooter } from '@/components/public/SocialFooter'
import { getPigEnabled } from '@/lib/actions/lab'
import { PigWrapper } from '@/components/public/PigWrapper'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const about = await db.about.findUnique({ where: { id: 'singleton' } })
  return {
    title: about?.name ? `${about.name} — Portfolio` : 'Portfolio',
    description: about?.tagline ?? 'Personal portfolio',
  }
}

export default async function PortfolioPage() {
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


  return (
    <div className="mx-auto min-h-screen max-w-screen-xl px-6 lg:px-12">
      <div className="lg:flex lg:gap-16">
        <Nav
          name={about?.name ?? ''}
          title={about?.title ?? ''}
          tagline={about?.tagline ?? ''}
          socialLinks={socialLinks}
        />
        <main className="flex-1 pt-24 pb-24 lg:pt-24">
          <AboutSection about={about} />
          <ExperienceSection experiences={experiences} />
          <ProjectsSection projects={projects} />
          <PlaygroundSection items={playgrounds} />
          <SocialFooter />
        </main>
      </div>
      {pigEnabled && <PigWrapper />}
    </div>
  )
}
