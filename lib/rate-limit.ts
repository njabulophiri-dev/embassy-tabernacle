import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

/**
 * Payment initialization rate limit.
 *
 * 10 checkout attempts per IP per minute.
 *
 * This protects the expensive Paystack initialization endpoint
 * from abuse while still allowing legitimate retries.
 */
export const checkoutRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

/**
 * Verification rate limit.
 *
 * 20 verification attempts per IP per minute.
 */
export const verificationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
});
