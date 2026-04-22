import { NextRequest } from "next/server";

const rates = new Map<string, { count: number; lastReset: number }>();

/**
 * Very simple in-memory rate limiter.
 * @param key Unique key for the client (e.g. IP + path)
 * @param limit Max requests per window
 * @param window Window size in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function rateLimit(
  key: string,
  limit: number = 60,
  window: number = 60000
): boolean {
  const now = Date.now();
  const rate = rates.get(key) || { count: 0, lastReset: now };

  if (now - rate.lastReset > window) {
    rate.count = 1;
    rate.lastReset = now;
  } else {
    rate.count++;
  }

  rates.set(key, rate);

  return rate.count <= limit;
}

/**
 * Get a rate limit key based on the request.
 * @param request The incoming request
 * @param prefix Optional prefix for the key
 * @returns A string key
 */
export function getRateLimitKey(request: NextRequest, prefix: string = ""): string {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  return `${prefix}:${ip}`;
}
