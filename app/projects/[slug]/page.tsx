import { getProjectBySlug } from '@/services/webflow/projects'
import { notFound } from 'next/navigation'
import ProjectDetailClient from '@/components/projects/ProjectDetailClient'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string }
}) {
  try {
    // Handle both sync and async params (Next.js 15+ uses Promise)
    const resolvedParams = params instanceof Promise ? await params : params
    console.log(`[ProjectPage] Received slug: "${resolvedParams.slug}"`)
    
    const project = await getProjectBySlug(resolvedParams.slug)

    if (!project) {
      console.error(`[ProjectPage] Project "${resolvedParams.slug}" not found, calling notFound()`)
      notFound()
    }
    
    console.log(`[ProjectPage] Project found: ${project.name}`)

    // TODO: Fetch address stats, FAQs, updates, and posts from APIs
    const addressStats = {
      tx_count: 0,
      funded_txo_sum: 0,
      supporters: [],
    }
    const faqs: any[] = []
    const updates: any[] = []
    const posts: any[] = []

    return (
      <ProjectDetailClient
        project={project}
        addressStats={addressStats}
        faqs={faqs}
        updates={updates}
        posts={posts}
      />
    )
  } catch (error: any) {
    console.error('[ProjectPage] Error rendering page:', error)
    console.error('[ProjectPage] Error stack:', error.stack)
    throw error // Re-throw to show error page
  }
}

