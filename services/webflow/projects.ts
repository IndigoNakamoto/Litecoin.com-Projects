import { kv } from '@/lib/kv'
import { createWebflowClient, listCollectionItems } from './client'
import type { WebflowProject } from './types'
import type { Project, ProjectSummary, Contributor } from '@/types/project'
import { getContributorsByIds } from './contributors'

const CACHE_TTL = 259200 // 3 days in seconds

// Cache for status ID to label mapping
let statusLabelMap: { [key: string]: string } | null = null
const STATUS_MAP_CACHE_KEY = 'webflow:projects:status-map'

interface CollectionSchemaField {
  id: string
  slug: string
  type: string
  displayName: string
  validations?: {
    options?: Array<{
      id: string
      name: string
    }>
  }
}

interface CollectionSchema {
  id: string
  displayName: string
  fields: CollectionSchemaField[]
}

/**
 * Get the collection schema from Webflow API
 */
async function getCollectionSchema(
  client: ReturnType<typeof createWebflowClient>,
  collectionId: string
): Promise<CollectionSchema> {
  try {
    const response = await client.get<CollectionSchema>(
      `/collections/${collectionId}`
    )
    return response.data
  } catch (error: any) {
    console.error(
      `Error fetching collection schema for ${collectionId}:`,
      error.response?.data || error.message
    )
    throw error
  }
}

/**
 * Create a mapping from status option IDs to their labels
 */
async function createStatusLabelMap(
  client: ReturnType<typeof createWebflowClient>,
  collectionId: string
): Promise<{ [key: string]: string }> {
  // Try to get from cache first
  try {
    const cached = await kv.get<{ [key: string]: string }>(STATUS_MAP_CACHE_KEY)
    if (cached) {
      statusLabelMap = cached
      return cached
    }
  } catch (error) {
    // Cache not available, continue
  }

  const schema = await getCollectionSchema(client, collectionId)
  const statusField = schema.fields.find((f) => f.slug === 'status')

  if (!statusField) {
    throw new Error('Status field not found in collection schema')
  }

  if (!statusField.validations || !statusField.validations.options) {
    throw new Error('Status field is not an Option field')
  }

  const map: { [key: string]: string } = {}
  statusField.validations.options.forEach((option) => {
    map[option.id] = option.name.trim()
  })

  statusLabelMap = map

  // Cache the mapping
  try {
    await kv.set(STATUS_MAP_CACHE_KEY, map, { ex: CACHE_TTL })
  } catch (error) {
    // Cache not available, continue
  }

  return map
}

/**
 * Get the label for a status ID
 */
async function getStatusLabel(
  client: ReturnType<typeof createWebflowClient>,
  collectionId: string,
  statusId: string
): Promise<string> {
  if (!statusLabelMap) {
    await createStatusLabelMap(client, collectionId)
  }

  return statusLabelMap?.[statusId] || statusId // Fallback to ID if not found
}

