import { useEffect, useState } from 'react'
import { Project } from '@/types/project'
import { determineProjectType, determineBountyStatus } from '@/utils/statusHelpers'
import { isProject, isOpenBounty, isPastProject, isHidden } from '@/utils/projectFilters'
import { sortProjectsByDisplayOrder } from '@/utils/projectSorting'

interface FilteredProjects {
  openSourceProjects: Project[]
  completedProjects: Project[]
  openBounties: Project[]
}

/**
 * Custom hook to filter and categorize projects
 * Handles visibility filtering, status transformation, and categorization
 */
export function useProjectFiltering(projects: Project[]): FilteredProjects {
  const [openSourceProjects, setOpenSourceProjects] = useState<Project[]>([])
  const [completedProjects, setCompletedProjects] = useState<Project[]>([])
  const [openBounties, setOpenBounties] = useState<Project[]>([])

  useEffect(() => {
    // Filter out hidden projects
    const visibleProjects = projects.filter((p) => !isHidden(p))
    
    // Debug logging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('=== PROJECT FILTERING DEBUG ===')
      console.log('Total projects from API:', projects.length)
      console.log('Visible projects (not hidden):', visibleProjects.length)
      
      const hiddenProjects = projects.filter(isHidden)
      if (hiddenProjects.length > 0) {
        console.log('Hidden projects:', hiddenProjects.map(p => p.name))
      }
    }
    
    // Transform projects with type and bountyStatus
    const transformedProjects = visibleProjects.map((project) => ({
      ...project,
      type: determineProjectType(project.status),
      bountyStatus: determineBountyStatus(project.status),
    }))

    // Filter by category
    const openProjects = transformedProjects.filter(isProject)
    const bounties = transformedProjects.filter(isOpenBounty)
    const completed = transformedProjects.filter(isPastProject)
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('=== FILTER RESULTS ===')
      console.log('Open projects (status="Open"):', openProjects.length)
      console.log('Bounties (status="Bounty Open"):', bounties.length)
      console.log('Completed projects:', completed.length)
      
      // Show projects that don't match any filter
      const unmatchedProjects = transformedProjects.filter(p => 
        !isProject(p) && !isOpenBounty(p) && !isPastProject(p)
      )
      if (unmatchedProjects.length > 0) {
        console.warn('⚠️ Projects that don\'t match any filter:', unmatchedProjects.length)
        unmatchedProjects.forEach(p => 
          console.log('  -', p.name, '| status:', JSON.stringify(p.status))
        )
      }
    }
    
    // Fallback: if no projects match filters, show all as open-source projects
    const allProjectsEmpty = openProjects.length === 0 && bounties.length === 0 && completed.length === 0
    const projectsToShow = allProjectsEmpty && visibleProjects.length > 0 
      ? transformedProjects 
      : openProjects

    if (allProjectsEmpty && visibleProjects.length > 0 && process.env.NODE_ENV === 'development') {
      console.warn('No projects matched filters. Showing all projects as open-source projects.')
    }

    // Sort and set state
    setOpenSourceProjects(sortProjectsByDisplayOrder(projectsToShow))
    setOpenBounties(bounties)
    setCompletedProjects(completed)
  }, [projects])

  return {
    openSourceProjects,
    completedProjects,
    openBounties,
  }
}

