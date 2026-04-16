import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    // Support both Vercel KV naming (KV_REST_API_*) and generic Upstash naming
    const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
    redis = new Redis({ url: url!, token: token! });
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    return await client.get<T>(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const client = getRedis();
    await client.set(key, value, { ex: ttlSeconds });
  } catch {
    // Silently fail — caching is not critical
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const client = getRedis();
    await client.del(key);
  } catch {
    // Silently fail
  }
}

// Rate limiting: track FMP API request count per minute
const RATE_LIMIT_KEY = "fmp:requests:minute";
const RATE_LIMIT_MAX = 260; // 300 req/min with safety margin

export async function checkRateLimit(): Promise<boolean> {
  try {
    const client = getRedis();
    const count = await client.incr(RATE_LIMIT_KEY);
    if (count === 1) {
      await client.expire(RATE_LIMIT_KEY, 60);
    }
    return count <= RATE_LIMIT_MAX;
  } catch {
    return true; // Allow if Redis unavailable
  }
}
