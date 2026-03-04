// // app/summary/index.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator,
//   Alert, RefreshControl, ScrollView, Dimensions, Animated, Image,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { StackedBarChart } from 'react-native-chart-kit';
// import { LinearGradient } from 'expo-linear-gradient';
// import HeaderWithMenu from '../../components/HeaderWithMenu';
// import bookingSummaryService from '../../services/bookingSummary';
// import { BookingSummaryItem, BookingSummaryResponse } from '../../types/summary';

// const { width } = Dimensions.get('window');

// // ── Source Image Map ──────────────────────────────────────────────────────────
// const SOURCE_IMAGES: Record<string, any> = {
//   airbnb:                        require('../../assets/adult/airbnb.png'),
//   'air bnb':                     require('../../assets/adult/airbnb.png'),
//   booking:                       require('../../assets/adult/booking.png'),
//   'booking.com':                 require('../../assets/adult/booking.png'),
//   agoda:                         require('../../assets/adult/agoda.png'),
//   expedia:                       require('../../assets/adult/expedia.png'),
//   'expedia affiliate network':   require('../../assets/adult/expedia.png'),
//   online:                        require('../../assets/adult/online.png'),
//   agency:                        require('../../assets/adult/agency.png'),
//   ai:                            require('../../assets/adult/Ai.png'),
//   ravan:                         require('../../assets/adult/ravan.png'),
//   walking:                       require('../../assets/adult/walking.png'),
//   'walk in':                     require('../../assets/adult/walking.png'),
//   walkin:                        require('../../assets/adult/walking.png'),
//   phone:                         require('../../assets/adult/phone.png'),
//   no:                            require('../../assets/adult/no.png'),
//   direct:                        require('../../assets/adult/a.png'),
//   download:                      require('../../assets/adult/download.png'),
// };

// const getSourceImage = (source: string | null | undefined) => {
//   if (!source) return null;
//   const key = source.toLowerCase().trim();
//   if (SOURCE_IMAGES[key]) return SOURCE_IMAGES[key];
//   for (const [k, v] of Object.entries(SOURCE_IMAGES)) {
//     if (key.includes(k) || k.includes(key)) return v;
//   }
//   return null;
// };

// const getSourceColor = (source: string): string => {
//   const s = source.toLowerCase();
//   if (s.includes('airbnb'))  return '#FF5A5F';
//   if (s.includes('booking')) return '#003580';
//   if (s.includes('expedia')) return '#FFCB05';
//   return '#6B5B95';
// };

// // ─────────────────────────────────────────────────────────────────────────────

// interface StatusStyle { backgroundColor: string; borderColor: string; textColor: string; }
// type StatusFilter = 'all' | 'approved' | 'cancelled';
// interface MonthlyChartData { labels: string[]; earned: number[]; upcoming: number[]; selected: string; }
// interface TooltipData { month: string; earned: number; upcoming: number; x: number; y: number; barIndex: number; }

// const BookingSummary = () => {
//   const getFirstDayOfMonth = () => {
//     const now = new Date();
//     return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
//   };
//   const getToday        = () => new Date().toISOString().split('T')[0];
//   const getCurrentMonth = () => {
//     const now = new Date();
//     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
//   };

//   const [fromDate, setFromDate]                     = useState(getFirstDayOfMonth());
//   const [toDate, setToDate]                         = useState(getToday());
//   const [showFromDatePicker, setShowFromDatePicker] = useState(false);
//   const [showToDatePicker, setShowToDatePicker]     = useState(false);
//   const [summaryData, setSummaryData]               = useState<BookingSummaryResponse | null>(null);
//   const [loading, setLoading]                       = useState(false);
//   const [refreshing, setRefreshing]                 = useState(false);
//   const [expandedRows, setExpandedRows]             = useState<Set<number>>(new Set());
//   const [currentPage, setCurrentPage]               = useState(1);
//   const [statusFilter, setStatusFilter]             = useState<StatusFilter>('approved');

//   const [chartData, setChartData]                         = useState<MonthlyChartData | null>(null);
//   const [chartLoading, setChartLoading]                   = useState(false);
//   const [selectedMonth, setSelectedMonth]                 = useState(getCurrentMonth());
//   const [showChartMonthPicker, setShowChartMonthPicker]   = useState(false);
//   const [showChart, setShowChart]                         = useState(true);

//   const [tooltipVisible, setTooltipVisible] = useState(false);
//   const [tooltipData, setTooltipData]       = useState<TooltipData | null>(null);
//   const tooltipOpacity    = useRef(new Animated.Value(0)).current;
//   const tooltipTranslateY = useRef(new Animated.Value(-10)).current;

//   const ITEMS_PER_PAGE = 10;

//   useEffect(() => { loadSummaryData(); }, [fromDate, toDate]);
//   useEffect(() => { loadChartData(); },  [selectedMonth]);
//   useEffect(() => { setCurrentPage(1); }, [summaryData, statusFilter]);

//   const loadChartData = async () => {
//     try {
//       setChartLoading(true);
//       const response = await bookingSummaryService.getMonthlyChart(selectedMonth);
//       setChartData(response);
//     } catch (error) {
//       if (error instanceof Error) Alert.alert('Chart Error', error.message);
//     } finally { setChartLoading(false); }
//   };

//   const loadSummaryData = async () => {
//     try {
//       setLoading(true);
//       const response = await bookingSummaryService.getBookingSummary(fromDate, toDate);
//       if (response?.data !== undefined) setSummaryData(response);
//       else Alert.alert('Error', 'Invalid response format from server');
//     } catch (error) {
//       Alert.alert('Error', error instanceof Error ? error.message : 'An unexpected error occurred');
//     } finally { setLoading(false); setRefreshing(false); }
//   };

//   const onRefresh = () => { setRefreshing(true); setCurrentPage(1); loadSummaryData(); loadChartData(); };

//   const goToNextPage     = () => { setCurrentPage(p => p + 1); setExpandedRows(new Set()); };
//   const goToPreviousPage = () => { if (currentPage > 1) { setCurrentPage(p => p - 1); setExpandedRows(new Set()); } };

//   const toggleRowExpansion = (id: number) => {
//     setExpandedRows(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
//   };

//   const handleChartMonthChange = (_: any, date?: Date) => {
//     setShowChartMonthPicker(false);
//     if (date) setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
//   };

//   const showTooltipFn = (data: TooltipData) => {
//     setTooltipData(data); setTooltipVisible(true);
//     tooltipOpacity.setValue(0); tooltipTranslateY.setValue(-20);
//     Animated.parallel([
//       Animated.timing(tooltipOpacity,    { toValue: 1, duration: 300, useNativeDriver: true }),
//       Animated.timing(tooltipTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }),
//     ]).start();
//   };

//   const hideTooltip = () => {
//     Animated.parallel([
//       Animated.timing(tooltipOpacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
//       Animated.timing(tooltipTranslateY, { toValue: -10, duration: 200, useNativeDriver: true }),
//     ]).start(() => { setTooltipVisible(false); setTooltipData(null); });
//   };

//   const getStatusStyle = (status: string): StatusStyle => {
//     switch (status.toLowerCase()) {
//       case 'approved': case 'confirmed': return { backgroundColor: '#10B98115', borderColor: '#10B981', textColor: '#10B981' };
//       case 'cancelled': case 'canceled': return { backgroundColor: '#EF444415', borderColor: '#EF4444', textColor: '#EF4444' };
//       case 'pending': return { backgroundColor: '#F59E0B15', borderColor: '#F59E0B', textColor: '#F59E0B' };
//       default: return { backgroundColor: '#6B728015', borderColor: '#6B7280', textColor: '#6B7280' };
//     }
//   };

//   const isCancelled      = (s: string) => ['cancelled', 'canceled'].includes(s.toLowerCase());
//   const getApprovedCount = () => summaryData?.data.filter(b => ['approved', 'confirmed'].includes(b.status.toLowerCase())).length ?? 0;

//   const handleFromDateChange = (_: any, date?: Date) => { setShowFromDatePicker(false); if (date) setFromDate(date.toISOString().split('T')[0]); };
//   const handleToDateChange   = (_: any, date?: Date) => { setShowToDatePicker(false);   if (date) setToDate(date.toISOString().split('T')[0]); };

//   const filterByStatus = (bookings: BookingSummaryItem[]) => {
//     if (statusFilter === 'all') return bookings;
//     return bookings.filter(b => {
//       const s = b.status.toLowerCase();
//       if (statusFilter === 'approved')  return s === 'approved' || s === 'confirmed';
//       if (statusFilter === 'cancelled') return s === 'cancelled' || s === 'canceled';
//       return true;
//     });
//   };

//   const getFilteredBookings = (): BookingSummaryItem[] => {
//     if (!summaryData?.data) return [];
//     const filtered = filterByStatus(summaryData.data);
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filtered.slice(start, start + ITEMS_PER_PAGE);
//   };

//   const getTotalFilteredCount = () => { if (!summaryData?.data) return 0; return filterByStatus(summaryData.data).length; };
//   const getTotalPages          = () => Math.ceil(getTotalFilteredCount() / ITEMS_PER_PAGE);
//   const formatCurrency         = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//   const formatDate             = (d: string) => { const dt = new Date(d); return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
//   const formatMonthYear        = (m: string) => { const [y, mo] = m.split('-'); return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); };
//   const formatYAxisLabel       = (value: string | number) => { const n = typeof value === 'string' ? parseFloat(value) : value; if (n >= 1000000) return `Rs.${(n/1000000).toFixed(1)}M`; if (n >= 100000) return `Rs.${(n/1000).toFixed(0)}K`; if (n >= 1000) return `Rs.${(n/1000).toFixed(1)}K`; return `Rs.${n}`; };

