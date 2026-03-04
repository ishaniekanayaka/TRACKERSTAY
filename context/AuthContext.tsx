// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
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

// Foreground notification handler
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
  const [user, setUser]                           = useState<any>(null);
  const [loading, setLoading]                     = useState(true);
  const [isAuthenticated, setIsAuthenticated]     = useState(false);
  const [expoPushToken, setExpoPushToken]         = useState<string | null>(null);
  const [isTokenRegistered, setIsTokenRegistered] = useState(false);

  const tapListenerRef      = useRef<Notifications.EventSubscription | null>(null);
  const receivedListenerRef = useRef<Notifications.EventSubscription | null>(null);

  // ── Notification Tap → navigate ───────────────────────────────────────────
  useEffect(() => {
    // 1) App open / background — notification tap
    tapListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("[Notification] Tapped:", response.notification.request.content);
        const data = response.notification.request.content.data as any;
        const targetScreen = data?.screen ?? "/nav/bookings";
        router.push(targetScreen as any);
      }
    );

    // 2) Foreground notification received
    receivedListenerRef.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("[Notification] Received foreground:", notification.request.content);
      }
    );

    // 3) App KILLED state — getLastNotificationResponse (sync, නව API)
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      const data = lastResponse.notification.request.content.data as any;
      const targetScreen = data?.screen ?? "/nav/bookings";
      setTimeout(() => {
        router.push(targetScreen as any);
      }, 500);
    }

    // Cleanup
    return () => {
      tapListenerRef.current?.remove();
      receivedListenerRef.current?.remove();
    };
  }, []);

  // ── Auto-register push token ──────────────────────────────────────────────
  useEffect(() => {
    if (expoPushToken && isAuthenticated && !isTokenRegistered) {
      registerDeviceToken(expoPushToken, Platform.OS).then((success) => {
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
    if (status !== "granted") {
      console.warn("[Push] Permission not granted");
      return;
    }

    const tokenData = await Notifications.getDevicePushTokenAsync();
    const token = tokenData?.data;
    if (!token) return;

    setExpoPushToken(token);
    await AsyncStorage.setItem("@expo_push_token", token);

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        sound: "trackerstay_tone1.mp3",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6B5B95",
        enableVibrate: true,
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