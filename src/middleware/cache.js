const redisClient = require('../config/redis');

/**
 * Middleware to cache HTTP responses in Redis
 * @param {number} duration - Time to live in seconds (default: 3600s = 1 hour)
 */
const cacheMiddleware = (duration = 3600) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Create a unique key based on the URL and query parameters
        const key = `cache:${req.originalUrl}`;

        try {
            // Check if the data exists in Redis
            const cachedData = await redisClient.get(key);

            if (cachedData) {
                // If found, return the cached data immediately
                console.log(`[Redis] Cache hit for: ${key}`);
                return res.status(200).json(JSON.parse(cachedData));
            }

            // If not found, we need to intercept the response
            console.log(`[Redis] Cache miss for: ${key}`);

            // Store the original res.json function
            const originalJson = res.json;

            // Override res.json to save the data in Redis before sending it
            res.json = function (data) {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    redisClient.setEx(key, duration, JSON.stringify(data));
                }

                // Call the original res.json function
                originalJson.call(this, data);
            };

            next();
        } catch (error) {
            console.error('Redis Cache Error:', error);
            // If Redis fails, just proceed without caching
            next();
        }
    };
};

/**
 * Helper function to clear cache for a specific pattern
 * @param {string} pattern - The pattern to match (e.g., 'cache:/api/v1/products*')
 */
const clearCache = async (pattern) => {
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`[Redis] Cleared ${keys.length} cache keys matching: ${pattern}`);
        }
    } catch (error) {
        console.error('Redis Clear Cache Error:', error);
    }
};

module.exports = {
    cacheMiddleware,
    clearCache
};
