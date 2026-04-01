import { Redis } from "@upstash/redis";

// Redis client singleton - uses UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// These must be set in .env.local for rate limiting and caching to work
export const redis = Redis.fromEnv();
