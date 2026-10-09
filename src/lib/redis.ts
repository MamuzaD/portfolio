import { Redis } from "@upstash/redis"

let redis: Redis | null = null

const cacheNamespace = import.meta.env.CACHE_NAMESPACE?.trim() || (import.meta.env.PROD ? "prod" : "dev")
const namespacedKey = (key: string) => `portfolio:${cacheNamespace}:${key}`

export function getRedisClient(): Redis | null {
  if (!redis) {
    if (!import.meta.env.KV_REST_API_URL || !import.meta.env.KV_REST_API_TOKEN) {
      return null
    }

    try {
      redis = new Redis({
        url: import.meta.env.KV_REST_API_URL,
        token: import.meta.env.KV_REST_API_TOKEN,
        signal: () => AbortSignal.timeout(2000),
        retry: false,
      })
      console.log("Redis: Connected")
    } catch (error) {
      console.error("Redis: Failed to connect:", error)
      return null
    }
  }
  return redis
}

export async function acquireCacheCooldown(key: string, seconds: number): Promise<boolean> {
  const client = getRedisClient()
  if (!client) {
    return !import.meta.env.KV_REST_API_URL && !import.meta.env.KV_REST_API_TOKEN
  }

  try {
    return (await client.set(namespacedKey(key), "1", { nx: true, ex: seconds })) === "OK"
  } catch (error) {
    console.warn("Redis: Cooldown unavailable; skipping refresh:", error)
    return false
  }
}

export async function cacheData(key: string, data: any, expirySeconds?: number): Promise<boolean> {
  const client = getRedisClient()
  if (!client) return false

  const scopedKey = namespacedKey(key)

  try {
    if (expirySeconds) {
      await client.setex(scopedKey, expirySeconds, JSON.stringify(data))
      console.log(`Redis: Cached ${scopedKey} (expires in ${expirySeconds}s)`)
    } else {
      await client.set(scopedKey, JSON.stringify(data))
      console.log(`Redis: Cached ${scopedKey} (no expiry)`)
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

  const scopedKey = namespacedKey(key)

  try {
    const cachedData = await client.get(scopedKey)
    if (cachedData !== null && cachedData !== undefined) {
      console.log(`Redis: Cache HIT ${scopedKey}`)
      return cachedData as T
    }
    console.log(`Redis: Cache MISS ${scopedKey}`)
    return null
  } catch (error) {
    console.warn("Redis: Cache read error:", error)
    return null
  }
}