export async function getAllPublishedProjects(): Promise<Project[]> {
  const apiToken = process.env.WEBFLOW_API_TOKEN
  const collectionId = process.env.WEBFLOW_COLLECTION_ID_PROJECTS

  if (!apiToken || !collectionId) {
    throw new Error('Webflow API credentials not configured')
  }

  const client = createWebflowClient(apiToken)
  
  // Get status label mapping first (needed for both cached and fresh data)
  const statusMap = await createStatusLabelMap(client, collectionId)
  
  const cacheKey = 'webflow:projects:published'
  let cached: Project[] | null = null
  
  // Try to get from cache, but don't fail if KV is not configured
  try {
    cached = await kv.get<Project[]>(cacheKey)
    // If we have cached data, ensure status labels are mapped (in case cache has old IDs)
    if (cached) {
      // Check if any project has a status that looks like an ID (long alphanumeric string)
      // If so, re-map the statuses
      const needsRemapping = cached.some(p => p.status && p.status.length > 20 && !p.status.includes(' '))
      if (needsRemapping) {
        console.log('Remapping status IDs to labels in cached projects')
        cached = cached.map(p => ({
          ...p,
          status: statusMap[p.status] || p.status
        }))
      }
      return cached
    }
  } catch (error) {
    // KV not configured or unavailable, continue without cache
    console.warn('KV cache unavailable, fetching directly from Webflow')
  }
  
  const allProjects = await listCollectionItems<WebflowProject>(
    client,
    collectionId
  )

  // Filter to only published and non-hidden projects
  const publishedProjects = allProjects.filter(
    (project) => 
      !project.isDraft && 
      !project.isArchived &&
      !project.fieldData.hidden // Also filter out hidden projects at the source
  )

  // Transform to our Project type, mapping status IDs to labels
  const projects: Project[] = publishedProjects.map((project) => {
    const statusId = project.fieldData.status
    const statusLabel = statusMap[statusId] || statusId // Use label if available, fallback to ID
    
    return {
      id: project.id,
      name: project.fieldData.name,
      slug: project.fieldData.slug,
      summary: project.fieldData.summary,
      content: project.fieldData.content,
      coverImage: project.fieldData['cover-image']?.url,
      status: statusLabel, // Use the mapped label instead of the ID
      projectType: project.fieldData['project-type'],
      hidden: project.fieldData.hidden,
      recurring: project.fieldData.recurring,
      totalPaid: project.fieldData['total-paid'],
      serviceFeesCollected: project.fieldData['service-fees-collected'],
      website: project.fieldData['website-link'],
      github: project.fieldData['github-link'],
      twitter: project.fieldData['twitter-link'],
      discord: project.fieldData['discord-link'],
      telegram: project.fieldData['telegram-link'],
      reddit: project.fieldData['reddit-link'],
      facebook: project.fieldData['facebook-link'],
      lastPublished: project.lastPublished,
      lastUpdated: project.lastUpdated,
      createdOn: project.createdOn,
    }
  })

  // Cache the results (if KV is available)
  try {
    await kv.set(cacheKey, projects, { ex: CACHE_TTL })
  } catch (error) {
    // KV not configured or unavailable, continue without caching
    console.warn('KV cache unavailable, skipping cache write')
  }

  return projects
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  console.log(`[getProjectBySlug] Fetching project with slug: "${slug}"`)
  
  const apiToken = process.env.WEBFLOW_API_TOKEN
  const collectionId = process.env.WEBFLOW_COLLECTION_ID_PROJECTS

  if (!apiToken || !collectionId) {
    console.error('[getProjectBySlug] Webflow API credentials not configured')
    throw new Error('Webflow API credentials not configured')
  }

  const client = createWebflowClient(apiToken)
  
  // Get status label mapping
  const statusMap = await createStatusLabelMap(client, collectionId)
  
  // Try to get from cache first (but skip cache for debugging)
  const cacheKey = `webflow:project:${slug}`
  try {
    const cached = await kv.get<Project>(cacheKey)
    if (cached) {
      console.log(`[getProjectBySlug] Found cached project: ${cached.name}`)
      // For now, skip cache to ensure fresh data
      // TODO: Re-enable cache after debugging
      // return cached
    }
  } catch (error) {
    // KV not available, continue
    console.log(`[getProjectBySlug] Cache not available, fetching from Webflow`)
  }

  const project = await fetchProjectWithContributors(client, collectionId, slug, statusMap)
  
  if (project) {
    console.log(`[getProjectBySlug] Successfully fetched project: ${project.name}`)
    // Cache the result
    try {
      await kv.set(cacheKey, project, { ex: CACHE_TTL })
    } catch (error) {
      // KV not available, continue
    }
  } else {
    console.warn(`[getProjectBySlug] Project "${slug}" not found`)
  }

  return project
}

