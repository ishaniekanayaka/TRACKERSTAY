
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  isAuthenticated, 
  registerDeviceToken 
} from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerPushToken: () => Promise<void>;
  expoPushToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: Platform.OS === 'ios',
    shouldShowList: Platform.OS === 'ios',
  }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    loadUserFromStorage();
    setupPushNotifications();
  }, []);

  const setupPushNotifications = async (): Promise<void> => {
    try {
      console.log('📱 Setting up push notifications...');
      
      // Check if running on a physical device
      if (!Device.isDevice) {
        console.log('⚠️ Push notifications not supported on emulators');
        return;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('⚠️ Push notification permission not granted');
        return;
      }

      console.log('✅ Push notification permission granted');

      // Get the Expo push token
      try {
        // const tokenData = await Notifications.getExpoPushTokenAsync({
        //   projectId: "090e95f8-5f76-4ece-a6ff-0ce737fef150" // FIXED: Consistent project ID
        // });
        
        // const token = tokenData.data;
        // console.log('📱 Expo Push Token:', token);
        
        // setExpoPushToken(token);
        // await AsyncStorage.setItem('@expo_push_token', token);

        // ✅ NEW: Use FCM Device Token for Development Build
        const tokenData = await Notifications.getDevicePushTokenAsync();
        const fcmToken = tokenData.data;
        console.log('🔥 FCM Device Token:', fcmToken);

        setExpoPushToken(fcmToken);
        await AsyncStorage.setItem('@expo_push_token', fcmToken);


        // Create notification channel for Android
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

      } catch (tokenError: any) {
        console.error('❌ Error getting push token:', tokenError.message);
      }
      
    } catch (error: any) {
      console.error('❌ Error setting up push notifications:', error.message);
    }
  };

  const registerPushToken = async (): Promise<void> => {
    try {
      let pushToken = expoPushToken;
      
      if (!pushToken) {
        pushToken = await AsyncStorage.getItem('@expo_push_token');
      }

      if (pushToken && authStatus) {
        console.log('📱 Registering push token with backend...');
        await registerDeviceToken(pushToken);
      } else {
        console.log('⚠️ No push token available for registration');
      }
    } catch (error: any) {
      console.error('❌ Error registering push token:', error.message);
    }
  };

  const loadUserFromStorage = async (): Promise<void> => {
    try {
      console.log("🔄 Loading user from storage...");
      const storedData = await AsyncStorage.getItem('@user_data');
      
      if (storedData) {
        const userData = JSON.parse(storedData);
        console.log("📦 Stored data found");
        
        // Validate stored data structure
        if (userData && userData.user && userData.token) {
          setUser(userData.user);
          setAuthStatus(true);
          console.log("✅ User loaded successfully:", userData.user.email);
          
          // Register device token after user is loaded
          setTimeout(() => {
            registerPushToken();
          }, 3000);
        } else {
          console.warn("⚠️ Invalid stored data structure, clearing...");
          await AsyncStorage.removeItem('@user_data');
          setUser(null);
          setAuthStatus(false);
        }
      } else {
        console.log("📭 No stored user data found");
        setUser(null);
        setAuthStatus(false);
      }
    } catch (error: any) {
      console.error('❌ Error loading user from storage:', error.message);
      // Clear corrupted data
      await AsyncStorage.removeItem('@user_data');
      setUser(null);
      setAuthStatus(false);
    } finally {
      setLoading(false);
      console.log("🏁 Auth loading complete");
    }
  };

  const handleLogin = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      console.log("🔐 Starting login process...");
      
      const userData = await apiLogin(email, password);
      
      // Update state with the new user data
      setUser(userData.user);
      setAuthStatus(true);
      
      console.log("✅ Login successful, user:", userData.user.email);
      
      // Wait a bit then register device token
      setTimeout(async () => {
        await registerPushToken();
      }, 2000);
      
      // Navigate to dashboard
      router.replace('/dashboard/home');
      
    } catch (error: any) {
      console.error('❌ Login failed:', error.message);
      // Clear any partial data on login failure
      await AsyncStorage.removeItem('@user_data');
      setUser(null);
      setAuthStatus(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log("🚪 Starting logout process...");
      
      await apiLogout();
      
    } catch (error: any) {
      console.error('❌ Logout API error:', error.message);
    } finally {
      // Always clear local state
      setUser(null);
      setAuthStatus(false);
      await AsyncStorage.removeItem('@user_data');
      await AsyncStorage.removeItem('@expo_push_token');
      setExpoPushToken(null);
      setLoading(false);
      
      console.log("✅ Logout complete, redirecting to login");
      router.replace('/login');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: authStatus,
    login: handleLogin,
    logout: handleLogout,
    registerPushToken,
    expoPushToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};