//   const getMaxChartValue = () => {
//     if (!chartData) return 100000;
//     let max = 0;
//     chartData.labels.forEach((_, i) => { max = Math.max(max, chartData.earned[i] || 0, chartData.upcoming[i] || 0); });
//     if (max > 1000000) return Math.ceil(max / 500000) * 500000;
//     if (max > 500000)  return Math.ceil(max / 100000) * 100000;
//     if (max > 100000)  return Math.ceil(max / 50000)  * 50000;
//     if (max > 50000)   return Math.ceil(max / 10000)  * 10000;
//     if (max > 10000)   return Math.ceil(max / 5000)   * 5000;
//     if (max > 5000)    return Math.ceil(max / 1000)   * 1000;
//     return Math.ceil(max / 500) * 500 || 10000;
//   };

//   // ── Table Row ──────────────────────────────────────────────────────────────
//   const renderTableRow = ({ item }: { item: BookingSummaryItem }) => {
//     const isExpanded  = expandedRows.has(item.id);
//     const statusStyle = getStatusStyle(item.status);
//     const cancelled   = isCancelled(item.status);
//     const sourceImage = getSourceImage(item.source);
//     const sourceColor = getSourceColor(item.source);

//     return (
//       <View style={[s.tableRow, cancelled && s.tableRowCancelled]}>
//         <View style={s.mainRow}>

//           {/* Source: image or fallback icon */}
//           <View style={s.sourceIconContainer}>
//             {sourceImage ? (
//               <View style={s.sourceImageWrapper}>
//                 <Image source={sourceImage} style={s.sourceImage} resizeMode="contain" />
//               </View>
//             ) : (
//               <View style={[s.sourceIconSmall, { backgroundColor: cancelled ? '#D1D5DB' : sourceColor }]}>
//                 <Ionicons name="globe" size={16} color="#FFFFFF" />
//               </View>
//             )}
//           </View>

//           <View style={s.guestNameContainer}>
//             <Text style={[s.guestNameText, cancelled && s.cancelledText]} numberOfLines={1}>{item.guest_name}</Text>
//           </View>

//           <View style={s.priceContainer}>
//             <Text style={[s.priceText, cancelled && s.cancelledText]}>${formatCurrency(item.usdprice)}</Text>
//           </View>

//           <TouchableOpacity onPress={() => toggleRowExpansion(item.id)} style={s.expandButton}>
//             <Ionicons name={isExpanded ? 'chevron-up-circle' : 'chevron-down-circle'} size={24} color={cancelled ? '#D1D5DB' : '#6B5B95'} />
//           </TouchableOpacity>
//         </View>

//         {isExpanded && (
//           <View style={[s.expandedContent, cancelled && s.expandedContentCancelled]}>
//             <View style={s.detailsColumn}>

//               {/* Source row with image */}
//               <View style={s.detailRowFull}>
//                 <View style={s.detailLabelContainer}>
//                   <Ionicons name="globe-outline" size={16} color={cancelled ? '#9CA3AF' : '#6B5B95'} />
//                   <Text style={[s.detailLabel, cancelled && s.cancelledLabel]}>SOURCE:</Text>
//                 </View>
//                 <View style={s.sourceDetailContainer}>
//                   {sourceImage && <Image source={sourceImage} style={s.sourceDetailImage} resizeMode="contain" />}
//                   <Text style={[s.detailValue, cancelled && s.cancelledText]}>{item.source}</Text>
//                 </View>
//               </View>

//               <View style={s.detailRowFull}>
//                 <View style={s.detailLabelContainer}>
//                   <Ionicons name="person-outline" size={16} color={cancelled ? '#9CA3AF' : '#6B5B95'} />
//                   <Text style={[s.detailLabel, cancelled && s.cancelledLabel]}>GUEST DETAILS:</Text>
//                 </View>
//                 <Text style={[s.detailValue, cancelled && s.cancelledText]}>{item.guest_details}</Text>
//               </View>

//               <View style={s.detailRowFull}>
//                 <View style={s.detailLabelContainer}>
//                   <Ionicons name="wallet-outline" size={16} color={cancelled ? '#9CA3AF' : '#6B5B95'} />
//                   <Text style={[s.detailLabel, cancelled && s.cancelledLabel]}>PRICE:</Text>
//                 </View>
//                 <Text style={[s.detailValueBold, cancelled && s.cancelledText]}>Rs.{formatCurrency(item.price)}</Text>
//               </View>

//               <View style={s.detailRowFull}>
//                 <View style={s.detailLabelContainer}>
//                   <Ionicons name="log-in-outline" size={16} color={cancelled ? '#9CA3AF' : '#6B5B95'} />
//                   <Text style={[s.detailLabel, cancelled && s.cancelledLabel]}>CHECK-IN:</Text>
//                 </View>
//                 <Text style={[s.detailValue, cancelled && s.cancelledText]}>{formatDate(item.check_in)}</Text>
//               </View>

//               <View style={s.detailRowFull}>
//                 <View style={s.detailLabelContainer}>
//                   <Ionicons name="log-out-outline" size={16} color={cancelled ? '#9CA3AF' : '#6B5B95'} />
//                   <Text style={[s.detailLabel, cancelled && s.cancelledLabel]}>CHECK-OUT:</Text>
//                 </View>
//                 <Text style={[s.detailValue, cancelled && s.cancelledText]}>{formatDate(item.check_out)}</Text>
//               </View>

//               <View style={s.detailRowFull}>
//                 <View style={s.detailLabelContainer}>
//                   <Ionicons name="bed-outline" size={16} color={cancelled ? '#9CA3AF' : '#6B5B95'} />
//                   <Text style={[s.detailLabel, cancelled && s.cancelledLabel]}>ROOMS:</Text>
//                 </View>
//                 <Text style={[s.detailValue, cancelled && s.cancelledText]}>{item.rooms}</Text>
//               </View>

//               <View style={s.detailRowFull}>
//                 <View style={s.detailLabelContainer}>
//                   <Ionicons name="calendar-outline" size={16} color={cancelled ? '#9CA3AF' : '#6B5B95'} />
//                   <Text style={[s.detailLabel, cancelled && s.cancelledLabel]}>BOOKED ON:</Text>
//                 </View>
//                 <Text style={[s.detailValue, cancelled && s.cancelledText]}>{formatDate(item.booked_on)}</Text>
//               </View>

//               <View style={s.detailRowFull}>
//                 <View style={s.detailLabelContainer}>
//                   <Ionicons name="information-circle-outline" size={16} color={cancelled ? '#9CA3AF' : '#6B5B95'} />
//                   <Text style={[s.detailLabel, cancelled && s.cancelledLabel]}>STATUS:</Text>
//                 </View>
//                 <View style={[s.statusBadgeSmall, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
//                   <Text style={[s.statusTextSmall, { color: statusStyle.textColor }]}>{item.status}</Text>
//                 </View>
//               </View>

//               <View style={s.detailRowFull}>
//                 <View style={s.detailLabelContainer}>
//                   <Ionicons name="wallet-outline" size={16} color={cancelled ? '#9CA3AF' : '#10B981'} />
//                   <Text style={[s.detailLabel, cancelled ? s.cancelledLabel : { color: '#10B981' }]}>COMMISSION:</Text>
//                 </View>
//                 <Text style={[s.detailValueBold, cancelled ? s.cancelledText : { color: '#10B981' }]}>Rs.{formatCurrency(item.commission)}</Text>
//               </View>

//               <View style={s.detailRowFull}>
//                 <View style={s.detailLabelContainer}>
//                   <Ionicons name="receipt-outline" size={16} color={cancelled ? '#9CA3AF' : '#6B5B95'} />
//                   <Text style={[s.detailLabel, cancelled && s.cancelledLabel]}>BOOKING NUMBER:</Text>
//                 </View>
//                 <Text style={[s.detailValue, cancelled && s.cancelledText]}>{item.booking_number || '-'}</Text>
//               </View>
//             </View>
//           </View>
//         )}
//       </View>
//     );
//   };

//   const filteredBookings   = getFilteredBookings();
//   const totalFilteredCount = getTotalFilteredCount();
//   const totalPages         = getTotalPages();
//   const hasNextPage        = currentPage < totalPages;
//   const hasPreviousPage    = currentPage > 1;
//   const startIndex         = (currentPage - 1) * ITEMS_PER_PAGE + 1;
//   const endIndex           = Math.min(currentPage * ITEMS_PER_PAGE, totalFilteredCount);

//   return (
//     <View style={s.container}>
//       <HeaderWithMenu title="Booking Summary" subtitle="View and analyze your booking reports" showNotification showMenuToggle />

//       <View style={s.contentContainer}>
//         {loading && !refreshing ? (
//           <View style={s.loadingContainer}>
//             <ActivityIndicator size="large" color="#6B5B95" />
//             <Text style={s.loadingText}>Loading summary data...</Text>
//           </View>
//         ) : (
//           <FlatList
//             ListHeaderComponent={
//               <>
//                 {/* Chart */}
//                 <View style={s.chartSection}>
//                   <View style={s.chartHeader}>
//                     <View style={s.chartTitleContainer}>
//                       <Ionicons name="bar-chart" size={24} color="#6B5B95" />
//                       <Text style={s.chartTitle}>Monthly Booking Summary</Text>
//                     </View>
//                     <TouchableOpacity onPress={() => setShowChart(!showChart)} style={s.chartToggleButton}>
//                       <Ionicons name={showChart ? 'chevron-up' : 'chevron-down'} size={20} color="#6B5B95" />
//                     </TouchableOpacity>
//                   </View>

