
import React, { createContext, useState, useContext, useEffect } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  registerDeviceToken,
} from "@/services/authService";
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
  registerPushToken: () => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isTokenRegistered, setIsTokenRegistered] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  // ✅ Monitor expoPushToken changes and auto-register
  useEffect(() => {
    if (expoPushToken && !isTokenRegistered) {
      // Call async function inside useEffect
      const registerToken = async () => {
        await autoRegisterToken();
      };
      registerToken();
    }
  }, [expoPushToken, isTokenRegistered]);

  // ✅ AUTO REGISTER TOKEN - When token is generated
  const autoRegisterToken = async (): Promise<void> => {
    try {
      if (!expoPushToken) {
        console.log("⚠️ No token available to register");
        return;
      }

      console.log("🔄 Auto-registering token to database...");
      
      // ✅ registerDeviceToken returns boolean now
      const success = await registerDeviceToken(expoPushToken, Platform.OS);
      
      if (success) {
        setIsTokenRegistered(true);
        console.log("✅ Token auto-registered successfully!");
      } else {
        console.log("⚠️ Token auto-registration failed");
      }
    } catch (error) {
      console.error("❌ Auto registration error:", error);
    }
  };

  // ✅ MAIN INITIALIZATION - App boot වෙද්දී run වෙනවා
  const initializeApp = async (): Promise<void> => {
    try {
      console.log("🚀 App initializing...");
      
      // 1️⃣ Setup push notifications FIRST
      await setupPushNotifications();
      
      // 2️⃣ Then load user data
      await loadUserFromStorage();
      
    } catch (e) {
      console.error("❌ App initialization error:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOAD USER - AsyncStorage එකෙන් user data load කරනවා
  const loadUserFromStorage = async (): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem("@user_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setIsAuth(true);
        console.log("✅ User loaded from storage:", parsed.user?.email);

        // User ඉන්නවා නම් token register කරන්න try කරනවා
        const token = await AsyncStorage.getItem("@expo_push_token");
        if (token) {
          console.log("📤 Re-registering token for existing user...");
          const success = await registerDeviceToken(token, Platform.OS);
          if (success) {
            setIsTokenRegistered(true);
          }
        }
      } else {
        console.log("ℹ️ No user data in storage");
      }
    } catch (e) {
      console.error("❌ loadUserFromStorage error:", e);
    }
  };

  // ✅ SETUP PUSH NOTIFICATIONS - FCM token generate කරනවා
  const setupPushNotifications = async (): Promise<void> => {
    try {
      if (!Device.isDevice) {
        console.warn("⚠️ Push notifications need physical device");
        return;
      }

      console.log("🔔 Requesting notification permissions...");

      // Permission request කරනවා
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("⚠️ Notification permission denied");
        return;
      }

      console.log("✅ Notification permission granted");

      // FCM token generate කරනවා
      const tokenData = await Notifications.getDevicePushTokenAsync();
      const token = tokenData?.data;

      if (!token) {
        console.warn("⚠️ No FCM token generated");
        return;
      }

      console.log("🎯 FCM Token generated:", token.substring(0, 50) + "...");

      // Token save කරනවා state එකට සහ AsyncStorage එකට
      setExpoPushToken(token);
      await AsyncStorage.setItem("@expo_push_token", token);
      console.log("💾 Token saved to AsyncStorage");

      // ✅ Token auto-registration happens via useEffect monitoring expoPushToken

      // Android notification channel setup
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
        console.log("✅ Android notification channel configured");
      }

    } catch (err: any) {
      console.error("❌ setupPushNotifications error:", err.message || err);
    }
  };

  // ✅ MANUAL REGISTER - Debug screen එකෙන් manually register කරන්න
  const registerPushToken = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("@expo_push_token");
      if (!token) {
        console.warn("⚠️ No token found to register");
        return;
      }

      console.log("📤 Manually registering token...");
      const success = await registerDeviceToken(token, Platform.OS);
      
      if (success) {
        setIsTokenRegistered(true);
        console.log("✅ Manual registration successful");
      } else {
        console.error("❌ Manual registration failed");
      }
    } catch (error) {
      console.error("❌ registerPushToken error:", error);
      throw error;
    }
  };

  // ✅ LOGIN - User login වෙද්දී token re-register කරනවා
  const handleLogin = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      console.log("🔐 Logging in user:", email);
      
      const res = await apiLogin(email, password);
      setUser(res.user);
      setIsAuth(true);
      console.log("✅ Login successful");

      // Login වෙලා user ඉන්නවා නම් token එක backend එකට යවනවා
      const token = await AsyncStorage.getItem("@expo_push_token");
      if (token) {
        console.log("📤 Registering token after login...");
        const success = await registerDeviceToken(token, Platform.OS);
        if (success) {
          setIsTokenRegistered(true);
        }
      } else {
        console.warn("⚠️ No token found after login");
      }

      router.replace("/dashboard/home");
    } catch (err: any) {
      console.error("❌ Login failed:", err.message || err);
      await AsyncStorage.removeItem("@user_data");
      setUser(null);
      setIsAuth(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGOUT - User logout වෙද්දී cleanup කරනවා
  const handleLogout = async (): Promise<void> => {
    setLoading(true);
    try {
      console.log("🚪 Logging out...");
      await apiLogout();
    } finally {
      setUser(null);
      setIsAuth(false);
      setIsTokenRegistered(false);
      await AsyncStorage.removeItem("@user_data");
      // ⚠️ Token එක clear කරන්නේ නැහැ - app එක තවමත් installed
      console.log("✅ Logout complete");
      setLoading(false);
      router.replace("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: isAuth,
        login: handleLogin,
        logout: handleLogout,
        expoPushToken,
        registerPushToken,
        isTokenRegistered,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};