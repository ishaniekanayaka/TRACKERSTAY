// types/notification.ts
export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  seen: boolean;
}

export interface NotificationContextProps {
  notifications: NotificationItem[];
  unseenCount: number;
  markAllAsSeen: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  markAsSeen: (id: string) => Promise<void>;
}