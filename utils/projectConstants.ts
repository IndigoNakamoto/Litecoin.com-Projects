/**
 * Constants related to project display and ordering
 */

/**
 * Desired display order for open-source projects
 * Projects in this list will appear first, in the specified order
 */
export const PROJECT_DISPLAY_ORDER = [
  'Litecoin Foundation',
  'Litecoin Core',
  'MWEB',
  'Ordinals Lite',
  'Litewallet',
  'Litecoin Development Kit',
  'Litecoin Mempool Explorer',
] as const

/**
 * Background colors for bounty project cards (alternating)
 */
export const BOUNTY_BG_COLORS: readonly string[] = ['bg-[#EEEEEE]', 'bg-[#c6d3d6]'] as const

/**
 * Litecoin Foundation project configuration
 * Used for the donation modal on the projects page
 */
export const LITECOIN_FOUNDATION_PROJECT = {
  id: 'litecoin-foundation',
  slug: 'litecoin-foundation',
  name: 'Litecoin Foundation',
  summary: '',
  coverImage: '/static/images/projects/Litecoin_Foundation_Project.png',
  telegram: '',
  reddit: '',
  facebook: '',
  status: 'Open',
  hidden: false,
  recurring: false,
  totalPaid: 0,
  serviceFeesCollected: 0,
  lastPublished: '',
  lastUpdated: '',
  createdOn: '',
} as const

