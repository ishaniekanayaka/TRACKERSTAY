// // // app/booking-history/index.tsx
// // import React, { useState, useEffect, useRef } from 'react';
// // import {
// //   StyleSheet,
// //   Text,
// //   View,
// //   TouchableOpacity,
// //   FlatList,
// //   ActivityIndicator,
// //   Alert,
// //   RefreshControl,
// //   Modal,
// //   Animated,
// //   ScrollView,
// //   Dimensions,
// // } from 'react-native';
// // import { Ionicons } from '@expo/vector-icons';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// // import { useRouter } from 'expo-router';
// // import bookingHistoryService, {
// //   BookingHistoryItem,
// //   BookingHistoryResponse,
// // } from '../../services/bookingHistory';
// // import HeaderWithMenu from '../../components/HeaderWithMenu';

// // const { width } = Dimensions.get('window');

// // type EventType    = 'created' | 'updated' | 'deleted' | 'all';
// // type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// // interface StatusStyle {
// //   backgroundColor: string;
// //   borderColor: string;
// //   textColor: string;
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // const BookingHistory = () => {
// //   const router = useRouter();

// //   const [activeTab,          setActiveTab]          = useState<EventType>('all');
// //   const [fromDate,           setFromDate]           = useState(
// //     new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
// //   );
// //   const [toDate,             setToDate]             = useState(new Date().toISOString().split('T')[0]);
// //   const [showFromDatePicker, setShowFromDatePicker] = useState(false);
// //   const [showToDatePicker,   setShowToDatePicker]   = useState(false);
// //   const [historyData,        setHistoryData]        = useState<BookingHistoryResponse | null>(null);
// //   const [loading,            setLoading]            = useState(false);
// //   const [refreshing,         setRefreshing]         = useState(false);
// //   const [selectedBooking,    setSelectedBooking]    = useState<BookingHistoryItem | null>(null);
// //   const [showDetailsModal,   setShowDetailsModal]   = useState(false);

// //   const fadeAnim  = useRef(new Animated.Value(0)).current;
// //   const slideAnim = useRef(new Animated.Value(30)).current;

// //   useEffect(() => { loadBookingHistory(); }, [fromDate, toDate]);

// //   useEffect(() => {
// //     if (!loading) return;
// //     Animated.parallel([
// //       Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
// //       Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
// //     ]).start();
// //   }, [loading]);

// //   const loadBookingHistory = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await bookingHistoryService.getBookingHistory(fromDate, toDate);
// //       if (response?.history) {
// //         setHistoryData(response);
// //       } else {
// //         Alert.alert('Error', 'No history data available');
// //       }
// //     } catch (error) {
// //       console.error('Error loading booking history:', error);
// //       Alert.alert('Error', 'Failed to load booking history');
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   };

// //   const onRefresh = () => { setRefreshing(true); loadBookingHistory(); };

// //   const getCurrentBookings = (): BookingHistoryItem[] => {
// //     if (!historyData?.history) return [];
// //     if (activeTab === 'all') return historyData.history;
// //     return bookingHistoryService.filterByEventType(historyData.history, activeTab);
// //   };

// //   const calculateNights = (checkIn: string, checkOut: string): number => {
// //     const diff = Math.abs(new Date(checkOut).getTime() - new Date(checkIn).getTime());
// //     return Math.ceil(diff / (1000 * 60 * 60 * 24));
// //   };

// //   const getRoomInfo = (booking: BookingHistoryItem): string => {
// //     if (booking.room_counts?.length) {
// //       const names = booking.room_counts
// //         .filter((r) => r.room_count > 0)
// //         .map((r) => `${r.category_name} (${r.room_count})`);
// //       return names.length ? names.join(', ') : 'No room details';
// //     }
// //     return 'No room details';
// //   };

// //   const getEventInfo = (eventType: string) => {
// //     switch (eventType) {
// //       case 'created': return { icon: 'add-circle'     as IoniconsName, color: '#10B981', bg: '#D1FAE5' };
// //       case 'updated': return { icon: 'refresh-circle' as IoniconsName, color: '#F59E0B', bg: '#FEF3C7' };
// //       case 'deleted': return { icon: 'remove-circle'  as IoniconsName, color: '#EF4444', bg: '#FEE2E2' };
// //       default:        return { icon: 'document-text'  as IoniconsName, color: '#6B5B95', bg: '#E5E7EB' };
// //     }
// //   };

// //   const getStatusStyle = (status: string): StatusStyle => {
// //     switch (status.toLowerCase()) {
// //       case 'confirmed':                return { backgroundColor: '#D1FAE5', borderColor: '#10B981', textColor: '#065F46' };
// //       case 'pending':                  return { backgroundColor: '#FEF3C7', borderColor: '#F59E0B', textColor: '#92400E' };
// //       case 'cancelled': case 'canceled': return { backgroundColor: '#FEE2E2', borderColor: '#EF4444', textColor: '#991B1B' };
// //       case 'checkin': case 'checked-in': return { backgroundColor: '#E0E7FF', borderColor: '#6366F1', textColor: '#3730A3' };
// //       case 'checkout': case 'checked-out': return { backgroundColor: '#FCE7F3', borderColor: '#EC4899', textColor: '#9D174D' };
// //       default:                         return { backgroundColor: '#F3F4F6', borderColor: '#9CA3AF', textColor: '#374151' };
// //     }
// //   };

// //   const formatDate = (dateString: string) => {
// //     const date = new Date(dateString);
// //     const diffDays = Math.floor(Math.abs(Date.now() - date.getTime()) / 86400000);
// //     if (diffDays === 0) return 'Today';
// //     if (diffDays === 1) return 'Yesterday';
// //     if (diffDays < 7)  return `${diffDays} days ago`;
// //     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined });
// //   };

// //   // ── Summary counts ──────────────────────────────────────────────────────────
// //   const summary = historyData?.summary;
// //   const summaryItems = [
// //     {
// //       key:   'all'     as EventType,
// //       label: 'All Events',
// //       count: summary?.total_events   ?? 0,
// //       color: '#6B5B95',
// //       bg:    '#EDE9FE',
// //       icon:  'apps'                  as IoniconsName,
// //     },
// //     {
// //       key:   'created' as EventType,
// //       label: 'Created',
// //       count: summary?.created_count  ?? 0,
// //       color: '#10B981',
// //       bg:    '#D1FAE5',
// //       icon:  'add-circle-outline'    as IoniconsName,
// //     },
// //     {
// //       key:   'updated' as EventType,
// //       label: 'Modified',
// //       count: summary?.updated_count  ?? 0,
// //       color: '#F59E0B',
// //       bg:    '#FEF3C7',
// //       icon:  'refresh-circle-outline' as IoniconsName,
// //     },
// //     {
// //       key:   'deleted' as EventType,
// //       label: 'Cancelled',
// //       count: summary?.deleted_count  ?? 0,
// //       color: '#EF4444',
// //       bg:    '#FEE2E2',
// //       icon:  'remove-circle-outline' as IoniconsName,
// //     },
// //   ];

// //   // ── Notification list item ──────────────────────────────────────────────────
// //   const renderNotificationItem = ({ item }: { item: BookingHistoryItem }) => {
// //     const eventInfo   = getEventInfo(item.event_type);
// //     const statusStyle = getStatusStyle(item.status);
// //     const nights      = calculateNights(item.checkin_date, item.checkout_date);
// //     const timeAgo     = formatDate(item.timestamp);

// //     return (
// //       <TouchableOpacity
// //         onPress={() => { setSelectedBooking(item); setShowDetailsModal(true); }}
// //         activeOpacity={0.7}
// //         style={styles.notificationCard}
// //       >
// //         <View style={styles.notificationHeader}>
// //           <View style={[styles.eventIconContainer, { backgroundColor: eventInfo.bg }]}>
// //             <Ionicons name={eventInfo.icon} size={20} color={eventInfo.color} />
// //           </View>

// //           <View style={styles.notificationContent}>
// //             <View style={styles.notificationTitleRow}>
// //               <Text style={styles.notificationTitle}>
// //                 {item.event_type.charAt(0).toUpperCase() + item.event_type.slice(1)} Booking
// //               </Text>
// //               <Text style={styles.notificationTime}>{timeAgo}</Text>
// //             </View>

// //             <Text style={styles.notificationGuest}>{item.guest_name}</Text>

// //             <View style={styles.notificationMeta}>
// //               <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
// //                 <Text style={[styles.statusText, { color: statusStyle.textColor }]}>{item.status}</Text>
// //               </View>
// //               <View style={styles.separatorDot} />
// //               <View style={styles.dateInfo}>
// //                 <Ionicons name="calendar-outline" size={14} color="#6B7280" />
// //                 <Text style={styles.dateText}>
// //                   {item.checkin_date} • {nights} night{nights !== 1 ? 's' : ''}
// //                 </Text>
// //               </View>
// //             </View>

// //             <View style={styles.notificationFooter}>
// //               <View>
// //                 <Text style={styles.amountLabel}>Total</Text>
// //                 <Text style={styles.amountValue}>LKR {item.total_amount.toFixed(2)}</Text>
// //               </View>
// //               <View style={styles.bookingInfo}>
// //                 <Ionicons name="person-outline" size={14} color="#6B7280" />
// //                 <Text style={styles.bookingInfoText}>
// //                   {item.adults} Adult{item.adults !== 1 ? 's' : ''}, {item.children} Child{item.children !== 1 ? 'ren' : ''}
// //                 </Text>
// //               </View>
// //             </View>
// //           </View>

// //           <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
// //         </View>
// //       </TouchableOpacity>
// //     );
// //   };

// //   // ── Detail modal ────────────────────────────────────────────────────────────
// //   const renderDetailsModal = () => {
// //     if (!selectedBooking) return null;
// //     const eventInfo   = getEventInfo(selectedBooking.event_type);
// //     const statusStyle = getStatusStyle(selectedBooking.status);
// //     const nights      = calculateNights(selectedBooking.checkin_date, selectedBooking.checkout_date);

