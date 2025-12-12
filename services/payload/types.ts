/**
 * Payload CMS API response types
 */

export interface PayloadProject {
  id: string
  name: string
  slug: string
  summary: string
  content?: string
  coverImage?: string | {
    id: string
    url: string
    alt?: string
  }
  status: 'active' | 'completed' | 'paused' | 'archived'
  projectType?: 'open-source' | 'research' | 'education' | 'infrastructure'
  hidden: boolean
  recurring: boolean
  totalPaid: number
  serviceFeesCollected: number
  website?: string
  github?: string
  twitter?: string
  discord?: string
  telegram?: string
  reddit?: string
  facebook?: string
  bitcoinContributors?: string[] | PayloadContributor[]
  litecoinContributors?: string[] | PayloadContributor[]
  advocates?: string[] | PayloadContributor[]
  hashtags?: Array<{ tag: string }>
  createdAt: string
  updatedAt: string
}

export interface PayloadContributor {
  id: string
  name: string
  slug: string
  profilePicture?: string | {
    id: string
    url: string
    alt?: string
  }
  twitterLink?: string
  discordLink?: string
  githubLink?: string
  youtubeLink?: string
  linkedinLink?: string
  email?: string
  createdAt: string
  updatedAt: string
}

export interface PayloadFAQ {
  id: string
  question: string
  answer: string
  project: string | PayloadProject
  order?: number
  category?: string
  createdAt: string
  updatedAt: string
}

export interface PayloadPost {
  id: string
  xPostLink?: string
  youtubeLink?: string
  redditLink?: string
  projects?: string[] | PayloadProject[]
  createdAt: string
  updatedAt: string
}

export interface PayloadUpdate {
  id: string
  title: string
  summary?: string
  content?: string
  project: string | PayloadProject
  date: string
  authorTwitterHandle?: string
  tags?: Array<{ tag: string }>
  createdAt: string
  updatedAt: string
}

export interface PayloadResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page?: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage?: number | null
  nextPage?: number | null
}



