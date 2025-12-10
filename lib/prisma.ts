import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    // Prisma 7 reads DATABASE_URL from environment automatically
    // Connection URL is configured in prisma/config.ts for migrations
    // Suppress error logs - we handle P2021 (table doesn't exist) gracefully with fallback
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'warn'] // Removed 'error' to suppress P2021 noise
      : ['warn'], // Only log warnings in production
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