// //     const DetailRow = ({ label, value }: { label: string; value: string }) => (
// //       <View style={styles.detailRow}>
// //         <Text style={styles.detailLabel}>{label}</Text>
// //         <Text style={styles.detailValue}>{value}</Text>
// //       </View>
// //     );

// //     const DateBox = ({ label, date, time }: { label: string; date: string; time?: string }) => (
// //       <View style={styles.dateBox}>
// //         <Text style={styles.dateBoxLabel}>{label}</Text>
// //         <Text style={styles.dateBoxDate}>{date}</Text>
// //         <Text style={styles.dateBoxTime}>{time || '14:00'}</Text>
// //       </View>
// //     );

// //     const PaymentRow = ({ label, value, color, bold }: { label: string; value: number; color: string; bold?: boolean }) => (
// //       <View style={styles.paymentRow}>
// //         <Text style={[styles.paymentLabel, { color }]}>{label}</Text>
// //         <Text style={[styles.paymentValue, { color }, bold && styles.paymentValueBold]}>
// //           LKR {value.toFixed(2)}
// //         </Text>
// //       </View>
// //     );

// //     return (
// //       <Modal
// //         visible={showDetailsModal} 
// //         transparent
// //         animationType="fade"
// //         onRequestClose={() => setShowDetailsModal(false)}
// //       >
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.modalContainer}>
// //             {/* Header */}
// //             <View style={styles.modalHeader}>
// //               <View style={styles.modalTitleContainer}>
// //                 <View style={[styles.modalEventIcon, { backgroundColor: eventInfo.bg }]}>
// //                   <Ionicons name={eventInfo.icon} size={24} color={eventInfo.color} />
// //                 </View>
// //                 <View>
// //                   <Text style={styles.modalTitle}>Booking Details</Text>
// //                   <Text style={styles.modalSubtitle}>
// //                     {selectedBooking.event_type.charAt(0).toUpperCase() + selectedBooking.event_type.slice(1)} • {formatDate(selectedBooking.timestamp)}
// //                   </Text>
// //                 </View>
// //               </View>
// //               <TouchableOpacity onPress={() => setShowDetailsModal(false)} style={styles.closeButton}>
// //                 <Ionicons name="close" size={24} color="#6B7280" />
// //               </TouchableOpacity>
// //             </View>

// //             <ScrollView style={styles.modalScroll}>
// //               {/* Guest */}
// //               <View style={styles.detailSection}>
// //                 <View style={styles.sectionHeader}>
// //                   <Ionicons name="person-circle-outline" size={20} color="#6B5B95" />
// //                   <Text style={styles.sectionTitle}>Guest Information</Text>
// //                 </View>
// //                 <DetailRow label="Name" value={selectedBooking.guest_name} />
// //                 {selectedBooking.phone   && <DetailRow label="Phone"   value={selectedBooking.phone} />}
// //                 {selectedBooking.email   && <DetailRow label="Email"   value={selectedBooking.email} />}
// //                 {selectedBooking.country && <DetailRow label="Country" value={selectedBooking.country} />}
// //               </View>

// //               {/* Booking */}
// //               <View style={styles.detailSection}>
// //                 <View style={styles.sectionHeader}>
// //                   <Ionicons name="calendar-outline" size={20} color="#6B5B95" />
// //                   <Text style={styles.sectionTitle}>Booking Details</Text>
// //                 </View>
// //                 <View style={styles.dateRangeContainer}>
// //                   <DateBox label="Check-in"  date={selectedBooking.checkin_date}  time={selectedBooking.checkin_time} />
// //                   <View style={styles.nightsContainer}>
// //                     <Text style={styles.nightsNumber}>{nights}</Text>
// //                     <Text style={styles.nightsLabel}>nights</Text>
// //                   </View>
// //                   <DateBox label="Check-out" date={selectedBooking.checkout_date} time={selectedBooking.checkout_time} />
// //                 </View>
// //                 <DetailRow label="Booking ID"     value={`#${selectedBooking.booking_id}`} />
// //                 {selectedBooking.booking_code && <DetailRow label="Booking Code" value={selectedBooking.booking_code} />}
// //                 <DetailRow label="Rooms"          value={getRoomInfo(selectedBooking)} />
// //                 <DetailRow label="Guests"         value={`${selectedBooking.adults} Adults, ${selectedBooking.children} Children`} />
// //                 <DetailRow label="Booking Method" value={selectedBooking.booking_method} />
// //                 <DetailRow label="Source"         value={selectedBooking.source} />
// //                 <DetailRow label="Type"           value={selectedBooking.booking_type} />
// //                 <View style={styles.statusRow}>
// //                   <Text style={styles.detailLabel}>Status</Text>
// //                   <View style={[styles.statusBadgeLarge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
// //                     <Text style={[styles.statusTextLarge, { color: statusStyle.textColor }]}>
// //                       {selectedBooking.status}
// //                     </Text>
// //                   </View>
// //                 </View>
// //                 {selectedBooking.note && <DetailRow label="Note" value={selectedBooking.note} />}
// //               </View>

// //               {/* Payment */}
// //               <View style={styles.detailSection}>
// //                 <View style={styles.sectionHeader}>
// //                   <Ionicons name="cash-outline" size={20} color="#6B5B95" />
// //                   <Text style={styles.sectionTitle}>Payment Information</Text>
// //                 </View>
// //                 <PaymentRow label="Total Amount" value={selectedBooking.total_amount} color="#111827" bold />
// //                 {selectedBooking.advance_payment != null && <PaymentRow label="Advance Payment" value={selectedBooking.advance_payment} color="#10B981" />}
// //                 {selectedBooking.card_payment    != null && <PaymentRow label="Card Payment"    value={selectedBooking.card_payment}    color="#6366F1" />}
// //                 {selectedBooking.cash_payment    != null && <PaymentRow label="Cash Payment"    value={selectedBooking.cash_payment}    color="#F59E0B" />}
// //                 {selectedBooking.balance         != null && <PaymentRow label="Balance"         value={selectedBooking.balance}         color="#EF4444" bold />}
// //                 {selectedBooking.payment && (
// //                   <View style={styles.paymentStatusRow}>
// //                     <Text style={styles.detailLabel}>Payment Status</Text>
// //                     <Text style={styles.paymentStatusValue}>{selectedBooking.payment}</Text>
// //                   </View>
// //                 )}
// //               </View>

// //               {/* System */}
// //               <View style={styles.detailSection}>
// //                 <View style={styles.sectionHeader}>
// //                   <Ionicons name="information-circle-outline" size={20} color="#6B5B95" />
// //                   <Text style={styles.sectionTitle}>System Information</Text>
// //                 </View>
// //                 <DetailRow label="Event Type" value={selectedBooking.event_type} />
// //                 {selectedBooking.user_id != null && <DetailRow label="User ID" value={selectedBooking.user_id.toString()} />}
// //                 <DetailRow label="Timestamp"  value={new Date(selectedBooking.timestamp).toLocaleString()} />
// //               </View>
// //             </ScrollView>

// //             <View style={styles.modalFooter}>
// //               <TouchableOpacity style={styles.actionButton} onPress={() => setShowDetailsModal(false)}>
// //                 <Text style={styles.actionButtonText}>Close</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity style={[styles.actionButton, styles.printButton]} onPress={() => {}}>
// //                 <Ionicons name="print-outline" size={18} color="#FFFFFF" />
// //                 <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Print</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
// //     );
// //   };

// //   const currentBookings = getCurrentBookings();

// //   // ── Render ──────────────────────────────────────────────────────────────────
// //   return (
// //     <View style={styles.container}>
// //       <HeaderWithMenu
// //         title="Notification History"
// //         subtitle="Stay updated with recent alerts"
// //         currentPage=""
// //       />

// //       {/* Date Range Selector */}
// //       <View style={styles.dateSelector}>
// //         <TouchableOpacity style={styles.dateButton} onPress={() => setShowFromDatePicker(true)}>
// //           <Ionicons name="calendar" size={16} color="#6B5B95" />
// //           <View style={styles.dateButtonTextContainer}>
// //             <Text style={styles.dateButtonLabel}>From Date</Text>
// //             <Text style={styles.dateButtonValue}>
// //               {new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
// //             </Text>
// //           </View>
// //         </TouchableOpacity>

// //         <View style={styles.dateSeparator}>
// //           <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
// //         </View>

// //         <TouchableOpacity style={styles.dateButton} onPress={() => setShowToDatePicker(true)}>
// //           <Ionicons name="calendar" size={16} color="#6B5B95" />
// //           <View style={styles.dateButtonTextContainer}>
// //             <Text style={styles.dateButtonLabel}>To Date</Text>
// //             <Text style={styles.dateButtonValue}>
// //               {new Date(toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
// //             </Text>
// //           </View>
// //         </TouchableOpacity>

// //         <TouchableOpacity style={styles.refreshButton} onPress={loadBookingHistory}>
// //           <Ionicons name="refresh" size={20} color="#FFFFFF" />
// //         </TouchableOpacity>
// //       </View>

// //       {showFromDatePicker && (
// //         <DateTimePicker
// //           value={new Date(fromDate)}
// //           mode="date"
// //           display="default"
// //           onChange={(_, date) => { setShowFromDatePicker(false); if (date) setFromDate(date.toISOString().split('T')[0]); }}
// //         />
// //       )}
// //       {showToDatePicker && (
// //         <DateTimePicker
// //           value={new Date(toDate)}
// //           mode="date"
// //           display="default"
// //           onChange={(_, date) => { setShowToDatePicker(false); if (date) setToDate(date.toISOString().split('T')[0]); }}
// //         />
// //       )}

// //       {/* ── Housekeeping-style Summary Strip ── */}
// //       {historyData?.summary && (
// //         <View style={styles.summaryWrapper}>
// //           {/* Period label */}
// //           <View style={styles.summaryPeriodRow}>
// //             <Text style={styles.summaryPeriodTitle}>Notification Summary</Text>
// //             <Text style={styles.summaryPeriodLabel}>
// //               {new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
// //               {new Date(toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
// //             </Text>
// //           </View>