//                   {showChart && (
//                     <>
//                       <TouchableOpacity onPress={() => setShowChartMonthPicker(true)} style={s.chartMonthButton} activeOpacity={0.8}>
//                         <View style={s.chartMonthContent}>
//                           <Ionicons name="calendar" size={20} color="#6B5B95" />
//                           <Text style={s.chartMonthText}>{formatMonthYear(selectedMonth)}</Text>
//                           <Ionicons name="chevron-down" size={16} color="#6B7280" />
//                         </View>
//                       </TouchableOpacity>

//                       {showChartMonthPicker && (
//                         <DateTimePicker value={new Date(selectedMonth + '-01')} mode="date" display="spinner" onChange={handleChartMonthChange} accentColor="#6B5B95" themeVariant="light" />
//                       )}

//                       {chartLoading ? (
//                         <View style={s.chartLoadingContainer}>
//                           <ActivityIndicator size="large" color="#6B5B95" />
//                           <Text style={s.chartLoadingText}>Loading chart...</Text>
//                         </View>
//                       ) : chartData ? (
//                         <View style={s.chartContainer}>
//                           <View style={s.chartInstructionContainer}>
//                             <Ionicons name="finger-print" size={16} color="#6B5B95" />
//                             <Text style={s.chartInstructionText}>👆 Tap any bar to view details</Text>
//                           </View>
//                           <ScrollView horizontal showsHorizontalScrollIndicator persistentScrollbar contentContainerStyle={s.chartScrollContent}>
//                             <View style={s.chartWrapper}>
//                               <StackedBarChart
//                                 data={{ labels: chartData.labels, legend: ['Earned', 'Total'], data: chartData.labels.map((_, i) => [chartData.earned[i] || 0, chartData.upcoming[i] || 0]), barColors: ['#D91656', '#D1D5DB'] }}
//                                 width={Math.max(width * 1.2, chartData.labels.length * 140)}
//                                 height={350}
//                                 chartConfig={{
//                                   backgroundColor: '#FFFFFF', backgroundGradientFrom: '#FFFFFF', backgroundGradientTo: '#FFFFFF',
//                                   decimalPlaces: 0, color: (o = 1) => `rgba(107,91,149,${o})`, labelColor: (o = 1) => `rgba(31,41,55,${o})`,
//                                   style: { borderRadius: 16 }, propsForBackgroundLines: { strokeDasharray: '5,5', stroke: '#E5E7EB', strokeWidth: 1 },
//                                   propsForLabels: { fontSize: 12, fontWeight: '600', fill: '#374151' }, barPercentage: 1.8,
//                                   fillShadowGradient: '#D91656', fillShadowGradientOpacity: 1,
//                                   yAxisLabel: '', yAxisSuffix: '', yAxisInterval: 1,
//                                   formatYLabel: (v) => formatYAxisLabel(parseFloat(v)),
//                                 }}
//                                 style={{ marginVertical: 8, borderRadius: 12, paddingRight: 20 }}
//                                 withHorizontalLabels withInnerLines segments={5} hideLegend
//                               />
//                               <View style={s.barOverlayContainer}>
//                                 {chartData.labels.map((_, index) => {
//                                   const cw = Math.max(width * 1.2, chartData.labels.length * 140);
//                                   const bw = (cw / chartData.labels.length) * 0.8 * 1.8;
//                                   const bs = (cw / chartData.labels.length) * 0.1;
//                                   const xp = 60 + (index * (cw / chartData.labels.length)) + bs;
//                                   return (
//                                     <TouchableOpacity key={`bar-${index}`} style={[s.barTouchArea, { left: xp, width: bw, height: 260, top: 30 }]} activeOpacity={0.6}
//                                       onPress={() => { showTooltipFn({ month: chartData.labels[index], earned: chartData.earned[index] || 0, upcoming: chartData.upcoming[index] || 0, x: xp + bw / 2, y: 200, barIndex: index }); setTimeout(hideTooltip, 5000); }}>
//                                       <View style={s.touchAreaIndicator} />
//                                     </TouchableOpacity>
//                                   );
//                                 })}
//                               </View>
//                               {tooltipVisible && tooltipData && (
//                                 <Animated.View style={[s.tooltipContainer, { opacity: tooltipOpacity, transform: [{ translateY: tooltipTranslateY }], left: Math.min(Math.max(20, tooltipData.x - 100), Math.max(width * 1.2, chartData.labels.length * 140) - 220), top: tooltipData.y }]}>
//                                   <View style={s.tooltipArrow} />
//                                   <View style={s.tooltipContent}>
//                                     <TouchableOpacity style={s.tooltipCloseButton} onPress={hideTooltip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
//                                       <Ionicons name="close-circle" size={18} color="#9CA3AF" />
//                                     </TouchableOpacity>
//                                     <View style={s.tooltipHeader}><Ionicons name="calendar" size={14} color="#6B5B95" /><Text style={s.tooltipMonth}>{tooltipData.month}</Text></View>
//                                     <View style={s.tooltipRow}><View style={s.tooltipLabelContainer}><View style={[s.tooltipIndicator, { backgroundColor: '#D91656' }]} /><Text style={s.tooltipLabel}>Earned</Text></View><Text style={[s.tooltipValue, { color: '#D91656' }]}>Rs. {formatCurrency(tooltipData.earned)}</Text></View>
//                                     <View style={s.tooltipRow}><View style={s.tooltipLabelContainer}><View style={[s.tooltipIndicator, { backgroundColor: '#6B7280' }]} /><Text style={s.tooltipLabel}>Total</Text></View><Text style={[s.tooltipValue, { color: '#374151' }]}>Rs. {formatCurrency(tooltipData.upcoming)}</Text></View>
//                                     <View style={s.tooltipDivider} />
//                                     <View style={s.tooltipRow}><Text style={s.tooltipTotalLabel}>Difference</Text><Text style={s.tooltipTotalValue}>Rs. {formatCurrency(tooltipData.upcoming - tooltipData.earned)}</Text></View>
//                                   </View>
//                                 </Animated.View>
//                               )}
//                             </View>
//                           </ScrollView>
//                           <View style={s.chartLegend}>
//                             <View style={s.legendItem}><View style={[s.legendColor, { backgroundColor: '#D91656' }]} /><Text style={s.legendText}>Earned</Text></View>
//                             <View style={s.legendItem}><View style={[s.legendColor, { backgroundColor: '#D1D5DB' }]} /><Text style={s.legendText}>Total</Text></View>
//                           </View>
//                         </View>
//                       ) : (
//                         <View style={s.chartEmptyContainer}><Ionicons name="bar-chart-outline" size={48} color="#D1D5DB" /><Text style={s.chartEmptyText}>No chart data available</Text></View>
//                       )}
//                     </>
//                   )}
//                 </View>

//                 {/* Date Range */}
//                 <View style={s.dateRangeContainer}>
//                   <TouchableOpacity onPress={() => setShowFromDatePicker(true)} style={s.dateButton} activeOpacity={0.8}>
//                     <View style={s.dateButtonContent}>
//                       <Ionicons name="calendar-outline" size={18} color="#6B5B95" />
//                       <View style={s.dateTextContainer}>
//                         <Text style={s.dateLabel}>From Date</Text>
//                         <Text style={s.dateValue}>{new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
//                       </View>
//                     </View>
//                   </TouchableOpacity>
//                   <TouchableOpacity onPress={() => setShowToDatePicker(true)} style={s.dateButton} activeOpacity={0.8}>
//                     <View style={s.dateButtonContent}>
//                       <Ionicons name="calendar-outline" size={18} color="#C9A965" />
//                       <View style={s.dateTextContainer}>
//                         <Text style={s.dateLabel}>To Date</Text>
//                         <Text style={s.dateValue}>{new Date(toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
//                       </View>
//                     </View>
//                   </TouchableOpacity>
//                 </View>

//                 {showFromDatePicker && <DateTimePicker value={new Date(fromDate)} mode="date" display="spinner" onChange={handleFromDateChange} accentColor="#6B5B95" themeVariant="light" />}
//                 {showToDatePicker   && <DateTimePicker value={new Date(toDate)}   mode="date" display="spinner" onChange={handleToDateChange}   accentColor="#6B5B95" themeVariant="light" />}

//                 {/* Summary Stats */}
//                 {summaryData?.summary && (
//                   <View style={s.summaryStatsContainer}>
//                     <View style={s.summaryStatsCard}>
//                       <View style={s.statItem}><Text style={s.statLabel}>Total Bookings</Text><Text style={s.statValue}>{getApprovedCount()}</Text></View>
//                       <View style={s.statDivider} />
//                       <View style={s.statItem}><Text style={s.statLabel}>Total Revenue</Text><Text style={[s.statValue, { fontSize: 14 }]}>Rs. {formatCurrency(summaryData.summary.total_price || 0)}</Text></View>
//                       <View style={s.statDivider} />
//                       <View style={s.statItem}><Text style={s.statLabel}>Commission</Text><Text style={[s.statValue, { fontSize: 14 }]}>Rs. {formatCurrency(summaryData.summary.total_commission || 0)}</Text></View>
//                     </View>
//                   </View>
//                 )}

