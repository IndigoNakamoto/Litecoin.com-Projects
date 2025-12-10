import { Project } from '@/types/project'
import { PROJECT_DISPLAY_ORDER } from './projectConstants'

/**
 * Sorts projects according to the desired display order
 * Projects in PROJECT_DISPLAY_ORDER appear first, in that order
 * Other projects are sorted alphabetically by name
 */
export function sortProjectsByDisplayOrder(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const indexA = PROJECT_DISPLAY_ORDER.indexOf(a.name as typeof PROJECT_DISPLAY_ORDER[number])
    const indexB = PROJECT_DISPLAY_ORDER.indexOf(b.name as typeof PROJECT_DISPLAY_ORDER[number])

    // Both in desired order - sort by order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }
    
    // Only A in desired order - A comes first
    if (indexA !== -1) return -1
    
    // Only B in desired order - B comes first
    if (indexB !== -1) return 1
    
    // Neither in desired order - sort alphabetically
    return a.name.localeCompare(b.name)
  })
}

