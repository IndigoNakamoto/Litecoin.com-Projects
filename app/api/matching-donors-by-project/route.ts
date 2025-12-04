import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { prisma } from '@/lib/prisma'
import { createWebflowClient, listCollectionItems } from '@/services/webflow/client'

// This is a simplified version - you may need to adapt based on your Webflow collection structure
interface MatchingDonor {
  id: string
  fieldData: {
    name?: string
    status?: string
    'matching-type'?: string
    'supported-projects'?: string[]
    [key: string]: any
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Project slug is required' },
        { status: 400 }
      )
    }

    const cacheKey = `matching-donors-${slug}`
    const cachedData = await kv.get(cacheKey)

    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    // Get the project by slug to get its ID
    const project = await prisma.project.findFirst({
      where: { slug },
      select: { id: true },
    })

    if (!project) {
      // Try fetching from Webflow if not in database
      // For now, return empty array if project not found
      return NextResponse.json([])
    }

    // Note: MatchingDonationLog may not exist in the new schema
    // This is a placeholder - you may need to create this model or use a different approach
    // For now, returning empty array if model doesn't exist
    let matchingDonations: { donorId: string }[] = []
    try {
      // @ts-ignore - Model may not exist yet
      matchingDonations = await prisma.matchingDonationLog.findMany({
        where: {
          projectSlug: slug,
        },
        select: {
          donorId: true,
        },
      })
    } catch (error) {
      console.warn('MatchingDonationLog model not found, returning empty array')
      return NextResponse.json([])
    }

    const donorIdsWhoMatchedProject = Array.from(
      new Set(matchingDonations.map((donation) => donation.donorId))
    )

    if (donorIdsWhoMatchedProject.length === 0) {
      return NextResponse.json([])
    }

    // Fetch matching donors from Webflow
    const apiToken = process.env.WEBFLOW_API_TOKEN
    const collectionId = process.env.WEBFLOW_COLLECTION_ID_MATCHING_DONORS

    if (!apiToken || !collectionId) {
      console.warn('Webflow API credentials not configured for matching donors')
      return NextResponse.json([])
    }

    const client = createWebflowClient(apiToken)
    const allDonors = await listCollectionItems<MatchingDonor>(
      client,
      collectionId
    )

    // Filter donors to those who have matched donations for this project
    const donorsWhoMatchedProject = allDonors.filter((donor) =>
      donorIdsWhoMatchedProject.includes(donor.id)
    )

    // Get total matched amounts for donors for this project
    let totalMatchedAmounts: { donorId: string; _sum: { matchedAmount: any } }[] = []
    try {
      // @ts-ignore - Model may not exist yet
      totalMatchedAmounts = await prisma.matchingDonationLog.groupBy({
        by: ['donorId'],
        where: {
          projectSlug: slug,
        },
        _sum: {
          matchedAmount: true,
        },
      })
    } catch (error) {
      console.warn('MatchingDonationLog model not found for groupBy')
      return NextResponse.json([])
    }

    // Create a map of donorId to totalMatchedAmount
    const totalMatchedAmountMap: { [donorId: string]: number } = {}
    totalMatchedAmounts.forEach((item) => {
      totalMatchedAmountMap[item.donorId] =
        item._sum.matchedAmount?.toNumber() ?? 0
    })

    // For each donor, retrieve the total matched amount from the map
    const donorsWithMatchedAmounts = donorsWhoMatchedProject.map((donor) => {
      const donorId = donor.id
      const totalMatchedAmount = totalMatchedAmountMap[donorId] || 0

      return {
        donorId,
        donorFieldData: {
          ...donor.fieldData,
        },
        totalMatchedAmount,
      }
    })

    await kv.set(cacheKey, donorsWithMatchedAmounts, { ex: 900 }) // Cache for 15 minutes

    return NextResponse.json(donorsWithMatchedAmounts)
  } catch (error) {
    console.error('Error fetching matching donors by project slug:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matching donors' },
      { status: 500 }
    )
  }
}

