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

    // Calculate projects supported - use project count (original behavior)
    // If you want to count only projects with donations, uncomment the try-catch below
    let projectsSupported = projects.length
    
    // Optional: Count only projects that have received donations
    // try {
    //   // @ts-ignore - Donation model may exist in database but not in schema
    //   const grouped = await prisma.donation.groupBy({
    //     by: ['projectSlug'],
    //   })
    //   projectsSupported = grouped.length
    // } catch (error) {
    //   // If Donation model doesn't exist, fall back to project count
    //   console.warn('[stats] Donation model not found, using project count')
    //   projectsSupported = projects.length
    // }

    // Calculate donations raised and matched
    // Use lazy import to avoid Prisma initialization errors if not configured
    let donationsRaised = 0
    let donationsMatched = 0
    
    try {
      // Dynamically import prisma to avoid initialization errors at module load time
      const { prisma } = await import('@/lib/prisma')
      
      // Use bracket notation to safely access models that might not exist in schema
      // @ts-ignore - Donation model may exist in database but not in schema
      const donationModel = (prisma as any)['donation']
      // @ts-ignore - MatchingDonationLog model may exist in database but not in schema
      const matchingDonationLogModel = (prisma as any)['matchingDonationLog']
      
      if (donationModel) {
        const donationsRaisedResult = await donationModel.aggregate({
          _sum: {
            valueAtDonationTimeUSD: true,
          },
          where: {
            status: 'Complete',
            valueAtDonationTimeUSD: {
              gte: 2,
            },
          },
        })
        donationsRaised =
          donationsRaisedResult._sum.valueAtDonationTimeUSD?.toNumber() ?? 0

        // Calculate donations matched
        const donations = await donationModel.findMany({
          where: {
            status: 'Complete',
            valueAtDonationTimeUSD: {
              gte: 2,
            },
          },
          select: {
            id: true,
          },
        })

        const donationIds = donations.map((d: any) => d.id)

        if (donationIds.length > 0 && matchingDonationLogModel) {
          const donationsMatchedResult = await matchingDonationLogModel.aggregate({
            _sum: {
              matchedAmount: true,
            },
            where: {
              donationId: {
                in: donationIds,
              },
            },
          })

          donationsMatched =
            donationsMatchedResult._sum.matchedAmount?.toNumber() ?? 0
        }
      }
    } catch (error: any) {
      // Silently fail if Prisma is not configured or models don't exist
      // This is expected during migration or if Prisma isn't set up
      const isExpectedError = 
        error?.code === 'P2001' || 
        error?.code === 'P2025' ||
        error?.name === 'PrismaClientConstructorValidationError' ||
        error?.message?.includes('Unknown model') ||
        error?.message?.includes('does not exist') ||
        error?.message?.includes('prisma.donation') ||
        error?.message?.includes('prisma.matchingDonationLog') ||
        error?.message?.includes('Cannot read property') ||
        error?.message?.includes('adapter') ||
        error?.message?.includes('accelerateUrl')
      
      if (!isExpectedError) {
        console.warn('[stats] Error calculating donations:', error?.message || error)
      }
      // Values already default to 0, so no need to set them here
    }

    const stats: Stats = {
      projectsSupported,
      totalPaid,
      donationsRaised,
      donationsMatched,
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

