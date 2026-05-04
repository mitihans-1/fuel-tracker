import { NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter for Next.js API routes.
 * For production with multiple instances, use a Redis-backed solution.
 */
export async function rateLimit(
  ip: string,
  limit: number = 5,
  durationMs: number = 60000 // 1 minute
) {
  const now = Date.now();
  const record = store[ip];

  if (!record || now > record.resetTime) {
    store[ip] = {
      count: 1,
      resetTime: now + durationMs,
    };
    return { success: true, remaining: limit - 1, reset: durationMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, reset: record.resetTime - now };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, reset: record.resetTime - now };
}
