// src/middleware/rateLimiter.middleware.js
const rateLimit = require("express-rate-limit");
const { getRedisClient } = require("../../config/redis");

// Create rate limiter with Redis store
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message:
        message || "Too many requests from this IP, please try again later.",
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use Redis for distributed rate limiting
    store: {
      incr: async (key) => {
        const redis = getRedisClient();
        const current = await redis.incr(key);
        if (current === 1) {
          await redis.expire(key, Math.ceil(windowMs / 1000));
        }
        return { totalHits: current };
      },
      decrement: async (key) => {
        const redis = getRedisClient();
        await redis.decr(key);
      },
      resetKey: async (key) => {
        const redis = getRedisClient();
        await redis.del(key);
      },
    },
  });
};

// Different rate limiters for different endpoints
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
const authLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 auth attempts per 15 minutes
const messageLimiter = createRateLimiter(60 * 1000, 30); // 30 messages per minute

module.exports = {
  generalLimiter,
  authLimiter,
  messageLimiter,
  createRateLimiter,
};
