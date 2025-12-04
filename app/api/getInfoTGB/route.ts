import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv'
import { prisma } from '@/lib/prisma'
import Decimal from 'decimal.js'

type SuccessResponse = {
  funded_txo_sum: number
  tx_count: number
  supporters: string[]
  donatedCreatedTime: {
    valueAtDonationTimeUSD: number
    createdTime: string
  }[]
}

type ErrorResponse = {
  message: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json(
      { message: 'Slug is required' },
      { status: 400 }
    )
  }

  try {
    const cacheKey = `tgb-info-${slug}`
    const cachedData = await kv.get<SuccessResponse>(cacheKey)

    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    // Note: This uses DonationPledge model - adapt based on your actual schema
    // If you have a Donation model with status and valueAtDonationTimeUSD, use that instead
    const donations = await prisma.donationPledge.findMany({
      where: {
        projectSlug: slug,
        // Note: DonationPledge doesn't have status or valueAtDonationTimeUSD
        // You may need to add these fields or use a different model
      },
    })

    if (!donations || donations.length === 0) {
      return NextResponse.json(
        { message: 'No donations found for this slug.' },
        { status: 404 }
      )
    }

    // Sum of all donation amounts using Decimal for precision
    // Note: Adapt based on your DonationPledge model fields
    const totalAmount = donations.reduce((acc, donation) => {
      // Using pledgeAmount as fallback - adjust based on your schema
      const donationAmount = donation.pledgeAmount
        ? new Decimal(donation.pledgeAmount.toString() || '0')
        : new Decimal(0)
      return acc.plus(donationAmount)
    }, new Decimal(0))

    // Unified supporter list
    const supporters: string[] = []

    donations.forEach((donation) => {
      if (donation.socialX) {
        supporters.push(`${donation.socialX}`)
      }
    })

    // Donation amounts with creation timestamps
    // Note: Adapt based on your schema - valueAtDonationTimeUSD may not exist
    const donatedCreatedTime = donations.map((donation) => ({
      valueAtDonationTimeUSD: donation.pledgeAmount
        ? parseFloat(donation.pledgeAmount?.toString())
        : 0,
      createdTime: donation.createdAt.toISOString(),
    }))

    const responseData: SuccessResponse = {
      funded_txo_sum: totalAmount.toNumber(),
      tx_count: donations.length,
      supporters: supporters,
      donatedCreatedTime: donatedCreatedTime,
    }

    await kv.set(cacheKey, responseData, { ex: 900 }) // Cache for 15 minutes

    return NextResponse.json(responseData)
  } catch (err) {
    console.error('Error fetching donation info:', err)
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    )
  }
}