// //           {/* Strip */}
// //           <View style={styles.summaryCard}>
// //             {summaryItems.map((item, index) => {
// //               const isActive = activeTab === item.key;
// //               const isLast   = index === summaryItems.length - 1;
// //               return (
// //                 <React.Fragment key={item.key}>
// //                   <TouchableOpacity
// //                     style={[styles.summaryItem, isActive && { backgroundColor: item.bg }]}
// //                     onPress={() => setActiveTab(isActive ? 'all' : item.key)}
// //                     activeOpacity={0.7}
// //                   >
// //                     {/* Icon */}
// //                     <View style={[
// //                       styles.summaryIconWrap,
// //                       { backgroundColor: isActive ? item.color : item.bg },
// //                     ]}>
// //                       <Ionicons name={item.icon} size={15} color={isActive ? '#fff' : item.color} />
// //                     </View>

// //                     {/* Count */}
// //                     <Text style={[styles.summaryCount, { color: isActive ? item.color : '#111827' }]}>
// //                       {item.count}
// //                     </Text>

// //                     {/* Label */}
// //                     <Text style={[styles.summaryLabel, { color: isActive ? item.color : '#6B7280' }]}>
// //                       {item.label}
// //                     </Text>

// //                     {/* Active underline */}
// //                     {isActive && (
// //                       <View style={[styles.summaryActiveLine, { backgroundColor: item.color }]} />
// //                     )}
// //                   </TouchableOpacity>

// //                   {!isLast && <View style={styles.summaryDivider} />}
// //                 </React.Fragment>
// //               );
// //             })}
// //           </View>

// //           {/* Active filter pill */}
// //           {activeTab !== 'all' && (
// //             <View style={styles.activePillRow}>
// //               <View style={styles.activePill}>
// //                 <Ionicons name="funnel" size={12} color="#6B5B95" />
// //                 <Text style={styles.activePillText}>
// //                   {summaryItems.find((s) => s.key === activeTab)?.label} ({currentBookings.length})
// //                 </Text>
// //                 <TouchableOpacity
// //                   onPress={() => setActiveTab('all')}
// //                   hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
// //                 >
// //                   <Ionicons name="close-circle" size={15} color="#6B5B95" />
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           )}
// //         </View>
// //       )}

// //       {/* Notification list */}
// //       <FlatList
// //         data={currentBookings}
// //         keyExtractor={(item) => `${item.booking_id}-${item.timestamp}`}
// //         renderItem={renderNotificationItem}
// //         contentContainerStyle={styles.listContainer}
// //         refreshControl={
// //           <RefreshControl
// //             refreshing={refreshing}
// //             onRefresh={onRefresh}
// //             colors={['#6B5B95']}
// //             tintColor="#6B5B95"
// //           />
// //         }
// //         ListEmptyComponent={
// //           <Animated.View style={[styles.emptyState, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
// //             <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
// //             <Text style={styles.emptyTitle}>No Activities Found</Text>
// //             <Text style={styles.emptySubtitle}>
// //               {`No booking ${activeTab === 'all' ? 'activities' : activeTab} found for the selected period`}
// //             </Text>
// //             <TouchableOpacity style={styles.emptyButton} onPress={loadBookingHistory}>
// //               <Text style={styles.emptyButtonText}>Refresh</Text>
// //             </TouchableOpacity>
// //           </Animated.View>
// //         }
// //         ListHeaderComponent={
// //           loading ? (
// //             <View style={styles.loadingContainer}>
// //               <ActivityIndicator size="large" color="#6B5B95" />
// //               <Text style={styles.loadingText}>Loading activities...</Text>
// //             </View>
// //           ) : null
// //         }
// //       />

// //       {renderDetailsModal()}
// //     </View>
// //   );
// // };

// // export default BookingHistory;

// // // ─────────────────────────────────────────────────────────────────────────────
// // // STYLES
// // // ─────────────────────────────────────────────────────────────────────────────
// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F9FAFB' },

// //   // Date selector
// //   dateSelector: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingHorizontal: 16,
// //     paddingVertical: 12,
// //     backgroundColor: '#FFFFFF',
// //     marginHorizontal: 16,
// //     marginTop: 16,
// //     borderRadius: 12,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 1 },
// //     shadowOpacity: 0.05,
// //     shadowRadius: 3,
// //     elevation: 2,
// //   },
// //   dateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
// //   dateButtonTextContainer: { flex: 1 },
// //   dateButtonLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 2 },
// //   dateButtonValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
// //   dateSeparator: { marginHorizontal: 8 },
// //   refreshButton: {
// //     width: 44,
// //     height: 44,
// //     backgroundColor: '#6B5B95',
// //     borderRadius: 10,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginLeft: 8,
// //   },

// //   // ── Housekeeping-style summary strip ────────────────────────────────────────
// //   summaryWrapper: {
// //     paddingHorizontal: 16,
// //     paddingTop: 14,
// //     paddingBottom: 4,
// //   },
// //   summaryPeriodRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 10,
// //   },
// //   summaryPeriodTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
// //   summaryPeriodLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

// //   summaryCard: {
// //     flexDirection: 'row',
// //     backgroundColor: '#fff',
// //     borderRadius: 14,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.07,
// //     shadowRadius: 6,
// //     elevation: 3,
// //     overflow: 'hidden',
// //   },
// //   summaryItem: {
// //     flex: 1,
// //     alignItems: 'center',
// //     paddingVertical: 14,
// //     paddingHorizontal: 2,
// //     position: 'relative',
// //   },
// //   summaryIconWrap: {
// //     width: 32,
// //     height: 32,
// //     borderRadius: 9,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginBottom: 5,
// //   },
// //   summaryCount: { fontSize: 20, fontWeight: '800', lineHeight: 24 },
// //   summaryLabel: { fontSize: 10, fontWeight: '500', textAlign: 'center', marginTop: 3, lineHeight: 13 },
// //   summaryActiveLine: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: '15%',
// //     right: '15%',
// //     height: 3,
// //     borderTopLeftRadius: 3,
// //     borderTopRightRadius: 3,
// //   },
// //   summaryDivider: { width: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },

// //   // Active pill
// //   activePillRow: { paddingTop: 10 },
// //   activePill: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 5,
// //     alignSelf: 'flex-start',
// //     backgroundColor: '#EDE9FE',
// //     paddingHorizontal: 11,
// //     paddingVertical: 5,
// //     borderRadius: 20,
// //   },
// //   activePillText: { fontSize: 12, color: '#6B5B95', fontWeight: '600' },

// //   // Notification card
// //   notificationCard: {
// //     backgroundColor: '#FFFFFF',
// //     marginHorizontal: 16,
// //     marginBottom: 8,
// //     borderRadius: 12,
// //     padding: 16,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 1 },
// //     shadowOpacity: 0.05,
// //     shadowRadius: 3,
// //     elevation: 2,
// //   },
// //   notificationHeader:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
// //   eventIconContainer:   { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
// //   notificationContent:  { flex: 1 },
// //   notificationTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
// //   notificationTitle:    { fontSize: 15, fontWeight: '600', color: '#111827' },
// //   notificationTime:     { fontSize: 12, color: '#6B7280', fontWeight: '500' },
// //   notificationGuest:    { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
// //   notificationMeta:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
// //   statusBadge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
// //   statusText:           { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
// //   separatorDot:         { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' },
// //   dateInfo:             { flexDirection: 'row', alignItems: 'center', gap: 4 },
// //   dateText:             { fontSize: 12, color: '#6B7280', fontWeight: '500' },
// //   notificationFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
// //   amountLabel:          { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 2 },
// //   amountValue:          { fontSize: 15, fontWeight: '700', color: '#111827' },
// //   bookingInfo:          { flexDirection: 'row', alignItems: 'center', gap: 6 },
// //   bookingInfoText:      { fontSize: 13, color: '#6B7280', fontWeight: '500' },

// //   listContainer: { paddingTop: 8, paddingBottom: 24 },
// //   loadingContainer: { paddingVertical: 32, alignItems: 'center' },
// //   loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280', fontWeight: '500' },

// //   emptyState:    { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 48 },
// //   emptyTitle:    { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 8 },
// //   emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
// //   emptyButton:   { backgroundColor: '#6B5B95', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
// //   emptyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

// //   // Detail modal
// //   modalOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
// //   modalContainer:      { backgroundColor: '#FFFFFF', borderRadius: 16, width: '90%', maxHeight: '85%', overflow: 'hidden' },
// //   modalHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
// //   modalTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
// //   modalEventIcon:      { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
// //   modalTitle:          { fontSize: 18, fontWeight: '700', color: '#111827' },
// //   modalSubtitle:       { fontSize: 13, color: '#6B7280', marginTop: 2 },
// //   closeButton:         { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
// //   modalScroll:         { maxHeight: 500 },

// //   detailSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
// //   sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
// //   sectionTitle:  { fontSize: 16, fontWeight: '600', color: '#111827' },

// //   detailRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
// //   detailLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500', width: '40%' },
// //   detailValue: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },

// //   dateRangeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
// //   dateBox:      { flex: 1, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, alignItems: 'center' },
// //   dateBoxLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
// //   dateBoxDate:  { fontSize: 14, fontWeight: '600', color: '#111827' },
// //   dateBoxTime:  { fontSize: 12, color: '#6B7280', marginTop: 2 },

// //   nightsContainer: { alignItems: 'center', marginHorizontal: 16 },
// //   nightsNumber:    { fontSize: 24, fontWeight: '700', color: '#6B5B95' },
// //   nightsLabel:     { fontSize: 11, color: '#6B7280', fontWeight: '500', textTransform: 'uppercase', marginTop: 2 },

// //   statusRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
// //   statusBadgeLarge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5 },
// //   statusTextLarge: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },

// //   paymentRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
// //   paymentLabel:     { fontSize: 14, fontWeight: '500' },
// //   paymentValue:     { fontSize: 15, fontWeight: '600' },
// //   paymentValueBold: { fontWeight: '700' },
// //   paymentStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
// //   paymentStatusValue: { fontSize: 14, fontWeight: '600', color: '#111827' },

