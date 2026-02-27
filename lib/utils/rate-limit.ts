interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Note: This in-memory rate limiter resets on server restart and does not work
// across multiple server instances. For production multi-instance deployments,
// replace with a distributed solution (e.g., Redis).
const store = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1 };
  }

  if (entry.count >= options.limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: options.limit - entry.count };
}

// Pre-configured rate limiters
export const generationRateLimit: RateLimitOptions = { limit: 10, windowMs: 60_000 };
export const pollingRateLimit: RateLimitOptions = { limit: 30, windowMs: 60_000 };
export const authRateLimit: RateLimitOptions = { limit: 5, windowMs: 60_000 };
export const presignRateLimit: RateLimitOptions = { limit: 10, windowMs: 60_000 };
