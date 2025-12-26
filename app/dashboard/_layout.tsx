import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotification } from "@/context/NotificationContext";

const DashboardLayout = () => {
  const COLORS = {
    background: "#fff",
    active: "#5D2F77",
    inactive: "#9CA3AF",
  };

  const { unseenCount } = useNotification();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={["bottom"]}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COLORS.active,
          tabBarInactiveTintColor: COLORS.inactive,
          headerShown: false,
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
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          tabBarIconStyle: {
            marginTop: 4,
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

        {/* Notifications */}
        <Tabs.Screen
          name="notifications"
          options={{
            title: "Notifications",
            tabBarBadge: unseenCount > 0 ? unseenCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: "#EF4444",
              color: "#FFFFFF",
              fontSize: 10,
              fontWeight: "700",
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              top: 2,
            },
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "notifications" : "notifications-outline"}
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



