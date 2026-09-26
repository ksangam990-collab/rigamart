import axios from 'axios';

let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

/**
 * Update memory-cached access token
 */
export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

/**
 * Process queue of waiting requests during token refresh
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Create configured Axios instance
const api = axios.create({
  baseURL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api',
  withCredentials: true, // Enables httpOnly refresh token cookies transmission
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach in-memory JWT bearer token if present
api.interceptors.request.use(
  (config) => {
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Seamless 401 interception & silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ignore if not a 401 or request already retried
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Do not attempt to refresh if the failed request was the refresh route itself or login
    if (
      originalRequest.url.includes('/auth/refresh-token') ||
      originalRequest.url.includes('/auth/login')
    ) {
      setAccessToken(null);
      if (typeof localStorage !== 'undefined') localStorage.removeItem('rigamart_user');
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue incoming requests while token exchange is in flight
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Exchange httpOnly refresh token cookie for new access token
      const res = await axios.post(
        `${api.defaults.baseURL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      const newAccessToken = res.data?.data?.accessToken;
      if (!newAccessToken) {
        throw new Error('Refresh token exchange did not return access token');
      }

      setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      // Re-issue original request with newly issued access token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      setAccessToken(null);
      if (typeof localStorage !== 'undefined') localStorage.removeItem('rigamart_user');
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
