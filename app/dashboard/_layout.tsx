
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNotification } from "@/context/NotificationContext";

const DashboardLayout = () => {
  const COLORS = {
    background: "#fff",
    active: "#5D2F77",
    inactive: "#9CA3AF",
    badge: "#ef4444",
  };

  const { unseenCount } = useNotification();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      edges={["bottom"]}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.active,
          tabBarInactiveTintColor: COLORS.inactive,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: -4,
          },
          tabBarStyle: {
            backgroundColor: COLORS.background,
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
          },
        }}
      >
        {/* Home */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                color={color}
                size={26}
              />
            ),
          }}
        />

        {/* Bookings */}
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "calendar" : "calendar-outline"}
                color={color}
                size={26}
              />
            ),
          }}
        />

        {/* Utility */}
        <Tabs.Screen
          name="utility"
          options={{
            title: "Utility",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                color={color}
                size={26}
              />
            ),
          }}
        />

    
      </Tabs>
    </SafeAreaView>
  );
};

export default DashboardLayout;
