
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  seen: boolean;
}

interface NotificationContextProps {
  notifications: NotificationItem[];
  unseenCount: number;
  markAllAsSeen: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  markAsSeen: (id: string) => Promise<void>;
}

const NotificationContext =
  createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);

  const updateUnseenCount = (list: NotificationItem[]) => {
    setUnseenCount(list.filter((n) => !n.seen).length);
  };

  const saveNotification = async (title: string, body: string) => {
    const newNotification: NotificationItem = {
      id: `${Date.now()}`,
      title,
      body,
      date: new Date().toISOString(),
      seen: false,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      AsyncStorage.setItem("@notification_list", JSON.stringify(updated));
      updateUnseenCount(updated);
      return updated;
    });
  };

  const loadStoredNotifications = async () => {
    const stored = await AsyncStorage.getItem("@notification_list");
    if (stored) {
      const list: NotificationItem[] = JSON.parse(stored);
      setNotifications(list);
      updateUnseenCount(list);
    }
  };

  useEffect(() => {
    loadStoredNotifications();

    // 1️⃣ App foreground
    const receivedListener =
      Notifications.addNotificationReceivedListener((notification) => {
        const title =
          notification.request.content.title ?? "No Title";
        const body =
          notification.request.content.body ?? "No Message";

        saveNotification(title, body);
      });

    // 2️⃣ App background → tap notification
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const title =
          response.notification.request.content.title ?? "No Title";
        const body =
          response.notification.request.content.body ?? "No Message";

        saveNotification(title, body);
      });

    // 3️⃣ 🔥 App killed → tap notification → app opens
    const checkKilledState = async () => {
      const lastResponse =
        await Notifications.getLastNotificationResponseAsync();

      if (lastResponse) {
        const title =
          lastResponse.notification.request.content.title ?? "No Title";
        const body =
          lastResponse.notification.request.content.body ?? "No Message";

        saveNotification(title, body);
      }
    };

    checkKilledState();

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }, []);

  const markAllAsSeen = async () => {
    const updated = notifications.map((n) => ({ ...n, seen: true }));
    setNotifications(updated);
    updateUnseenCount(updated);
    await AsyncStorage.setItem("@notification_list", JSON.stringify(updated));
  };

  const markAsSeen = async (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, seen: true } : n
    );
    setNotifications(updated);
    updateUnseenCount(updated);
    await AsyncStorage.setItem("@notification_list", JSON.stringify(updated));
  };

  const clearNotifications = async () => {
    setNotifications([]);
    setUnseenCount(0);
    await AsyncStorage.removeItem("@notification_list");
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unseenCount,
        markAllAsSeen,
        clearNotifications,
        markAsSeen,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotification must be inside NotificationProvider");
  return context;
};
