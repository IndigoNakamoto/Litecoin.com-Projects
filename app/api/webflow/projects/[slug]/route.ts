import { NextRequest, NextResponse } from 'next/server'
import { getProjectBySlug } from '@/services/webflow/projects'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    // Handle both sync and async params (Next.js 15+ uses Promise)
    const resolvedParams = params instanceof Promise ? await params : params
    const slug = resolvedParams.slug
    console.log(`[API Route] Fetching project with slug: "${slug}"`)
    
    const project = await getProjectBySlug(slug)

    if (!project) {
      console.error(`[API Route] Project "${slug}" not found`)
      return NextResponse.json(
        { error: 'Project not found', slug },
        { status: 404 }
      )
    }

    console.log(`[API Route] Successfully returning project: ${project.name}`)
    return NextResponse.json({ project })
  } catch (error: any) {
    console.error('[API Route] Error fetching project:', error)
    console.error('[API Route] Error stack:', error.stack)
    return NextResponse.json(
      { 
        error: 'Failed to fetch project', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

