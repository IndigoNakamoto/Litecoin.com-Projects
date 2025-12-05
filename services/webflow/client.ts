import axios, { AxiosInstance } from 'axios'

const WEBFLOW_API_BASE = 'https://api.webflow.com/v2'

export interface WebflowResponse<T> {
  items: T[]
  count: number
  total: number
  limit: number
  offset: number
}

export function createWebflowClient(apiToken: string): AxiosInstance {
  return axios.create({
    baseURL: WEBFLOW_API_BASE,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'accept-version': '1.0.0',
      'Content-Type': 'application/json',
    },
  })
}

export async function listCollectionItems<T>(
  client: AxiosInstance,
  collectionId: string,
  params: Record<string, any> = {}
): Promise<T[]> {
  let items: T[] = []
  let offset = 0
  let total = 0
  const limit = 100

  try {
    do {
      const response = await client.get<WebflowResponse<T>>(
        `/collections/${collectionId}/items`,
        {
          params: {
            limit,
            offset,
            ...params,
          },
        }
      )
      items = items.concat(response.data.items)
      total = response.data.total
      offset += limit
    } while (items.length < total)

    return items
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number; data?: unknown }; message?: string }
    
    // If rate limited (429), return empty array to allow graceful degradation
    if (axiosError.response?.status === 429) {
      console.warn(
        `Rate limited (429) when fetching items from collection ${collectionId}. Returning empty array.`
      )
      return []
    }
    
    const errorMessage = axiosError.response?.data || axiosError.message || 'Unknown error'
    console.error(
      `Error fetching items from collection ${collectionId}:`,
      errorMessage
    )
    // For other errors, still throw to maintain existing behavior
    throw error
  }
}

