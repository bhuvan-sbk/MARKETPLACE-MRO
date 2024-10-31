// frontend/src/config/axios.js
import axios from 'axios';
import config from './index';

const axiosInstance = axios.create({
  baseURL: config.API_URL || 'http://localhost:5300/api',ENDPOINTS: {
    BOOKINGS: '/bookings',
    SERVICES: '/services',
    HANGARS: '/hangars',
    AUTH: '/auth'
},
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 seconds
});

 // Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
      const token = localStorage.getItem('token');
      if (token) {
          config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('Request Config:', {
          url: config.url,
          method: config.method,
          baseURL: config.baseURL,
          headers: config.headers,
          data: config.data
      });
      return config;
  },
  (error) => {
      console.error('Request Error:', error);
      return Promise.reject(error);
  }
);


// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear local storage and redirect to login
          localStorage.clear();
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Access denied');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          console.error('An error occurred');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;