interface CacheEntry<T> {
  value: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Get a value from the cache.
 * @param key The cache key
 * @param ttl The maximum age in milliseconds (optional)
 * @returns The cached value or null if not found or expired
 */
export function getCached<T>(key: string, ttl?: number): T | null {
  const entry = cache.get(key);
  
  if (!entry) return null;
  
  const now = Date.now();
  
  // If a specific TTL was provided for this get, check against entry creation
  if (ttl !== undefined && now - (entry.expiry - (ttl)) > ttl) {
    cache.delete(key);
    return null;
  }

  // Check against absolute expiry
  if (now > entry.expiry) {
    cache.delete(key);
    return null;
  }
  
  return entry.value as T;
}

/**
 * Set a value in the cache.
 * @param key The cache key
 * @param value The value to cache
 * @param ttl The time-to-live in milliseconds
 */
export function setCache<T>(key: string, value: T, ttl: number = 3600000): void {
  const expiry = Date.now() + ttl;
  cache.set(key, { value, expiry });
}

/**
 * Clear the entire cache.
 */
export function clearCache(): void {
  cache.clear();
}
