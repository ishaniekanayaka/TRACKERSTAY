import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../config/apiConfig";

interface LoginResponse {
  token: string;
  token_type: string;
  user: any;
}

// LOGIN
export const login = async (
  email: string,
  password: string,
  device_name: string = "mobile"
): Promise<LoginResponse> => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);
  formData.append("device_name", device_name);

  const response = await api.post<LoginResponse>("/login", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!response.data?.token || !response.data?.user) {
    throw new Error("Invalid login response");
  }

  await AsyncStorage.setItem("@user_data", JSON.stringify(response.data));
  return response.data;
};

// REGISTER DEVICE TOKEN (non-blocking)
export const registerDeviceToken = async (
  deviceToken: string,
  deviceType: string = "android"
): Promise<boolean> => {
  if (!deviceToken) return false;

  try {
    await api.post("/user/device-token", {
      device_token: deviceToken,
      device_type: deviceType,
    });
    return true;
  } catch (error: any) {
    console.warn("Device token registration failed (non-critical):", 
      error.response?.data?.message || error.message
    );
    return false;
  }
};

// LOGOUT
export const logout = async (): Promise<void> => {
  try {
    await api.post("/logout");
  } catch (error) {
    console.warn("Logout API failed, continuing...", error);
  } finally {
    await AsyncStorage.removeItem("@user_data");
  }
};

// GET CURRENT USER
export const getCurrentUser = async (): Promise<any> => {
  try {
    const { data } = await api.get("/me");
    return data;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
};