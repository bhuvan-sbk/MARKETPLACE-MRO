// backend/config/config.js
const config = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mro-marketplace'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '7d'
    },
    server: {
        port: process.env.PORT || 5300,
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }
    }
};

module.exports = config;

// frontend/src/config/config.js
const config = {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5300/api',
    WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:5300',
    ENV: process.env.NODE_ENV || 'development'
};

export default config;