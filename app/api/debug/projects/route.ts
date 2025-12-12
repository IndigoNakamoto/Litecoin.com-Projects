import { NextResponse } from 'next/server'
import { listCollectionItems, createWebflowClient } from '@/services/webflow/client'
import type { WebflowProject } from '@/services/webflow/types'

export async function GET() {
  try {
    const apiToken = process.env.WEBFLOW_API_TOKEN
    const collectionId = process.env.WEBFLOW_COLLECTION_ID_PROJECTS

    if (!apiToken || !collectionId) {
      return NextResponse.json(
        {
          error: 'Webflow API credentials not configured',
          apiToken: apiToken ? 'Set' : 'Missing',
          collectionId: collectionId ? 'Set' : 'Missing',
        },
        { status: 500 }
      )
    }

    const client = createWebflowClient(apiToken)
    
    const allProjects = await listCollectionItems<WebflowProject>(client, collectionId)
    
    // Get all slugs and their status
    const projectsInfo = allProjects.map((p) => ({
      id: p.id,
      name: p.fieldData.name,
      slug: p.fieldData.slug,
      isDraft: p.isDraft,
      isArchived: p.isArchived,
      hidden: p.fieldData.hidden,
      status: p.fieldData.status,
    }))

    // Filter for "core" slug specifically
    const coreProject = allProjects.find((p) => p.fieldData.slug === 'core')
    
    return NextResponse.json({
      total: allProjects.length,
      projects: projectsInfo,
      coreProject: coreProject
        ? {
            found: true,
            name: coreProject.fieldData.name,
            slug: coreProject.fieldData.slug,
            isDraft: coreProject.isDraft,
            isArchived: coreProject.isArchived,
            hidden: coreProject.fieldData.hidden,
          }
        : { found: false },
      publishedProjects: projectsInfo.filter(
        (p) => !p.isDraft && !p.isArchived
      ),
    })
  } catch (error: any) {
    console.error('[DEBUG API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch projects',
        message: error.message,
        details: error.response?.data || error.stack,
      },
      { status: 500 }
    )
  }
}

