// Create a safe wrapper that handles missing KV credentials
const mockKv = {
  get: async <T>(_key: string): Promise<T | null> => null,
  set: async (_key: string, _value: any, _options?: { ex?: number }): Promise<string> => 'OK',
  del: async (_key: string): Promise<number> => 0,
  exists: async (_key: string): Promise<number> => 0,
  keys: async (_pattern?: string): Promise<string[]> => [],
}

let kv: typeof mockKv

try {
  // Check if KV credentials are available
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    // Dynamically import only if credentials are present
    const vercelKvModule = require('@vercel/kv')
    kv = vercelKvModule.kv
  } else {
    kv = mockKv
  }
} catch (error) {
  // If KV initialization fails, use mock
  kv = mockKv
}

export { kv }

