import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../config/apiConfig";

interface LoginResponse {
  token: string;
  token_type: string;
  user: any;
}

// ✅ LOGIN FUNCTION
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

    const response = await api.post<LoginResponse>("/login", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!response.data?.token || !response.data?.user) {
      throw new Error("Invalid login response from server");
    }

    await AsyncStorage.setItem("@user_data", JSON.stringify(response.data));
    console.log("✅ User data saved to storage");
    return response.data;
  } catch (error: any) {
    console.error("❌ Login error:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error("Invalid email or password");
    }
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

// ✅ REGISTER DEVICE TOKEN - Backend එකට token එක save කරනවා
export const registerDeviceToken = async (
  deviceToken: string,
  deviceType: string = "android"
): Promise<boolean> => {
  try {
    if (!deviceToken) {
      console.error("❌ Device token is required");
      return false;
    }

    console.log("📡 Sending token to backend...");
    console.log("Token:", deviceToken.substring(0, 50) + "...");
    console.log("Device:", deviceType);

    const payload = {
      device_token: deviceToken,
      device_type: deviceType,
    };

    // ✅ CORRECT ENDPOINT: /user/device-token (singular)
    const res = await api.post("/user/device-token", payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    console.log("✅ Backend Response:", res.data);
    console.log("✅ Device token successfully registered to database!");
    return true;

  } catch (error: any) {
    // Error handling but don't throw - app should continue working
    const statusCode = error.response?.status;
    const errorData = error.response?.data;
    
    console.error("❌ Token registration failed:");
    console.error("Status:", statusCode);
    console.error("Error:", errorData?.message || error.message);
    console.error("Full error:", JSON.stringify(errorData, null, 2));
    
    // Network errors හෝ server errors නම් app එක crash වෙන්නේ නැහැ
    if (!error.response) {
      console.error("Network error - no response from server");
    } else if (statusCode === 401) {
      console.error("Unauthorized - user may need to login");
    } else if (statusCode >= 500) {
      console.error("Server error - backend issue");
    }
    
    console.warn("⚠️ App will continue without registered device token");
    return false;
  }
};

// ✅ LOGOUT FUNCTION
export const logout = async (): Promise<void> => {
  try {
    console.log("🚪 Calling logout API...");
    await api.post("/logout", {});
    console.log("✅ Logout API successful");
  } catch (error: any) {
    console.error("❌ Logout API error (continuing anyway):", 
      error.response?.data || error.message
    );
  } finally {
    // Always clear local storage
    await AsyncStorage.removeItem("@user_data");
    console.log("✅ User data cleared from storage");
    
    // Note: Token එක clear කරන්නේ නැහැ මෙතනින්
    // Token එක තවමත් device එකේ ඉන්නවා next login එකට
  }
};

// ✅ GET CURRENT USER
export const getCurrentUser = async (): Promise<any> => {
  try {
    const res = await api.get("/me");
    return res.data;
  } catch (error) {
    console.error("❌ Get current user error:", error);
    return null;
  }
};