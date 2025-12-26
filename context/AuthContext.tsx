
import React, { createContext, useState, useContext, useEffect } from "react";
import { login as apiLogin, logout as apiLogout, registerDeviceToken } from "@/services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { router } from "expo-router";

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  expoPushToken: string | null;
  isTokenRegistered: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: Platform.OS === "ios",
    shouldShowList: Platform.OS === "ios",
  }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isTokenRegistered, setIsTokenRegistered] = useState(false);

  // Auto-register token when available + authenticated
  useEffect(() => {
    if (expoPushToken && isAuthenticated && !isTokenRegistered) {
      registerDeviceToken(expoPushToken, Platform.OS).then(success => {
        if (success) setIsTokenRegistered(true);
      });
    }
  }, [expoPushToken, isAuthenticated, isTokenRegistered]);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await setupPushNotifications();
      await loadUserFromStorage();
    } catch (e) {
      console.error("App init error:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadUserFromStorage = async () => {
    const stored = await AsyncStorage.getItem("@user_data");
    if (stored) {
      const data = JSON.parse(stored);
      setUser(data.user);
      setIsAuthenticated(true);
    }
  };

  const setupPushNotifications = async () => {
    if (!Device.isDevice) return;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;

    const tokenData = await Notifications.getDevicePushTokenAsync();
    const token = tokenData?.data;
    if (!token) return;

    setExpoPushToken(token);
    await AsyncStorage.setItem("@expo_push_token", token);

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      setUser(res.user);
      setIsAuthenticated(true);
      router.replace("/dashboard/home");
    } catch (err: any) {
      await AsyncStorage.removeItem("@user_data");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsTokenRegistered(false);
      await AsyncStorage.removeItem("@user_data");
      router.replace("/login");
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
        expoPushToken,
        isTokenRegistered,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};