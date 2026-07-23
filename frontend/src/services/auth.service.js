import axios from "axios";
import toast from "react-hot-toast";

// Create a customized axios instance
const apiClient = axios.create({
  withCredentials: true,
});

// Interceptor to handle network errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Determine if it's a network error (server down, CORS, offline)
    if (!error.response) {
      toast.error("Network Error: Please check your connection.");
      return Promise.reject(new Error("Network Error: Server is unreachable."));
    }

    // Handle 401 Unauthorized globally (e.g. expired token)
    if (error.response.status === 401) {
      toast.error("Session expired. Please log in again.");
      // Optional: trigger a global event or redirect to login here
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (serverUrl, credentials, abortSignal) => {
    const response = await apiClient.post(`${serverUrl}/api/auth/signin`, credentials, {
      signal: abortSignal,
    });
    return response.data;
  },

  signup: async (serverUrl, data, abortSignal) => {
    const response = await apiClient.post(`${serverUrl}/api/auth/signup`, data, {
      signal: abortSignal,
    });
    return response.data;
  },

  logout: async (serverUrl) => {
    const response = await apiClient.get(`${serverUrl}/api/auth/logout`);
    return response.data;
  },
};
