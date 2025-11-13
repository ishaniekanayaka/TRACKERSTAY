import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, Button, Platform, ActivityIndicator } from "react-native";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as Notifications from "expo-notifications";
import api from "@/config/apiConfig";

export default function DebugScreen() {
  const { expoPushToken, user, registerPushToken, isTokenRegistered } = useAuth();
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [backendResponse, setBackendResponse] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isTestingBackend, setIsTestingBackend] = useState(false);

  useEffect(() => {
    loadStoredToken();
  }, []);

  const loadStoredToken = async () => {
    const token = await AsyncStorage.getItem("@expo_push_token");
    setStoredToken(token);
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied!", "Token copied to clipboard");
  };

  const testLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification 🔔",
        body: "This is a test notification from Debug Screen!",
        sound: "default",
      },
      trigger: null,
    });
  };

  const manuallyRegisterToken = async () => {
    if (!storedToken) {
      Alert.alert("No Token", "No FCM token found in storage");
      return;
    }

    try {
      setIsRegistering(true);
      console.log("📡 Manually registering token via context...");
      await registerPushToken();
      Alert.alert("✅ Success", "Token registration completed!");
    } catch (error: any) {
      console.error("❌ registerPushToken() error:", error);
      Alert.alert("Error", `Failed to register token: ${error.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const testBackendConnection = async () => {
    const finalToken = storedToken || expoPushToken;

    if (!finalToken) {
      Alert.alert("No FCM Token", "Please ensure you have a valid FCM token first.");
      return;
    }

    const url = "/user/device-token";
    console.log("🚀 Testing backend POST:", url);

    try {
      setIsTestingBackend(true);
      const res = await api.post(
        url,
        {
          device_token: finalToken,
          device_type: Platform.OS === "ios" ? "ios" : "android",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("✅ Backend response:", res.data);
      setBackendResponse(JSON.stringify(res.data, null, 2));
      Alert.alert("✅ Success", "Backend connection working!");
    } catch (err: any) {
      console.error("❌ Backend test failed:", err.response?.data || err.message);
      const details = `
Method: POST
URL: ${url}
Status: ${err.response?.status || "Unknown"}
Error: ${err.message}
Data: ${JSON.stringify(err.response?.data || {}, null, 2)}
`;
      setBackendResponse(details);
      Alert.alert("Error", "Backend test failed — check console");
    } finally {
      setIsTestingBackend(false);
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.removeItem("@expo_push_token");
      await AsyncStorage.removeItem("@user_data");
      setStoredToken(null);
      setBackendResponse("");
      Alert.alert("Cleared", "All local data cleared. Restart app to test fresh installation.");
    } catch (error) {
      Alert.alert("Error", "Failed to clear data");
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#f5f5f5" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
        FCM Token Debug
      </Text>

      {/* Token Info */}
      <View style={{ backgroundColor: "white", padding: 15, borderRadius: 10, marginBottom: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>FCM Token Status</Text>

        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontWeight: "600" }}>Auto Registration Status:</Text>
          <Text style={{ color: isTokenRegistered ? "green" : "red", fontWeight: "bold" }}>
            {isTokenRegistered ? "✅ REGISTERED" : "❌ NOT REGISTERED"}
          </Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontWeight: "600" }}>Context Token:</Text>
          <Text selectable style={{ backgroundColor: "#f0f0f0", padding: 10, borderRadius: 5, marginTop: 5, fontSize: 10 }}>
            {expoPushToken || "Not available"}
          </Text>
          {expoPushToken && (
            <Button title="Copy Context Token" onPress={() => copyToClipboard(expoPushToken)} />
          )}
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontWeight: "600" }}>Stored Token:</Text>
          <Text selectable style={{ backgroundColor: "#f0f0f0", padding: 10, borderRadius: 5, marginTop: 5, fontSize: 10 }}>
            {storedToken || "Not available"}
          </Text>
          {storedToken && (
            <Button title="Copy Stored Token" onPress={() => copyToClipboard(storedToken)} />
          )}
        </View>
      </View>

      {/* User Info */}
      <View style={{ backgroundColor: "white", padding: 15, borderRadius: 10, marginBottom: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>User Info</Text>
        <Text>Email: {user?.email || "Not logged in"}</Text>
        <Text>Status: {user ? "✅ Logged In" : "❌ Logged Out"}</Text>
        <Text>Platform: {Platform.OS}</Text>
        <Text>User ID: {user?.id || "N/A"}</Text>
      </View>

      {/* Test Actions */}
      <View style={{ backgroundColor: "white", padding: 15, borderRadius: 10, marginBottom: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Test Actions</Text>
        <View style={{ gap: 10 }}>
          <Button title="📱 Test Local Notification" onPress={testLocalNotification} />
          <Button title="🔄 Refresh Token" onPress={loadStoredToken} />
          <Button
            title={isRegistering ? "Registering..." : "📤 Register Token"}
            onPress={manuallyRegisterToken}
            disabled={isRegistering}
          />
          <Button
            title={isTestingBackend ? "Testing..." : "🚀 Test Backend"}
            onPress={testBackendConnection}
            disabled={isTestingBackend}
          />
          <Button title="🗑️ Clear All Data" onPress={clearAllData} color="red" />
        </View>
      </View>

      {/* Backend Response */}
      {backendResponse ? (
        <View style={{ backgroundColor: "#fff3e0", padding: 15, borderRadius: 10, marginBottom: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5 }}>Backend Response:</Text>
          <Text selectable style={{ fontFamily: "monospace", fontSize: 12, backgroundColor: "#fafafa", padding: 10, borderRadius: 5 }}>
            {backendResponse}
          </Text>
        </View>
      ) : null}

      {/* Auto Registration Info */}
      <View style={{ backgroundColor: "#e8f5e8", padding: 15, borderRadius: 10, marginBottom: 15 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "green" }}>Auto Registration Status</Text>
        <Text>• App Install: {isTokenRegistered ? "✅ Token auto-saved" : "❌ Not saved"}</Text>
        <Text>• User Login: {user ? "✅ Will re-register" : "❌ Not logged in"}</Text>
        <Text>• Token Available: {storedToken ? "✅ Yes" : "❌ No"}</Text>
      </View>

      {/* Instructions */}
      <View style={{ backgroundColor: "#e3f2fd", padding: 15, borderRadius: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>How to Test Auto Registration:</Text>
        <Text>1️⃣ Clear data using "🗑️ Clear All Data" button</Text>
        <Text>2️⃣ Close and restart the app completely</Text>
        <Text>3️⃣ Check "Auto Registration Status" above</Text>
        <Text>4️⃣ If status is "✅ REGISTERED", token was auto-saved</Text>
        <Text>5️⃣ Check your database for the stored token</Text>
        <Text>6️⃣ Login to test re-registration</Text>
      </View>
    </ScrollView>
  );
}