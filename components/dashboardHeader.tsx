// components/DashboardHeader.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getCurrentUser } from '../services/authService';
import { logout } from '../services/authService';
import { useNotification } from '../context/NotificationContext';
import { NotificationItem } from '../types/notification';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

interface UserData {
  id: number;
  name: string;
  email: string;
  lname: string;
  status: string;
  role: string;
  hotel_chain_id: number;
  hotel_id: number;
  hotel: {
    id: number;
    hotel_name: string;
    hotel_chain_id: number;
  };
}

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onMenuPress?: () => void;
  showMenuButton?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle = 'Manage your bookings efficiently',
  onMenuPress,
  showMenuButton = false,
}) => {
  const router = useRouter();
  const {
    notifications,
    unseenCount,
    markAllAsSeen,
    clearNotifications,
    markAsSeen,
  } = useNotification();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const notificationDropdownAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: showUserDropdown ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showUserDropdown]);

  useEffect(() => {
    Animated.timing(notificationDropdownAnim, {
      toValue: showNotificationDropdown ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showNotificationDropdown]);

  const loadUserData = async () => {
    try {
      setLoadingUser(true);
      const response = await getCurrentUser();
      
      if (response && response.user) {
        const user = response.user;
        setUserData({
          id: user.id,
          name: user.name || 'User',
          email: user.email || 'user@example.com',
          lname: user.lname || '',
          status: user.status || 'Active',
          role: user.role || 'Admin',
          hotel_chain_id: user.hotel_chain_id,
          hotel_id: user.hotel_id,
          hotel: {
            id: user.hotel?.id || user.hotel_id,
            hotel_name: user.hotel?.hotel_name || 'Hotel Name',
            hotel_chain_id: user.hotel?.hotel_chain_id || user.hotel_chain_id,
          },
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
    setShowUserDropdown(false);
  };

  const handleMarkAllAsSeen = async () => {
    await markAllAsSeen();
  };

  const handleClearNotifications = async () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearNotifications();
            setShowNotificationDropdown(false);
          },
        },
      ]
    );
  };

  const handleNotificationItemPress = async (notification: NotificationItem) => {
    await markAsSeen(notification.id);
    setShowNotificationDropdown(false);
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const dropdownScale = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const dropdownTranslateY = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  const notificationScale = notificationDropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const notificationTranslateY = notificationDropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  return (
    <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View style={styles.welcomeContainer}>
            {showMenuButton && IS_MOBILE && (
              <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
                <Ionicons name="menu" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <View style={styles.textContainer}>
              <Text style={styles.welcomeText}>{title}</Text>
              {subtitle && <Text style={styles.welcomeSubtext}>{subtitle}</Text>}
            </View>
          </View>

          <View style={styles.headerActions}>
            {/* Notification Icon */}
            <TouchableOpacity
              onPress={handleNotificationPress}
              style={styles.notificationButton}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              {unseenCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unseenCount > 99 ? '99+' : unseenCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* User Profile Button */}
            <TouchableOpacity
              onPress={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotificationDropdown(false);
              }}
              style={styles.userProfileButton}
              activeOpacity={0.8}
            >
              <View style={styles.userAvatarContainer}>
                {loadingUser ? (
                  <ActivityIndicator size="small" color="#6B5B95" />
                ) : (
                  <Text style={styles.userAvatarText}>
                    {userData ? getInitials(userData.name || 'U') : 'U'}
                  </Text>
                )}
              </View>
              <Ionicons
                name={showUserDropdown ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#FFFFFF"
                style={styles.dropdownIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Notification Dropdown */}
      {showNotificationDropdown && (
        <Animated.View
          style={[
            styles.notificationDropdown,
            {
              opacity: notificationDropdownAnim,
              transform: [
                { scale: notificationScale },
                { translateY: notificationTranslateY },
              ],
            },
          ]}
        >
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>Notifications</Text>
            <View style={styles.notificationActions}>
              {unseenCount > 0 && (
                <TouchableOpacity
                  onPress={handleMarkAllAsSeen}
                  style={styles.notificationActionButton}
                >
                  <Ionicons name="checkmark-done-outline" size={18} color="#6B5B95" />
                  <Text style={styles.notificationActionText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              {notifications.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearNotifications}
                  style={styles.notificationActionButton}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text style={[styles.notificationActionText, { color: '#EF4444' }]}>
                    Clear all
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.notificationList} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.noNotificationsContainer}>
                <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
                <Text style={styles.noNotificationsText}>No notifications</Text>
                <Text style={styles.noNotificationsSubtext}>You're all caught up!</Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  onPress={() => handleNotificationItemPress(notification)}
                  style={[
                    styles.notificationItem,
                    !notification.seen && styles.unseenNotificationItem,
                  ]}
                >
                  <View style={styles.notificationItemHeader}>
                    <Text
                      style={[
                        styles.notificationItemTitle,
                        !notification.seen && styles.unseenNotificationTitle,
                      ]}
                    >
                      {notification.title}
                    </Text>
                    {!notification.seen && <View style={styles.unseenDot} />}
                  </View>
                  <Text style={styles.notificationItemBody} numberOfLines={2}>
                    {notification.body}
                  </Text>
                  <Text style={styles.notificationItemTime}>
                    {formatNotificationTime(notification.date)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* User Dropdown */}
      {showUserDropdown && userData && (
        <Animated.View
          style={[
            styles.userDropdown,
            {
              opacity: dropdownAnim,
              transform: [{ scale: dropdownScale }, { translateY: dropdownTranslateY }],
            },
          ]}
        >
          <View style={styles.dropdownHeader}>
            <View style={styles.dropdownAvatarLarge}>
              <Text style={styles.dropdownAvatarText}>
                {getInitials(userData.name || 'U')}
              </Text>
            </View>
            <View style={styles.dropdownUserInfo}>
              <Text style={styles.dropdownUserName}>
                {userData.name} {userData.lname}
              </Text>
              <Text style={styles.dropdownHotelName}>{userData.hotel.hotel_name}</Text>
            </View>
          </View>

          <View style={styles.dropdownDivider} />

          <View style={styles.dropdownItem}>
            <Ionicons name="mail-outline" size={18} color="#6B5B95" />
            <Text style={styles.dropdownItemText}>{userData.email}</Text>
          </View>

          <View style={styles.dropdownDivider} />

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.dropdownLogoutButton}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.dropdownLogoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  headerContent: {
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    padding: 4,
  },
  textContainer: {
    flex: 1,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeSubtext: {
    color: '#E9D5FF',
    fontSize: 15,
    fontWeight: '400',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6B5B95',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  userProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  userAvatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#6B5B95',
    fontSize: 15,
    fontWeight: '700',
  },
  dropdownIcon: {
    marginLeft: 4,
  },
  notificationDropdown: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 350,
    maxHeight: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  notificationActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B5B95',
  },
  notificationList: {
    maxHeight: 300,
  },
  noNotificationsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noNotificationsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  noNotificationsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unseenNotificationItem: {
    backgroundColor: '#F0F4FF',
  },
  notificationItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  unseenNotificationTitle: {
    color: '#1F2937',
    fontWeight: '700',
  },
  unseenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6B5B95',
  },
  notificationItemBody: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationItemTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  userDropdown: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  dropdownAvatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6B5B95',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  dropdownUserInfo: {
    flex: 1,
  },
  dropdownUserName: {
    color: '#1F2937',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  dropdownHotelName: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  dropdownItemText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  dropdownLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dropdownLogoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default DashboardHeader;