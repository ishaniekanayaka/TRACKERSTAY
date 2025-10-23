import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export const BASE_URL = "https://demo.trackerstay.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: "application/json" },
  timeout: 10000,
});

// 🔹 Attach token automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const storedData = await AsyncStorage.getItem("@user_data");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const token = parsedData?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error attaching token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔹 Handle token expiry silently
let isLoggingOut = false;

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;
      console.warn("⚠️ Token expired — redirecting to login");

      try {
        await AsyncStorage.removeItem("@user_data");
      } catch (storageError) {
        console.error("Error clearing storage:", storageError);
      }

      setTimeout(() => {
        router.replace("/login");
        isLoggingOut = false;
      }, 1000);
      
      return Promise.reject(error);
    }

    // For other errors, reject normally
    return Promise.reject(error);
  }
);

export default api;