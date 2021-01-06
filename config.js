const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    corsUrl: process.env.CORS_URL,
    mongoHost: process.env.MONGO_HOST,
    redisHost: process.env.REDIS_HOST
}
