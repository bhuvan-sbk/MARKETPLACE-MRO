const config = {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5300/api',
    WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:5300',
    ENV: process.env.NODE_ENV || 'development'
};

export default config;