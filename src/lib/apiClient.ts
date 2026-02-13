import axios from 'axios';

const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies with requests
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token from localStorage
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the access token
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`, {}, {
                    withCredentials: true,
                });

                const { access_token } = response.data;
                localStorage.setItem('access_token', access_token);

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login or clear auth
                localStorage.removeItem('access_token');
                // You might want to redirect to login page here
                return Promise.reject(refreshError);
            }
        }

        // Handle errors globally
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default apiClient;