// //   modalFooter:     { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
// //   actionButton:    { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center' },
// //   printButton:     { backgroundColor: '#6B5B95', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
// //   actionButtonText: { fontSize: 15, fontWeight: '600', color: '#111827' },
// // });



// // app/booking-history/index.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
//   Modal,
//   Animated,
//   ScrollView,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useRouter } from 'expo-router';
// import bookingHistoryService, {
//   BookingHistoryItem,
//   BookingHistoryResponse,
// } from '../../services/bookingHistory';
// import HeaderWithMenu from '../../components/HeaderWithMenu';

// const { width } = Dimensions.get('window');

// type EventType    = 'created' | 'updated' | 'deleted' | 'all';
// type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// interface StatusStyle {
//   backgroundColor: string;
//   borderColor: string;
//   textColor: string;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// const BookingHistory = () => {
//   const router = useRouter();

//   const [activeTab,          setActiveTab]          = useState<EventType>('all');
//   const [fromDate,           setFromDate]           = useState(
//     new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//   );
//   const [toDate,             setToDate]             = useState(new Date().toISOString().split('T')[0]);
//   const [showFromDatePicker, setShowFromDatePicker] = useState(false);
//   const [showToDatePicker,   setShowToDatePicker]   = useState(false);
//   const [historyData,        setHistoryData]        = useState<BookingHistoryResponse | null>(null);
//   const [loading,            setLoading]            = useState(false);
//   const [refreshing,         setRefreshing]         = useState(false);
//   const [selectedBooking,    setSelectedBooking]    = useState<BookingHistoryItem | null>(null);
//   const [showDetailsModal,   setShowDetailsModal]   = useState(false);

//   const fadeAnim  = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(30)).current;

//   useEffect(() => { loadBookingHistory(); }, [fromDate, toDate]);

//   useEffect(() => {
//     if (!loading) return;
//     Animated.parallel([
//       Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
//       Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
//     ]).start();
//   }, [loading]);

//   const loadBookingHistory = async () => {
//     try {
//       setLoading(true);
//       const response = await bookingHistoryService.getBookingHistory(fromDate, toDate);
//       if (response?.history) {
//         setHistoryData(response);
//       } else {
//         Alert.alert('Error', 'No history data available');
//       }
//     } catch (error) {
//       console.error('Error loading booking history:', error);
//       Alert.alert('Error', 'Failed to load booking history');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => { setRefreshing(true); loadBookingHistory(); };

//   const getCurrentBookings = (): BookingHistoryItem[] => {
//     if (!historyData?.history) return [];
//     if (activeTab === 'all') return historyData.history;
//     return bookingHistoryService.filterByEventType(historyData.history, activeTab);
//   };

//   const calculateNights = (checkIn: string, checkOut: string): number => {
//     const diff = Math.abs(new Date(checkOut).getTime() - new Date(checkIn).getTime());
//     return Math.ceil(diff / (1000 * 60 * 60 * 24));
//   };

//   const getRoomInfo = (booking: BookingHistoryItem): string => {
//     if (booking.room_counts?.length) {
//       const names = booking.room_counts
//         .filter((r) => r.room_count > 0)
//         .map((r) => `${r.category_name} (${r.room_count})`);
//       return names.length ? names.join(', ') : 'No room details';
//     }
//     return 'No room details';
//   };

//   // ── "deleted" event type එකට label "Cancelled Booking" කියලා show කරනවා ──
//   const getEventLabel = (eventType: string): string => {
//     switch (eventType) {
//       case 'created':  return 'Created Booking';
//       case 'updated':  return 'Modified Booking';
//       case 'deleted':  return 'Cancelled Booking';   // ← CHANGED: "Deleted" → "Cancelled"
//       default:         return eventType.charAt(0).toUpperCase() + eventType.slice(1) + ' Booking';
//     }
//   };

//   const getEventInfo = (eventType: string) => {
//     switch (eventType) {
//       case 'created': return { icon: 'add-circle'        as IoniconsName, color: '#10B981', bg: '#D1FAE5' };
//       case 'updated': return { icon: 'refresh-circle'    as IoniconsName, color: '#F59E0B', bg: '#FEF3C7' };
//       case 'deleted': return { icon: 'close-circle'      as IoniconsName, color: '#EF4444', bg: '#FEE2E2' };  // ← cancel icon
//       default:        return { icon: 'document-text'     as IoniconsName, color: '#6B5B95', bg: '#E5E7EB' };
//     }
//   };

//   // ── Pending + deleted combo නම් "Cancelled" කියලා override කරනවා ──────────
//   const getDisplayStatus = (item: BookingHistoryItem): string => {
//     if (
//       item.event_type === 'deleted' &&
//       item.status.toLowerCase() === 'pending'
//     ) {
//       return 'Cancelled';   // ← AUTO OVERRIDE
//     }
//     return item.status;
//   };

//   const getStatusStyle = (status: string): StatusStyle => {
//     switch (status.toLowerCase()) {
//       case 'confirmed':                    return { backgroundColor: '#D1FAE5', borderColor: '#10B981', textColor: '#065F46' };
//       case 'pending':                      return { backgroundColor: '#FEF3C7', borderColor: '#F59E0B', textColor: '#92400E' };
//       case 'cancelled': case 'canceled':   return { backgroundColor: '#FEE2E2', borderColor: '#EF4444', textColor: '#991B1B' };
//       case 'checkin':   case 'checked-in': return { backgroundColor: '#E0E7FF', borderColor: '#6366F1', textColor: '#3730A3' };
//       case 'checkout':  case 'checked-out':return { backgroundColor: '#FCE7F3', borderColor: '#EC4899', textColor: '#9D174D' };
//       default:                             return { backgroundColor: '#F3F4F6', borderColor: '#9CA3AF', textColor: '#374151' };
//     }
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const diffDays = Math.floor(Math.abs(Date.now() - date.getTime()) / 86400000);
//     if (diffDays === 0) return 'Today';
//     if (diffDays === 1) return 'Yesterday';
//     if (diffDays < 7)  return `${diffDays} days ago`;
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined });
//   };

//   // ── Summary counts ──────────────────────────────────────────────────────────
//   const summary = historyData?.summary;
//   const summaryItems = [
//     {
//       key:   'all'     as EventType,
//       label: 'All Events',
//       count: summary?.total_events   ?? 0,
//       color: '#6B5B95',
//       bg:    '#EDE9FE',
//       icon:  'apps'                  as IoniconsName,
//     },
//     {
//       key:   'created' as EventType,
//       label: 'Created',
//       count: summary?.created_count  ?? 0,
//       color: '#10B981',
//       bg:    '#D1FAE5',
//       icon:  'add-circle-outline'    as IoniconsName,
//     },
//     {
//       key:   'updated' as EventType,
//       label: 'Modified',
//       count: summary?.updated_count  ?? 0,
//       color: '#F59E0B',
//       bg:    '#FEF3C7',
//       icon:  'refresh-circle-outline' as IoniconsName,
//     },
//     {
//       key:   'deleted' as EventType,
//       label: 'Cancelled',           // ← Already correct label in summary strip
//       count: summary?.deleted_count  ?? 0,
//       color: '#EF4444',
//       bg:    '#FEE2E2',
//       icon:  'close-circle-outline'  as IoniconsName,  // ← cancel icon
//     },
//   ];

//   // ── Notification list item ──────────────────────────────────────────────────
//   const renderNotificationItem = ({ item }: { item: BookingHistoryItem }) => {
//     const eventInfo     = getEventInfo(item.event_type);
//     const displayStatus = getDisplayStatus(item);           // ← use override helper
//     const statusStyle   = getStatusStyle(displayStatus);
//     const nights        = calculateNights(item.checkin_date, item.checkout_date);
//     const timeAgo       = formatDate(item.timestamp);

//     return (
//       <TouchableOpacity
//         onPress={() => { setSelectedBooking(item); setShowDetailsModal(true); }}
//         activeOpacity={0.7}
//         style={styles.notificationCard}
//       >
//         <View style={styles.notificationHeader}>
//           <View style={[styles.eventIconContainer, { backgroundColor: eventInfo.bg }]}>
//             <Ionicons name={eventInfo.icon} size={20} color={eventInfo.color} />
//           </View>

//           <View style={styles.notificationContent}>
//             <View style={styles.notificationTitleRow}>
//               {/* ← CHANGED: getEventLabel() use කරනවා "Deleted Booking" → "Cancelled Booking" */}
//               <Text style={styles.notificationTitle}>
//                 {getEventLabel(item.event_type)}
//               </Text>
//               <Text style={styles.notificationTime}>{timeAgo}</Text>
//             </View>

//             <Text style={styles.notificationGuest}>{item.guest_name}</Text>

//             <View style={styles.notificationMeta}>
//               <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
//                 {/* ← CHANGED: displayStatus use කරනවා (Pending → Cancelled for deleted events) */}
//                 <Text style={[styles.statusText, { color: statusStyle.textColor }]}>{displayStatus}</Text>
//               </View>
//               <View style={styles.separatorDot} />
//               <View style={styles.dateInfo}>
//                 <Ionicons name="calendar-outline" size={14} color="#6B7280" />
//                 <Text style={styles.dateText}>
//                   {item.checkin_date} • {nights} night{nights !== 1 ? 's' : ''}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.notificationFooter}>
//               <View>
//                 <Text style={styles.amountLabel}>Total</Text>
//                 <Text style={styles.amountValue}>LKR {item.total_amount.toFixed(2)}</Text>
//               </View>
//               <View style={styles.bookingInfo}>
//                 <Ionicons name="person-outline" size={14} color="#6B7280" />
//                 <Text style={styles.bookingInfoText}>
//                   {item.adults} Adult{item.adults !== 1 ? 's' : ''}, {item.children} Child{item.children !== 1 ? 'ren' : ''}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // ── Detail modal ────────────────────────────────────────────────────────────
//   const renderDetailsModal = () => {
//     if (!selectedBooking) return null;
//     const eventInfo     = getEventInfo(selectedBooking.event_type);
//     const displayStatus = getDisplayStatus(selectedBooking);  // ← use override helper
//     const statusStyle   = getStatusStyle(displayStatus);
//     const nights        = calculateNights(selectedBooking.checkin_date, selectedBooking.checkout_date);

