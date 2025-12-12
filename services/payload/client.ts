import axios, { AxiosInstance } from 'axios'

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3000/api'

/**
 * Create a Payload CMS API client
 */
export function createPayloadClient(): AxiosInstance {
  const apiToken = process.env.PAYLOAD_API_TOKEN

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Add authentication if API token is provided
  if (apiToken) {
    headers.Authorization = `Bearer ${apiToken}`
  }

  return axios.create({
    baseURL: PAYLOAD_API_URL,
    headers,
  })
}

/**
 * Helper to fetch paginated results from Payload
 */
export async function fetchAllPages<T>(
  client: AxiosInstance,
  endpoint: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const allItems: T[] = []
  let page = 1
  const limit = 100 // Payload default limit

  while (true) {
    const response = await client.get(endpoint, {
      params: {
        ...params,
        page,
        limit,
      },
    })

    const { docs, totalPages } = response.data

    allItems.push(...docs)

    if (page >= totalPages) {
      break
    }

    page++
  }

  return allItems
}



