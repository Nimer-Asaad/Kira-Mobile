import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../utils/constants";

// Get API base URL from environment or use default
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api" ||
  "http://10.0.2.2:8000/api";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error reading token from SecureStore:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error;

    // Handle 401 Unauthorized - logout user
    if (response?.status === 401) {
      // Remove token from secure storage
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      } catch (err) {
        console.error("Error deleting token:", err);
      }

      // Trigger logout event (can be caught by AuthContext or app-level handlers)
      // This will be handled by the app state management
      console.warn("Unauthorized - token removed. User should be logged out.");
    }

    // Handle network errors
    if (!response) {
      const newError = new Error("Network error - could not connect to server");
      newError.isNetworkError = true;
      return Promise.reject(newError);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