async function fetchProjectWithContributors(
  client: ReturnType<typeof createWebflowClient>,
  collectionId: string,
  slug: string,
  statusMap: { [key: string]: string }
): Promise<Project | null> {
  try {
    // Fetch all projects and find the one with matching slug
    console.log(`[fetchProjectWithContributors] Starting fetch for slug: "${slug}"`)
    const allProjects = await listCollectionItems<WebflowProject>(
      client,
      collectionId
    )

    console.log(`[fetchProjectWithContributors] Fetched ${allProjects.length} total projects`)

    // Debug: Log available slugs
    const availableSlugs = allProjects.map(p => ({
      slug: p.fieldData.slug,
      isDraft: p.isDraft,
      isArchived: p.isArchived,
      name: p.fieldData.name
    }))
    console.log(`[fetchProjectWithContributors] Looking for slug: "${slug}"`)
    console.log(`[fetchProjectWithContributors] Available projects (first 5):`, availableSlugs.slice(0, 5).map(p => `${p.slug} (draft: ${p.isDraft}, archived: ${p.isArchived})`).join(', '))
    
    // Check for exact match first
    const exactMatch = allProjects.find((p) => p.fieldData.slug === slug)
    console.log(`[fetchProjectWithContributors] Exact slug match found:`, exactMatch ? `Yes - ${exactMatch.fieldData.name} (draft: ${exactMatch.isDraft}, archived: ${exactMatch.isArchived})` : 'No')

    const webflowProject = allProjects.find((p) => p.fieldData.slug === slug && !p.isDraft && !p.isArchived)

    if (!webflowProject) {
      // Check if project exists but is draft/archived
      const draftOrArchived = allProjects.find((p) => p.fieldData.slug === slug)
      if (draftOrArchived) {
        console.warn(`[fetchProjectWithContributors] Project "${slug}" found but is draft: ${draftOrArchived.isDraft}, archived: ${draftOrArchived.isArchived}`)
      } else {
        console.warn(`[fetchProjectWithContributors] Project "${slug}" not found in ${allProjects.length} projects`)
        // List all slugs for debugging
        const allSlugs = allProjects.map(p => p.fieldData.slug).join(', ')
        console.warn(`[fetchProjectWithContributors] All available slugs: ${allSlugs}`)
      }
      return null
    }
    
    console.log(`[fetchProjectWithContributors] Found project: ${webflowProject.fieldData.name} (slug: ${webflowProject.fieldData.slug})`)

    const statusId = webflowProject.fieldData.status
    const statusLabel = statusMap[statusId] || statusId

    // Fetch contributors
    // Try both field name variations for compatibility
    const bitcoinContributorIds = 
      webflowProject.fieldData['bitcoin-contributors-2'] || 
      webflowProject.fieldData['bitcoin-contributors'] || 
      []
    const litecoinContributorIds = 
      webflowProject.fieldData['litecoin-contributors-2'] || 
      webflowProject.fieldData['litecoin-contributors'] || 
      []
    const advocateIds = 
      webflowProject.fieldData['advocates-2'] || 
      webflowProject.fieldData.advocates || 
      []
    
    console.log(`[fetchProjectWithContributors] Fetching contributors...`)
    let bitcoinContributors: Contributor[] = []
    let litecoinContributors: Contributor[] = []
    let advocates: Contributor[] = []
    
    try {
      [bitcoinContributors, litecoinContributors, advocates] = await Promise.all([
        getContributorsByIds(bitcoinContributorIds),
        getContributorsByIds(litecoinContributorIds),
        getContributorsByIds(advocateIds),
      ])
      console.log(`[fetchProjectWithContributors] Successfully fetched contributors`)
    } catch (contributorError: any) {
      console.warn(`[fetchProjectWithContributors] Error fetching contributors (continuing anyway):`, contributorError.message)
      // Continue without contributors rather than failing the whole request
    }

    const project: Project = {
      id: webflowProject.id,
      name: webflowProject.fieldData.name,
      slug: webflowProject.fieldData.slug,
      summary: webflowProject.fieldData.summary,
      content: webflowProject.fieldData.content,
      coverImage: webflowProject.fieldData['cover-image']?.url,
      status: statusLabel,
      projectType: webflowProject.fieldData['project-type'],
      hidden: webflowProject.fieldData.hidden,
      recurring: webflowProject.fieldData.recurring,
      totalPaid: webflowProject.fieldData['total-paid'],
      serviceFeesCollected: webflowProject.fieldData['service-fees-collected'],
      website: webflowProject.fieldData['website-link'],
      github: webflowProject.fieldData['github-link'],
      twitter: webflowProject.fieldData['twitter-link'],
      discord: webflowProject.fieldData['discord-link'],
      telegram: webflowProject.fieldData['telegram-link'],
      reddit: webflowProject.fieldData['reddit-link'],
      facebook: webflowProject.fieldData['facebook-link'],
      lastPublished: webflowProject.lastPublished,
      lastUpdated: webflowProject.lastUpdated,
      createdOn: webflowProject.createdOn,
      bitcoinContributors: bitcoinContributors.length > 0 ? bitcoinContributors : undefined,
      litecoinContributors: litecoinContributors.length > 0 ? litecoinContributors : undefined,
      advocates: advocates.length > 0 ? advocates : undefined,
    }

    console.log(`[fetchProjectWithContributors] Successfully created project object: ${project.name}`)
    return project
  } catch (error: any) {
    console.error(`[fetchProjectWithContributors] Error fetching project "${slug}":`, error)
    console.error(`[fetchProjectWithContributors] Error details:`, error.message, error.stack)
    throw error
  }
}

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  const projects = await getAllPublishedProjects()
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    summary: project.summary,
    coverImage: project.coverImage,
    status: project.status,
    projectType: project.projectType,
    totalPaid: project.totalPaid,
  }))
}