//                 {/* Filter Buttons */}
//                 <View style={s.filterButtonsContainer}>
//                   {(['all', 'approved', 'cancelled'] as StatusFilter[]).map(f => (
//                     <TouchableOpacity key={f}
//                       style={[s.filterButton, f === 'all' && statusFilter === 'all' && s.filterButtonActive, f === 'approved' && statusFilter === 'approved' && s.filterButtonApprovedActive, f === 'cancelled' && statusFilter === 'cancelled' && s.filterButtonCancelledActive]}
//                       onPress={() => { setStatusFilter(f); setCurrentPage(1); setExpandedRows(new Set()); }} activeOpacity={0.7}>
//                       <Ionicons name={f === 'all' ? 'apps' : f === 'approved' ? 'checkmark-circle' : 'close-circle'} size={18} color={statusFilter === f ? '#FFFFFF' : f === 'approved' ? '#10B981' : f === 'cancelled' ? '#EF4444' : '#1F2937'} />
//                       <Text style={[s.filterButtonText, statusFilter === f && s.filterButtonTextActive, statusFilter !== f && { color: f === 'approved' ? '#10B981' : f === 'cancelled' ? '#EF4444' : '#1F2937' }]}>
//                         {f.charAt(0).toUpperCase() + f.slice(1)}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>

//                 <View style={s.resultsContainer}>
//                   <Text style={s.resultsText}>Showing {totalFilteredCount > 0 ? startIndex : 0}-{endIndex} of {totalFilteredCount} Booking{totalFilteredCount !== 1 ? 's' : ''} (Page {currentPage} of {totalPages || 1})</Text>
//                 </View>

//                 {/* Table Header */}
//                 <View style={s.tableHeader}>
//                   <View style={s.headerSourceColumn}><Text style={s.headerText}>Source</Text></View>
//                   <View style={s.headerGuestNameColumn}><Text style={s.headerText}>Guest Name</Text></View>
//                   <View style={s.headerPriceColumn}><Text style={s.headerText}>Price</Text></View>
//                   <View style={s.headerExpandColumn} />
//                 </View>
//               </>
//             }
//             data={filteredBookings}
//             keyExtractor={item => item.id.toString()}
//             renderItem={renderTableRow}
//             contentContainerStyle={s.listContainer}
//             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B5B95" colors={['#6B5B95']} />}
//             ListEmptyComponent={
//               <View style={s.emptyContainer}>
//                 <Ionicons name="document-text-outline" size={60} color="#6B5B95" />
//                 <Text style={s.emptyText}>No Bookings Found</Text>
//                 <Text style={s.emptySubtext}>{statusFilter !== 'all' ? `No ${statusFilter} bookings for the selected date range` : 'No bookings for the selected date range'}</Text>
//               </View>
//             }
//             ListFooterComponent={
//               totalFilteredCount > 0 ? (
//                 <View style={s.paginationContainer}>
//                   <TouchableOpacity style={[s.paginationButton, !hasPreviousPage && s.paginationButtonDisabled]} onPress={goToPreviousPage} disabled={!hasPreviousPage} activeOpacity={0.8}>
//                     <Ionicons name="arrow-back-circle-outline" size={20} color={hasPreviousPage ? '#6B5B95' : '#D1D5DB'} />
//                     <Text style={[s.paginationButtonText, !hasPreviousPage && s.paginationButtonTextDisabled]}>Previous</Text>
//                   </TouchableOpacity>
//                   <View style={s.pageInfoContainer}><Text style={s.pageInfoText}>Page {currentPage} of {totalPages || 1}</Text></View>
//                   <TouchableOpacity style={[s.paginationButton, !hasNextPage && s.paginationButtonDisabled]} onPress={goToNextPage} disabled={!hasNextPage} activeOpacity={0.8}>
//                     <Text style={[s.paginationButtonText, !hasNextPage && s.paginationButtonTextDisabled]}>Next</Text>
//                     <Ionicons name="arrow-forward-circle-outline" size={20} color={hasNextPage ? '#6B5B95' : '#D1D5DB'} />
//                   </TouchableOpacity>
//                 </View>
//               ) : null
//             }
//           />
//         )}
//       </View>
//     </View>
//   );
// };

// export default BookingSummary;

// // ── Styles ────────────────────────────────────────────────────────────────────
// const s = StyleSheet.create({
//   container:        { flex: 1, backgroundColor: '#F5F5F5' },
//   contentContainer: { flex: 1, backgroundColor: '#F5F5F5' },

//   chartSection: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, marginBottom: 12, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
//   chartHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
//   chartTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   chartTitle:          { fontSize: 16, fontWeight: '700', color: '#1F2937' },
//   chartToggleButton:   { padding: 4 },
//   chartMonthButton:    { backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 16 },
//   chartMonthContent:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 16 },
//   chartMonthText:      { fontSize: 14, fontWeight: '700', color: '#1F2937' },
//   chartInstructionContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#EEF2FF', borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#C7D2FE' },
//   chartInstructionText: { fontSize: 13, color: '#6B5B95', fontWeight: '700' },
//   chartContainer:       { alignItems: 'center', width: '100%' },
//   chartScrollContent:   { paddingRight: 20, paddingLeft: 10, paddingBottom: 10 },
//   chartWrapper:         { position: 'relative' },
//   barOverlayContainer:  { position: 'absolute', top: 0, left: 0, right: 0, height: '100%', flexDirection: 'row' },
//   barTouchArea:         { position: 'absolute', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
//   touchAreaIndicator:   { width: '100%', height: '100%', backgroundColor: 'transparent' },
//   chartLegend:          { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
//   legendItem:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   legendColor:          { width: 16, height: 16, borderRadius: 4 },
//   legendText:           { fontSize: 13, fontWeight: '600', color: '#6B7280' },
//   chartLoadingContainer:{ paddingVertical: 60, alignItems: 'center' },
//   chartLoadingText:     { color: '#6B5B95', fontSize: 14, marginTop: 12, fontWeight: '600' },
//   chartEmptyContainer:  { paddingVertical: 60, alignItems: 'center' },
//   chartEmptyText:       { color: '#9CA3AF', fontSize: 14, marginTop: 12, fontWeight: '600' },

//   tooltipContainer: { position: 'absolute', zIndex: 1000, elevation: 15, alignItems: 'center' },
//   tooltipArrow: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#FFFFFF', alignSelf: 'center', marginBottom: -1, elevation: 15 },
//   tooltipContent: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, minWidth: 180, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 15, borderWidth: 1, borderColor: '#E5E7EB' },
//   tooltipCloseButton:    { position: 'absolute', top: 8, right: 8, padding: 2, zIndex: 2 },
//   tooltipHeader:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
//   tooltipMonth:          { fontSize: 13, fontWeight: '700', color: '#1F2937' },
//   tooltipDivider:        { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
//   tooltipRow:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
//   tooltipLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   tooltipIndicator:      { width: 10, height: 10, borderRadius: 3 },
//   tooltipLabel:          { fontSize: 11, fontWeight: '600', color: '#6B7280' },
//   tooltipValue:          { fontSize: 12, fontWeight: '700' },
//   tooltipTotalLabel:     { fontSize: 11, fontWeight: '700', color: '#374151' },
//   tooltipTotalValue:     { fontSize: 13, fontWeight: '800', color: '#6B5B95' },

//   dateRangeContainer: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 16, marginBottom: 12 },
//   dateButton:         { flex: 1, borderRadius: 12, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
//   dateButtonContent:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 14 },
//   dateTextContainer:  { flex: 1 },
//   dateLabel:          { fontSize: 11, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
//   dateValue:          { fontSize: 13, color: '#1F2937', fontWeight: '700' },

//   summaryStatsContainer: { paddingHorizontal: 16, marginBottom: 16 },
//   summaryStatsCard:      { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6, borderWidth: 1, borderColor: '#E5E7EB' },
//   statItem:    { alignItems: 'center', flex: 1 },
//   statLabel:   { color: '#6B7280', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
//   statValue:   { color: '#1F2937', fontSize: 16, fontWeight: '800' },
//   statDivider: { width: 1, height: 40, backgroundColor: '#E5E7EB' },

//   filterButtonsContainer:      { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 16 },
//   filterButton:                { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
//   filterButtonActive:          { backgroundColor: '#1F2937', borderColor: '#1F2937' },
//   filterButtonApprovedActive:  { backgroundColor: '#10B981', borderColor: '#10B981' },
//   filterButtonCancelledActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
//   filterButtonText:            { fontSize: 13, fontWeight: '700', color: '#1F2937' },
//   filterButtonTextActive:      { color: '#FFFFFF' },

//   resultsContainer: { paddingHorizontal: 16, marginBottom: 12 },
//   resultsText:      { fontSize: 14, fontWeight: '600', color: '#6B7280' },

//   tableHeader:           { flexDirection: 'row', backgroundColor: '#6B5B95', paddingVertical: 14, paddingHorizontal: 16, marginHorizontal: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, alignItems: 'center' },
//   headerSourceColumn:    { width: 70 },
//   headerGuestNameColumn: { flex: 1 },
//   headerPriceColumn:     { width: 110 },
//   headerExpandColumn:    { width: 40 },
//   headerText:            { color: '#FFFFFF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },

//   tableRow:          { backgroundColor: '#FFFFFF', marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   tableRowCancelled: { backgroundColor: '#FEF2F2', borderLeftWidth: 4, borderLeftColor: '#EF4444' },
//   mainRow:           { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },

