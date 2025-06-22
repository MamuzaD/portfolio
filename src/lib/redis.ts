import { Redis } from "@upstash/redis"

let redis: Redis | null = null

export function getRedisClient(): Redis | null {
  if (!redis) {
    if (!import.meta.env.KV_REST_API_URL || !import.meta.env.KV_REST_API_TOKEN) {
      return null
    }

    try {
      redis = new Redis({
        url: import.meta.env.KV_REST_API_URL,
        token: import.meta.env.KV_REST_API_TOKEN,
      })
      console.log("Redis: Connected")
    } catch (error) {
      console.error("Redis: Failed to connect:", error)
      return null
    }
  }
  return redis
}

export async function cacheData(key: string, data: any, expirySeconds?: number): Promise<boolean> {
  const client = getRedisClient()
  if (!client) return false

  try {
    if (expirySeconds) {
      await client.setex(key, expirySeconds, JSON.stringify(data))
      console.log(`Redis: Cached ${key} (expires in ${expirySeconds}s)`)
    } else {
      await client.set(key, JSON.stringify(data))
      console.log(`Redis: Cached ${key} (no expiry)`)
    }
    return true
  } catch (error) {
    console.warn("Redis: Cache write error:", error)
    return false
  }
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const client = getRedisClient()
  if (!client) return null

  try {
    const cachedData = await client.get(key)
    if (cachedData) {
      console.log(`Redis: Cache HIT ${key}`)
      return cachedData as T
    }
    console.log(`Redis: Cache MISS ${key}`)
    return null
  } catch (error) {
    console.warn("Redis: Cache read error:", error)
    return null
  }
}

export async function deleteCachedData(key: string): Promise<boolean> {
  const client = getRedisClient()
  if (!client) return false

  try {
    const result = await client.del(key)
    if (result > 0) {
      console.log(`Redis: Deleted ${key}`)
    }
    return result > 0
  } catch (error) {
    console.warn("Redis: Delete error:", error)
    return false
  }
}