//     const DetailRow = ({ label, value }: { label: string; value: string }) => (
//       <View style={styles.detailRow}>
//         <Text style={styles.detailLabel}>{label}</Text>
//         <Text style={styles.detailValue}>{value}</Text>
//       </View>
//     );

//     const DateBox = ({ label, date, time }: { label: string; date: string; time?: string }) => (
//       <View style={styles.dateBox}>
//         <Text style={styles.dateBoxLabel}>{label}</Text>
//         <Text style={styles.dateBoxDate}>{date}</Text>
//         <Text style={styles.dateBoxTime}>{time || '14:00'}</Text>
//       </View>
//     );

//     const PaymentRow = ({ label, value, color, bold }: { label: string; value: number; color: string; bold?: boolean }) => (
//       <View style={styles.paymentRow}>
//         <Text style={[styles.paymentLabel, { color }]}>{label}</Text>
//         <Text style={[styles.paymentValue, { color }, bold && styles.paymentValueBold]}>
//           LKR {value.toFixed(2)}
//         </Text>
//       </View>
//     );

//     return (
//       <Modal
//         visible={showDetailsModal}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowDetailsModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             {/* Header */}
//             <View style={styles.modalHeader}>
//               <View style={styles.modalTitleContainer}>
//                 <View style={[styles.modalEventIcon, { backgroundColor: eventInfo.bg }]}>
//                   <Ionicons name={eventInfo.icon} size={24} color={eventInfo.color} />
//                 </View>
//                 <View>
//                   <Text style={styles.modalTitle}>Booking Details</Text>
//                   {/* ← CHANGED: getEventLabel() use කරනවා modal subtitle එකේත් */}
//                   <Text style={styles.modalSubtitle}>
//                     {getEventLabel(selectedBooking.event_type)} • {formatDate(selectedBooking.timestamp)}
//                   </Text>
//                 </View>
//               </View>
//               <TouchableOpacity onPress={() => setShowDetailsModal(false)} style={styles.closeButton}>
//                 <Ionicons name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={styles.modalScroll}>
//               {/* Guest */}
//               <View style={styles.detailSection}>
//                 <View style={styles.sectionHeader}>
//                   <Ionicons name="person-circle-outline" size={20} color="#6B5B95" />
//                   <Text style={styles.sectionTitle}>Guest Information</Text>
//                 </View>
//                 <DetailRow label="Name" value={selectedBooking.guest_name} />
//                 {selectedBooking.phone   && <DetailRow label="Phone"   value={selectedBooking.phone} />}
//                 {selectedBooking.email   && <DetailRow label="Email"   value={selectedBooking.email} />}
//                 {selectedBooking.country && <DetailRow label="Country" value={selectedBooking.country} />}
//               </View>

//               {/* Booking */}
//               <View style={styles.detailSection}>
//                 <View style={styles.sectionHeader}>
//                   <Ionicons name="calendar-outline" size={20} color="#6B5B95" />
//                   <Text style={styles.sectionTitle}>Booking Details</Text>
//                 </View>
//                 <View style={styles.dateRangeContainer}>
//                   <DateBox label="Check-in"  date={selectedBooking.checkin_date}  time={selectedBooking.checkin_time} />
//                   <View style={styles.nightsContainer}>
//                     <Text style={styles.nightsNumber}>{nights}</Text>
//                     <Text style={styles.nightsLabel}>nights</Text>
//                   </View>
//                   <DateBox label="Check-out" date={selectedBooking.checkout_date} time={selectedBooking.checkout_time} />
//                 </View>
//                 <DetailRow label="Booking ID"     value={`#${selectedBooking.booking_id}`} />
//                 {selectedBooking.booking_code && <DetailRow label="Booking Code" value={selectedBooking.booking_code} />}
//                 <DetailRow label="Rooms"          value={getRoomInfo(selectedBooking)} />
//                 <DetailRow label="Guests"         value={`${selectedBooking.adults} Adults, ${selectedBooking.children} Children`} />
//                 <DetailRow label="Booking Method" value={selectedBooking.booking_method} />
//                 <DetailRow label="Source"         value={selectedBooking.source} />
//                 <DetailRow label="Type"           value={selectedBooking.booking_type} />
//                 <View style={styles.statusRow}>
//                   <Text style={styles.detailLabel}>Status</Text>
//                   {/* ← CHANGED: displayStatus use කරනවා modal status badge එකේත් */}
//                   <View style={[styles.statusBadgeLarge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
//                     <Text style={[styles.statusTextLarge, { color: statusStyle.textColor }]}>
//                       {displayStatus}
//                     </Text>
//                   </View>
//                 </View>
//                 {selectedBooking.note && <DetailRow label="Note" value={selectedBooking.note} />}
//               </View>

//               {/* Payment */}
//               <View style={styles.detailSection}>
//                 <View style={styles.sectionHeader}>
//                   <Ionicons name="cash-outline" size={20} color="#6B5B95" />
//                   <Text style={styles.sectionTitle}>Payment Information</Text>
//                 </View>
//                 <PaymentRow label="Total Amount" value={selectedBooking.total_amount} color="#111827" bold />
//                 {selectedBooking.advance_payment != null && <PaymentRow label="Advance Payment" value={selectedBooking.advance_payment} color="#10B981" />}
//                 {selectedBooking.card_payment    != null && <PaymentRow label="Card Payment"    value={selectedBooking.card_payment}    color="#6366F1" />}
//                 {selectedBooking.cash_payment    != null && <PaymentRow label="Cash Payment"    value={selectedBooking.cash_payment}    color="#F59E0B" />}
//                 {selectedBooking.balance         != null && <PaymentRow label="Balance"         value={selectedBooking.balance}         color="#EF4444" bold />}
//                 {selectedBooking.payment && (
//                   <View style={styles.paymentStatusRow}>
//                     <Text style={styles.detailLabel}>Payment Status</Text>
//                     <Text style={styles.paymentStatusValue}>{selectedBooking.payment}</Text>
//                   </View>
//                 )}
//               </View>

//               {/* System */}
//               <View style={styles.detailSection}>
//                 <View style={styles.sectionHeader}>
//                   <Ionicons name="information-circle-outline" size={20} color="#6B5B95" />
//                   <Text style={styles.sectionTitle}>System Information</Text>
//                 </View>
//                 {/* ← CHANGED: "deleted" event type label එකත් "Cancelled Booking" කියලා show කරනවා */}
//                 <DetailRow label="Event Type" value={getEventLabel(selectedBooking.event_type)} />
//                 {selectedBooking.user_id != null && <DetailRow label="User ID" value={selectedBooking.user_id.toString()} />}
//                 <DetailRow label="Timestamp"  value={new Date(selectedBooking.timestamp).toLocaleString()} />
//               </View>
//             </ScrollView>

//             <View style={styles.modalFooter}>
//               <TouchableOpacity style={styles.actionButton} onPress={() => setShowDetailsModal(false)}>
//                 <Text style={styles.actionButtonText}>Close</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.actionButton, styles.printButton]} onPress={() => {}}>
//                 <Ionicons name="print-outline" size={18} color="#FFFFFF" />
//                 <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Print</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   const currentBookings = getCurrentBookings();

//   // ── Render ──────────────────────────────────────────────────────────────────
//   return (
//     <View style={styles.container}>
//       <HeaderWithMenu
//         title="Notification History"
//         subtitle="Stay updated with recent alerts"
//         currentPage=""
//       />

//       {/* Date Range Selector */}
//       <View style={styles.dateSelector}>
//         <TouchableOpacity style={styles.dateButton} onPress={() => setShowFromDatePicker(true)}>
//           <Ionicons name="calendar" size={16} color="#6B5B95" />
//           <View style={styles.dateButtonTextContainer}>
//             <Text style={styles.dateButtonLabel}>From Date</Text>
//             <Text style={styles.dateButtonValue}>
//               {new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//             </Text>
//           </View>
//         </TouchableOpacity>

//         <View style={styles.dateSeparator}>
//           <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
//         </View>

//         <TouchableOpacity style={styles.dateButton} onPress={() => setShowToDatePicker(true)}>
//           <Ionicons name="calendar" size={16} color="#6B5B95" />
//           <View style={styles.dateButtonTextContainer}>
//             <Text style={styles.dateButtonLabel}>To Date</Text>
//             <Text style={styles.dateButtonValue}>
//               {new Date(toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//             </Text>
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.refreshButton} onPress={loadBookingHistory}>
//           <Ionicons name="refresh" size={20} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>

//       {showFromDatePicker && (
//         <DateTimePicker
//           value={new Date(fromDate)}
//           mode="date"
//           display="default"
//           onChange={(_, date) => { setShowFromDatePicker(false); if (date) setFromDate(date.toISOString().split('T')[0]); }}
//         />
//       )}
//       {showToDatePicker && (
//         <DateTimePicker
//           value={new Date(toDate)}
//           mode="date"
//           display="default"
//           onChange={(_, date) => { setShowToDatePicker(false); if (date) setToDate(date.toISOString().split('T')[0]); }}
//         />
//       )}

//       {/* ── Housekeeping-style Summary Strip ── */}
//       {historyData?.summary && (
//         <View style={styles.summaryWrapper}>
//           {/* Period label */}
//           <View style={styles.summaryPeriodRow}>
//             <Text style={styles.summaryPeriodTitle}>Notification Summary</Text>
//             <Text style={styles.summaryPeriodLabel}>
//               {new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
//               {new Date(toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//             </Text>
//           </View>

