import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export const BASE_URL = "https://demo.trackerstay.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 
    "Accept": "application/json",
    "Content-Type": "application/json"
  },
  timeout: 15000,
});

// 🔹 Attach token automatically with enhanced error handling
api.interceptors.request.use(
  async (config) => {
    try {
      const storedData = await AsyncStorage.getItem("@user_data");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const token = parsedData?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔐 Token attached to request');
        }
      }
    } catch (error) {
      console.error("Error attaching token:", error);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// 🔹 Handle token expiry silently with enhanced logic
let isLoggingOut = false;

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("🌐 Network error:", error.message);
      return Promise.reject(new Error("Network error. Please check your internet connection."));
    }

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;
      console.warn("⚠️ Token expired or invalid — redirecting to login");

      try {
        await AsyncStorage.removeItem("@user_data");
        await AsyncStorage.removeItem('@expo_push_token');
        console.log('🗑️ Storage cleared due to token expiry');
      } catch (storageError) {
        console.error("Error clearing storage:", storageError);
      }

      setTimeout(() => {
        router.replace("/login");
        isLoggingOut = false;
      }, 1500);
      
      return Promise.reject(new Error("Session expired. Please login again."));
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      console.error("🚨 Server error:", error.response.status);
      return Promise.reject(new Error("Server error. Please try again later."));
    }

    // For other errors, reject with proper message
    const message = error.response?.data?.message || error.message || "An error occurred";
    console.error("❌ API Error:", {
      status: error.response?.status,
      message: message,
      url: error.config?.url
    });
    
    return Promise.reject(new Error(message));
  }
);

export default api;