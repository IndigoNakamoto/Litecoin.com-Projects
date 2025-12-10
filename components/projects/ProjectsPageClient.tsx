'use client'

import { useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useDonation } from '@/contexts/DonationContext'
import { Project } from '@/types/project'
import { useProjectFiltering } from '@/hooks/useProjectFiltering'
import { BOUNTY_BG_COLORS, LITECOIN_FOUNDATION_PROJECT } from '@/utils/projectConstants'
import VerticalSocialIcons from '@/components/ui/VerticalSocialIcons'
import SectionWhite from '@/components/ui/SectionWhite'
import SectionBlue from '@/components/ui/SectionBlue'
import SectionStats from '@/components/ui/SectionStats'
import SectionMatchingDonations from '@/components/ui/SectionMatchingDonations'
import HeroSection from './HeroSection'
import ProjectsList from './ProjectsList'
import DevelopmentPortalSection from './DevelopmentPortalSection'

type ProjectsPageClientProps = {
  projects: Project[]
}

export default function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const router = useRouter()
  const { dispatch } = useDonation()
  const { openSourceProjects, completedProjects, openBounties } = useProjectFiltering(projects)

  const projectsRef = useRef<HTMLDivElement>(null)
  const bountiesRef = useRef<HTMLDivElement>(null)

  const openPaymentModal = useCallback((project: Project = LITECOIN_FOUNDATION_PROJECT) => {
    dispatch({
      type: 'SET_PROJECT_DETAILS',
      payload: {
        slug: project.slug,
        title: project.name,
        image: project.coverImage || '',
      },
    })
    router.push(`/projects?modal=true`)
  }, [dispatch, router])

  const bgColors = useMemo(() => [...BOUNTY_BG_COLORS], [])

  return (
    <div className="w-full overflow-x-hidden">
      <VerticalSocialIcons />
      
      <HeroSection
        onDonateClick={() => openPaymentModal()}
        projectsRef={projectsRef}
        bountiesRef={bountiesRef}
      />

      <SectionWhite>
        <div className="py-2">
          <SectionStats />
        </div>
      </SectionWhite>

      <SectionBlue>
        <SectionMatchingDonations />
      </SectionBlue>

      <div ref={projectsRef}>
        <ProjectsList
          title="Open-Source Projects"
          projects={openSourceProjects}
          onProjectClick={openPaymentModal}
          emptyMessage="No open-source projects found."
          emptyDescription='Projects with status "Open" will appear here. Check the browser console for debugging information.'
        />
      </div>

      <div ref={bountiesRef}>
        <ProjectsList
          title="Completed Projects"
          projects={completedProjects}
          onProjectClick={openPaymentModal}
          emptyMessage="No completed projects found."
          emptyDescription='Projects with status "Completed", "Closed", "Bounty Completed", or "Bounty Closed" will appear here.'
        />
      </div>

      {openBounties.length > 0 && (
        <ProjectsList
          title="Open Bounties"
          projects={openBounties}
          onProjectClick={openPaymentModal}
          bgColors={bgColors}
        />
      )}

      <DevelopmentPortalSection />
    </div>
  )
}