//   // ── Source image styles ──────────────────────────────────────────────────
//   sourceIconContainer: { width: 70, alignItems: 'flex-start' },
//   sourceImageWrapper: {
//     width: 44, height: 44, borderRadius: 10,
//     backgroundColor: '#F9F7FF', borderWidth: 1, borderColor: '#E5E7EB',
//     justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
//   },
//   sourceImage:     { width: 36, height: 36 },
//   sourceIconSmall: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

//   sourceDetailContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' },
//   sourceDetailImage:     { width: 24, height: 24, borderRadius: 5 },

//   guestNameContainer: { flex: 1, paddingHorizontal: 8 },
//   guestNameText:      { fontSize: 13, fontWeight: '600', color: '#1F2937' },
//   priceContainer:     { width: 110, alignItems: 'flex-end', paddingHorizontal: 8 },
//   priceText:          { fontSize: 13, fontWeight: '700', color: '#1F2937' },
//   expandButton:       { width: 40, alignItems: 'center' },

//   cancelledText:  { color: '#1F2937', textDecorationLine: 'line-through' },
//   cancelledLabel: { color: '#9CA3AF' },

//   expandedContent:          { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
//   expandedContentCancelled: { backgroundColor: '#FEE2E2' },
//   detailsColumn:  { gap: 2 },
//   detailRowFull:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   detailLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   detailLabel:     { fontSize: 11, fontWeight: '600', color: '#6B7280', letterSpacing: 0.5 },
//   detailValue:     { fontSize: 13, fontWeight: '600', color: '#1F2937' },
//   detailValueBold: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
//   statusBadgeSmall: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1.5 },
//   statusTextSmall:  { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
//   loadingText:      { color: '#6B5B95', fontSize: 16, marginTop: 12, fontWeight: '600' },
//   emptyContainer:   { paddingVertical: 60, alignItems: 'center' },
//   emptyText:        { color: '#1F2937', fontSize: 18, fontWeight: '600', marginTop: 16 },
//   emptySubtext:     { color: '#6B7280', fontSize: 14, marginTop: 4 },
//   listContainer:    { paddingBottom: 80 },

//   paginationContainer:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 20, gap: 12 },
//   paginationButton:              { backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, borderWidth: 2, borderColor: '#6B5B95', flex: 1, justifyContent: 'center' },
//   paginationButtonDisabled:      { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
//   paginationButtonText:          { color: '#6B5B95', fontSize: 14, fontWeight: '700' },
//   paginationButtonTextDisabled:  { color: '#D1D5DB' },
//   pageInfoContainer:             { backgroundColor: '#6B5B95', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
//   pageInfoText:                  { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
// });


// app/summary/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator,
  Alert, RefreshControl, ScrollView, Dimensions, Animated, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import HeaderWithMenu from '../../components/HeaderWithMenu';
import bookingSummaryService from '../../services/bookingSummary';
import { BookingSummaryItem, BookingSummaryResponse } from '../../types/summary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Source Image Map ──────────────────────────────────────────────────────────
const SOURCE_IMAGES: Record<string, any> = {
  airbnb:                        require('../../assets/adult/airbnb.png'),
  'air bnb':                     require('../../assets/adult/airbnb.png'),
  booking:                       require('../../assets/adult/booking.png'),
  'booking.com':                 require('../../assets/adult/booking.png'),
  agoda:                         require('../../assets/adult/agoda.png'),
  expedia:                       require('../../assets/adult/expedia.png'),
  'expedia affiliate network':   require('../../assets/adult/expedia.png'),
  online:                        require('../../assets/adult/online.png'),
  agency:                        require('../../assets/adult/agency.png'),
  ai:                            require('../../assets/adult/Ai.png'),
  ravan:                         require('../../assets/adult/ravan.png'),
  walking:                       require('../../assets/adult/walking.png'),
  'walk in':                     require('../../assets/adult/walking.png'),
  walkin:                        require('../../assets/adult/walking.png'),
  phone:                         require('../../assets/adult/phone.png'),
  no:                            require('../../assets/adult/no.png'),
  direct:                        require('../../assets/adult/a.png'),
  download:                      require('../../assets/adult/download.png'),
};

