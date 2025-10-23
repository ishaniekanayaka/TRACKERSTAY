import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, isAuthenticated } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState(false);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async (): Promise<void> => {
    try {
      console.log("🔄 Loading user from storage...");
      const storedData = await AsyncStorage.getItem('@user_data');
      
      if (storedData) {
        const userData = JSON.parse(storedData);
        console.log("📦 Stored data found:", userData);
        
        // Validate stored data structure
        if (userData && userData.user && userData.token) {
          setUser(userData.user);
          setAuthStatus(true);
          console.log("✅ User loaded successfully:", userData.user.email);
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
      
      // Navigate to dashboard
      router.replace('/dashboard/home');
      
    } catch (error: any) {
      console.error('❌ Login failed:', error.message);
      // Clear any partial data on login failure
      await AsyncStorage.removeItem('@user_data');
      setUser(null);
      setAuthStatus(false);
      throw error; // Re-throw to handle in UI
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
      // Continue with local cleanup even if API fails
    } finally {
      // Always clear local state
      setUser(null);
      setAuthStatus(false);
      await AsyncStorage.removeItem('@user_data');
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