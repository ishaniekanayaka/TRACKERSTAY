import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Animated,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import homeService from '../../services/homeService';
import { logout, getCurrentUser } from '../../services/authService';
import { useNavigation } from '@react-navigation/native';
import { TabType, Booking, BookingData, PaymentInfo, StatusStyle } from './../../types/booking';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from "expo-router";
import { useNotification } from '@/context/NotificationContext';
import { NotificationItem } from './../../types/notification';


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

const Home = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { 
    notifications, 
    unseenCount, 
    markAllAsSeen, 
    clearNotifications, 
    markAsSeen 
  } = useNotification();
  
  const [activeTab, setActiveTab] = useState<TabType>('arrivals');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const detailsSlideAnim = useRef(new Animated.Value(0)).current;
  const detailsFadeAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const notificationDropdownAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadBookingDetails();
    loadUserData();
  }, [selectedDate]);

  useEffect(() => {
    if (showDetailsModal) {
      Animated.parallel([
        Animated.spring(detailsSlideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(detailsFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(detailsSlideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(detailsFadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showDetailsModal]);

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
      console.log('User API Response:', response);
      
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

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await homeService.getDailyBookingDetails(selectedDate);
      console.log('API Response:', response);
      
      if (response && response.details) {
        setBookingData(response);
      } else {
        Alert.alert('Error', 'Invalid response format');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/login");
            } catch (error) {
              Alert.alert("Error", "Failed to logout");
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookingDetails();
  };

  const getCurrentBookings = (): Booking[] => {
    if (!bookingData || !bookingData.details) return [];
    
    const bookings = bookingData.details[activeTab] || [];
    console.log(`${activeTab} bookings:`, bookings);
    return bookings;
  };

  const calculateNights = (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRoomInfo = (booking: Booking): string => {
    if (booking.booking_room_count && booking.booking_room_count.length > 0) {
      const roomNames = booking.booking_room_count
        .filter((room: any) => room.room_count > 0)
        .map((room: any) => {
          const roomType = room.room_categories?.room_type || room.room_categories?.category || 'Room';
          return `${roomType} (${room.room_count})`;
        });
      return roomNames.length > 0 ? roomNames.join(', ') : `${booking.room_count} Room${booking.room_count > 1 ? 's' : ''}`;
    }
    return `${booking.room_count} Room${booking.room_count > 1 ? 's' : ''}`;
  };

  const getPaymentInfo = (booking: Booking): PaymentInfo => {
    const total = booking.total_amount || 0;
    
    if (booking.reservation) {
      const advancePayment = parseFloat(booking.reservation.advance_payment || '0');
      const balance = parseFloat(booking.reservation.balance || '0');
      
      return {
        total: total.toFixed(2),
        paid: advancePayment.toFixed(2),
        balance: (total - advancePayment).toFixed(2),
      };
    }
    
    return {
      total: total.toFixed(2),
      paid: '0.00',
      balance: total.toFixed(2),
    };
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date.toISOString().split('T')[0]);
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
      "Clear Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
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
    // You can add additional logic here for navigating to specific screens
    // based on the notification content
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

  const renderStatCard = (
    icon: any,
    label: string,
    value: number,
    iconColor: string,
    tab: TabType
  ) => (
    <TouchableOpacity 
      onPress={() => setActiveTab(tab)}
      activeOpacity={0.7}
      style={s.statCardContainer}
    >
      <View style={[s.statCard, activeTab === tab && s.activeStatCard]}>
        <View style={[s.statIconContainer, { backgroundColor: iconColor }]}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>
        <View style={s.statTextContainer}>
          <Text style={s.statValue}>{value}</Text>
          <Text style={s.statLabel}>{label}</Text>
        </View>
        {activeTab === tab && (
          <View style={s.activeIndicator}>
            <View style={[s.activeDot, { backgroundColor: iconColor }]} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const getStatusStyle = (booking: Booking): StatusStyle => {
    const status = booking.checking_status || booking.status || '';
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'checkin':
      case 'checked-in':
      case 'checked in':
        return { backgroundColor: '#6B5B9515', borderColor: '#6B5B95', textColor: '#6B5B95' };
      case 'checkout':
      case 'checked-out':
      case 'checked out':
        return { backgroundColor: '#C9A96515', borderColor: '#C9A965', textColor: '#C9A965' };
      case 'confirmed':
        return { backgroundColor: '#10B98115', borderColor: '#10B981', textColor: '#10B981' };
      case 'pending':
        return { backgroundColor: '#F59E0B15', borderColor: '#F59E0B', textColor: '#F59E0B' };
      default:
        return { backgroundColor: '#EF444415', borderColor: '#EF4444', textColor: '#EF4444' };
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const statusStyle = getStatusStyle(item);
    const nights = calculateNights(item.checking_date, item.checkout_date);
    const roomInfo = getRoomInfo(item);
    const paymentInfo = getPaymentInfo(item);
    const guestName = `${item.first_name} ${item.last_name}`.trim();
    
    return (
      <TouchableOpacity 
        onPress={() => handleViewBooking(item)}
        activeOpacity={0.9}
      >
        <View style={s.bookingCard}>
          <View style={s.bookingHeader}>
            <View style={s.bookingHeaderLeft}>
              <Text style={s.bookingName}>{guestName}</Text>
              <View style={[s.statusBadge, { 
                backgroundColor: statusStyle.backgroundColor, 
                borderColor: statusStyle.borderColor 
              }]}>
                <Text style={[s.statusText, { color: statusStyle.textColor }]}>
                  {item.checking_status || item.status}
                </Text>
              </View>
            </View>
          </View>

          {item.booking_date && (
            <View style={s.bookingDateContainer}>
              <Ionicons name="calendar-outline" size={14} color="#6B5B95" />
              <Text style={s.bookingDateText}>
                Booking Date: {new Date(item.booking_date).toLocaleDateString()}
              </Text>
            </View>
          )}

          <LinearGradient 
            colors={['#6B5B95', '#7D6BA8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.dateRangeBanner}
          >
            <View style={s.dateRangeItem}>
              <Text style={s.dateRangeLabel}>Check-in</Text>
              <Text style={s.dateRangeDate}>{item.checking_date}</Text>
              <Text style={s.dateRangeTime}>{item.checking_time || '14:00'}</Text>
            </View>
            <View style={s.nightsBadge}>
              <Text style={s.nightsText}>{nights}</Text>
              <Text style={s.nightsLabel}>NIGHTS</Text>
            </View>
            <View style={s.dateRangeItem}>
              <Text style={s.dateRangeLabel}>Check-out</Text>
              <Text style={s.dateRangeDate}>{item.checkout_date}</Text>
              <Text style={s.dateRangeTime}>{item.checkout_time || '12:00'}</Text>
            </View>
          </LinearGradient>

          <View style={s.infoSection}>
            <View style={s.infoRow}>
              <View style={s.infoItemFull}>
                <Ionicons name="bed-outline" size={16} color="#6B5B95" />
                <Text style={s.infoText}>{roomInfo}</Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <View style={s.infoItem}>
                <Ionicons name="person-outline" size={16} color="#6B5B95" />
                <Text style={s.infoText}>{item.adults} Adults</Text>
              </View>
              <View style={s.infoItem}>
                <Ionicons name="person-outline" size={16} color="#C9A965" />
                <Text style={s.infoText}>{item.children} Children</Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <View style={s.infoItemFull}>
                <Ionicons name="restaurant-outline" size={16} color="#6B5B95" />
                <Text style={s.infoText}>{item.breakfast || 'No Meal'}</Text>
              </View>
            </View>
          </View>

          <View style={s.paymentContainer}>
            <View style={s.paymentRow}>
              <Text style={s.paymentLabel}>Total Amount</Text>
              <Text style={s.paymentValue}>LKR {paymentInfo.total}</Text>
            </View>
            <View style={s.paymentRow}>
              <Text style={[s.paymentLabel, { color: '#10B981' }]}>Paid</Text>
              <Text style={[s.paymentValue, { color: '#10B981' }]}>LKR {paymentInfo.paid}</Text>
            </View>
            <View style={[s.paymentRow, s.balanceRow]}>
              <Text style={[s.paymentLabel, { color: '#EF4444', fontWeight: '700' }]}>Balance Due</Text>
              <Text style={[s.paymentValue, { color: '#EF4444', fontWeight: '700' }]}>LKR {paymentInfo.balance}</Text>
            </View>
          </View>

          <View style={s.tapToViewContainer}>
            <Ionicons name="finger-print" size={16} color="#6B5B95" />
            <Text style={s.tapToViewText}>Tap to view full details</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailsModal = () => {
    if (!selectedBooking) return null;

    const statusStyle = getStatusStyle(selectedBooking);
    const nights = calculateNights(selectedBooking.checking_date, selectedBooking.checkout_date);
    const roomInfo = getRoomInfo(selectedBooking);
    const paymentInfo = getPaymentInfo(selectedBooking);
    const guestName = `${selectedBooking.first_name} ${selectedBooking.last_name}`.trim();
    
    const detailsSlideUpTranslate = detailsSlideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [600, 0],
    });

    return (
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <Animated.View style={[s.modalOverlay, { opacity: detailsFadeAnim }]}>
          <TouchableOpacity 
            style={s.modalBackground} 
            activeOpacity={1} 
            onPress={() => setShowDetailsModal(false)}
          />
          <Animated.View
            style={[
              s.detailsContainer,
              {
                transform: [{ translateY: detailsSlideUpTranslate }],
              },
            ]}
          >
            <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={s.detailsHeader}>
              <Text style={s.detailsTitle}>Booking Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Ionicons name="close-circle" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={s.detailsScroll}>
              <View style={s.detailsContent}>
                <View style={s.detailsSection}>
                  <Text style={s.detailsSectionTitle}>Guest Information</Text>
                  <View style={s.detailsRow}>
                    <Ionicons name="person" size={18} color="#6B5B95" />
                    <Text style={s.detailsLabel}>Name:</Text>
                    <Text style={s.detailsValue}>{guestName}</Text>
                  </View>
                  {selectedBooking.phone && (
                    <View style={s.detailsRow}>
                      <Ionicons name="call" size={18} color="#6B5B95" />
                      <Text style={s.detailsLabel}>Phone:</Text>
                      <Text style={s.detailsValue}>{selectedBooking.phone}</Text>
                    </View>
                  )}
                  {selectedBooking.email && (
                    <View style={s.detailsRow}>
                      <Ionicons name="mail" size={18} color="#6B5B95" />
                      <Text style={s.detailsLabel}>Email:</Text>
                      <Text style={s.detailsValue}>{selectedBooking.email}</Text>
                    </View>
                  )}
                  {selectedBooking.country && (
                    <View style={s.detailsRow}>
                      <Ionicons name="flag" size={18} color="#6B5B95" />
                      <Text style={s.detailsLabel}>Country:</Text>
                      <Text style={s.detailsValue}>{selectedBooking.country}</Text>
                    </View>
                  )}
                  {selectedBooking.passport && (
                    <View style={s.detailsRow}>
                      <Ionicons name="document-text" size={18} color="#6B5B95" />
                      <Text style={s.detailsLabel}>Passport:</Text>
                      <Text style={s.detailsValue}>{selectedBooking.passport}</Text>
                    </View>
                  )}
                </View>

                <View style={s.detailsSection}>
                  <Text style={s.detailsSectionTitle}>Booking Information</Text>
                  <View style={s.detailsRow}>
                    <Ionicons name="key" size={18} color="#6B5B95" />
                    <Text style={s.detailsLabel}>Booking ID:</Text>
                    <Text style={s.detailsValue}>#{selectedBooking.id}</Text>
                  </View>
                  <View style={s.detailsRow}>
                    <Ionicons name="calendar" size={18} color="#6B5B95" />
                    <Text style={s.detailsLabel}>Check-in:</Text>
                    <Text style={s.detailsValue}>{selectedBooking.checking_date} {selectedBooking.checking_time || '14:00'}</Text>
                  </View>
                  <View style={s.detailsRow}>
                    <Ionicons name="calendar" size={18} color="#6B5B95" />
                    <Text style={s.detailsLabel}>Check-out:</Text>
                    <Text style={s.detailsValue}>{selectedBooking.checkout_date} {selectedBooking.checkout_time || '12:00'}</Text>
                  </View>
                  <View style={s.detailsRow}>
                    <Ionicons name="moon" size={18} color="#6B5B95" />
                    <Text style={s.detailsLabel}>Nights:</Text>
                    <Text style={s.detailsValue}>{nights}</Text>
                  </View>
                  <View style={s.detailsRow}>
                    <Ionicons name="bed" size={18} color="#6B5B95" />
                    <Text style={s.detailsLabel}>Room Type:</Text>
                    <Text style={s.detailsValue}>{roomInfo}</Text>
                  </View>
                  <View style={s.detailsRow}>
                    <Ionicons name="people" size={18} color="#6B5B95" />
                    <Text style={s.detailsLabel}>Guests:</Text>
                    <Text style={s.detailsValue}>{selectedBooking.adults} Adults, {selectedBooking.children} Children</Text>
                  </View>
                  <View style={s.detailsRow}>
                    <Ionicons name="restaurant" size={18} color="#6B5B95" />
                    <Text style={s.detailsLabel}>Meal:</Text>
                    <Text style={s.detailsValue}>{selectedBooking.breakfast || 'No Meal'}</Text>
                  </View>
                  {selectedBooking.booking_method && (
                    <View style={s.detailsRow}>
                      <Ionicons name="briefcase" size={18} color="#6B5B95" />
                      <Text style={s.detailsLabel}>Method:</Text>
                      <Text style={s.detailsValue}>{selectedBooking.booking_method}</Text>
                    </View>
                  )}
                  <View style={s.detailsRow}>
                    <Ionicons name="information-circle" size={18} color="#6B5B95" />
                    <Text style={s.detailsLabel}>Status:</Text>
                    <View style={[s.statusBadge, { 
                      backgroundColor: statusStyle.backgroundColor, 
                      borderColor: statusStyle.borderColor,
                      marginLeft: 'auto'
                    }]}>
                      <Text style={[s.statusText, { color: statusStyle.textColor }]}>
                        {selectedBooking.checking_status || selectedBooking.status}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={s.detailsSection}>
                  <Text style={s.detailsSectionTitle}>Payment Information</Text>
                  <View style={s.detailsPaymentRow}>
                    <Text style={s.detailsPaymentLabel}>Total Amount:</Text>
                    <Text style={s.detailsPaymentValue}>LKR {paymentInfo.total}</Text>
                  </View>
                  <View style={s.detailsPaymentRow}>
                    <Text style={[s.detailsPaymentLabel, { color: '#10B981' }]}>Paid Amount:</Text>
                    <Text style={[s.detailsPaymentValue, { color: '#10B981' }]}>LKR {paymentInfo.paid}</Text>
                  </View>
                  <View style={[s.detailsPaymentRow, s.detailsPaymentRowHighlight]}>
                    <Text style={[s.detailsPaymentLabel, { color: '#EF4444', fontWeight: '700' }]}>Balance Due:</Text>
                    <Text style={[s.detailsPaymentValue, { color: '#EF4444', fontWeight: '700' }]}>LKR {paymentInfo.balance}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={s.detailsFooter}>
              <TouchableOpacity style={s.detailsActionButton}>
                <LinearGradient colors={['#C9A965', '#D4B87A']} style={s.detailsActionButtonGradient}>
                  <Ionicons name="print-outline" size={20} color="#FFFFFF" />
                  <Text style={s.detailsActionButtonText}>Print Invoice</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  const renderNotificationDropdown = () => {
    const notificationScale = notificationDropdownAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
    });

    const notificationTranslateY = notificationDropdownAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-10, 0],
    });

    return (
      <Animated.View 
        style={[
          s.notificationDropdown,
          {
            opacity: notificationDropdownAnim,
            transform: [
              { scale: notificationScale },
              { translateY: notificationTranslateY }
            ]
          }
        ]}
      >
        <View style={s.notificationHeader}>
          <Text style={s.notificationTitle}>Notifications</Text>
          <View style={s.notificationActions}>
            {unseenCount > 0 && (
              <TouchableOpacity 
                onPress={handleMarkAllAsSeen}
                style={s.notificationActionButton}
              >
                <Ionicons name="checkmark-done-outline" size={18} color="#6B5B95" />
                <Text style={s.notificationActionText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity 
                onPress={handleClearNotifications}
                style={s.notificationActionButton}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={[s.notificationActionText, { color: '#EF4444' }]}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={s.notificationList} showsVerticalScrollIndicator={false}>
          {notifications.length === 0 ? (
            <View style={s.noNotificationsContainer}>
              <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
              <Text style={s.noNotificationsText}>No notifications</Text>
              <Text style={s.noNotificationsSubtext}>You're all caught up!</Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationItemPress(notification)}
                style={[
                  s.notificationItem,
                  !notification.seen && s.unseenNotificationItem
                ]}
              >
                <View style={s.notificationItemHeader}>
                  <Text style={[
                    s.notificationItemTitle,
                    !notification.seen && s.unseenNotificationTitle
                  ]}>
                    {notification.title}
                  </Text>
                  {!notification.seen && (
                    <View style={s.unseenDot} />
                  )}
                </View>
                <Text style={s.notificationItemBody} numberOfLines={2}>
                  {notification.body}
                </Text>
                <Text style={s.notificationItemTime}>
                  {formatNotificationTime(notification.date)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Animated.View>
    );
  };

  const currentBookings = getCurrentBookings();

  const dropdownScale = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const dropdownTranslateY = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  return (
    <View style={s.container}>
      {/* Header with User Profile and Notifications */}
      <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={s.stickyHeader}>
        <View style={s.headerContent}>
          <View style={s.headerTop}>
            <View style={s.welcomeContainer}>
              <Text style={s.welcomeText}>Welcome Back</Text>
              <Text style={s.welcomeSubtext}>Manage your bookings efficiently</Text>
            </View>
            
            <View style={s.headerActions}>
              {/* Notification Icon */}
              <TouchableOpacity 
                onPress={handleNotificationPress}
                style={s.notificationButton}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                {unseenCount > 0 && (
                  <View style={s.notificationBadge}>
                    <Text style={s.notificationBadgeText}>
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
                style={s.userProfileButton}
                activeOpacity={0.8}
              >
                <View style={s.userAvatarContainer}>
                  {loadingUser ? (
                    <ActivityIndicator size="small" color="#6B5B95" />
                  ) : (
                    <Text style={s.userAvatarText}>
                      {userData ? getInitials(userData.name || 'U') : 'U'}
                    </Text>
                  )}
                </View>
                <Ionicons 
                  name={showUserDropdown ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#FFFFFF" 
                  style={s.dropdownIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notification Dropdown */}
        {showNotificationDropdown && renderNotificationDropdown()}

        {/* User Dropdown */}
        {showUserDropdown && userData && (
          <Animated.View 
            style={[
              s.userDropdown,
              {
                opacity: dropdownAnim,
                transform: [
                  { scale: dropdownScale },
                  { translateY: dropdownTranslateY }
                ]
              }
            ]}
          >
            <View style={s.dropdownHeader}>
              <View style={s.dropdownAvatarLarge}>
                <Text style={s.dropdownAvatarText}>
                  {getInitials(userData.name || 'U')}
                </Text>
              </View>
              <View style={s.dropdownUserInfo}>
                <Text style={s.dropdownUserName}>{userData.name} {userData.lname}</Text>
                <Text style={s.dropdownHotelName}>{userData.hotel.hotel_name}</Text>
              </View>
            </View>

            <View style={s.dropdownDivider} />

            <View style={s.dropdownItem}>
              <Ionicons name="mail-outline" size={18} color="#6B5B95" />
              <Text style={s.dropdownItemText}>{userData.email}</Text>
            </View>

            <View style={s.dropdownDivider} />

            <TouchableOpacity 
              onPress={handleLogout}
              style={s.dropdownLogoutButton}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={s.dropdownLogoutText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </LinearGradient>

      {/* Scrollable Content */}
      <View style={s.contentContainer}>
        {showDatePicker && (
          <DateTimePicker
            value={new Date(selectedDate)}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            style={s.datePicker}
          />
        )}
        
        {loading ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color="#6B5B95" />
            <Text style={s.loadingText}>Loading bookings...</Text>
          </View>
        ) : (
          <FlatList
            ListHeaderComponent={
              <>
                {/* Date Picker Section */}
                <View style={s.datePickerContainer}>
                  <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)}
                    style={s.datePickerButton}
                    activeOpacity={0.8}
                  >
                    <View style={s.datePickerGradient}>
                      <Ionicons name="calendar" size={20} color="#6B5B95" />
                      <Text style={s.datePickerText}>
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#6B5B95" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                {bookingData && bookingData.summary && (
                  <View style={s.statsContainer}>
                    <View style={s.statsGrid}>
                      {renderStatCard('log-in-outline', 'Arrivals', bookingData.summary.arrivals_count, '#6B5B95', 'arrivals')}
                      {renderStatCard('log-out-outline', 'Departures', bookingData.summary.departures_count, '#C9A965', 'departures')}
                      {renderStatCard('home-outline', 'In-House', bookingData.summary.in_house_count, '#8B7BA8', 'in_house')}
                      {renderStatCard('time-outline', 'All Active', bookingData.summary.pending_count, '#9C8AAD', 'pending')}
                    </View>
                  </View>
                )}

                {/* Current Tab Display */}
                <View style={s.currentTabContainer}>
                  <View style={s.currentTabBadge}>
                    <Ionicons 
                      name={
                        activeTab === 'arrivals' ? 'log-in-outline' :
                        activeTab === 'departures' ? 'log-out-outline' :
                        activeTab === 'in_house' ? 'home-outline' : 'time-outline'
                      } 
                      size={18} 
                      color="#6B5B95" 
                    />
                    <Text style={s.currentTabText}>
                      {activeTab === 'arrivals' ? 'Arrivals' :
                       activeTab === 'departures' ? 'Departures' :
                       activeTab === 'in_house' ? 'In-House Guests' : 'All Active Bookings'}
                    </Text>
                    <View style={s.currentTabCount}>
                      <Text style={s.currentTabCountText}>
                        {bookingData ? 
                          activeTab === 'arrivals' ? bookingData.summary.arrivals_count :
                          activeTab === 'departures' ? bookingData.summary.departures_count :
                          activeTab === 'in_house' ? bookingData.summary.in_house_count :
                          bookingData.summary.pending_count : 0
                        }
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            }
            data={currentBookings}
            keyExtractor={(item) => `${activeTab}-${item.id}`}
            renderItem={renderBookingCard}
            contentContainerStyle={s.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#6B5B95"
                colors={['#6B5B95']}
              />
            }
            ListEmptyComponent={
              <View style={s.emptyContainer}>
                <Ionicons name="calendar-outline" size={60} color="#6B5B95" />
                <Text style={s.emptyText}>No Bookings Found</Text>
                <Text style={s.emptySubtext}>
                  No {activeTab.replace('_', ' ')} for this date
                </Text>
              </View>
            }
            extraData={activeTab}
          />
        )}

        {renderDetailsModal()}
      </View>
    </View>
  );
};

export default Home;

const s = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  stickyHeader: { 
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  welcomeContainer: {
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
  contentContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // Date Picker Styles
  datePickerContainer: { paddingHorizontal: 16, marginVertical: 16 },
  datePickerButton: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  datePickerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  datePickerText: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
  datePicker: {
    backgroundColor: '#FFFFFF',
  },
  
  // Stats Grid Styles
  statsContainer: { paddingHorizontal: 16, marginBottom: 16 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCardContainer: {
    width: '48%',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 85,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeStatCard: {
    borderColor: '#6B5B95',
    shadowColor: '#6B5B95',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextContainer: { flex: 1 },
  statValue: { color: '#1F2937', fontSize: 22, fontWeight: '700' },
  statLabel: { color: '#6B7280', fontSize: 12, marginTop: 2, fontWeight: '500' },
  activeIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Current Tab Display
  currentTabContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  currentTabBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  currentTabText: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  currentTabCount: {
    backgroundColor: '#6B5B95',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  currentTabCountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  
  // Loading & Empty States
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#6B5B95', fontSize: 16, marginTop: 12, fontWeight: '600' },
  emptyContainer: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { color: '#1F2937', fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: '#6B7280', fontSize: 14, marginTop: 4 },
  listContainer: { paddingBottom: 80 },
  
  // Booking Card Styles
  bookingCard: { 
    marginHorizontal: 16,
    marginBottom: 16, 
    borderRadius: 16, 
    backgroundColor: '#FFFFFF',
    padding: 18,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 10, 
    elevation: 4 
  },
  bookingHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 10 
  },
  bookingHeaderLeft: { flex: 1 },
  bookingName: { color: '#1F2937', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  bookingDateContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    marginBottom: 12 
  },
  bookingDateText: { color: '#6B5B95', fontSize: 12, fontWeight: '500' },
  statusBadge: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: 8, 
    borderWidth: 1.5 
  },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  dateRangeBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderRadius: 12, 
    padding: 14, 
    marginVertical: 12,
  },
  dateRangeItem: { alignItems: 'center', flex: 1 },
  dateRangeLabel: { 
    color: '#E9D5FF', 
    fontSize: 10, 
    fontWeight: '600', 
    textTransform: 'uppercase', 
    marginBottom: 6 
  },
  dateRangeDate: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  dateRangeTime: { color: '#E9D5FF', fontSize: 11, marginTop: 3, fontWeight: '500' },
  nightsBadge: { 
    backgroundColor: 'rgba(255, 255, 255, 0.25)', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    alignItems: 'center', 
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  nightsText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  nightsLabel: { 
    color: '#FFFFFF', 
    fontSize: 9, 
    fontWeight: '600', 
    textTransform: 'uppercase', 
    marginTop: 2 
  },
  infoSection: { marginVertical: 12, gap: 8 },
  infoRow: { flexDirection: 'row', gap: 8 },
  infoItem: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#F9FAFB', 
    padding: 12, 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoItemFull: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#F9FAFB', 
    padding: 12, 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoText: { color: '#1F2937', fontSize: 13, fontWeight: '600', flex: 1 },
  paymentContainer: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 12, 
    padding: 14, 
    marginTop: 12, 
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  balanceRow: { 
    marginTop: 6, 
    paddingTop: 12, 
    borderTopWidth: 1.5, 
    borderTopColor: '#E5E7EB' 
  },
  paymentLabel: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  paymentValue: { color: '#1F2937', fontSize: 14, fontWeight: '700' },
  tapToViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: '#E5E7EB',
  },
  tapToViewText: {
    color: '#6B5B95',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'flex-end' 
  },
  modalBackground: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0 
  },
  detailsContainer: { 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    maxHeight: '90%',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 12, 
    elevation: 10 
  },
  detailsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 20, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24 
  },
  detailsTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  detailsScroll: { maxHeight: 500 },
  detailsContent: { padding: 24 },
  detailsSection: { 
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailsSectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#6B5B95', 
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E7EB',
  },
  detailsRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  detailsLabel: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#6B7280',
    width: 100,
  },
  detailsValue: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#1F2937',
    flex: 1,
  },
  detailsPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailsPaymentRowHighlight: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: '#E5E7EB',
  },
  detailsPaymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  detailsPaymentValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  detailsFooter: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  detailsActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#C9A965',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  detailsActionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  detailsActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});