//           {/* Strip */}
//           <View style={styles.summaryCard}>
//             {summaryItems.map((item, index) => {
//               const isActive = activeTab === item.key;
//               const isLast   = index === summaryItems.length - 1;
//               return (
//                 <React.Fragment key={item.key}>
//                   <TouchableOpacity
//                     style={[styles.summaryItem, isActive && { backgroundColor: item.bg }]}
//                     onPress={() => setActiveTab(isActive ? 'all' : item.key)}
//                     activeOpacity={0.7}
//                   >
//                     {/* Icon */}
//                     <View style={[
//                       styles.summaryIconWrap,
//                       { backgroundColor: isActive ? item.color : item.bg },
//                     ]}>
//                       <Ionicons name={item.icon} size={15} color={isActive ? '#fff' : item.color} />
//                     </View>

//                     {/* Count */}
//                     <Text style={[styles.summaryCount, { color: isActive ? item.color : '#111827' }]}>
//                       {item.count}
//                     </Text>

//                     {/* Label */}
//                     <Text style={[styles.summaryLabel, { color: isActive ? item.color : '#6B7280' }]}>
//                       {item.label}
//                     </Text>

//                     {/* Active underline */}
//                     {isActive && (
//                       <View style={[styles.summaryActiveLine, { backgroundColor: item.color }]} />
//                     )}
//                   </TouchableOpacity>

//                   {!isLast && <View style={styles.summaryDivider} />}
//                 </React.Fragment>
//               );
//             })}
//           </View>

//           {/* Active filter pill */}
//           {activeTab !== 'all' && (
//             <View style={styles.activePillRow}>
//               <View style={styles.activePill}>
//                 <Ionicons name="funnel" size={12} color="#6B5B95" />
//                 <Text style={styles.activePillText}>
//                   {summaryItems.find((s) => s.key === activeTab)?.label} ({currentBookings.length})
//                 </Text>
//                 <TouchableOpacity
//                   onPress={() => setActiveTab('all')}
//                   hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
//                 >
//                   <Ionicons name="close-circle" size={15} color="#6B5B95" />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         </View>
//       )}

//       {/* Notification list */}
//       <FlatList
//         data={currentBookings}
//         keyExtractor={(item) => `${item.booking_id}-${item.timestamp}`}
//         renderItem={renderNotificationItem}
//         contentContainerStyle={styles.listContainer}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#6B5B95']}
//             tintColor="#6B5B95"
//           />
//         }
//         ListEmptyComponent={
//           <Animated.View style={[styles.emptyState, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
//             <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
//             <Text style={styles.emptyTitle}>No Activities Found</Text>
//             <Text style={styles.emptySubtitle}>
//               {`No booking ${activeTab === 'all' ? 'activities' : activeTab === 'deleted' ? 'cancellations' : activeTab} found for the selected period`}
//             </Text>
//             <TouchableOpacity style={styles.emptyButton} onPress={loadBookingHistory}>
//               <Text style={styles.emptyButtonText}>Refresh</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         }
//         ListHeaderComponent={
//           loading ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#6B5B95" />
//               <Text style={styles.loadingText}>Loading activities...</Text>
//             </View>
//           ) : null
//         }
//       />

//       {renderDetailsModal()}
//     </View>
//   );
// };

// export default BookingHistory;

// // ─────────────────────────────────────────────────────────────────────────────
// // STYLES
// // ─────────────────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F9FAFB' },

//   // Date selector
//   dateSelector: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 16,
//     marginTop: 16,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   dateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
//   dateButtonTextContainer: { flex: 1 },
//   dateButtonLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 2 },
//   dateButtonValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
//   dateSeparator: { marginHorizontal: 8 },
//   refreshButton: {
//     width: 44,
//     height: 44,
//     backgroundColor: '#6B5B95',
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },

//   // ── Housekeeping-style summary strip ────────────────────────────────────────
//   summaryWrapper: {
//     paddingHorizontal: 16,
//     paddingTop: 14,
//     paddingBottom: 4,
//   },
//   summaryPeriodRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   summaryPeriodTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
//   summaryPeriodLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

//   summaryCard: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.07,
//     shadowRadius: 6,
//     elevation: 3,
//     overflow: 'hidden',
//   },
//   summaryItem: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 2,
//     position: 'relative',
//   },
//   summaryIconWrap: {
//     width: 32,
//     height: 32,
//     borderRadius: 9,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   summaryCount: { fontSize: 20, fontWeight: '800', lineHeight: 24 },
//   summaryLabel: { fontSize: 10, fontWeight: '500', textAlign: 'center', marginTop: 3, lineHeight: 13 },
//   summaryActiveLine: {
//     position: 'absolute',
//     bottom: 0,
//     left: '15%',
//     right: '15%',
//     height: 3,
//     borderTopLeftRadius: 3,
//     borderTopRightRadius: 3,
//   },
//   summaryDivider: { width: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },

//   // Active pill
//   activePillRow: { paddingTop: 10 },
//   activePill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 5,
//     alignSelf: 'flex-start',
//     backgroundColor: '#EDE9FE',
//     paddingHorizontal: 11,
//     paddingVertical: 5,
//     borderRadius: 20,
//   },
//   activePillText: { fontSize: 12, color: '#6B5B95', fontWeight: '600' },

//   // Notification card
//   notificationCard: {
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 16,
//     marginBottom: 8,
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   notificationHeader:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
//   eventIconContainer:   { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
//   notificationContent:  { flex: 1 },
//   notificationTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
//   notificationTitle:    { fontSize: 15, fontWeight: '600', color: '#111827' },
//   notificationTime:     { fontSize: 12, color: '#6B7280', fontWeight: '500' },
//   notificationGuest:    { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
//   notificationMeta:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
//   statusBadge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
//   statusText:           { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
//   separatorDot:         { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' },
//   dateInfo:             { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   dateText:             { fontSize: 12, color: '#6B7280', fontWeight: '500' },
//   notificationFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
//   amountLabel:          { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 2 },
//   amountValue:          { fontSize: 15, fontWeight: '700', color: '#111827' },
//   bookingInfo:          { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   bookingInfoText:      { fontSize: 13, color: '#6B7280', fontWeight: '500' },

//   listContainer: { paddingTop: 8, paddingBottom: 24 },
//   loadingContainer: { paddingVertical: 32, alignItems: 'center' },
//   loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280', fontWeight: '500' },

//   emptyState:    { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 48 },
//   emptyTitle:    { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 8 },
//   emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
//   emptyButton:   { backgroundColor: '#6B5B95', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
//   emptyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

//   // Detail modal
//   modalOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
//   modalContainer:      { backgroundColor: '#FFFFFF', borderRadius: 16, width: '90%', maxHeight: '85%', overflow: 'hidden' },
//   modalHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   modalTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
//   modalEventIcon:      { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
//   modalTitle:          { fontSize: 18, fontWeight: '700', color: '#111827' },
//   modalSubtitle:       { fontSize: 13, color: '#6B7280', marginTop: 2 },
//   closeButton:         { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
//   modalScroll:         { maxHeight: 500 },

//   detailSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
//   sectionTitle:  { fontSize: 16, fontWeight: '600', color: '#111827' },

//   detailRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
//   detailLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500', width: '40%' },
//   detailValue: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },

//   dateRangeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
//   dateBox:      { flex: 1, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, alignItems: 'center' },
//   dateBoxLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
//   dateBoxDate:  { fontSize: 14, fontWeight: '600', color: '#111827' },
//   dateBoxTime:  { fontSize: 12, color: '#6B7280', marginTop: 2 },

//   nightsContainer: { alignItems: 'center', marginHorizontal: 16 },
//   nightsNumber:    { fontSize: 24, fontWeight: '700', color: '#6B5B95' },
//   nightsLabel:     { fontSize: 11, color: '#6B7280', fontWeight: '500', textTransform: 'uppercase', marginTop: 2 },

//   statusRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
//   statusBadgeLarge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5 },
//   statusTextLarge: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },

//   paymentRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
//   paymentLabel:     { fontSize: 14, fontWeight: '500' },
//   paymentValue:     { fontSize: 15, fontWeight: '600' },
//   paymentValueBold: { fontWeight: '700' },
//   paymentStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
//   paymentStatusValue: { fontSize: 14, fontWeight: '600', color: '#111827' },

//   modalFooter:     { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
//   actionButton:    { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center' },
//   printButton:     { backgroundColor: '#6B5B95', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
//   actionButtonText: { fontSize: 15, fontWeight: '600', color: '#111827' },
// });

// app/booking-history/index.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import bookingHistoryService, {
  BookingHistoryItem,
  BookingHistoryResponse,
} from '../../services/bookingHistory';
import HeaderWithMenu from '../../components/HeaderWithMenu';

const { width } = Dimensions.get('window');

type EventType    = 'created' | 'updated' | 'deleted' | 'all';
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface StatusStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

