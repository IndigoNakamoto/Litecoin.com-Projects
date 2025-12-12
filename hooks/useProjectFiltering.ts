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

