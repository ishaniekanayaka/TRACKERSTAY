// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../config/apiConfig";

// interface LoginResponse {
//   token: string;
//   token_type: string;
//   user: any;
// }

// export const login = async (
//   email: string,
//   password: string,
//   device_name: string = "android-mobile"
// ): Promise<LoginResponse> => {
//   try {
//     const formData = new FormData();
//     formData.append("email", email);
//     formData.append("password", password);
//     formData.append("device_name", device_name);

//     console.log("🔐 Attempting login for:", email);
    
//     const response = await api.post<LoginResponse>("/login", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });

//     console.log("✅ Login response:", response.data);

//     // Validate response structure
//     if (!response.data) {
//       throw new Error("No response data received");
//     }

//     if (!response.data.token) {
//       throw new Error("No token received from server");
//     }

//     if (!response.data.user) {
//       throw new Error("No user data received from server");
//     }

//     // Store the complete response including token and user
//     await AsyncStorage.setItem("@user_data", JSON.stringify(response.data));
    
//     console.log("✅ User data stored successfully");
//     return response.data;

//   } catch (error: any) {
//     console.error("❌ Login error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status
//     });
    
//     // Create a more user-friendly error message
//     if (error.response?.status === 401) {
//       throw new Error("Invalid email or password");
//     } else if (error.response?.status >= 500) {
//       throw new Error("Server error. Please try again later.");
//     } else if (error.message.includes("Network Error")) {
//       throw new Error("Network error. Please check your connection.");
//     } else {
//       throw new Error(error.response?.data?.message || "Login failed. Please try again.");
//     }
//   }
// };

// export const logout = async (): Promise<void> => {
//   try {
//     const storedData = await AsyncStorage.getItem("@user_data");
//     if (!storedData) {
//       console.log("No user data found for logout");
//       return;
//     }

//     const parsedData = JSON.parse(storedData);
//     const token = parsedData?.token;

//     if (token) {
//       await api.post(
//         "/logout",
//         {},
//         { 
//           headers: { 
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json" 
//           } 
//         }
//       );
//       console.log("✅ Logout successful");
//     }

//   } catch (error: any) {
//     console.error("❌ Logout error:", {
//       message: error.message,
//       response: error.response?.data
//     });
//     // Even if logout API fails, clear local storage
//   } finally {
//     // Always clear local storage
//     await AsyncStorage.removeItem("@user_data");
//     console.log("✅ Local storage cleared");
//   }
// };

// export const getCurrentUser = async (): Promise<any> => {
//   try {
//     const response = await api.get("/me");
//     console.log("✅ Current user data:", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ User info error:", {
//       message: error.message,
//       response: error.response?.data
//     });
//     return null;
//   }
// };

// export const isAuthenticated = async (): Promise<boolean> => {
//   try {
//     const storedData = await AsyncStorage.getItem("@user_data");
//     if (!storedData) return false;

//     const parsedData = JSON.parse(storedData);
//     return !!(parsedData?.token && parsedData?.user);
//   } catch (error) {
//     console.error("Error checking authentication:", error);
//     return false;
//   }
// };

import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../config/apiConfig";
import * as Notifications from 'expo-notifications';

interface LoginResponse {
  token: string;
  token_type: string;
  user: any;
}

export const login = async (
  email: string,
  password: string,
  device_name: string = "android-mobile"
): Promise<LoginResponse> => {
  try {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("device_name", device_name);

    console.log("🔐 Attempting login for:", email);
    
    const response = await api.post<LoginResponse>("/login", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Login response:", response.data);

    // Validate response structure
    if (!response.data) {
      throw new Error("No response data received");
    }

    if (!response.data.token) {
      throw new Error("No token received from server");
    }

    if (!response.data.user) {
      throw new Error("No user data received from server");
    }

    // Store the complete response including token and user
    await AsyncStorage.setItem("@user_data", JSON.stringify(response.data));
    
    console.log("✅ User data stored successfully");
    return response.data;

  } catch (error: any) {
    console.error("❌ Login error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Create a more user-friendly error message
    if (error.response?.status === 401) {
      throw new Error("Invalid email or password");
    } else if (error.response?.status >= 500) {
      throw new Error("Server error. Please try again later.");
    } else if (error.message.includes("Network Error")) {
      throw new Error("Network error. Please check your connection.");
    } else {
      throw new Error(error.response?.data?.message || "Login failed. Please try again.");
    }
  }
};

export const registerDeviceToken = async (deviceToken: string): Promise<void> => {
  try {
    const storedData = await AsyncStorage.getItem("@user_data");
    if (!storedData) {
      throw new Error("No user data found");
    }

    const parsedData = JSON.parse(storedData);
    const token = parsedData?.token;

    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("📱 Registering device token:", deviceToken);
    
    const response = await api.post(
      "/user/device-token",
      {
        device_token: deviceToken,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Device token registered successfully:", response.data);
  } catch (error: any) {
    console.error("❌ Device token registration error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Don't throw error for device token registration failures
    // as it shouldn't block the main app functionality
    console.warn("⚠️ Device token registration failed, but continuing...");
  }
};

export const logout = async (): Promise<void> => {
  try {
    const storedData = await AsyncStorage.getItem("@user_data");
    if (!storedData) {
      console.log("No user data found for logout");
      return;
    }

    const parsedData = JSON.parse(storedData);
    const token = parsedData?.token;

    if (token) {
      await api.post(
        "/logout",
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json" 
          } 
        }
      );
      console.log("✅ Logout successful");
    }

  } catch (error: any) {
    console.error("❌ Logout error:", {
      message: error.message,
      response: error.response?.data
    });
    // Even if logout API fails, clear local storage
  } finally {
    // Always clear local storage
    await AsyncStorage.removeItem("@user_data");
    console.log("✅ Local storage cleared");
  }
};

export const getCurrentUser = async (): Promise<any> => {
  try {
    const response = await api.get("/me");
    console.log("✅ Current user data:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ User info error:", {
      message: error.message,
      response: error.response?.data
    });
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const storedData = await AsyncStorage.getItem("@user_data");
    if (!storedData) return false;

    const parsedData = JSON.parse(storedData);
    return !!(parsedData?.token && parsedData?.user);
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};