// ─────────────────────────────────────────────────────────────────────────────
const BookingHistory = () => {
  const router = useRouter();

  const [activeTab,          setActiveTab]          = useState<EventType>('all');
  const [fromDate,           setFromDate]           = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );
  const [toDate,             setToDate]             = useState(new Date().toISOString().split('T')[0]);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker,   setShowToDatePicker]   = useState(false);
  const [historyData,        setHistoryData]        = useState<BookingHistoryResponse | null>(null);
  const [loading,            setLoading]            = useState(false);
  const [refreshing,         setRefreshing]         = useState(false);
  const [selectedBooking,    setSelectedBooking]    = useState<BookingHistoryItem | null>(null);
  const [showDetailsModal,   setShowDetailsModal]   = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => { loadBookingHistory(); }, [fromDate, toDate]);

  useEffect(() => {
    if (!loading) return;
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [loading]);

  const loadBookingHistory = async () => {
    try {
      setLoading(true);
      const response = await bookingHistoryService.getBookingHistory(fromDate, toDate);
      if (response?.history) {
        setHistoryData(response);
      } else {
        Alert.alert('Error', 'No history data available');
      }
    } catch (error) {
      console.error('Error loading booking history:', error);
      Alert.alert('Error', 'Failed to load booking history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadBookingHistory(); };

  const getCurrentBookings = (): BookingHistoryItem[] => {
    if (!historyData?.history) return [];
    if (activeTab === 'all') return historyData.history;
    return bookingHistoryService.filterByEventType(historyData.history, activeTab);
  };

  const calculateNights = (checkIn: string, checkOut: string): number => {
    const diff = Math.abs(new Date(checkOut).getTime() - new Date(checkIn).getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getRoomInfo = (booking: BookingHistoryItem): string => {
    if (booking.room_counts?.length) {
      const names = booking.room_counts
        .filter((r) => r.room_count > 0)
        .map((r) => `${r.category_name} (${r.room_count})`);
      return names.length ? names.join(', ') : 'No room details';
    }
    return 'No room details';
  };

  // ── "deleted" event type එකට label "Cancelled Booking" කියලා show කරනවා ──
  const getEventLabel = (eventType: string): string => {
    switch (eventType) {
      case 'created':  return 'Created Booking';
      case 'updated':  return 'Modified Booking';
      case 'deleted':  return 'Cancelled Booking';   // ← CHANGED: "Deleted" → "Cancelled"
      default:         return eventType.charAt(0).toUpperCase() + eventType.slice(1) + ' Booking';
    }
  };

  const getEventInfo = (eventType: string) => {
    switch (eventType) {
      case 'created': return { icon: 'add-circle'        as IoniconsName, color: '#10B981', bg: '#D1FAE5' };
      case 'updated': return { icon: 'refresh-circle'    as IoniconsName, color: '#F59E0B', bg: '#FEF3C7' };
      case 'deleted': return { icon: 'close-circle'      as IoniconsName, color: '#EF4444', bg: '#FEE2E2' };  // ← cancel icon
      default:        return { icon: 'document-text'     as IoniconsName, color: '#6B5B95', bg: '#E5E7EB' };
    }
  };

  // ── Pending + deleted combo නම් "Cancelled" කියලා override කරනවා ──────────
  const getDisplayStatus = (item: BookingHistoryItem): string => {
    if (
      item.event_type === 'deleted' &&
      item.status.toLowerCase() === 'pending'
    ) {
      return 'Cancelled';   // ← AUTO OVERRIDE
    }
    return item.status;
  };

  const getStatusStyle = (status: string): StatusStyle => {
    switch (status.toLowerCase()) {
      case 'confirmed':                    return { backgroundColor: '#D1FAE5', borderColor: '#10B981', textColor: '#065F46' };
      case 'pending':                      return { backgroundColor: '#FEF3C7', borderColor: '#F59E0B', textColor: '#92400E' };
      case 'cancelled': case 'canceled':   return { backgroundColor: '#FEE2E2', borderColor: '#EF4444', textColor: '#991B1B' };
      case 'checkin':   case 'checked-in': return { backgroundColor: '#E0E7FF', borderColor: '#6366F1', textColor: '#3730A3' };
      case 'checkout':  case 'checked-out':return { backgroundColor: '#FCE7F3', borderColor: '#EC4899', textColor: '#9D174D' };
      default:                             return { backgroundColor: '#F3F4F6', borderColor: '#9CA3AF', textColor: '#374151' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffDays = Math.floor(Math.abs(Date.now() - date.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7)  return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined });
  };

  // ── Summary counts ──────────────────────────────────────────────────────────
  const summary = historyData?.summary;
  const summaryItems = [
    {
      key:   'all'     as EventType,
      label: 'All Events',
      count: summary?.total_events   ?? 0,
      color: '#6B5B95',
      bg:    '#EDE9FE',
      icon:  'apps'                  as IoniconsName,
    },
    {
      key:   'created' as EventType,
      label: 'Created',
      count: summary?.created_count  ?? 0,
      color: '#10B981',
      bg:    '#D1FAE5',
      icon:  'add-circle-outline'    as IoniconsName,
    },
    {
      key:   'updated' as EventType,
      label: 'Modified',
      count: summary?.updated_count  ?? 0,
      color: '#F59E0B',
      bg:    '#FEF3C7',
      icon:  'refresh-circle-outline' as IoniconsName,
    },
    {
      key:   'deleted' as EventType,
      label: 'Cancelled',           // ← Already correct label in summary strip
      count: summary?.deleted_count  ?? 0,
      color: '#EF4444',
      bg:    '#FEE2E2',
      icon:  'close-circle-outline'  as IoniconsName,  // ← cancel icon
    },
  ];

  // ── Notification list item ──────────────────────────────────────────────────
  const renderNotificationItem = ({ item }: { item: BookingHistoryItem }) => {
    const eventInfo     = getEventInfo(item.event_type);
    const displayStatus = getDisplayStatus(item);           // ← use override helper
    const statusStyle   = getStatusStyle(displayStatus);
    const nights        = calculateNights(item.checkin_date, item.checkout_date);
    const timeAgo       = formatDate(item.timestamp);

    return (
      <TouchableOpacity
        onPress={() => { setSelectedBooking(item); setShowDetailsModal(true); }}
        activeOpacity={0.7}
        style={styles.notificationCard}
      >
        <View style={styles.notificationHeader}>
          <View style={[styles.eventIconContainer, { backgroundColor: eventInfo.bg }]}>
            <Ionicons name={eventInfo.icon} size={20} color={eventInfo.color} />
          </View>

          <View style={styles.notificationContent}>
            <View style={styles.notificationTitleRow}>
              <Text style={styles.notificationTitle}>
                {getEventLabel(item.event_type)}
              </Text>
              <Text style={styles.notificationTime}>{timeAgo}</Text>
            </View>

            <Text style={styles.notificationGuest}>{item.guest_name}</Text>

            <View style={styles.notificationMeta}>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
                <Text style={[styles.statusText, { color: statusStyle.textColor }]}>{displayStatus}</Text>
              </View>
              <View style={styles.separatorDot} />
              <View style={styles.dateInfo}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={styles.dateText}>
                  {item.checkin_date} • {nights} night{nights !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            <View style={styles.notificationFooter}>
              <View>
                <Text style={styles.amountLabel}>Total</Text>
                <Text style={styles.amountValue}>LKR {item.total_amount.toFixed(2)}</Text>
              </View>
              <View style={styles.bookingInfo}>
                <Ionicons name="person-outline" size={14} color="#6B7280" />
                <Text style={styles.bookingInfoText}>
                  {item.adults} Adult{item.adults !== 1 ? 's' : ''}, {item.children} Child{item.children !== 1 ? 'ren' : ''}
                </Text>
              </View>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </View>
      </TouchableOpacity>
    );
  };

  // ── Detail modal ────────────────────────────────────────────────────────────
  const renderDetailsModal = () => {
    if (!selectedBooking) return null;
    const eventInfo     = getEventInfo(selectedBooking.event_type);
    const displayStatus = getDisplayStatus(selectedBooking);  // ← use override helper
    const statusStyle   = getStatusStyle(displayStatus);
    const nights        = calculateNights(selectedBooking.checkin_date, selectedBooking.checkout_date);

    const DetailRow = ({ label, value }: { label: string; value: string }) => (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );

    const DateBox = ({ label, date, time }: { label: string; date: string; time?: string }) => (
      <View style={styles.dateBox}>
        <Text style={styles.dateBoxLabel}>{label}</Text>
        <Text style={styles.dateBoxDate}>{date}</Text>
        <Text style={styles.dateBoxTime}>{time || '14:00'}</Text>
      </View>
    );

    const PaymentRow = ({ label, value, color, bold }: { label: string; value: number; color: string; bold?: boolean }) => (
      <View style={styles.paymentRow}>
        <Text style={[styles.paymentLabel, { color }]}>{label}</Text>
        <Text style={[styles.paymentValue, { color }, bold && styles.paymentValueBold]}>
          LKR {value.toFixed(2)}
        </Text>
      </View>
    );

    return (
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={[styles.modalEventIcon, { backgroundColor: eventInfo.bg }]}>
                  <Ionicons name={eventInfo.icon} size={24} color={eventInfo.color} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Booking Details</Text>
                  <Text style={styles.modalSubtitle}>
                    {getEventLabel(selectedBooking.event_type)} • {formatDate(selectedBooking.timestamp)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Guest */}
              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-circle-outline" size={20} color="#6B5B95" />
                  <Text style={styles.sectionTitle}>Guest Information</Text>
                </View>
                <DetailRow label="Name" value={selectedBooking.guest_name} />
                {selectedBooking.phone   && <DetailRow label="Phone"   value={selectedBooking.phone} />}
                {selectedBooking.email   && <DetailRow label="Email"   value={selectedBooking.email} />}
                {selectedBooking.country && <DetailRow label="Country" value={selectedBooking.country} />}
              </View>

              {/* Booking */}
              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar-outline" size={20} color="#6B5B95" />
                  <Text style={styles.sectionTitle}>Booking Details</Text>
                </View>
                <View style={styles.dateRangeContainer}>
                  <DateBox label="Check-in"  date={selectedBooking.checkin_date}  time={selectedBooking.checkin_time} />
                  <View style={styles.nightsContainer}>
                    <Text style={styles.nightsNumber}>{nights}</Text>
                    <Text style={styles.nightsLabel}>nights</Text>
                  </View>
                  <DateBox label="Check-out" date={selectedBooking.checkout_date} time={selectedBooking.checkout_time} />
                </View>
                <DetailRow label="Booking ID"     value={`#${selectedBooking.booking_id}`} />
                {selectedBooking.booking_code && <DetailRow label="Booking Code" value={selectedBooking.booking_code} />}
                <DetailRow label="Rooms"          value={getRoomInfo(selectedBooking)} />
                <DetailRow label="Guests"         value={`${selectedBooking.adults} Adults, ${selectedBooking.children} Children`} />
                <DetailRow label="Booking Method" value={selectedBooking.booking_method} />
                <DetailRow label="Source"         value={selectedBooking.source} />
                <DetailRow label="Type"           value={selectedBooking.booking_type} />
                <View style={styles.statusRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[styles.statusBadgeLarge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
                    <Text style={[styles.statusTextLarge, { color: statusStyle.textColor }]}>
                      {displayStatus}
                    </Text>
                  </View>
                </View>
                {selectedBooking.note && <DetailRow label="Note" value={selectedBooking.note} />}
              </View>

              {/* Payment */}
              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="cash-outline" size={20} color="#6B5B95" />
                  <Text style={styles.sectionTitle}>Payment Information</Text>
                </View>
                <PaymentRow label="Total Amount" value={selectedBooking.total_amount} color="#111827" bold />
                {selectedBooking.advance_payment != null && <PaymentRow label="Advance Payment" value={selectedBooking.advance_payment} color="#10B981" />}
                {selectedBooking.card_payment    != null && <PaymentRow label="Card Payment"    value={selectedBooking.card_payment}    color="#6366F1" />}
                {selectedBooking.cash_payment    != null && <PaymentRow label="Cash Payment"    value={selectedBooking.cash_payment}    color="#F59E0B" />}
                {selectedBooking.balance         != null && <PaymentRow label="Balance"         value={selectedBooking.balance}         color="#EF4444" bold />}
                {selectedBooking.payment && (
                  <View style={styles.paymentStatusRow}>
                    <Text style={styles.detailLabel}>Payment Status</Text>
                    <Text style={styles.paymentStatusValue}>{selectedBooking.payment}</Text>
                  </View>
                )}
              </View>

              {/* System */}
              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="information-circle-outline" size={20} color="#6B5B95" />
                  <Text style={styles.sectionTitle}>System Information</Text>
                </View>
                <DetailRow label="Event Type" value={getEventLabel(selectedBooking.event_type)} />
                {selectedBooking.user_id != null && <DetailRow label="User ID" value={selectedBooking.user_id.toString()} />}
                <DetailRow label="Timestamp"  value={new Date(selectedBooking.timestamp).toLocaleString()} />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.actionButton} onPress={() => setShowDetailsModal(false)}>
                <Text style={styles.actionButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.printButton]} onPress={() => {}}>
                <Ionicons name="print-outline" size={18} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Print</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const currentBookings = getCurrentBookings();

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <HeaderWithMenu
        title="Notification History"
        subtitle="Stay updated with recent alerts"
        currentPage=""
      />

      {/* Date Range Selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowFromDatePicker(true)}>
          <Ionicons name="calendar" size={16} color="#6B5B95" />
          <View style={styles.dateButtonTextContainer}>
            <Text style={styles.dateButtonLabel}>From Date</Text>
            <Text style={styles.dateButtonValue}>
              {new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.dateSeparator}>
          <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
        </View>

        <TouchableOpacity style={styles.dateButton} onPress={() => setShowToDatePicker(true)}>
          <Ionicons name="calendar" size={16} color="#6B5B95" />
          <View style={styles.dateButtonTextContainer}>
            <Text style={styles.dateButtonLabel}>To Date</Text>
            <Text style={styles.dateButtonValue}>
              {new Date(toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshButton} onPress={loadBookingHistory}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {showFromDatePicker && (
        <DateTimePicker
          value={new Date(fromDate)}
          mode="date"
          display="default"
          onChange={(_, date) => { setShowFromDatePicker(false); if (date) setFromDate(date.toISOString().split('T')[0]); }}
        />
      )}
      {showToDatePicker && (
        <DateTimePicker
          value={new Date(toDate)}
          mode="date"
          display="default"
          onChange={(_, date) => { setShowToDatePicker(false); if (date) setToDate(date.toISOString().split('T')[0]); }}
        />
      )}

      {/* ── Housekeeping-style Summary Strip ── */}
      {historyData?.summary && (
        <View style={styles.summaryWrapper}>
          {/* Period label */}
          <View style={styles.summaryPeriodRow}>
            <Text style={styles.summaryPeriodTitle}>Notification Summary</Text>
            <Text style={styles.summaryPeriodLabel}>
              {new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
              {new Date(toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>

          {/* Strip */}
          <View style={styles.summaryCard}>
            {summaryItems.map((item, index) => {
              const isActive = activeTab === item.key;
              const isLast   = index === summaryItems.length - 1;
              return (
                <React.Fragment key={item.key}>
                  <TouchableOpacity
                    style={[styles.summaryItem, isActive && { backgroundColor: item.bg }]}
                    onPress={() => setActiveTab(isActive ? 'all' : item.key)}
                    activeOpacity={0.7}
                  >
                    {/* Icon */}
                    <View style={[
                      styles.summaryIconWrap,
                      { backgroundColor: isActive ? item.color : item.bg },
                    ]}>
                      <Ionicons name={item.icon} size={15} color={isActive ? '#fff' : item.color} />
                    </View>

                    {/* Count */}
                    <Text style={[styles.summaryCount, { color: isActive ? item.color : '#111827' }]}>
                      {item.count}
                    </Text>

                    {/* Label */}
                    <Text style={[styles.summaryLabel, { color: isActive ? item.color : '#6B7280' }]}>
                      {item.label}
                    </Text>

                    {/* Active underline */}
                    {isActive && (
                      <View style={[styles.summaryActiveLine, { backgroundColor: item.color }]} />
                    )}
                  </TouchableOpacity>

                  {!isLast && <View style={styles.summaryDivider} />}
                </React.Fragment>
              );
            })}
          </View>

          {/* Active filter pill */}
          {activeTab !== 'all' && (
            <View style={styles.activePillRow}>
              <View style={styles.activePill}>
                <Ionicons name="funnel" size={12} color="#6B5B95" />
                <Text style={styles.activePillText}>
                  {summaryItems.find((s) => s.key === activeTab)?.label} ({currentBookings.length})
                </Text>
                <TouchableOpacity
                  onPress={() => setActiveTab('all')}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="close-circle" size={15} color="#6B5B95" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Notification list */}
      <FlatList
        data={currentBookings}
        keyExtractor={(item) => `${item.booking_id}-${item.timestamp}`}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6B5B95']}
            tintColor="#6B5B95"
          />
        }
        ListEmptyComponent={
          <Animated.View style={[styles.emptyState, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Activities Found</Text>
            <Text style={styles.emptySubtitle}>
              {`No booking ${activeTab === 'all' ? 'activities' : activeTab === 'deleted' ? 'cancellations' : activeTab} found for the selected period`}
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={loadBookingHistory}>
              <Text style={styles.emptyButtonText}>Refresh</Text>
            </TouchableOpacity>
          </Animated.View>
        }
        ListHeaderComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6B5B95" />
              <Text style={styles.loadingText}>Loading activities...</Text>
            </View>
          ) : null
        }
      />

      {renderDetailsModal()}
    </View>
  );
};

export default BookingHistory;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // Date selector
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateButtonTextContainer: { flex: 1 },
  dateButtonLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 2 },
  dateButtonValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  dateSeparator: { marginHorizontal: 8 },
  refreshButton: {
    width: 44,
    height: 44,
    backgroundColor: '#6B5B95',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // ── Housekeeping-style summary strip ────────────────────────────────────────
  summaryWrapper: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  summaryPeriodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryPeriodTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  summaryPeriodLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 2,
    position: 'relative',
  },
  summaryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  summaryCount: { fontSize: 20, fontWeight: '800', lineHeight: 24 },
  summaryLabel: { fontSize: 10, fontWeight: '500', textAlign: 'center', marginTop: 3, lineHeight: 13 },
  summaryActiveLine: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  summaryDivider: { width: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },

  // Active pill
  activePillRow: { paddingTop: 10 },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
  },
  activePillText: { fontSize: 12, color: '#6B5B95', fontWeight: '600' },

  // Notification card
  notificationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationHeader:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  eventIconContainer:   { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  notificationContent:  { flex: 1 },
  notificationTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notificationTitle:    { fontSize: 15, fontWeight: '600', color: '#111827' },
  notificationTime:     { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  notificationGuest:    { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  notificationMeta:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statusBadge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  statusText:           { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  separatorDot:         { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' },
  dateInfo:             { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText:             { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  notificationFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  amountLabel:          { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 2 },
  amountValue:          { fontSize: 15, fontWeight: '700', color: '#111827' },
  bookingInfo:          { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bookingInfoText:      { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  listContainer: { paddingTop: 8, paddingBottom: 24 },
  loadingContainer: { paddingVertical: 32, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280', fontWeight: '500' },

  emptyState:    { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 48 },
  emptyTitle:    { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyButton:   { backgroundColor: '#6B5B95', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  emptyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

  // Detail modal
  modalOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer:      { backgroundColor: '#FFFFFF', borderRadius: 16, width: '90%', maxHeight: '85%', overflow: 'hidden' },
  modalHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  modalEventIcon:      { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalTitle:          { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalSubtitle:       { fontSize: 13, color: '#6B7280', marginTop: 2 },
  closeButton:         { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  modalScroll:         { maxHeight: 500 },

  detailSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle:  { fontSize: 16, fontWeight: '600', color: '#111827' },

  detailRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  detailLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500', width: '40%' },
  detailValue: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },

  dateRangeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  dateBox:      { flex: 1, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, alignItems: 'center' },
  dateBoxLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
  dateBoxDate:  { fontSize: 14, fontWeight: '600', color: '#111827' },
  dateBoxTime:  { fontSize: 12, color: '#6B7280', marginTop: 2 },

  nightsContainer: { alignItems: 'center', marginHorizontal: 16 },
  nightsNumber:    { fontSize: 24, fontWeight: '700', color: '#6B5B95' },
  nightsLabel:     { fontSize: 11, color: '#6B7280', fontWeight: '500', textTransform: 'uppercase', marginTop: 2 },

  statusRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadgeLarge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5 },
  statusTextLarge: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },

  paymentRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  paymentLabel:     { fontSize: 14, fontWeight: '500' },
  paymentValue:     { fontSize: 15, fontWeight: '600' },
  paymentValueBold: { fontWeight: '700' },
  paymentStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  paymentStatusValue: { fontSize: 14, fontWeight: '600', color: '#111827' },

  modalFooter:     { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  actionButton:    { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center' },
  printButton:     { backgroundColor: '#6B5B95', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionButtonText: { fontSize: 15, fontWeight: '600', color: '#111827' },
});