// src/services/cache.service.js
const { getRedisClient } = require("../../config/redis");
const logger = require("../../config/winston");

class CacheService {
  constructor() {
    this.redis = getRedisClient();
    this.defaultTTL = 3600; // 1 hour
  }

  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error("Cache get error:", error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error("Cache set error:", error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error("Cache delete error:", error);
      return false;
    }
  }

  async exists(key) {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error("Cache exists error:", error);
      return false;
    }
  }

  // Cache user profile
  async cacheUserProfile(userId, userData) {
    return await this.set(`user:profile:${userId}`, userData, 1800); // 30 minutes
  }

  async getUserProfile(userId) {
    return await this.get(`user:profile:${userId}`);
  }

  // Cache chat data
  async cacheChatData(chatId, chatData) {
    return await this.set(`chat:${chatId}`, chatData, 900); // 15 minutes
  }

  async getChatData(chatId) {
    return await this.get(`chat:${chatId}`);
  }

  // Cache online users
  async setUserOnline(userId) {
    try {
      await this.redis.sadd("users:online", userId);
      await this.redis.expire("users:online", 300); // 5 minutes
      return true;
    } catch (error) {
      logger.error("Set user online error:", error);
      return false;
    }
  }

  async setUserOffline(userId) {
    try {
      await this.redis.srem("users:online", userId);
      return true;
    } catch (error) {
      logger.error("Set user offline error:", error);
      return false;
    }
  }

  async getOnlineUsers() {
    try {
      return await this.redis.smembers("users:online");
    } catch (error) {
      logger.error("Get online users error:", error);
      return [];
    }
  }
}

module.exports = new CacheService();
