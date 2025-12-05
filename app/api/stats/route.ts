import { NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { getAllPublishedProjects } from '@/services/webflow/projects'

interface Stats {
  projectsSupported: number
  totalPaid: number
  donationsRaised: number
  donationsMatched: number
}

export async function GET() {
  const cacheKey = 'stats:all'

  try {
    // Try to fetch the cached stats
    try {
      const cachedStats = await kv.get<Stats>(cacheKey)
      if (cachedStats) {
        return NextResponse.json(cachedStats, {
          headers: {
            'Cache-Control': 's-maxage=600, stale-while-revalidate',
          },
        })
      }
    } catch (error) {
      // KV not available, continue
      console.log('[stats] Cache not available, fetching fresh data')
    }

    // If not cached, fetch the data
    const projects = await getAllPublishedProjects()
    
    // Calculate total paid from projects
    const totalPaid = projects.reduce((acc, project) => {
      const paid = project.totalPaid || 0
      return acc + (typeof paid === 'number' ? paid : 0)
    }, 0)

    // For now, return default values for stats that require database access
    // TODO: Implement database queries when Prisma is set up
    const stats: Stats = {
      projectsSupported: projects.length,
      totalPaid,
      donationsRaised: 0, // TODO: Query from database when available
      donationsMatched: 0, // TODO: Query from database when available
    }

    // Cache the stats for 10 minutes
    try {
      await kv.set(cacheKey, stats, { ex: 600 })
    } catch (error) {
      // KV not available, continue
    }

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 's-maxage=600, stale-while-revalidate',
      },
    })
  } catch (error: any) {
    console.error('[stats] Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