const getSourceImage = (source: string | null | undefined) => {
  if (!source) return null;
  const key = source.toLowerCase().trim();
  if (SOURCE_IMAGES[key]) return SOURCE_IMAGES[key];
  for (const [k, v] of Object.entries(SOURCE_IMAGES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
};

const getSourceColor = (source: string): string => {
  const s = source.toLowerCase();
  if (s.includes('airbnb'))  return '#FF5A5F';
  if (s.includes('booking')) return '#003580';
  if (s.includes('expedia')) return '#FFCB05';
  return '#6B5B95';
};

// ── Y-axis formatter  (1K / 10K / 1M etc) ────────────────────────────────────
const formatYLabel = (value: number): string => {
  if (value === 0) return '0';
  if (value >= 1_000_000) {
    const v = value / 1_000_000;
    return Number.isInteger(v) ? `${v}M` : `${v.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const v = value / 1_000;
    return Number.isInteger(v) ? `${v}K` : `${v.toFixed(1)}K`;
  }
  return `${value}`;
};

const fmt = (v: number) =>
  v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ═══════════════════════════════════════════════════════════════════════════════
//  CUSTOM BAR CHART
// ═══════════════════════════════════════════════════════════════════════════════
interface BarEntry {
  label:      string;
  earned:     number;
  total:      number;
  isSelected: boolean;
}

interface CustomChartProps {
  entries:     BarEntry[];
  onBarPress:  (entry: BarEntry, index: number) => void;
  activeIndex: number | null;
}

const CHART_H      = 220;   // drawable bar height
const Y_AXIS_W     = 54;    // left column for y-labels
const X_LABEL_H    = 38;    // bottom row for x-labels
const GRID_COUNT   = 5;
// ── UPDATED: narrower bars & smaller gap ──
const BAR_GAP      = 40;     // gap between bars
const BAR_MIN_W    = 40;    // minimum bar width

function niceMax(raw: number): number {
  if (raw <= 0) return 1000;
  const mag  = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const m of [1, 2, 2.5, 5, 10]) {
    const c = m * mag;
    if (c >= raw) return c;
  }
  return mag * 10;
}

const CustomBarChart: React.FC<CustomChartProps> = ({ entries, onBarPress, activeIndex }) => {
  const maxRaw  = entries.reduce((mx, e) => Math.max(mx, e.total, e.earned), 0);
  const maxVal  = niceMax(maxRaw);
  const pxUnit  = CHART_H / maxVal;

  const ticks = Array.from({ length: GRID_COUNT + 1 }, (_, i) =>
    Math.round((maxVal / GRID_COUNT) * i)
  );

  const innerW  = SCREEN_WIDTH - 32 - Y_AXIS_W - 8;
  const minW    = entries.length * (BAR_MIN_W + BAR_GAP);
  const totalW  = Math.max(innerW, minW);
  // ── UPDATED: narrower bar width ──
  const barW    = Math.max(BAR_MIN_W, Math.min(22, (totalW / entries.length) - BAR_GAP));
  const scroll  = totalW > innerW;

  // No DIFF_ZONE_H needed anymore (arrow removed)
  const totalH = CHART_H + X_LABEL_H;

  const renderBars = () => (
    <View style={{ width: totalW, height: totalH }}>
      {/* Grid lines */}
      {ticks.map((tick, ti) => {
        const y = CHART_H - tick * pxUnit;
        return (
          <View key={`g${ti}`} style={{
            position: 'absolute', left: 0, right: 0, top: y, height: 1,
            backgroundColor: ti === 0 ? '#CBD5E1' : '#EEF2F7',
          }} />
        );
      })}

      {/* Bars */}
      {entries.map((e, idx) => {
        const x       = idx * (barW + BAR_GAP) + BAR_GAP / 2;
        const earnH   = Math.max(0, Math.round(e.earned * pxUnit));
        const totalHt = Math.max(0, Math.round(e.total  * pxUnit));
        const isActive= activeIndex === idx;
        const isSel   = e.isSelected;

        return (
          <TouchableOpacity
            key={`b${idx}`}
            activeOpacity={0.8}
            onPress={() => onBarPress(e, idx)}
            style={{ position: 'absolute', left: x, width: barW, top: 0, height: CHART_H + X_LABEL_H }}
          >
            {/* ── UPDATED: Gray "difference" portion (total bar background) ── */}
            {totalHt > 0 && (
              <View style={{
                position: 'absolute', bottom: X_LABEL_H, left: 0, width: barW, height: totalHt,
                backgroundColor: isActive ? '#9CA3AF' : '#D1D5DB',  // Gray = Difference portion
                borderTopLeftRadius: 6, borderTopRightRadius: 6, overflow: 'hidden',
              }} />
            )}

            {/* ── UPDATED: Red "earned" bar ── */}
            {earnH > 0 && (
              <View style={{
                position: 'absolute', bottom: X_LABEL_H, left: 0, width: barW, height: earnH,
                borderTopLeftRadius: earnH >= totalHt ? 6 : 0,
                borderTopRightRadius: earnH >= totalHt ? 6 : 0,
                overflow: 'hidden',
              }}>
                <LinearGradient
                  colors={isActive ? ['#FF2D72', '#B0003B'] : ['#F0176A', '#D91656']}
                  style={{ flex: 1 }}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                />
              </View>
            )}

            {/* ── REMOVED: Difference arrow indicator ── */}

            {/* Active ring */}
            {isActive && totalHt > 0 && (
              <View style={{
                position: 'absolute', bottom: X_LABEL_H - 2, left: -2,
                width: barW + 4, height: totalHt + 4,
                borderRadius: 8, borderWidth: 2, borderColor: '#6B5B95',
              }} />
            )}

            {/* X-label */}
            <View style={{
              position: 'absolute', bottom: 0, left: -(BAR_GAP / 2),
              width: barW + BAR_GAP, height: X_LABEL_H,
              justifyContent: 'flex-start', alignItems: 'center', paddingTop: 6,
            }}>
              <Text numberOfLines={2} style={{
                fontSize: isSel ? 11 : 10,
                fontWeight: isSel ? '800' : '500',
                color: isSel ? '#5B4A85' : '#6B7280',
                textAlign: 'center', lineHeight: 13,
              }}>
                {e.label}
              </Text>
              {isSel && (
                <View style={{ marginTop: 2, width: 18, height: 3, backgroundColor: '#6B5B95', borderRadius: 2 }} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={{ flexDirection: 'row', paddingTop: 4 }}>
      {/* Y-axis */}
      <View style={{ width: Y_AXIS_W, height: CHART_H }}>
        {[...ticks].reverse().map((tick, ti) => (
          <Text key={`y${ti}`} style={{
            position: 'absolute',
            top: CHART_H - tick * pxUnit - 9,
            right: 6, fontSize: 10, color: '#9CA3AF', fontWeight: '600', textAlign: 'right',
          }}>
            {formatYLabel(tick)}
          </Text>
        ))}
      </View>

      {/* Chart */}
      {scroll ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingRight: 4 }}>
          {renderBars()}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{renderBars()}</View>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  TOOLTIP
// ═══════════════════════════════════════════════════════════════════════════════
interface TooltipProps {
  visible:    boolean;
  data:       BarEntry | null;
  opacity:    Animated.Value;
  translateY: Animated.Value;
  onClose:    () => void;
}

const ChartTooltip: React.FC<TooltipProps> = ({ visible, data, opacity, translateY, onClose }) => {
  if (!visible || !data) return null;
  const diff = data.total - data.earned;
  return (
    <Animated.View style={[s.tooltipWrap, { opacity, transform: [{ translateY }] }]}>
      <View style={s.tooltipInner}>
        <TouchableOpacity style={s.tooltipClose} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color="#9CA3AF" />
        </TouchableOpacity>
        <View style={s.tooltipHead}>
          <Ionicons name="calendar" size={14} color="#6B5B95" />
          <Text style={s.tooltipMonth}>{data.label}</Text>
        </View>
        {/* ── Earned Row (Red) ── */}
        <View style={s.tooltipRow}>
          <View style={s.tooltipLabelWrap}>
            <View style={[s.tooltipDot, { backgroundColor: '#D91656' }]} />
            <Text style={s.tooltipLabel}>Earned</Text>
          </View>
          <Text style={[s.tooltipVal, { color: '#D91656' }]}>Rs. {fmt(data.earned)}</Text>
        </View>
        {/* ── Difference Row (Gray) ── */}
        <View style={s.tooltipRow}>
          <View style={s.tooltipLabelWrap}>
            <View style={[s.tooltipDot, { backgroundColor: '#D1D5DB' }]} />
            <Text style={s.tooltipLabel}>Forcased</Text>
          </View>
          <Text style={[s.tooltipVal, { color: '#9CA3AF' }]}>Rs. {fmt(diff)}</Text>
        </View>
        <View style={s.tooltipDivider} />
        {/* ── Total Row ── */}
        <View style={s.tooltipRow}>
          <View style={s.tooltipLabelWrap}>
            <Ionicons name="wallet" size={13} color="#6B5B95" />
            <Text style={s.tooltipDiffLbl}>Total</Text>
          </View>
          <Text style={s.tooltipDiffVal}>Rs. {fmt(data.total)}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
interface MonthlyChartData { labels: string[]; earned: number[]; upcoming: number[]; selected: string; }
type StatusFilter = 'all' | 'approved' | 'cancelled';

const BookingSummary = () => {
  const getFirstDayOfMonth = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().split('T')[0]; };
  const getToday        = () => new Date().toISOString().split('T')[0];
  const getCurrentMonth = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`; };

  const [fromDate, setFromDate]                     = useState(getFirstDayOfMonth());
  const [toDate, setToDate]                         = useState(getToday());
  const [showFromPicker, setShowFromPicker]         = useState(false);
  const [showToPicker, setShowToPicker]             = useState(false);
  const [summaryData, setSummaryData]               = useState<BookingSummaryResponse | null>(null);
  const [loading, setLoading]                       = useState(false);
  const [refreshing, setRefreshing]                 = useState(false);
  const [expandedRows, setExpandedRows]             = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage]               = useState(1);
  const [statusFilter, setStatusFilter]             = useState<StatusFilter>('approved');

  const [chartData, setChartData]                     = useState<MonthlyChartData | null>(null);
  const [chartLoading, setChartLoading]               = useState(false);
  const [selectedMonth, setSelectedMonth]             = useState(getCurrentMonth());
  const [showMonthPicker, setShowMonthPicker]         = useState(false);
  const [showChart, setShowChart]                     = useState(true);

  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const [tooltipEntry, setTooltipEntry]     = useState<BarEntry | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const tooltipTransY  = useRef(new Animated.Value(-10)).current;

  const ITEMS_PER_PAGE = 10;

  useEffect(() => { loadSummaryData(); }, [fromDate, toDate]);
  useEffect(() => { loadChartData();   }, [selectedMonth]);
  useEffect(() => { setCurrentPage(1); }, [summaryData, statusFilter]);

  const loadChartData = async () => {
    try {
      setChartLoading(true);
      const r = await bookingSummaryService.getMonthlyChart(selectedMonth);
      setChartData(r);
    } catch (e) { if (e instanceof Error) Alert.alert('Chart Error', e.message); }
    finally { setChartLoading(false); }
  };

  const loadSummaryData = async () => {
    try {
      setLoading(true);
      const r = await bookingSummaryService.getBookingSummary(fromDate, toDate);
      if (r?.data !== undefined) setSummaryData(r);
      else Alert.alert('Error', 'Invalid response format');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Unexpected error');
    } finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); setCurrentPage(1); loadSummaryData(); loadChartData(); };

  const goNext = () => { setCurrentPage(p => p + 1); setExpandedRows(new Set()); };
  const goPrev = () => { if (currentPage > 1) { setCurrentPage(p => p - 1); setExpandedRows(new Set()); } };

  const toggleExpand = (id: number) =>
    setExpandedRows(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const handleMonthChange = (_: any, date?: Date) => {
    setShowMonthPicker(false);
    if (date) setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const selectedMonthShort = (() => {
    const [y, m] = selectedMonth.split('-');
    return new Date(parseInt(y), parseInt(m) - 1)
      .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  })();

  const barEntries: BarEntry[] = chartData
    ? chartData.labels.map((label, i) => ({
        label,
        earned:     chartData.earned[i]   ?? 0,
        total:      chartData.upcoming[i] ?? 0,
        isSelected: label.trim().toLowerCase() === selectedMonthShort.trim().toLowerCase(),
      }))
    : [];

  const showTooltipAnim = (entry: BarEntry, idx: number) => {
    setActiveBarIndex(idx); setTooltipEntry(entry); setTooltipVisible(true);
    tooltipOpacity.setValue(0); tooltipTransY.setValue(-15);
    Animated.parallel([
      Animated.timing(tooltipOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(tooltipTransY,  { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
    setTimeout(hideTooltip, 6000);
  };

  const hideTooltip = () => {
    Animated.parallel([
      Animated.timing(tooltipOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(tooltipTransY,  { toValue: -8, duration: 180, useNativeDriver: true }),
    ]).start(() => { setTooltipVisible(false); setTooltipEntry(null); setActiveBarIndex(null); });
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': case 'confirmed': return { bg: '#10B98115', border: '#10B981', text: '#10B981' };
      case 'cancelled': case 'canceled': return { bg: '#EF444415', border: '#EF4444', text: '#EF4444' };
      case 'pending': return { bg: '#F59E0B15', border: '#F59E0B', text: '#F59E0B' };
      default: return { bg: '#6B728015', border: '#6B7280', text: '#6B7280' };
    }
  };

  const isCancelled      = (s: string) => ['cancelled', 'canceled'].includes(s.toLowerCase());
  const getApprovedCount = () => summaryData?.data.filter(b => ['approved', 'confirmed'].includes(b.status.toLowerCase())).length ?? 0;

  const filterByStatus = (bks: BookingSummaryItem[]) => {
    if (statusFilter === 'all') return bks;
    return bks.filter(b => {
      const s = b.status.toLowerCase();
      if (statusFilter === 'approved')  return s === 'approved'  || s === 'confirmed';
      if (statusFilter === 'cancelled') return s === 'cancelled' || s === 'canceled';
      return true;
    });
  };

  const getFiltered = (): BookingSummaryItem[] => {
    if (!summaryData?.data) return [];
    const f = filterByStatus(summaryData.data);
    const s = (currentPage - 1) * ITEMS_PER_PAGE;
    return f.slice(s, s + ITEMS_PER_PAGE);
  };

  const totalFiltered = !summaryData?.data ? 0 : filterByStatus(summaryData.data).length;
  const totalPages    = Math.ceil(totalFiltered / ITEMS_PER_PAGE);
  const hasNext       = currentPage < totalPages;
  const hasPrev       = currentPage > 1;
  const startIdx      = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx        = Math.min(currentPage * ITEMS_PER_PAGE, totalFiltered);
  const fmtDate       = (d: string) => { const dt = new Date(d); return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
  const fmtMonthYear  = (m: string) => { const [y, mo] = m.split('-'); return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); };

  // ── Table row ──────────────────────────────────────────────────────────────
  const renderRow = ({ item }: { item: BookingSummaryItem }) => {
    const expanded    = expandedRows.has(item.id);
    const ss          = getStatusStyle(item.status);
    const cancelled   = isCancelled(item.status);
    const srcImg      = getSourceImage(item.source);
    const srcColor    = getSourceColor(item.source);

    return (
      <View style={[s.tableRow, cancelled && s.tableRowCancelled]}>
        <View style={s.mainRow}>
          <View style={s.srcIconWrap}>
            {srcImg
              ? <View style={s.srcImgBox}><Image source={srcImg} style={s.srcImg} resizeMode="contain" /></View>
              : <View style={[s.srcIconFallback, { backgroundColor: cancelled ? '#D1D5DB' : srcColor }]}><Ionicons name="globe" size={16} color="#FFF" /></View>
            }
          </View>
          <View style={s.guestCol}>
            <Text style={[s.guestName, cancelled && s.crossedOut]} numberOfLines={1}>{item.guest_name}</Text>
          </View>
          <View style={s.priceCol}>
            <Text style={[s.priceText, cancelled && s.crossedOut]}>${item.usdprice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleExpand(item.id)} style={s.expandBtn}>
            <Ionicons name={expanded ? 'chevron-up-circle' : 'chevron-down-circle'} size={24} color={cancelled ? '#D1D5DB' : '#6B5B95'} />
          </TouchableOpacity>
        </View>

        {expanded && (
          <View style={[s.expandedWrap, cancelled && s.expandedCancelled]}>
            <View style={s.detailsWrap}>
              {[
                { icon: 'globe-outline',            label: 'SOURCE',         val: item.source,     src: true  },
                { icon: 'person-outline',            label: 'GUEST DETAILS', val: item.guest_details              },
                { icon: 'wallet-outline',            label: 'PRICE',         val: `Rs.${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, bold: true },
                { icon: 'log-in-outline',            label: 'CHECK-IN',      val: fmtDate(item.check_in)          },
                { icon: 'log-out-outline',           label: 'CHECK-OUT',     val: fmtDate(item.check_out)         },
                { icon: 'bed-outline',               label: 'ROOMS',         val: item.rooms                      },
                { icon: 'calendar-outline',          label: 'BOOKED ON',     val: fmtDate(item.booked_on)         },
              ].map(row => (
                <View key={row.label} style={s.detailRow}>
                  <View style={s.detailLblWrap}>
                    <Ionicons name={row.icon as any} size={16} color={cancelled ? '#9CA3AF' : '#6B5B95'} />
                    <Text style={[s.detailLbl, cancelled && s.cancelLbl]}>{row.label}:</Text>
                  </View>
                  {row.src ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                      {srcImg && <Image source={srcImg} style={{ width: 22, height: 22, borderRadius: 4 }} resizeMode="contain" />}
                      <Text style={[s.detailVal, cancelled && s.crossedOut]}>{row.val}</Text>
                    </View>
                  ) : (
                    <Text style={[row.bold ? s.detailValBold : s.detailVal, cancelled && s.crossedOut]}>{row.val}</Text>
                  )}
                </View>
              ))}

              <View style={s.detailRow}>
                <View style={s.detailLblWrap}>
                  <Ionicons name="information-circle-outline" size={16} color={cancelled ? '#9CA3AF' : '#6B5B95'} />
                  <Text style={[s.detailLbl, cancelled && s.cancelLbl]}>STATUS:</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: ss.bg, borderColor: ss.border }]}>
                  <Text style={[s.statusBadgeText, { color: ss.text }]}>{item.status}</Text>
                </View>
              </View>

              <View style={s.detailRow}>
                <View style={s.detailLblWrap}>
                  <Ionicons name="wallet-outline" size={16} color={cancelled ? '#9CA3AF' : '#10B981'} />
                  <Text style={[s.detailLbl, cancelled ? s.cancelLbl : { color: '#10B981' }]}>COMMISSION:</Text>
                </View>
                <Text style={[s.detailValBold, cancelled ? s.crossedOut : { color: '#10B981' }]}>
                  Rs.{item.commission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
                <View style={s.detailLblWrap}>
                  <Ionicons name="receipt-outline" size={16} color={cancelled ? '#9CA3AF' : '#6B5B95'} />
                  <Text style={[s.detailLbl, cancelled && s.cancelLbl]}>BOOKING NUMBER:</Text>
                </View>
                <Text style={[s.detailVal, cancelled && s.crossedOut]}>{item.booking_number || '–'}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <HeaderWithMenu title="Booking Summary" subtitle="View and analyze your booking reports" showNotification showMenuToggle />

      <View style={{ flex: 1 }}>
        {loading && !refreshing ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color="#6B5B95" />
            <Text style={s.loadingTxt}>Loading summary data...</Text>
          </View>
        ) : (
          <FlatList
            ListHeaderComponent={<>
              {/* ── CHART ─────────────────────────────────────────────── */}
              <View style={s.chartCard}>
                <View style={s.chartTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons name="bar-chart" size={22} color="#6B5B95" />
                    <Text style={s.chartTitle}>Monthly Booking Summary</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowChart(!showChart)} style={{ padding: 4 }}>
                    <Ionicons name={showChart ? 'chevron-up' : 'chevron-down'} size={20} color="#6B5B95" />
                  </TouchableOpacity>
                </View>

                {showChart && <>
                  {/* Month selector */}
                  <TouchableOpacity onPress={() => setShowMonthPicker(true)} style={s.monthBtn} activeOpacity={0.8}>
                    <Ionicons name="calendar" size={20} color="#6B5B95" />
                    <Text style={s.monthBtnTxt}>{fmtMonthYear(selectedMonth)}</Text>
                    <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                  </TouchableOpacity>

                  {showMonthPicker && (
                    <DateTimePicker value={new Date(selectedMonth + '-01')} mode="date" display="spinner"
                      onChange={handleMonthChange} accentColor="#6B5B95" themeVariant="light" />
                  )}

                  <View style={s.tapHint}>
                    <Ionicons name="finger-print" size={15} color="#6B5B95" />
                    <Text style={s.tapHintTxt}>👆 Tap any bar to view details</Text>
                  </View>

                  {chartLoading ? (
                    <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                      <ActivityIndicator size="large" color="#6B5B95" />
                      <Text style={{ color: '#6B5B95', marginTop: 10, fontWeight: '600' }}>Loading chart...</Text>
                    </View>
                  ) : barEntries.length > 0 ? (<>
                    <CustomBarChart entries={barEntries} onBarPress={showTooltipAnim} activeIndex={activeBarIndex} />

                    {/* Tooltip — rendered below chart, full-width */}
                    <ChartTooltip
                      visible={tooltipVisible} data={tooltipEntry}
                      opacity={tooltipOpacity} translateY={tooltipTransY}
                      onClose={hideTooltip}
                    />

                    {/* ── UPDATED Legend ── */}
                    <View style={s.legendRow}>
                      <View style={s.legendItem}>
                        <LinearGradient colors={['#F0176A', '#D91656']} style={s.legendSwatch} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                        <Text style={s.legendTxt}>Earned</Text>
                      </View>
                      <View style={s.legendItem}>
                        <View style={[s.legendSwatch, { backgroundColor: '#D1D5DB' }]} />
                        <Text style={s.legendTxt}>Forcased</Text>
                      </View>
                    </View>
                  </>) : (
                    <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                      <Ionicons name="bar-chart-outline" size={48} color="#D1D5DB" />
                      <Text style={{ color: '#9CA3AF', marginTop: 12, fontWeight: '600' }}>No chart data available</Text>
                    </View>
                  )}
                </>}
              </View>

              {/* ── DATE RANGE ────────────────────────────────────────── */}
              <View style={s.dateRow}>
                {[
                  { label: 'From Date', val: fromDate, color: '#6B5B95', onPress: () => setShowFromPicker(true) },
                  { label: 'To Date',   val: toDate,   color: '#C9A965', onPress: () => setShowToPicker(true)   },
                ].map(d => (
                  <TouchableOpacity key={d.label} onPress={d.onPress} style={s.dateBtn} activeOpacity={0.8}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 14 }}>
                      <Ionicons name="calendar-outline" size={18} color={d.color} />
                      <View>
                        <Text style={s.dateLbl}>{d.label}</Text>
                        <Text style={s.dateVal}>{new Date(d.val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              {showFromPicker && <DateTimePicker value={new Date(fromDate)} mode="date" display="spinner" onChange={(_, d) => { setShowFromPicker(false); if (d) setFromDate(d.toISOString().split('T')[0]); }} accentColor="#6B5B95" themeVariant="light" />}
              {showToPicker   && <DateTimePicker value={new Date(toDate)}   mode="date" display="spinner" onChange={(_, d) => { setShowToPicker(false);   if (d) setToDate(d.toISOString().split('T')[0]); }} accentColor="#6B5B95" themeVariant="light" />}

              {/* ── STATS ─────────────────────────────────────────────── */}
              {summaryData?.summary && (
                <View style={s.statsWrap}>
                  <View style={s.statsCard}>
                    <View style={s.statItem}><Text style={s.statLbl}>Total Bookings</Text><Text style={s.statVal}>{getApprovedCount()}</Text></View>
                    <View style={s.statDiv} />
                    <View style={s.statItem}><Text style={s.statLbl}>Total Revenue</Text><Text style={[s.statVal, { fontSize: 13 }]}>Rs. {fmt(summaryData.summary.total_price || 0)}</Text></View>
                    <View style={s.statDiv} />
                    <View style={s.statItem}><Text style={s.statLbl}>Commission</Text><Text style={[s.statVal, { fontSize: 13 }]}>Rs. {fmt(summaryData.summary.total_commission || 0)}</Text></View>
                  </View>
                </View>
              )}

              {/* ── FILTERS ───────────────────────────────────────────── */}
              <View style={s.filterRow}>
                {(['all', 'approved', 'cancelled'] as StatusFilter[]).map(f => (
                  <TouchableOpacity key={f}
                    style={[
                      s.filterBtn,
                      f === 'all'       && statusFilter === 'all'       && s.filterAllActive,
                      f === 'approved'  && statusFilter === 'approved'  && s.filterApproveActive,
                      f === 'cancelled' && statusFilter === 'cancelled' && s.filterCancelActive,
                    ]}
                    onPress={() => { setStatusFilter(f); setCurrentPage(1); setExpandedRows(new Set()); }}>
                    <Ionicons
                      name={f === 'all' ? 'apps' : f === 'approved' ? 'checkmark-circle' : 'close-circle'}
                      size={17}
                      color={statusFilter === f ? '#FFF' : f === 'approved' ? '#10B981' : f === 'cancelled' ? '#EF4444' : '#1F2937'}
                    />
                    <Text style={[s.filterBtnTxt, statusFilter === f && { color: '#FFF' }, statusFilter !== f && { color: f === 'approved' ? '#10B981' : f === 'cancelled' ? '#EF4444' : '#1F2937' }]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B7280' }}>
                  Showing {totalFiltered > 0 ? startIdx : 0}–{endIdx} of {totalFiltered} Booking{totalFiltered !== 1 ? 's' : ''} (Page {currentPage} of {totalPages || 1})
                </Text>
              </View>

              {/* Table header */}
              <View style={s.tableHead}>
                <View style={{ width: 70 }}><Text style={s.headTxt}>Source</Text></View>
                <View style={{ flex: 1 }}><Text style={s.headTxt}>Guest Name</Text></View>
                <View style={{ width: 110 }}><Text style={s.headTxt}>Price</Text></View>
                <View style={{ width: 40 }} />
              </View>
            </>}
            data={getFiltered()}
            keyExtractor={item => item.id.toString()}
            renderItem={renderRow}
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B5B95" colors={['#6B5B95']} />}
            ListEmptyComponent={
              <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                <Ionicons name="document-text-outline" size={60} color="#6B5B95" />
                <Text style={{ color: '#1F2937', fontSize: 18, fontWeight: '600', marginTop: 16 }}>No Bookings Found</Text>
                <Text style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>
                  {statusFilter !== 'all' ? `No ${statusFilter} bookings for the selected date range` : 'No bookings for the selected date range'}
                </Text>
              </View>
            }
            ListFooterComponent={totalFiltered > 0 ? (
              <View style={s.pagination}>
                <TouchableOpacity style={[s.pageBtn, !hasPrev && s.pageBtnOff]} onPress={goPrev} disabled={!hasPrev}>
                  <Ionicons name="arrow-back-circle-outline" size={20} color={hasPrev ? '#6B5B95' : '#D1D5DB'} />
                  <Text style={[s.pageBtnTxt, !hasPrev && { color: '#D1D5DB' }]}>Previous</Text>
                </TouchableOpacity>
                <View style={s.pageInfo}><Text style={s.pageInfoTxt}>Page {currentPage} of {totalPages || 1}</Text></View>
                <TouchableOpacity style={[s.pageBtn, !hasNext && s.pageBtnOff]} onPress={goNext} disabled={!hasNext}>
                  <Text style={[s.pageBtnTxt, !hasNext && { color: '#D1D5DB' }]}>Next</Text>
                  <Ionicons name="arrow-forward-circle-outline" size={20} color={hasNext ? '#6B5B95' : '#D1D5DB'} />
                </TouchableOpacity>
              </View>
            ) : null}
          />
        )}
      </View>
    </View>
  );
};

export default BookingSummary;

// ═══════════════════════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#F5F5F5' },
  loadingWrap:{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  loadingTxt: { color: '#6B5B95', fontSize: 16, marginTop: 12, fontWeight: '600' },

  // Chart card
  chartCard: {
    backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 16, marginBottom: 12,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  chartTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  chartTitle:  { fontSize: 16, fontWeight: '700', color: '#1F2937' },

  monthBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 14,
  },
  monthBtnTxt: { fontSize: 15, fontWeight: '700', color: '#1F2937', flex: 1, textAlign: 'center' },

  tapHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: '#EEF2FF', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#C7D2FE',
  },
  tapHintTxt: { fontSize: 12, color: '#6B5B95', fontWeight: '700' },

  legendRow:   { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendSwatch:{ width: 16, height: 10, borderRadius: 3 },
  legendTxt:   { fontSize: 12, fontWeight: '600', color: '#6B7280' },

  // Tooltip
  tooltipWrap: {
    marginTop: 10, marginHorizontal: 4, borderRadius: 14, backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 12, elevation: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  tooltipInner:   { padding: 14 },
  tooltipClose:   { position: 'absolute', top: 8, right: 8, zIndex: 2 },
  tooltipHead:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  tooltipMonth:   { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  tooltipRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  tooltipLabelWrap:{ flexDirection: 'row', alignItems: 'center', gap: 7 },
  tooltipDot:     { width: 10, height: 10, borderRadius: 3 },
  tooltipLabel:   { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  tooltipVal:     { fontSize: 13, fontWeight: '700' },
  tooltipDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 7 },
  tooltipDiffLbl: { fontSize: 12, fontWeight: '700', color: '#6B5B95', marginLeft: 4 },
  tooltipDiffVal: { fontSize: 14, fontWeight: '800', color: '#6B5B95' },

  // Date range
  dateRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 4, marginBottom: 12 },
  dateBtn: { flex: 1, borderRadius: 12, backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  dateLbl: { fontSize: 11, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  dateVal: { fontSize: 13, color: '#1F2937', fontWeight: '700' },

  // Stats
  statsWrap:  { paddingHorizontal: 16, marginBottom: 14 },
  statsCard:  { backgroundColor: '#FFF', borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  statItem:   { alignItems: 'center', flex: 1 },
  statLbl:    { color: '#6B7280', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginBottom: 5, letterSpacing: 0.4 },
  statVal:    { color: '#1F2937', fontSize: 15, fontWeight: '800' },
  statDiv:    { width: 1, height: 34, backgroundColor: '#E5E7EB' },

  // Filters
  filterRow:         { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  filterBtn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderRadius: 10, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  filterAllActive:   { backgroundColor: '#1F2937', borderColor: '#1F2937' },
  filterApproveActive:{ backgroundColor: '#10B981', borderColor: '#10B981' },
  filterCancelActive:{ backgroundColor: '#EF4444', borderColor: '#EF4444' },
  filterBtnTxt:      { fontSize: 12, fontWeight: '700' },

  // Table
  tableHead:  { flexDirection: 'row', backgroundColor: '#6B5B95', paddingVertical: 13, paddingHorizontal: 16, marginHorizontal: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, alignItems: 'center' },
  headTxt:    { color: '#FFF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  tableRow:         { backgroundColor: '#FFF', marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tableRowCancelled:{ backgroundColor: '#FEF2F2', borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  mainRow:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16 },

  srcIconWrap:    { width: 70, alignItems: 'flex-start' },
  srcImgBox:      { width: 44, height: 44, borderRadius: 10, backgroundColor: '#F9F7FF', borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  srcImg:         { width: 36, height: 36 },
  srcIconFallback:{ width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  guestCol:  { flex: 1, paddingHorizontal: 8 },
  guestName: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  priceCol:  { width: 110, alignItems: 'flex-end', paddingHorizontal: 8 },
  priceText: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
  expandBtn: { width: 40, alignItems: 'center' },

  crossedOut: { textDecorationLine: 'line-through', color: '#1F2937' },
  cancelLbl:  { color: '#9CA3AF' },

  expandedWrap:     { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  expandedCancelled:{ backgroundColor: '#FEE2E2' },
  detailsWrap:      { gap: 2 },
  detailRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, paddingHorizontal: 14, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  detailLblWrap:    { flexDirection: 'row', alignItems: 'center', gap: 7 },
  detailLbl:        { fontSize: 11, fontWeight: '600', color: '#6B7280', letterSpacing: 0.4 },
  detailVal:        { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  detailValBold:    { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  statusBadge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1.5 },
  statusBadgeText:  { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Pagination
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 20, gap: 10 },
  pageBtn:    { backgroundColor: '#FFF', paddingVertical: 11, paddingHorizontal: 14, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 7, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, borderWidth: 2, borderColor: '#6B5B95', flex: 1, justifyContent: 'center' },
  pageBtnOff: { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
  pageBtnTxt: { color: '#6B5B95', fontSize: 13, fontWeight: '700' },
  pageInfo:   { backgroundColor: '#6B5B95', paddingVertical: 11, paddingHorizontal: 16, borderRadius: 10 },
  pageInfoTxt:{ color: '#FFF', fontSize: 12, fontWeight: '700' },
});