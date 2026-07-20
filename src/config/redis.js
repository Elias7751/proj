const redis = require('redis');

// Create Redis Client
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis successfully!');
});

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Could not connect to Redis:', error.message);
    }
})();

module.exports = redisClient;
