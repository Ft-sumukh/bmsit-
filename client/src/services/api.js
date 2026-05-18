import axios from 'axios';

// Create configured Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api',
  withCredentials: true, // Crucial to send refresh cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT access token on all outbound requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle auto token refresh upon expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Trigger silent refresh if access token expired (returns 401)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      const errMsg = error.response.data ? error.response.data.message : '';
      
      if (errMsg === 'Token expired' || errMsg.includes('expired')) {
        originalRequest._retry = true;
        try {
          const refreshUrl = `${
            import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api'
          }/auth/refresh`;

          // Post with credentials to send HttpOnly refreshToken cookie
          const { data } = await axios.post(refreshUrl, {}, { withCredentials: true });

          if (data && data.token) {
            localStorage.setItem('token', data.token);
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
            
            // Retry the original query
            return api(originalRequest);
          }
        } catch (refreshErr) {
          console.error('Silent JWT refresh handshake failed:', refreshErr.message);
          localStorage.removeItem('token');
          // Dispatch native event or redirect to login page
          window.dispatchEvent(new Event('auth-logout'));
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
