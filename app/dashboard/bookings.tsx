// app/dashboard/bookings.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import homeService, { NotificationItem } from '../../services/homeService';

type FilterType = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'deleted';

const Bookings = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState<NotificationItem[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, activeFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await homeService.getNotifications();
      const sorted = data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setBookings(sorted);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;
    
    if (activeFilter !== 'all') {
      filtered = bookings.filter(booking => 
        booking.status.toLowerCase() === activeFilter.toLowerCase()
      );
    }
    
    setFilteredBookings(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      case 'deleted':
        return '#6B7280';
      default:
        return '#6B5B95';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      case 'deleted':
        return 'trash';
      default:
        return 'help-circle';
    }
  };

  const calculateNights = (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderBookingCard = ({ item }: { item: NotificationItem }) => {
    const nights = calculateNights(item.checkin_date, item.checkout_date);
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            'Booking Details',
            `Customer: ${item.customer_name}\nBooking ID: ${item.booking_id}\nPhone: ${item.customer_phone}\nEmail: ${item.customer_email}\nCheck-in: ${formatDate(item.checkin_date)}\nCheck-out: ${formatDate(item.checkout_date)}\nNights: ${nights}\nStatus: ${item.status.toUpperCase()}`,
            [{ text: 'OK' }]
          );
        }}
        activeOpacity={0.9}
      >
        <View style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <View style={styles.bookingInfo}>
              <Text style={styles.customerName}>{item.customer_name}</Text>
              <Text style={styles.bookingId}>#{item.booking_id}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}15` }
            ]}>
              <Ionicons 
                name={statusIcon as any} 
                size={16} 
                color={statusColor} 
              />
              <Text style={[
                styles.statusText,
                { color: statusColor }
              ]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{item.customer_phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{item.customer_email}</Text>
            </View>
          </View>

          <LinearGradient 
            colors={['#6B5B95', '#7D6BA8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dateRangeBanner}
          >
            <View style={styles.dateRangeItem}>
              <Text style={styles.dateRangeLabel}>Check-in</Text>
              <Text style={styles.dateRangeDate}>{formatDate(item.checkin_date)}</Text>
            </View>
            <View style={styles.nightsBadge}>
              <Text style={styles.nightsText}>{nights}</Text>
              <Text style={styles.nightsLabel}>NIGHTS</Text>
            </View>
            <View style={styles.dateRangeItem}>
              <Text style={styles.dateRangeLabel}>Check-out</Text>
              <Text style={styles.dateRangeDate}>{formatDate(item.checkout_date)}</Text>
            </View>
          </LinearGradient>

          <View style={styles.footer}>
            <View style={styles.timeInfo}>
              <Ionicons name="time-outline" size={14} color="#9CA3AF" />
              <Text style={styles.timeText}>
                Created: {formatDateTime(item.created_at)}
              </Text>
            </View>
            {item.updated_at !== item.created_at && (
              <Text style={styles.updatedText}>
                Updated
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filterButtons = [
    { key: 'all' as FilterType, label: 'All Bookings', icon: 'apps' },
    { key: 'confirmed' as FilterType, label: 'Confirmed', icon: 'checkmark-circle' },
    { key: 'pending' as FilterType, label: 'Pending', icon: 'time' },
    { key: 'cancelled' as FilterType, label: 'Cancelled', icon: 'close-circle' },
    { key: 'deleted' as FilterType, label: 'Deleted', icon: 'trash' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B5B95" />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - Same as Home Page */}
      <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Booking History</Text>
          <Text style={styles.headerSubtitle}>All booking activities and status changes</Text>
        </View>
      </LinearGradient>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {filterButtons.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[
                styles.filterButton,
                activeFilter === filter.key && styles.activeFilterButton
              ]}
            >
              <Ionicons 
                name={filter.icon as any} 
                size={16} 
                color={activeFilter === filter.key ? '#FFFFFF' : '#6B5B95'} 
              />
              <Text style={[
                styles.filterText,
                activeFilter === filter.key && styles.activeFilterText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.booking_id}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6B5B95"
            colors={['#6B5B95']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#6B5B95" />
            <Text style={styles.emptyText}>No Bookings Found</Text>
            <Text style={styles.emptySubtext}>
              {activeFilter === 'all' 
                ? 'No bookings available' 
                : `No ${activeFilter} bookings`
              }
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B5B95',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    gap: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#E9D5FF',
    fontSize: 14,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B5B95',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  customerName: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bookingId: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bookingDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  dateRangeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 14,
    marginVertical: 12,
  },
  dateRangeItem: {
    alignItems: 'center',
    flex: 1,
  },
  dateRangeLabel: {
    color: '#E9D5FF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  dateRangeDate: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
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
  nightsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  nightsLabel: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
  },
  updatedText: {
    color: '#6B5B95',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default Bookings;