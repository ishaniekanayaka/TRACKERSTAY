// components/CalendarView.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import homeService from '../services/homeService';

interface RoomCategory {
  id: number;
  category: string;
  room_count: number;
  rooms?: number[];
}

interface CalendarBooking {
  bookingId: number;
  roomId: number;
  guestName: string;
  startDate: string;
  endDate: string;
  status: string;
  color: string;
}

interface CalendarViewProps {
  onClose: () => void;
}

const ROOM_COLORS = {
  'Standard': '#6B5B95',
  'Cabana': '#E67E22',
  'Triple': '#3498DB',
  'Deluxe Cozy': '#27AE60',
};

const STATUS_COLORS = {
  'Checkin': '#6B5B95',
  'Checkout': '#C9A965',
  'Confirmed': '#10B981',
  'Pending': '#F59E0B',
  'Repair': '#9CA3AF',
};

const CalendarView: React.FC<CalendarViewProps> = ({ onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysToShow] = useState(20);
  const [roomCategories, setRoomCategories] = useState<RoomCategory[]>([]);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate dates for calendar
  const dates = useMemo(() => {
    const dateArray = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      dateArray.push(date);
    }
    return dateArray;
  }, [currentDate, daysToShow]);

  // Load calendar data
  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const startDate = dates[0].toISOString().split('T')[0];
      const endDate = dates[dates.length - 1].toISOString().split('T')[0];
      
      // Load data for each day in range
      const allBookings: CalendarBooking[] = [];
      const categoriesMap = new Map<number, RoomCategory>();

      for (let i = 0; i < dates.length; i++) {
        const date = dates[i].toISOString().split('T')[0];
        const response = await homeService.getDailyBookingDetails(date);
        
        if (response && response.details) {
          // Process all booking types
          const allBookingData = [
            ...response.details.arrivals,
            ...response.details.departures,
            ...response.details.in_house,
            ...response.details.pending,
          ];

          allBookingData.forEach((booking: any) => {
            if (booking.booking_room_count) {
              booking.booking_room_count.forEach((roomCount: any) => {
                if (roomCount.room_count > 0 && roomCount.room_categories) {
                  const category = roomCount.room_categories;
                  
                  // Store room category
                  if (!categoriesMap.has(category.id)) {
                    categoriesMap.set(category.id, {
                      id: category.id,
                      category: category.category,
                      room_count: category.room_count,
                      rooms: Array.from({ length: category.room_count }, (_, idx) => 
                        category.id * 100 + idx + 1
                      ),
                    });
                  }

                  // Create calendar booking entries
                  const rooms = categoriesMap.get(category.id)?.rooms || [];
                  for (let j = 0; j < roomCount.room_count && j < rooms.length; j++) {
                    allBookings.push({
                      bookingId: booking.id,
                      roomId: rooms[j],
                      guestName: `${booking.first_name} ${booking.last_name}`.trim(),
                      startDate: booking.checking_date,
                      endDate: booking.checkout_date,
                      status: booking.checking_status || booking.status,
                      color: STATUS_COLORS[booking.checking_status as keyof typeof STATUS_COLORS] || 
                             ROOM_COLORS[category.category as keyof typeof ROOM_COLORS] || '#6B5B95',
                    });
                  }
                }
              });
            }
          });
        }
      }

      setRoomCategories(Array.from(categoriesMap.values()));
      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      Alert.alert('Error', 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  // Check if a booking occupies a specific room on a specific date
  const getBookingForRoomAndDate = (roomId: number, date: Date): CalendarBooking | null => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.find(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const current = new Date(dateStr);
      
      return booking.roomId === roomId && 
             current >= start && 
             current < end;
    }) || null;
  };

  // Navigate to previous period
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - daysToShow);
    setCurrentDate(newDate);
  };

  // Navigate to next period
  const navigateNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + daysToShow);
    setCurrentDate(newDate);
  };

  // Navigate to today
  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B5B95" />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room Calendar</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Navigation Controls */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={navigatePrevious} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#6B5B95" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={navigateToday} style={styles.todayButton}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
        
        <Text style={styles.dateRangeText}>
          {dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
          {dates[dates.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
        
        <TouchableOpacity onPress={navigateNext} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#6B5B95" />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.horizontalScroll}
      >
        <View style={styles.calendarContainer}>
          {/* Header Row with Dates */}
          <View style={styles.headerRow}>
            <View style={[styles.roomHeaderCell, styles.stickyCell]}>
              <Text style={styles.roomHeaderText}>Room</Text>
            </View>
            {dates.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <View 
                  key={index} 
                  style={[styles.dateCell, isToday && styles.todayCell]}
                >
                  <Text style={[styles.dayText, isToday && styles.todayText]}>
                    {date.getDate()}
                  </Text>
                  <Text style={[styles.weekdayText, isToday && styles.todayText]}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Room Rows by Category */}
          <ScrollView style={styles.verticalScroll}>
            {roomCategories.map((category) => (
              <View key={category.id}>
                {/* Category Header */}
                <View style={styles.categoryHeaderRow}>
                  <View style={[styles.categoryHeaderCell, styles.stickyCell]}>
                    <View 
                      style={[
                        styles.categoryDot, 
                        { backgroundColor: ROOM_COLORS[category.category as keyof typeof ROOM_COLORS] || '#6B5B95' }
                      ]} 
                    />
                    <Text style={styles.categoryHeaderText}>{category.category}</Text>
                  </View>
                  {dates.map((_, idx) => (
                    <View key={idx} style={styles.emptyCategoryCell} />
                  ))}
                </View>

                {/* Room Rows */}
                {category.rooms?.map((roomId) => (
                  <View key={roomId} style={styles.roomRow}>
                    <View style={[styles.roomCell, styles.stickyCell]}>
                      <Ionicons name="bed-outline" size={16} color="#6B5B95" />
                      <Text style={styles.roomNumberText}>{roomId}</Text>
                    </View>
                    {dates.map((date, dateIdx) => {
                      const booking = getBookingForRoomAndDate(roomId, date);
                      const isFirstDay = booking && date.toISOString().split('T')[0] === booking.startDate;
                      
                      return (
                        <View 
                          key={dateIdx} 
                          style={[
                            styles.bookingCell,
                            booking && styles.bookedCell,
                          ]}
                        >
                          {booking && isFirstDay && (
                            <View 
                              style={[
                                styles.bookingBlock,
                                { backgroundColor: booking.color }
                              ]}
                            >
                              <Text 
                                style={styles.bookingText}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {booking.guestName}
                              </Text>
                            </View>
                          )}
                          {booking && !isFirstDay && (
                            <View 
                              style={[
                                styles.bookingContinuation,
                                { backgroundColor: booking.color }
                              ]} 
                            />
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Status Legend:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{status}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
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
    marginTop: 12,
    fontSize: 16,
    color: '#6B5B95',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    padding: 8,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6B5B95',
    borderRadius: 8,
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dateRangeText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 16,
  },
  horizontalScroll: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
  },
  verticalScroll: {
    maxHeight: 600,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  roomHeaderCell: {
    width: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    justifyContent: 'center',
  },
  stickyCell: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
  },
  roomHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  dateCell: {
    width: 80,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  todayCell: {
    backgroundColor: '#6B5B9515',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  weekdayText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  todayText: {
    color: '#6B5B95',
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryHeaderCell: {
    width: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  emptyCategoryCell: {
    width: 80,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  roomRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  roomCell: {
    width: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  bookingCell: {
    width: 80,
    minHeight: 48,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    position: 'relative',
  },
  bookedCell: {
    backgroundColor: '#F9FAFB',
  },
  bookingBlock: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 4,
    bottom: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  bookingContinuation: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 4,
    bottom: 4,
    opacity: 0.9,
  },
  bookingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  legendContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default CalendarView;