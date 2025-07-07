// config/redis.js
const Redis = require("ioredis");
const logger = require("./winston");

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      maxMemoryPolicy: "allkeys-lru",
    });

    await redisClient.connect();
    logger.info("Redis Connected");

    redisClient.on("error", (error) => {
      logger.error("Redis error:", error);
    });
  } catch (error) {
    logger.error("Redis connection failed:", error);
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized");
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
