const redis = require('redis');

let redisClient = null;
let redisConnected = false;

const getRedisClient = async () => {
  if (redisClient && redisConnected) return redisClient;

  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        connectTimeout: 2000,
        reconnectStrategy: false // Don't auto-reconnect
      }
    });

    redisClient.on('error', (err) => {
      // Silently handle Redis errors - cache is optional
      redisConnected = false;
    });

    await redisClient.connect();
    redisConnected = true;
    console.log('Redis connected successfully');
  } catch (error) {
    console.log('Redis not available, running without cache');
    redisConnected = false;
  }

  return redisClient;
};

const cacheMiddleware = (key, ttl = 3600) => {
  return async (req, res, next) => {
    // В dev-режиме кэш часто мешает (из-за фиксированных ключей можно долго видеть старые координаты).
    // Поэтому по умолчанию отключаем кэширование, если это не production.
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      return next();
    }

    // If Redis is not available, skip caching
    if (!redisConnected || !redisClient) {
      return next();
    }

    try {
      const client = await getRedisClient();
      if (!client || !redisConnected) {
        return next();
      }

      const cachedData = await client.get(key);
      
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      res.originalJson = res.json;
      res.json = async (data) => {
        try {
          if (redisConnected && client) {
            await client.setEx(key, ttl, JSON.stringify(data));
          }
        } catch (cacheError) {
          // Ignore cache write errors
        }
        res.originalJson(data);
      };

      next();
    } catch (error) {
      // Silently fail - continue without cache
      next();
    }
  };
};

module.exports = { getRedisClient, cacheMiddleware };
