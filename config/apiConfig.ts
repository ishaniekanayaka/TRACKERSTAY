import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export const BASE_URL = "https://demo.trackerstay.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Attach JWT token automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const storedData = await AsyncStorage.getItem("@user_data");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        const token = parsed?.token;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.error("Request interceptor error:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized or server errors globally
let isLoggingOut = false;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (!error.response) {
      return Promise.reject(new Error("Network error. Check your connection."));
    }

    const status = error.response.status;

    if (status === 401 && !isLoggingOut) {
      isLoggingOut = true;
      try {
        await AsyncStorage.removeItem("@user_data");
        await AsyncStorage.removeItem("@expo_push_token");
      } catch (e) {
        console.error("Error clearing storage after 401:", e);
      }
      setTimeout(() => {
        router.replace("/login");
        isLoggingOut = false;
      }, 1200);
      return Promise.reject(new Error("Session expired. Please log in again."));
    }

    if (status >= 500) {
      return Promise.reject(new Error("Server error. Please try again later."));
    }

    const message =
      error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

export default api;
