import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Button } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';

export default function DebugScreen() {
  const { expoPushToken, user } = useAuth();
  const [storedToken, setStoredToken] = useState<string | null>(null);

  useEffect(() => {
    loadStoredToken();
  }, []);

  const loadStoredToken = async () => {
    const token = await AsyncStorage.getItem('@expo_push_token');
    setStoredToken(token);
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Token copied to clipboard');
  };

  const testLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification 🔔',
        body: 'This is a test notification from debug screen!',
        sound: 'default',
      },
      trigger: { seconds: 1, repeats: false, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL }
,
    });
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Debug Information
      </Text>

      {/* Push Token Section */}
      <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Push Tokens</Text>
        
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontWeight: '600' }}>Expo Push Token:</Text>
          <Text selectable style={{ 
            backgroundColor: '#f0f0f0', 
            padding: 10, 
            borderRadius: 5, 
            marginTop: 5,
            fontFamily: 'monospace'
          }}>
            {expoPushToken || 'Not available'}
          </Text>
          {expoPushToken && (
            <Button 
              title="Copy Expo Token" 
              onPress={() => copyToClipboard(expoPushToken)} 
            />
          )}
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontWeight: '600' }}>Stored Token:</Text>
          <Text selectable style={{ 
            backgroundColor: '#f0f0f0', 
            padding: 10, 
            borderRadius: 5, 
            marginTop: 5,
            fontFamily: 'monospace'
          }}>
            {storedToken || 'Not available'}
          </Text>
          {storedToken && (
            <Button 
              title="Copy Stored Token" 
              onPress={() => copyToClipboard(storedToken)} 
            />
          )}
        </View>
      </View>

      {/* User Info Section */}
      <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>User Info</Text>
        <Text>Email: {user?.email || 'Not logged in'}</Text>
        <Text>Status: {user ? '✅ Logged In' : '❌ Logged Out'}</Text>
      </View>

      {/* Test Buttons */}
      <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Testing</Text>
        <View style={{ gap: 10 }}>
          <Button 
            title="📱 Test Local Notification" 
            onPress={testLocalNotification} 
          />
          <Button 
            title="🔄 Refresh Tokens" 
            onPress={loadStoredToken} 
          />
        </View>
      </View>

      {/* Instructions */}
      <View style={{ backgroundColor: '#e3f2fd', padding: 15, borderRadius: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>How to Test:</Text>
        <Text>1. Copy the Expo Push Token</Text>
        <Text>2. Run this command in terminal:</Text>
        <Text style={{ fontFamily: 'monospace', fontSize: 12, marginTop: 5 }}>
          npx expo-notifications-send --token "PASTE_TOKEN_HERE" --title "Test" --body "Hello World!"
        </Text>
      </View>
    </ScrollView>
  );
}