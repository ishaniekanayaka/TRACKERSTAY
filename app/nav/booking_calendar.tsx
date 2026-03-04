// // app/calendar/index.tsx
// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import {
//   StyleSheet, Text, View, TouchableOpacity, ScrollView,
//   ActivityIndicator, Alert, RefreshControl, Modal,
//   Dimensions, Animated, Image,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import HeaderWithMenu from '../../components/HeaderWithMenu';
// import bookingCalendarService, {
//   BookingCalendarResponse,
//   CalendarCategory,
//   CalendarRoom,
//   RoomBookingEntry,
// } from '../../services/bookingCalendar';

// // ── Layout constants ──────────────────────────────────────────────────────────
// const DAY_W  = 54;
// const ROOM_W = 62;
// const ROW_H  = 50;
// const HEAD_H = 46;

// // ── OTA config: icon + brand colour ──────────────────────────────────────────
// const OTA_IMAGES: Record<string, any> = {
//   airbnb:                      require('../../assets/adult/airbnb.png'),
//   'air bnb':                   require('../../assets/adult/airbnb.png'),
//   booking:                     require('../../assets/adult/booking.png'),
//   'booking.com':               require('../../assets/adult/booking.png'),
//   agoda:                       require('../../assets/adult/agoda.png'),
//   expedia:                     require('../../assets/adult/expedia.png'),
//   'expedia affiliate network': require('../../assets/adult/expedia.png'),
//   online:                      require('../../assets/adult/online.png'),
//   agency:                      require('../../assets/adult/agency.png'),
//   ai:                          require('../../assets/adult/Ai.png'),
//   ravan:                       require('../../assets/adult/ravan.png'),
//   walking:                     require('../../assets/adult/walking.png'),
//   'walk in':                   require('../../assets/adult/walking.png'),
//   walkin:                      require('../../assets/adult/walking.png'),
//   phone:                       require('../../assets/adult/phone.png'),
//   direct:                      require('../../assets/adult/a.png'),
// };

// // OTA brand colours — block background colour is determined by booking source
// const OTA_COLORS: Record<string, string> = {
//   airbnb:                      '#FF5A5F',
//   'air bnb':                   '#FF5A5F',
//   booking:                     '#003580',
//   'booking.com':               '#003580',
//   agoda:                       '#E4002B',
//   expedia:                     '#FFC72C',
//   'expedia affiliate network': '#FFC72C',
//   online:                      '#6B5B95',
//   agency:                      '#2E4057',
//   walking:                     '#2F9E44',
//   'walk in':                   '#2F9E44',
//   walkin:                      '#2F9E44',
//   phone:                       '#1098AD',
//   direct:                      '#495057',
//   ravan:                       '#C2255C',
// };

// const FALLBACK_COLORS = [
//   '#3B5BDB','#E03131','#2F9E44','#E67700','#7048E8',
//   '#1098AD','#C2255C','#0CA678','#F76707','#6741D9',
// ];

// const getOtaKey = (method?: string | null): string => {
//   if (!method) return '';
//   const k = method.toLowerCase().trim();
//   if (OTA_IMAGES[k]) return k;
//   for (const key of Object.keys(OTA_IMAGES)) {
//     if (k.includes(key) || key.includes(k)) return key;
//   }
//   return '';
// };

// const getOtaImage = (method?: string | null) => {
//   const key = getOtaKey(method);
//   return key ? OTA_IMAGES[key] : null;
// };

// const getBlockColor = (booking: RoomBookingEntry): string => {
//   const key = getOtaKey(booking.method);
//   if (key && OTA_COLORS[key]) return OTA_COLORS[key];
//   // Fallback: colour derived from booking_id so same booking = same colour
//   return FALLBACK_COLORS[Math.abs(booking.booking_id) % FALLBACK_COLORS.length];
// };

// // ── Status helpers ────────────────────────────────────────────────────────────
// const statusMeta = (status: string) => {
//   const s = status.toLowerCase();
//   if (s === 'approved' || s === 'confirmed') return { color: '#10B981', bg: '#ECFDF5', label: 'APPROVED' };
//   if (s === 'cancelled' || s === 'canceled') return { color: '#EF4444', bg: '#FEF2F2', label: 'CANCELLED' };
//   if (s === 'pending')                        return { color: '#F59E0B', bg: '#FFFBEB', label: 'PENDING' };
//   return { color: '#6B5B95', bg: '#F5F3FF', label: status.toUpperCase() };
// };
// const isCancelledStatus = (s: string) => ['cancelled','canceled'].includes(s.toLowerCase());

// const DAYS_SHORT = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

// // ── Placed block ──────────────────────────────────────────────────────────────
// interface PlacedBlock { entry: RoomBookingEntry; startIdx: number; span: number; }

// // ── Date helpers ──────────────────────────────────────────────────────────────
// const fmtDate = (d: string) => {
//   const dt = new Date(d);
//   return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// const BookingCalendar = () => {
//   const now = new Date();
//   const [year,  setYear]            = useState(now.getFullYear());
//   const [month, setMonth]           = useState(now.getMonth());
//   const [showPicker, setShowPicker] = useState(false);
//   const [data,  setData]            = useState<BookingCalendarResponse | null>(null);
//   const [loading, setLoading]       = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selected, setSelected]     = useState<RoomBookingEntry | null>(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const modalAnim = useRef(new Animated.Value(0)).current;

//   const monthFirstDay = `${year}-${String(month+1).padStart(2,'0')}-01`;
//   const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

//   // ── Fetch ─────────────────────────────────────────────────────────────────
//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await bookingCalendarService.getCalendarBookings(monthFirstDay);
//       setData(res);
//     } catch (err) {
//       Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load');
//     } finally { setLoading(false); setRefreshing(false); }
//   }, [monthFirstDay]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   // ── Month nav ─────────────────────────────────────────────────────────────
//   const goPrev = () => { if (month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
//   const goNext = () => { if (month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };
//   const onPick = (_:any, d?:Date) => {
//     setShowPicker(false);
//     if (d){ setYear(d.getFullYear()); setMonth(d.getMonth()); }
//   };

//   // ── Modal ─────────────────────────────────────────────────────────────────
//   const openModal = (e: RoomBookingEntry) => {
//     setSelected(e); setModalVisible(true);
//     modalAnim.setValue(0);
//     Animated.spring(modalAnim, { toValue:1, useNativeDriver:true, tension:80, friction:10 }).start();
//   };
//   const closeModal = () => {
//     Animated.timing(modalAnim, { toValue:0, duration:180, useNativeDriver:true })
//       .start(()=>{ setModalVisible(false); setSelected(null); });
//   };

//   // ── Day list ──────────────────────────────────────────────────────────────
//   const dayList: string[] = data?.days_in_month ?? [];
//   const totalDayW = dayList.length * DAY_W;

//   // ── Build placed blocks for a room ───────────────────────────────────────
//   // Now: room.bookings[] directly contains the booking entries with start_date/end_date
//   const getPlacedBlocks = (room: CalendarRoom): PlacedBlock[] => {
//     if (!dayList.length) return [];
//     const result: PlacedBlock[] = [];

//     (room.bookings ?? []).forEach(entry => {
//       const ciStr = entry.start_date;
//       const coStr = entry.end_date;

//       let startIdx = dayList.indexOf(ciStr);
//       let endIdx   = dayList.indexOf(coStr);

//       // Clamp: booking starts before month
//       if (startIdx < 0 && ciStr < dayList[0]) startIdx = 0;
//       // Clamp: booking ends after month
//       if (endIdx   < 0 && coStr > dayList[dayList.length - 1]) endIdx = dayList.length;
//       // Skip if entirely outside month
//       if (startIdx < 0 || endIdx <= startIdx) return;

//       const span = Math.max(1, endIdx - startIdx);
//       result.push({ entry, startIdx, span });
//     });

//     return result;
//   };

//   // ── Summary counts ────────────────────────────────────────────────────────
//   const counts = useMemo(() => {
//     if (!data) return { approved: 0, pending: 0, cancelled: 0 };
//     let approved = 0, pending = 0, cancelled = 0;
//     data.categories.forEach(cat => {
//       cat.rooms.forEach(room => {
//         (room.bookings ?? []).forEach(b => {
//           const s = b.status.toLowerCase();
//           if (s === 'approved' || s === 'confirmed') approved++;
//           else if (s === 'pending') pending++;
//           else if (s === 'cancelled' || s === 'canceled') cancelled++;
//         });
//       });
//     });
//     return { approved, pending, cancelled };
//   }, [data]);

//   const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month:'long', year:'numeric' });

//   // ── Render category ───────────────────────────────────────────────────────
//   const renderCategory = (cat: CalendarCategory) => (
//     <View key={`cat-${cat.category_id}`} style={s.catCard}>

//       {/* Category header bar */}
//       <View style={s.catBar}>
//         <Ionicons name="bed" size={16} color="#fff" />
//         <Text style={s.catBarTxt}>{cat.category_name}</Text>
//         <View style={s.catBadge}>
//           <Text style={s.catBadgeTxt}>{cat.rooms.length} rooms</Text>
//         </View>
//       </View>

//       {/* Table: sticky left column + horizontal scroll right */}
//       <View style={s.tableWrap}>

//         {/* ── STICKY LEFT COLUMN ── */}
//         <View style={s.stickyCol}>
//           {/* "ROOM" header */}
//           <View style={s.stickyHead}>
//             <Text style={s.stickyHeadTxt}>ROOM</Text>
//           </View>
//           {/* Room labels */}
//           {cat.rooms.map((room, idx) => (
//             <View
//               key={`sticky-${cat.category_id}-${room.id}`}
//               style={[s.stickyCell, idx === cat.rooms.length - 1 && s.noBorder]}
//             >
//               <Text style={s.stickyCellTxt}>{room.room_number}</Text>
//             </View>
//           ))}
//         </View>

//         {/* ── SCROLLABLE RIGHT SIDE ── */}
//         <ScrollView horizontal showsHorizontalScrollIndicator persistentScrollbar style={s.hScroll}>
//           <View style={{ width: totalDayW }}>

//             {/* Day header row */}
//             <View style={s.dayHeadRow}>
//               {dayList.map((dateStr, i) => {
//                 const d   = new Date(dateStr);
//                 const dow = DAYS_SHORT[d.getDay()];
//                 const isWE = d.getDay() === 0 || d.getDay() === 6;
//                 const isTD = dateStr === todayStr;
//                 return (
//                   <View
//                     key={`dh-${cat.category_id}-${i}`}
//                     style={[s.dayHead, { width: DAY_W }, isWE && s.dayHeadWE, isTD && s.dayHeadToday]}
//                   >
//                     <Text style={[s.dayNum, isTD && s.dayNumToday]}>{d.getDate()}</Text>
//                     <Text style={[s.dayDow, isTD && s.dayDowToday]}>{dow}</Text>
//                   </View>
//                 );
//               })}
//             </View>

//             {/* Grid rows — one per room */}
//             {cat.rooms.map((room, rIdx) => {
//               const blocks = getPlacedBlocks(room);
//               return (
//                 <View
//                   key={`row-${cat.category_id}-${room.id}`}
//                   style={[s.gridRow, { width: totalDayW }, rIdx === cat.rooms.length - 1 && s.noBorder]}
//                 >
//                   {/* Background day cells */}
//                   {dayList.map((dateStr, i) => {
//                     const dow = new Date(dateStr).getDay();
//                     const isWE = dow === 0 || dow === 6;
//                     const isTD = dateStr === todayStr;
//                     return (
//                       <View
//                         key={`bg-${cat.category_id}-${room.id}-${i}`}
//                         style={[s.dayBg, { width: DAY_W }, isWE && s.dayBgWE, isTD && s.dayBgToday]}
//                       />
//                     );
//                   })}

//                   {/* Booking blocks */}
//                   {blocks.map(({ entry, startIdx, span }) => {
//                     const isCancelled = isCancelledStatus(entry.status);
//                     const color   = isCancelled ? '#9CA3AF' : getBlockColor(entry);
//                     const left    = startIdx * DAY_W + 1;
//                     const width   = span * DAY_W - 2;
//                     const otaImg  = getOtaImage(entry.method);

//                     return (
//                       <TouchableOpacity
//                         key={`block-${cat.category_id}-${room.id}-${entry.booking_id}-${startIdx}`}
//                         activeOpacity={0.82}
//                         onPress={() => openModal(entry)}
//                         style={[
//                           s.block,
//                           { left, width, backgroundColor: color },
//                           isCancelled && s.blockCancelled,
//                         ]}
//                       >
//                         {/* OTA icon */}
//                         {otaImg && width > 55 && (
//                           <View style={s.blockIconWrap}>
//                             <Image source={otaImg} style={s.blockIcon} resizeMode="contain" />
//                           </View>
//                         )}
//                         {/* Guest name */}
//                         <Text style={s.blockName} numberOfLines={1} ellipsizeMode="tail">
//                           {isCancelled ? `✕ ${entry.guest_name}` : entry.guest_name}
//                         </Text>
//                       </TouchableOpacity>
//                     );
//                   })}
//                 </View>
//               );
//             })}
//           </View>
//         </ScrollView>
//       </View>
//     </View>
//   );

//   // ── Detail Modal ──────────────────────────────────────────────────────────
//   const renderModal = () => {
//     if (!selected) return null;
//     const e      = selected;
//     const meta   = statusMeta(e.status);
//     const color  = getBlockColor(e);
//     const otaImg = getOtaImage(e.method);

//     const scale   = modalAnim.interpolate({ inputRange:[0,1], outputRange:[0.88,1] });
//     const opacity = modalAnim;

//     return (
//       <Modal transparent animationType="none" visible={modalVisible} onRequestClose={closeModal}>
//         <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={closeModal}>
//           <Animated.View style={[s.modalCard, { opacity, transform:[{ scale }] }]}>
//             <TouchableOpacity activeOpacity={1} onPress={() => {}}>

//               {/* Header */}
//               <View style={[s.mHead, { backgroundColor: color }]}>
//                 <View style={s.mHeadLeft}>
//                   {otaImg
//                     ? <Image source={otaImg} style={s.mOtaImg} resizeMode="contain" />
//                     : <View style={s.mOtaFb}><Ionicons name="globe" size={20} color="#fff" /></View>
//                   }
//                   <View style={{ flex: 1 }}>
//                     <Text style={s.mName} numberOfLines={1}>{e.guest_name}</Text>
//                     {e.method && <Text style={s.mMethod}>{e.method}</Text>}
//                   </View>
//                 </View>
//                 <TouchableOpacity onPress={closeModal} hitSlop={{ top:12, bottom:12, left:12, right:12 }}>
//                   <Ionicons name="close-circle" size={26} color="rgba(255,255,255,0.9)" />
//                 </TouchableOpacity>
//               </View>

//               {/* Status */}
//               <View style={[s.mStatus, { backgroundColor: meta.bg }]}>
//                 <View style={[s.mDot, { backgroundColor: meta.color }]} />
//                 <Text style={[s.mStatusTxt, { color: meta.color }]}>{meta.label}</Text>
//                 <Text style={s.mCode}>  #{e.booking_id}</Text>
//               </View>

//               {/* Details */}
//               <View style={s.mBody}>
//                 {[
//                   { icon:'log-in-outline',     label:'Check-In',  val: fmtDate(e.start_date) },
//                   { icon:'log-out-outline',     label:'Check-Out', val: fmtDate(e.end_date) },
//                   { icon:'moon-outline',        label:'Type',      val: e.booking_type ?? '—' },
//                   { icon:'globe-outline',       label:'Source',    val: e.method ?? '—' },
//                 ].map(row => (
//                   <View key={`mr-${row.label}`} style={s.mRow}>
//                     <View style={s.mRowLeft}>
//                       <Ionicons name={row.icon as any} size={15} color="#6B5B95" />
//                       <Text style={s.mLabel}>{row.label}</Text>
//                     </View>
//                     <Text style={s.mVal} numberOfLines={2}>{row.val}</Text>
//                   </View>
//                 ))}
//               </View>
//             </TouchableOpacity>
//           </Animated.View>
//         </TouchableOpacity>
//       </Modal>
//     );
//   };

//   // ── UI ────────────────────────────────────────────────────────────────────
//   return (
//     <View style={s.container}>
//       <HeaderWithMenu
//         title="Booking Calendar"
//         subtitle="Monthly room availability overview"
//         showNotification showMenuToggle
//       />

//       {/* Month bar */}
//       <View style={s.monthBar}>
//         <TouchableOpacity onPress={goPrev} style={s.navBtn} activeOpacity={0.7}>
//           <Ionicons name="chevron-back-circle" size={34} color="#6B5B95" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => setShowPicker(true)} style={s.monthBtn} activeOpacity={0.8}>
//           <Ionicons name="calendar" size={17} color="#6B5B95" />
//           <Text style={s.monthBtnTxt}>{monthLabel}</Text>
//           <Ionicons name="chevron-down" size={15} color="#9CA3AF" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={goNext} style={s.navBtn} activeOpacity={0.7}>
//           <Ionicons name="chevron-forward-circle" size={34} color="#6B5B95" />
//         </TouchableOpacity>
//       </View>

//       {showPicker && (
//         <DateTimePicker
//           value={new Date(year, month, 1)}
//           mode="date" display="spinner"
//           onChange={onPick}
//           accentColor="#6B5B95" themeVariant="light"
//         />
//       )}

//       {/* Legend pills */}
//       <View style={s.legend}>
//         {([
//           { label:'Approved',  color:'#10B981', count: counts.approved  },
//           { label:'Pending',   color:'#F59E0B', count: counts.pending   },
//           { label:'Cancelled', color:'#EF4444', count: counts.cancelled },
//         ] as const).map(({ label, color, count }) => (
//           <View key={label} style={[s.pill, { borderColor: color + '55', backgroundColor: color + '14' }]}>
//             <View style={[s.pillDot, { backgroundColor: color }]} />
//             <Text style={[s.pillLabel, { color }]}>{label}</Text>
//             <View style={[s.pillBadge, { backgroundColor: color }]}>
//               <Text style={s.pillBadgeTxt}>{count}</Text>
//             </View>
//           </View>
//         ))}
//       </View>

//       {/* OTA legend */}
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.otaLegendScroll} contentContainerStyle={s.otaLegendContent}>
//         {([
//           { label:'Booking.com', color:'#003580', key:'booking' },
//           { label:'Airbnb',      color:'#FF5A5F', key:'airbnb'  },
//           { label:'Expedia',     color:'#FFC72C', key:'expedia' },
//           { label:'Agoda',       color:'#E4002B', key:'agoda'   },
//           { label:'Agency',      color:'#2E4057', key:'agency'  },
//           { label:'Online',      color:'#6B5B95', key:'online'  },
//           { label:'Walk-in',     color:'#2F9E44', key:'walking' },
//           { label:'Direct',      color:'#495057', key:'direct'  },
//         ]).map(({ label, color, key }) => (
//           <View key={key} style={s.otaChip}>
//             <View style={[s.otaChipDot, { backgroundColor: color }]} />
//             {OTA_IMAGES[key] && (
//               <Image source={OTA_IMAGES[key]} style={s.otaChipImg} resizeMode="contain" />
//             )}
//             <Text style={s.otaChipTxt}>{label}</Text>
//           </View>
//         ))}
//       </ScrollView>

//       {/* Body */}
//       {loading && !refreshing ? (
//         <View style={s.loadWrap}>
//           <ActivityIndicator size="large" color="#6B5B95" />
//           <Text style={s.loadTxt}>Loading calendar...</Text>
//         </View>
//       ) : (
//         <ScrollView
//           style={s.scroll}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={() => { setRefreshing(true); fetchData(); }}
//               tintColor="#6B5B95" colors={['#6B5B95']}
//             />
//           }
//         >
//           {!data || data.categories.length === 0 ? (
//             <View style={s.emptyWrap}>
//               <Ionicons name="calendar-outline" size={62} color="#D1D5DB" />
//               <Text style={s.emptyTitle}>No Bookings This Month</Text>
//               <Text style={s.emptySub}>Pull down to refresh</Text>
//             </View>
//           ) : (
//             data.categories.map(cat => renderCategory(cat))
//           )}
//           <View style={{ height: 80 }} />
//         </ScrollView>
//       )}

//       {renderModal()}
//     </View>
//   );
// };

// export default BookingCalendar;

// // ── Styles ────────────────────────────────────────────────────────────────────
// const s = StyleSheet.create({
//   container: { flex:1, backgroundColor:'#F0EEF8' },
//   scroll:    { flex:1 },

//   monthBar: {
//     flexDirection:'row', alignItems:'center', justifyContent:'space-between',
//     backgroundColor:'#fff', paddingHorizontal:14, paddingVertical:10,
//     borderBottomWidth:1, borderBottomColor:'#E5E7EB',
//     shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:4, elevation:3,
//   },
//   navBtn:     { padding:4 },
//   monthBtn:   {
//     flexDirection:'row', alignItems:'center', gap:8,
//     paddingVertical:9, paddingHorizontal:18,
//     backgroundColor:'#F5F3FF', borderRadius:12, borderWidth:1.5, borderColor:'#C4B5FD',
//   },
//   monthBtnTxt: { fontSize:15, fontWeight:'700', color:'#1F2937' },

//   legend: {
//     flexDirection:'row', justifyContent:'center', gap:8,
//     paddingVertical:8, paddingHorizontal:12,
//     backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:'#E5E7EB',
//   },
//   pill:       { flexDirection:'row', alignItems:'center', gap:5, paddingVertical:5, paddingHorizontal:9, borderRadius:20, borderWidth:1 },
//   pillDot:    { width:8, height:8, borderRadius:4 },
//   pillLabel:  { fontSize:11, fontWeight:'600' },
//   pillBadge:  { borderRadius:10, paddingHorizontal:6, paddingVertical:1, minWidth:20, alignItems:'center' },
//   pillBadgeTxt:{ fontSize:11, fontWeight:'800', color:'#fff' },

//   // OTA source legend scrollable row
//   otaLegendScroll:  { maxHeight:34, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:'#E5E7EB' },
//   otaLegendContent: { paddingHorizontal:12, paddingVertical:6, flexDirection:'row', gap:8 },
//   otaChip:    { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:8, paddingVertical:3, backgroundColor:'#F3F4F6', borderRadius:12 },
//   otaChipDot: { width:8, height:8, borderRadius:4 },
//   otaChipImg: { width:14, height:14, borderRadius:2 },
//   otaChipTxt: { fontSize:10, fontWeight:'600', color:'#374151' },

//   // Category card
//   catCard: {
//     backgroundColor:'#fff', marginHorizontal:12, marginTop:14, borderRadius:14, overflow:'hidden',
//     shadowColor:'#000', shadowOffset:{width:0,height:3}, shadowOpacity:0.09, shadowRadius:10, elevation:5,
//   },
//   catBar: {
//     flexDirection:'row', alignItems:'center', gap:8,
//     paddingVertical:11, paddingHorizontal:16, backgroundColor:'#6B5B95',
//   },
//   catBarTxt:  { fontSize:15, fontWeight:'800', color:'#fff', flex:1 },
//   catBadge:   { backgroundColor:'rgba(255,255,255,0.25)', borderRadius:10, paddingHorizontal:8, paddingVertical:2 },
//   catBadgeTxt:{ fontSize:11, fontWeight:'700', color:'#fff' },

//   // Table layout
//   tableWrap: { flexDirection:'row' },

//   // Sticky column
//   stickyCol: { width:ROOM_W, zIndex:10 },
//   stickyHead: {
//     width:ROOM_W, height:HEAD_H, justifyContent:'center', alignItems:'center',
//     backgroundColor:'#EDE9F6', borderRightWidth:1.5, borderRightColor:'#D1C4E9',
//     borderBottomWidth:1.5, borderBottomColor:'#D1C4E9',
//   },
//   stickyHeadTxt: { fontSize:10, fontWeight:'700', color:'#6B5B95', textTransform:'uppercase' },
//   stickyCell: {
//     width:ROOM_W, height:ROW_H, justifyContent:'center', alignItems:'center',
//     backgroundColor:'#F9F7FF', borderRightWidth:1.5, borderRightColor:'#D1C4E9',
//     borderBottomWidth:1, borderBottomColor:'#EDE9F6',
//   },
//   stickyCellTxt: { fontSize:13, fontWeight:'700', color:'#6B5B95' },
//   noBorder: { borderBottomWidth:0 },

//   // Horizontal scroll
//   hScroll: { flex:1 },

//   // Day header
//   dayHeadRow: { flexDirection:'row', borderBottomWidth:1.5, borderBottomColor:'#D1C4E9' },
//   dayHead:    {
//     height:HEAD_H, justifyContent:'center', alignItems:'center',
//     borderRightWidth:1, borderRightColor:'#EDE9F6', backgroundColor:'#F5F3FF',
//   },
//   dayHeadWE:    { backgroundColor:'#EDE9F6' },
//   dayHeadToday: { backgroundColor:'#6B5B95' },
//   dayNum:       { fontSize:13, fontWeight:'700', color:'#374151' },
//   dayNumToday:  { color:'#fff' },
//   dayDow:       { fontSize:9,  fontWeight:'600', color:'#9CA3AF', marginTop:1 },
//   dayDowToday:  { color:'rgba(255,255,255,0.85)' },

//   // Grid row
//   gridRow: {
//     flexDirection:'row', position:'relative',
//     height:ROW_H, borderBottomWidth:1, borderBottomColor:'#F0EEF8',
//   },

//   // Day background cells
//   dayBg:      { height:ROW_H, borderRightWidth:1, borderRightColor:'#F3F0FF' },
//   dayBgWE:    { backgroundColor:'#FAF7FF' },
//   dayBgToday: { backgroundColor:'#EEF2FF' },

//   // Booking block
//   block: {
//     position:'absolute', top:5, height:ROW_H - 10,
//     borderRadius:7, flexDirection:'row', alignItems:'center',
//     paddingHorizontal:5, gap:4,
//     shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.28, shadowRadius:4, elevation:6,
//     overflow:'hidden',
//   },
//   blockCancelled: { opacity:0.6, borderWidth:1.5, borderColor:'#EF4444', borderStyle:'dashed' },
//   blockIconWrap:  { width:18, height:18, borderRadius:4, backgroundColor:'rgba(255,255,255,0.25)', justifyContent:'center', alignItems:'center', flexShrink:0 },
//   blockIcon:      { width:14, height:14 },
//   blockName:      { fontSize:11, fontWeight:'700', color:'#fff', flexShrink:1 },

//   // Loading / empty
//   loadWrap:  { flex:1, justifyContent:'center', alignItems:'center', paddingTop:120 },
//   loadTxt:   { color:'#6B5B95', fontSize:15, marginTop:12, fontWeight:'600' },
//   emptyWrap: { paddingTop:80, alignItems:'center' },
//   emptyTitle:{ fontSize:17, fontWeight:'700', color:'#1F2937', marginTop:16 },
//   emptySub:  { fontSize:13, color:'#9CA3AF', marginTop:6 },

//   // Modal
//   overlay: {
//     flex:1, backgroundColor:'rgba(0,0,0,0.52)',
//     justifyContent:'center', alignItems:'center', padding:20,
//   },
//   modalCard: {
//     backgroundColor:'#fff', borderRadius:18, overflow:'hidden',
//     width:'100%', maxWidth:430,
//     shadowColor:'#000', shadowOffset:{width:0,height:14}, shadowOpacity:0.3, shadowRadius:28, elevation:22,
//   },
//   mHead:    { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16 },
//   mHeadLeft:{ flexDirection:'row', alignItems:'center', gap:10, flex:1 },
//   mOtaImg:  { width:38, height:38, borderRadius:8, backgroundColor:'rgba(255,255,255,0.15)' },
//   mOtaFb:   { width:38, height:38, borderRadius:8, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center' },
//   mName:    { fontSize:16, fontWeight:'800', color:'#fff' },
//   mMethod:  { fontSize:12, color:'rgba(255,255,255,0.85)', marginTop:2 },
//   mStatus:  { flexDirection:'row', alignItems:'center', gap:8, paddingHorizontal:16, paddingVertical:9 },
//   mDot:     { width:8, height:8, borderRadius:4 },
//   mStatusTxt:{ fontSize:11, fontWeight:'800', letterSpacing:0.8 },
//   mCode:    { fontSize:11, color:'#9CA3AF', fontWeight:'600' },
//   mBody:    { paddingHorizontal:16, paddingBottom:18, paddingTop:2 },
//   mRow: {
//     flexDirection:'row', justifyContent:'space-between', alignItems:'center',
//     paddingVertical:11, borderBottomWidth:1, borderBottomColor:'#F3F4F6',
//   },
//   mRowLeft: { flexDirection:'row', alignItems:'center', gap:7 },
//   mLabel:   { fontSize:12, fontWeight:'600', color:'#6B7280' },
//   mVal:     { fontSize:13, fontWeight:'700', color:'#1F2937', maxWidth:'60%', textAlign:'right' },
// }); 




// // app/calendar/index.tsx
// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import {
//   StyleSheet, Text, View, TouchableOpacity, ScrollView,
//   ActivityIndicator, Alert, RefreshControl, Modal,
//   Dimensions, Animated, Image,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import HeaderWithMenu from '../../components/HeaderWithMenu';
// import bookingCalendarService, {
//   BookingCalendarResponse,
//   CalendarCategory,
//   CalendarRoom,
//   RoomBookingEntry,
//   RepairEntry,
// } from '../../services/bookingCalendar';

// // ── Layout ────────────────────────────────────────────────────────────────────
// const DAY_W  = 54;
// const ROOM_W = 62;
// const ROW_H  = 50;
// const HEAD_H = 46;

// // ── OTA images ────────────────────────────────────────────────────────────────
// const OTA_IMAGES: Record<string, any> = {
//   airbnb:                      require('../../assets/adult/airbnb.png'),
//   'air bnb':                   require('../../assets/adult/airbnb.png'),
//   booking:                     require('../../assets/adult/booking.png'),
//   'booking.com':               require('../../assets/adult/booking.png'),
//   agoda:                       require('../../assets/adult/agoda.png'),
//   expedia:                     require('../../assets/adult/expedia.png'),
//   'expedia affiliate network': require('../../assets/adult/expedia.png'),
//   online:                      require('../../assets/adult/online.png'),
//   agency:                      require('../../assets/adult/agency.png'),
//   ai:                          require('../../assets/adult/Ai.png'),
//   ravan:                       require('../../assets/adult/ravan.png'),
//   walking:                     require('../../assets/adult/walking.png'),
//   'walk in':                   require('../../assets/adult/walking.png'),
//   walkin:                      require('../../assets/adult/walking.png'),
//   phone:                       require('../../assets/adult/phone.png'),
//   direct:                      require('../../assets/adult/a.png'),
// };

// const OTA_COLORS: Record<string, string> = {
//   airbnb:                      '#FF5A5F',
//   'air bnb':                   '#FF5A5F',
//   booking:                     '#003580',
//   'booking.com':               '#003580',
//   agoda:                       '#E4002B',
//   expedia:                     '#FFC72C',
//   'expedia affiliate network': '#FFC72C',
//   online:                      '#6B5B95',
//   agency:                      '#2E4057',
//   walking:                     '#2F9E44',
//   'walk in':                   '#2F9E44',
//   walkin:                      '#2F9E44',
//   phone:                       '#1098AD',
//   direct:                      '#495057',
//   ravan:                       '#C2255C',
// };

// const FALLBACK_COLORS = [
//   '#3B5BDB','#E03131','#2F9E44','#E67700','#7048E8',
//   '#1098AD','#C2255C','#0CA678','#F76707','#6741D9',
// ];

// const getOtaKey = (method?: string | null) => {
//   if (!method) return '';
//   const k = method.toLowerCase().trim();
//   if (OTA_IMAGES[k]) return k;
//   for (const key of Object.keys(OTA_IMAGES)) {
//     if (k.includes(key) || key.includes(k)) return key;
//   }
//   return '';
// };
// const getOtaImage  = (method?: string | null) => { const k = getOtaKey(method); return k ? OTA_IMAGES[k] : null; };
// const getBlockColor = (b: RoomBookingEntry) => {
//   const k = getOtaKey(b.method);
//   if (k && OTA_COLORS[k]) return OTA_COLORS[k];
//   return FALLBACK_COLORS[Math.abs(b.booking_id) % FALLBACK_COLORS.length];
// };

// // ── Status ────────────────────────────────────────────────────────────────────
// const isApproved  = (s: string) => ['approved','confirmed'].includes(s.toLowerCase());
// const isCancelled = (s: string) => ['cancelled','canceled'].includes(s.toLowerCase());
// const statusMeta  = (s: string) => {
//   if (isApproved(s))  return { color:'#10B981', bg:'#ECFDF5', label:'APPROVED'  };
//   if (isCancelled(s)) return { color:'#EF4444', bg:'#FEF2F2', label:'CANCELLED' };
//   if (s.toLowerCase()==='pending') return { color:'#F59E0B', bg:'#FFFBEB', label:'PENDING' };
//   return { color:'#6B5B95', bg:'#F5F3FF', label: s.toUpperCase() };
// };

// const DAYS_SHORT = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

// // ── Block types ───────────────────────────────────────────────────────────────
// interface PlacedBlock  { kind:'booking'; entry: RoomBookingEntry; startIdx:number; span:number; }
// interface PlacedRepair { kind:'repair';  entry: RepairEntry;       startIdx:number; span:number; }
// type AnyBlock = PlacedBlock | PlacedRepair;

// const fmtDate = (d:string) => {
//   const dt = new Date(d);
//   return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
// };

// // ─────────────────────────────────────────────────────────────────────────────
// const BookingCalendar = () => {
//   const now = new Date();
//   const [year,  setYear]            = useState(now.getFullYear());
//   const [month, setMonth]           = useState(now.getMonth());
//   const [showPicker, setShowPicker] = useState(false);
//   const [data,  setData]            = useState<BookingCalendarResponse | null>(null);
//   const [loading, setLoading]       = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // Modal can show either a booking or a repair
//   const [selBooking, setSelBooking] = useState<RoomBookingEntry | null>(null);
//   const [selRepair,  setSelRepair]  = useState<RepairEntry | null>(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const modalAnim = useRef(new Animated.Value(0)).current;

//   const monthFirstDay = `${year}-${String(month+1).padStart(2,'0')}-01`;
//   const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

//   // ── Fetch ─────────────────────────────────────────────────────────────────
//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await bookingCalendarService.getCalendarBookings(monthFirstDay);
//       setData(res);
//     } catch (err) {
//       Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load');
//     } finally { setLoading(false); setRefreshing(false); }
//   }, [monthFirstDay]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   // ── Month nav ─────────────────────────────────────────────────────────────
//   const goPrev = () => { if (month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
//   const goNext = () => { if (month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };
//   const onPick = (_:any, d?:Date) => {
//     setShowPicker(false);
//     if (d){ setYear(d.getFullYear()); setMonth(d.getMonth()); }
//   };

//   // ── Modal ─────────────────────────────────────────────────────────────────
//   const openBookingModal = (e: RoomBookingEntry) => {
//     setSelBooking(e); setSelRepair(null); setModalVisible(true);
//     modalAnim.setValue(0);
//     Animated.spring(modalAnim,{toValue:1,useNativeDriver:true,tension:80,friction:10}).start();
//   };
//   const openRepairModal = (e: RepairEntry) => {
//     setSelRepair(e); setSelBooking(null); setModalVisible(true);
//     modalAnim.setValue(0);
//     Animated.spring(modalAnim,{toValue:1,useNativeDriver:true,tension:80,friction:10}).start();
//   };
//   const closeModal = () => {
//     Animated.timing(modalAnim,{toValue:0,duration:180,useNativeDriver:true})
//       .start(()=>{ setModalVisible(false); setSelBooking(null); setSelRepair(null); });
//   };

//   // ── Day list ──────────────────────────────────────────────────────────────
//   const dayList: string[] = data?.days_in_month ?? [];
//   const totalDayW = dayList.length * DAY_W;

//   // ── Build blocks for a room (approved bookings + repairs) ─────────────────
//   const getBlocks = (room: CalendarRoom): AnyBlock[] => {
//     if (!dayList.length) return [];
//     const result: AnyBlock[] = [];

//     const placeEntry = (startStr:string, endStr:string): {startIdx:number;span:number}|null => {
//       let si = dayList.indexOf(startStr);
//       let ei = dayList.indexOf(endStr);
//       if (si < 0 && startStr < dayList[0]) si = 0;
//       if (ei < 0 && endStr  > dayList[dayList.length-1]) ei = dayList.length;
//       if (si < 0 || ei <= si) return null;
//       return { startIdx: si, span: Math.max(1, ei - si) };
//     };

//     // ── All bookings (approved + pending + cancelled) ─────────────────────
//     (room.bookings ?? []).forEach(b => {
//         const p = placeEntry(b.start_date, b.end_date);
//         if (p) result.push({ kind:'booking', entry:b, ...p });
//       });

//     // ── Repairs (always show, grey) ───────────────────────────────────────
//     (room.repairs ?? []).forEach(r => {
//       const p = placeEntry(r.start_date, r.end_date);
//       if (p) result.push({ kind:'repair', entry:r, ...p });
//     });

//     return result;
//   };

//   // ── Summary counts (approved bookings only) ───────────────────────────────
//   const counts = useMemo(() => {
//     if (!data) return { approved:0, pending:0, repairs:0 };
//     let approved=0, pending=0, repairs=0;
//     data.categories.forEach(cat => cat.rooms.forEach(room => {
//       (room.bookings ?? []).forEach(b => {
//         const st = b.status.toLowerCase();
//         if (st==="approved"||st==="confirmed") approved++;
//         else if (st==="pending") pending++;
//       });
//       repairs += (room.repairs ?? []).length;
//     }));
//     return { approved, pending, repairs };
//   }, [data]);

//   const monthLabel = new Date(year,month).toLocaleDateString('en-US',{month:'long',year:'numeric'});

//   // ── Render category ───────────────────────────────────────────────────────
//   const renderCategory = (cat: CalendarCategory) => (
//     <View key={`cat-${cat.category_id}`} style={s.catCard}>
//       <View style={s.catBar}>
//         <Ionicons name="bed" size={16} color="#fff" />
//         <Text style={s.catBarTxt}>{cat.category_name}</Text>
//         <View style={s.catBadge}>
//           <Text style={s.catBadgeTxt}>{cat.rooms.length} rooms</Text>
//         </View>
//       </View>

//       <View style={s.tableWrap}>
//         {/* Sticky left column */}
//         <View style={s.stickyCol}>
//           <View style={s.stickyHead}>
//             <Text style={s.stickyHeadTxt}>ROOM</Text>
//           </View>
//           {cat.rooms.map((room, idx) => (
//             <View key={`sc-${cat.category_id}-${room.room_id}`}
//               style={[s.stickyCell, idx===cat.rooms.length-1 && s.noBorder]}>
//               <Text style={s.stickyCellTxt}>{room.room_number}</Text>
//             </View>
//           ))}
//         </View>

//         {/* Horizontal scroll */}
//         <ScrollView horizontal showsHorizontalScrollIndicator persistentScrollbar style={s.hScroll}>
//           <View style={{width:totalDayW}}>

//             {/* Day header */}
//             <View style={s.dayHeadRow}>
//               {dayList.map((dateStr,i) => {
//                 const d = new Date(dateStr);
//                 const isWE = d.getDay()===0||d.getDay()===6;
//                 const isTD = dateStr===todayStr;
//                 return (
//                   <View key={`dh-${cat.category_id}-${i}`}
//                     style={[s.dayHead,{width:DAY_W},isWE&&s.dayHeadWE,isTD&&s.dayHeadToday]}>
//                     <Text style={[s.dayNum,isTD&&s.dayNumToday]}>{d.getDate()}</Text>
//                     <Text style={[s.dayDow,isTD&&s.dayDowToday]}>{DAYS_SHORT[d.getDay()]}</Text>
//                   </View>
//                 );
//               })}
//             </View>

//             {/* Room rows */}
//             {cat.rooms.map((room, rIdx) => {
//               const blocks = getBlocks(room);
//               return (
//                 <View key={`row-${cat.category_id}-${room.room_id}`}
//                   style={[s.gridRow,{width:totalDayW},rIdx===cat.rooms.length-1&&s.noBorder]}>

//                   {/* Background day cells */}
//                   {dayList.map((dateStr,i) => {
//                     const dow = new Date(dateStr).getDay();
//                     const isWE = dow===0||dow===6;
//                     const isTD = dateStr===todayStr;
//                     return (
//                       <View key={`bg-${cat.category_id}-${room.room_id}-${i}`}
//                         style={[s.dayBg,{width:DAY_W},isWE&&s.dayBgWE,isTD&&s.dayBgToday]}/>
//                     );
//                   })}

//                   {/* Booking & repair blocks */}
//                   {blocks.map((blk) => {
//                     const left  = blk.startIdx * DAY_W + 1;
//                     const width = blk.span * DAY_W - 2;

//                     if (blk.kind === 'repair') {
//                       return (
//                         <TouchableOpacity
//                           key={`rep-${cat.category_id}-${room.room_id}-${blk.startIdx}`}
//                           activeOpacity={0.8}
//                           onPress={() => openRepairModal(blk.entry)}
//                           style={[s.block, s.blockRepair, {left, width}]}
//                         >
//                           <View style={s.repairDot}/>
//                           <Text style={s.repairName} numberOfLines={1} ellipsizeMode="tail">
//                             {blk.entry.description ?? blk.entry.note ?? 'Repair'}
//                           </Text>
//                         </TouchableOpacity>
//                       );
//                     }

//                     // Booking block
//                     const b       = blk.entry;
//                     const color   = getBlockColor(b);
//                     const otaImg  = getOtaImage(b.method);

//                     return (
//                       <TouchableOpacity
//                         key={`bk-${cat.category_id}-${room.room_id}-${b.booking_id}-${blk.startIdx}`}
//                         activeOpacity={0.82}
//                         onPress={() => openBookingModal(b)}
//                         style={[s.block, {left, width, backgroundColor: color}]}
//                       >
//                         {otaImg && width > 55 && (
//                           <View style={s.blockIconWrap}>
//                             <Image source={otaImg} style={s.blockIcon} resizeMode="contain"/>
//                           </View>
//                         )}
//                         <Text style={s.blockName} numberOfLines={1} ellipsizeMode="tail">
//                           {b.guest_name}
//                         </Text>
//                       </TouchableOpacity>
//                     );
//                   })}
//                 </View>
//               );
//             })}
//           </View>
//         </ScrollView>
//       </View>
//     </View>
//   );

//   // ── Booking Modal ─────────────────────────────────────────────────────────
//   const renderBookingModal = () => {
//     if (!selBooking) return null;
//     const b     = selBooking;
//     const meta  = statusMeta(b.status);
//     const color = getBlockColor(b);
//     const otaImg = getOtaImage(b.method);
//     const scale  = modalAnim.interpolate({inputRange:[0,1],outputRange:[0.88,1]});

//     return (
//       <Modal transparent animationType="none" visible={modalVisible} onRequestClose={closeModal}>
//         <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={closeModal}>
//           <Animated.View style={[s.modalCard,{opacity:modalAnim,transform:[{scale}]}]}>
//             <TouchableOpacity activeOpacity={1} onPress={()=>{}}>

//               <View style={[s.mHead,{backgroundColor:color}]}>
//                 <View style={s.mHeadLeft}>
//                   {otaImg
//                     ? <Image source={otaImg} style={s.mOtaImg} resizeMode="contain"/>
//                     : <View style={s.mOtaFb}><Ionicons name="globe" size={20} color="#fff"/></View>
//                   }
//                   <View style={{flex:1}}>
//                     <Text style={s.mName} numberOfLines={1}>{b.guest_name}</Text>
//                     {b.method && <Text style={s.mMethod}>{b.method}</Text>}
//                   </View>
//                 </View>
//                 <TouchableOpacity onPress={closeModal} hitSlop={{top:12,bottom:12,left:12,right:12}}>
//                   <Ionicons name="close-circle" size={26} color="rgba(255,255,255,0.9)"/>
//                 </TouchableOpacity>
//               </View>

//               <View style={[s.mStatus,{backgroundColor:meta.bg}]}>
//                 <View style={[s.mDot,{backgroundColor:meta.color}]}/>
//                 <Text style={[s.mStatusTxt,{color:meta.color}]}>{meta.label}</Text>
//                 <Text style={s.mCode}>  #{b.booking_id}</Text>
//               </View>

//               <View style={s.mBody}>
//                 {[
//                   {icon:'log-in-outline',    label:'Check-In',  val:fmtDate(b.start_date)},
//                   {icon:'log-out-outline',   label:'Check-Out', val:fmtDate(b.end_date)},
//                   {icon:'moon-outline',      label:'Type',      val:b.booking_type??'—'},
//                   {icon:'globe-outline',     label:'Source',    val:b.method??'—'},
//                 ].map(row => (
//                   <View key={`mr-${row.label}`} style={s.mRow}>
//                     <View style={s.mRowLeft}>
//                       <Ionicons name={row.icon as any} size={15} color="#6B5B95"/>
//                       <Text style={s.mLabel}>{row.label}</Text>
//                     </View>
//                     <Text style={s.mVal} numberOfLines={2}>{row.val}</Text>
//                   </View>
//                 ))}
//               </View>
//             </TouchableOpacity>
//           </Animated.View>
//         </TouchableOpacity>
//       </Modal>
//     );
//   };

//   // ── Repair Modal ──────────────────────────────────────────────────────────
//   const renderRepairModal = () => {
//     if (!selRepair) return null;
//     const r     = selRepair;
//     const scale = modalAnim.interpolate({inputRange:[0,1],outputRange:[0.88,1]});

//     return (
//       <Modal transparent animationType="none" visible={modalVisible} onRequestClose={closeModal}>
//         <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={closeModal}>
//           <Animated.View style={[s.modalCard,{opacity:modalAnim,transform:[{scale}]}]}>
//             <TouchableOpacity activeOpacity={1} onPress={()=>{}}>

//               <View style={[s.mHead,{backgroundColor:'#6B7280'}]}>
//                 <View style={s.mHeadLeft}>
//                   <View style={s.mOtaFb}>
//                     <Ionicons name="construct" size={22} color="#fff"/>
//                   </View>
//                   <View style={{flex:1}}>
//                     <Text style={s.mName}>Room Repair</Text>
//                     <Text style={s.mMethod}>{r.description ?? r.note ?? 'Under maintenance'}</Text>
//                   </View>
//                 </View>
//                 <TouchableOpacity onPress={closeModal} hitSlop={{top:12,bottom:12,left:12,right:12}}>
//                   <Ionicons name="close-circle" size={26} color="rgba(255,255,255,0.9)"/>
//                 </TouchableOpacity>
//               </View>

//               <View style={[s.mStatus,{backgroundColor:'#F3F4F6'}]}>
//                 <View style={[s.mDot,{backgroundColor:'#6B7280'}]}/>
//                 <Text style={[s.mStatusTxt,{color:'#6B7280'}]}>UNDER REPAIR</Text>
//               </View>

//               <View style={s.mBody}>
//                 {[
//                   {icon:'calendar-outline', label:'Start Date', val:fmtDate(r.start_date)},
//                   {icon:'calendar-outline', label:'End Date',   val:fmtDate(r.end_date)},
//                   ...(r.description||r.note ? [{icon:'document-text-outline' as any, label:'Note', val:r.description??r.note??''}] : []),
//                 ].map(row => (
//                   <View key={`rr-${row.label}`} style={s.mRow}>
//                     <View style={s.mRowLeft}>
//                       <Ionicons name={row.icon as any} size={15} color="#6B7280"/>
//                       <Text style={[s.mLabel,{color:'#6B7280'}]}>{row.label}</Text>
//                     </View>
//                     <Text style={s.mVal} numberOfLines={2}>{row.val}</Text>
//                   </View>
//                 ))}
//               </View>
//             </TouchableOpacity>
//           </Animated.View>
//         </TouchableOpacity>
//       </Modal>
//     );
//   };

//   // ── UI ────────────────────────────────────────────────────────────────────
//   return (
//     <View style={s.container}>
//       <HeaderWithMenu
//         title="Booking Calendar"
//         subtitle="Monthly room availability overview"
//         showNotification showMenuToggle
//       />

//       {/* Month bar */}
//       <View style={s.monthBar}>
//         <TouchableOpacity onPress={goPrev} style={s.navBtn} activeOpacity={0.7}>
//           <Ionicons name="chevron-back-circle" size={34} color="#6B5B95"/>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={()=>setShowPicker(true)} style={s.monthBtn} activeOpacity={0.8}>
//           <Ionicons name="calendar" size={17} color="#6B5B95"/>
//           <Text style={s.monthBtnTxt}>{monthLabel}</Text>
//           <Ionicons name="chevron-down" size={15} color="#9CA3AF"/>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={goNext} style={s.navBtn} activeOpacity={0.7}>
//           <Ionicons name="chevron-forward-circle" size={34} color="#6B5B95"/>
//         </TouchableOpacity>
//       </View>

//       {showPicker && (
//         <DateTimePicker value={new Date(year,month,1)} mode="date" display="spinner"
//           onChange={onPick} accentColor="#6B5B95" themeVariant="light"/>
//       )}

//       {/* Stats bar — approved + repairs counts */}
//       <View style={s.statsBar}>
//         <View style={[s.statPill, {borderColor:"#10B98155", backgroundColor:"#10B98114"}]}>
//           <Ionicons name="checkmark-circle" size={15} color="#10B981"/>
//           <Text style={[s.statLabel,{color:"#10B981"}]}>Approved</Text>
//           <View style={[s.statBadge,{backgroundColor:"#10B981"}]}>
//             <Text style={s.statBadgeTxt}>{counts.approved}</Text>
//           </View>
//         </View>
//         <View style={[s.statPill, {borderColor:"#F59E0B55", backgroundColor:"#F59E0B14"}]}>
//           <Ionicons name="time" size={15} color="#F59E0B"/>
//           <Text style={[s.statLabel,{color:"#F59E0B"}]}>Pending</Text>
//           <View style={[s.statBadge,{backgroundColor:"#F59E0B"}]}>
//             <Text style={s.statBadgeTxt}>{counts.pending}</Text>
//           </View>
//         </View>
//         <View style={[s.statPill, {borderColor:"#6B728055", backgroundColor:"#6B728014"}]}>
//           <Ionicons name="construct" size={15} color="#6B7280"/>
//           <Text style={[s.statLabel,{color:"#6B7280"}]}>Repairs</Text>
//           <View style={[s.statBadge,{backgroundColor:"#6B7280"}]}>
//             <Text style={s.statBadgeTxt}>{counts.repairs}</Text>
//           </View>
//         </View>
//       </View>

//       {/* OTA source legend */}
//       <ScrollView horizontal showsHorizontalScrollIndicator={false}
//         style={s.otaScroll} contentContainerStyle={s.otaContent}>
//         {([
//           {label:'Booking.com', color:'#003580', key:'booking'},
//           {label:'Airbnb',      color:'#FF5A5F', key:'airbnb'},
//           {label:'Expedia',     color:'#FFC72C', key:'expedia'},
//           {label:'Agoda',       color:'#E4002B', key:'agoda'},
//           {label:'Agency',      color:'#2E4057', key:'agency'},
//           {label:'Online',      color:'#6B5B95', key:'online'},
//           {label:'Walk-in',     color:'#2F9E44', key:'walking'},
//           {label:'Phone',       color:'#1098AD', key:'phone'},
//           {label:'Direct',      color:'#495057', key:'direct'},
//           {label:'Repair',      color:'#6B7280', key:''},
//         ]).map(({label,color,key},i) => (
//           <View key={`ota-${i}`} style={s.otaChip}>
//             <View style={[s.otaChipDot,{backgroundColor:color}]}/>
//             {key && OTA_IMAGES[key] && (
//               <Image source={OTA_IMAGES[key]} style={s.otaChipImg} resizeMode="contain"/>
//             )}
//             {!key && <Ionicons name="construct" size={10} color={color}/>}
//             <Text style={s.otaChipTxt}>{label}</Text>
//           </View>
//         ))}
//       </ScrollView>

//       {/* Body */}
//       {loading && !refreshing ? (
//         <View style={s.loadWrap}>
//           <ActivityIndicator size="large" color="#6B5B95"/>
//           <Text style={s.loadTxt}>Loading calendar...</Text>
//         </View>
//       ) : (
//         <ScrollView style={s.scroll}
//           refreshControl={
//             <RefreshControl refreshing={refreshing}
//               onRefresh={()=>{setRefreshing(true);fetchData();}}
//               tintColor="#6B5B95" colors={['#6B5B95']}/>
//           }
//         >
//           {!data||data.categories.length===0 ? (
//             <View style={s.emptyWrap}>
//               <Ionicons name="calendar-outline" size={62} color="#D1D5DB"/>
//               <Text style={s.emptyTitle}>No Bookings This Month</Text>
//               <Text style={s.emptySub}>Pull down to refresh</Text>
//             </View>
//           ) : (
//             data.categories.map(cat => renderCategory(cat))
//           )}
//           <View style={{height:80}}/>
//         </ScrollView>
//       )}

//       {selBooking && renderBookingModal()}
//       {selRepair  && renderRepairModal()}
//     </View>
//   );
// };

// export default BookingCalendar;

// // ── Styles ────────────────────────────────────────────────────────────────────
// const s = StyleSheet.create({
//   container: {flex:1, backgroundColor:'#F0EEF8'},
//   scroll:    {flex:1},

//   monthBar: {
//     flexDirection:'row', alignItems:'center', justifyContent:'space-between',
//     backgroundColor:'#fff', paddingHorizontal:14, paddingVertical:10,
//     borderBottomWidth:1, borderBottomColor:'#E5E7EB',
//     shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:4, elevation:3,
//   },
//   navBtn:    {padding:4},
//   monthBtn:  {
//     flexDirection:'row', alignItems:'center', gap:8,
//     paddingVertical:9, paddingHorizontal:18,
//     backgroundColor:'#F5F3FF', borderRadius:12, borderWidth:1.5, borderColor:'#C4B5FD',
//   },
//   monthBtnTxt:{fontSize:15, fontWeight:'700', color:'#1F2937'},

//   // Stats bar
//   statsBar: { flexDirection:"row", justifyContent:"center", gap:8, paddingVertical:8, paddingHorizontal:8, backgroundColor:"#fff", borderBottomWidth:1, borderBottomColor:"#E5E7EB", flexWrap:"wrap" },
//   statPill:     {flexDirection:'row', alignItems:'center', gap:6, paddingVertical:5, paddingHorizontal:10, borderRadius:20, borderWidth:1},
//   statLabel:    {fontSize:11, fontWeight:'600'},
//   statBadge:    {borderRadius:10, paddingHorizontal:6, paddingVertical:1, minWidth:22, alignItems:'center'},
//   statBadgeTxt: {fontSize:11, fontWeight:'800', color:'#fff'},

//   // OTA legend
//   otaScroll:   {maxHeight:36, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:'#E5E7EB'},
//   otaContent:  {paddingHorizontal:12, paddingVertical:8, flexDirection:'row', gap:8},
//   otaChip:     {flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:8, paddingVertical:3, backgroundColor:'#F3F4F6', borderRadius:12},
//   otaChipDot:  {width:8, height:8, borderRadius:4},
//   otaChipImg:  {width:14, height:14, borderRadius:2},
//   otaChipTxt:  {fontSize:10, fontWeight:'600', color:'#374151'},

//   // Category card
//   catCard: {
//     backgroundColor:'#fff', marginHorizontal:12, marginTop:14, borderRadius:14, overflow:'hidden',
//     shadowColor:'#000', shadowOffset:{width:0,height:3}, shadowOpacity:0.09, shadowRadius:10, elevation:5,
//   },
//   catBar:    {flexDirection:'row', alignItems:'center', gap:8, paddingVertical:11, paddingHorizontal:16, backgroundColor:'#6B5B95'},
//   catBarTxt: {fontSize:15, fontWeight:'800', color:'#fff', flex:1},
//   catBadge:  {backgroundColor:'rgba(255,255,255,0.25)', borderRadius:10, paddingHorizontal:8, paddingVertical:2},
//   catBadgeTxt:{fontSize:11, fontWeight:'700', color:'#fff'},

//   tableWrap: {flexDirection:'row'},

//   // Sticky column
//   stickyCol: {width:ROOM_W, zIndex:10},
//   stickyHead: {
//     width:ROOM_W, height:HEAD_H, justifyContent:'center', alignItems:'center',
//     backgroundColor:'#EDE9F6', borderRightWidth:1.5, borderRightColor:'#D1C4E9',
//     borderBottomWidth:1.5, borderBottomColor:'#D1C4E9',
//   },
//   stickyHeadTxt:{fontSize:10, fontWeight:'700', color:'#6B5B95', textTransform:'uppercase'},
//   stickyCell: {
//     width:ROOM_W, height:ROW_H, justifyContent:'center', alignItems:'center',
//     backgroundColor:'#F9F7FF', borderRightWidth:1.5, borderRightColor:'#D1C4E9',
//     borderBottomWidth:1, borderBottomColor:'#EDE9F6',
//   },
//   stickyCellTxt:{fontSize:13, fontWeight:'700', color:'#6B5B95'},
//   noBorder:  {borderBottomWidth:0},

//   hScroll:   {flex:1},

//   dayHeadRow:{flexDirection:'row', borderBottomWidth:1.5, borderBottomColor:'#D1C4E9'},
//   dayHead:   {height:HEAD_H, justifyContent:'center', alignItems:'center', borderRightWidth:1, borderRightColor:'#EDE9F6', backgroundColor:'#F5F3FF'},
//   dayHeadWE: {backgroundColor:'#EDE9F6'},
//   dayHeadToday:{backgroundColor:'#6B5B95'},
//   dayNum:    {fontSize:13, fontWeight:'700', color:'#374151'},
//   dayNumToday:{color:'#fff'},
//   dayDow:    {fontSize:9, fontWeight:'600', color:'#9CA3AF', marginTop:1},
//   dayDowToday:{color:'rgba(255,255,255,0.85)'},

//   gridRow:   {flexDirection:'row', position:'relative', height:ROW_H, borderBottomWidth:1, borderBottomColor:'#F0EEF8'},
//   dayBg:     {height:ROW_H, borderRightWidth:1, borderRightColor:'#F3F0FF'},
//   dayBgWE:   {backgroundColor:'#FAF7FF'},
//   dayBgToday:{backgroundColor:'#EEF2FF'},

//   // Booking block
//   block: {
//     position:'absolute', top:5, height:40,
//     borderRadius:7, flexDirection:'row', alignItems:'center',
//     paddingHorizontal:6, gap:4, overflow:'hidden',
//     shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.28, shadowRadius:4, elevation:6,
//   },
//   blockIconWrap:{width:18, height:18, borderRadius:4, backgroundColor:'rgba(255,255,255,0.25)', justifyContent:'center', alignItems:'center', flexShrink:0},
//   blockIcon:    {width:14, height:14},
//   blockName:    {fontSize:11, fontWeight:'700', color:'#fff', flexShrink:1},

//   // Repair block — grey with dot prefix
//   blockRepair: {
//     backgroundColor:'#6B7280',
//     borderWidth:1, borderColor:'#9CA3AF', borderStyle:'solid',
//   },
//   repairDot:  {width:6, height:6, borderRadius:3, backgroundColor:'#fff', flexShrink:0},
//   repairName: {fontSize:11, fontWeight:'600', color:'#fff', flexShrink:1},

//   // Loading / empty
//   loadWrap: {flex:1, justifyContent:'center', alignItems:'center', paddingTop:120},
//   loadTxt:  {color:'#6B5B95', fontSize:15, marginTop:12, fontWeight:'600'},
//   emptyWrap:{paddingTop:80, alignItems:'center'},
//   emptyTitle:{fontSize:17, fontWeight:'700', color:'#1F2937', marginTop:16},
//   emptySub: {fontSize:13, color:'#9CA3AF', marginTop:6},

//   // Modal shared
//   overlay: {flex:1, backgroundColor:'rgba(0,0,0,0.52)', justifyContent:'center', alignItems:'center', padding:20},
//   modalCard: {
//     backgroundColor:'#fff', borderRadius:18, overflow:'hidden',
//     width:'100%', maxWidth:430,
//     shadowColor:'#000', shadowOffset:{width:0,height:14}, shadowOpacity:0.3, shadowRadius:28, elevation:22,
//   },
//   mHead:    {flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16},
//   mHeadLeft:{flexDirection:'row', alignItems:'center', gap:10, flex:1},
//   mOtaImg:  {width:38, height:38, borderRadius:8, backgroundColor:'rgba(255,255,255,0.15)'},
//   mOtaFb:   {width:38, height:38, borderRadius:8, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center'},
//   mName:    {fontSize:16, fontWeight:'800', color:'#fff'},
//   mMethod:  {fontSize:12, color:'rgba(255,255,255,0.85)', marginTop:2},
//   mStatus:  {flexDirection:'row', alignItems:'center', gap:8, paddingHorizontal:16, paddingVertical:9},
//   mDot:     {width:8, height:8, borderRadius:4},
//   mStatusTxt:{fontSize:11, fontWeight:'800', letterSpacing:0.8},
//   mCode:    {fontSize:11, color:'#9CA3AF', fontWeight:'600'},
//   mBody:    {paddingHorizontal:16, paddingBottom:18, paddingTop:2},
//   mRow:     {flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:11, borderBottomWidth:1, borderBottomColor:'#F3F4F6'},
//   mRowLeft: {flexDirection:'row', alignItems:'center', gap:7},
//   mLabel:   {fontSize:12, fontWeight:'600', color:'#6B7280'},
//   mVal:     {fontSize:13, fontWeight:'700', color:'#1F2937', maxWidth:'60%', textAlign:'right'},
// });




// // app/calendar/index.tsx
// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import {
//   StyleSheet, Text, View, TouchableOpacity, ScrollView,
//   ActivityIndicator, Alert, RefreshControl, Modal,
//   Animated, Image, Linking,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import HeaderWithMenu from '../../components/HeaderWithMenu';
// import bookingCalendarService, {
//   BookingCalendarResponse,
//   CalendarCategory,
//   CalendarRoom,
//   RoomBookingEntry,
//   RepairEntry,
//   BookingDetail,
// } from '../../services/bookingCalendar';

// // ── Layout ────────────────────────────────────────────────────────────────────
// const DAY_W  = 54;
// const ROOM_W = 62;
// const ROW_H  = 50;
// const HEAD_H = 46;

// // ── OTA images & colours ──────────────────────────────────────────────────────
// const OTA_IMAGES: Record<string, any> = {
//   airbnb:                      require('../../assets/adult/airbnb.png'),
//   'air bnb':                   require('../../assets/adult/airbnb.png'),
//   booking:                     require('../../assets/adult/booking.png'),
//   'booking.com':               require('../../assets/adult/booking.png'),
//   agoda:                       require('../../assets/adult/agoda.png'),
//   expedia:                     require('../../assets/adult/expedia.png'),
//   'expedia affiliate network': require('../../assets/adult/expedia.png'),
//   online:                      require('../../assets/adult/online.png'),
//   agency:                      require('../../assets/adult/agency.png'),
//   ai:                          require('../../assets/adult/Ai.png'),
//   ravan:                       require('../../assets/adult/ravan.png'),
//   walking:                     require('../../assets/adult/walking.png'),
//   'walk in':                   require('../../assets/adult/walking.png'),
//   walkin:                      require('../../assets/adult/walking.png'),
//   phone:                       require('../../assets/adult/phone.png'),
//   direct:                      require('../../assets/adult/a.png'),
// };
// const OTA_COLORS: Record<string, string> = {
//   airbnb:'#FF5A5F','air bnb':'#FF5A5F',
//   booking:'#003580','booking.com':'#003580',
//   agoda:'#E4002B',
//   expedia:'#FFC72C','expedia affiliate network':'#FFC72C',
//   online:'#6B5B95', agency:'#2E4057',
//   walking:'#2F9E44','walk in':'#2F9E44',walkin:'#2F9E44',
//   phone:'#1098AD', direct:'#495057', ravan:'#C2255C',
// };
// const FALLBACK_COLORS = [
//   '#3B5BDB','#E03131','#2F9E44','#E67700','#7048E8',
//   '#1098AD','#C2255C','#0CA678','#F76707','#6741D9',
// ];

// const getOtaKey = (method?: string | null) => {
//   if (!method) return '';
//   const k = method.toLowerCase().trim();
//   if (OTA_IMAGES[k]) return k;
//   for (const key of Object.keys(OTA_IMAGES)) {
//     if (k.includes(key) || key.includes(k)) return key;
//   }
//   return '';
// };
// const getOtaImage   = (method?: string | null) => { const k = getOtaKey(method); return k ? OTA_IMAGES[k] : null; };
// const getOtaColor   = (method?: string | null) => { const k = getOtaKey(method); return k && OTA_COLORS[k] ? OTA_COLORS[k] : null; };
// const getBlockColor = (b: RoomBookingEntry) => getOtaColor(b.method) ?? FALLBACK_COLORS[Math.abs(b.booking_id) % FALLBACK_COLORS.length];
// const getDetailColor = (method?: string) => getOtaColor(method) ?? '#6B5B95';

// // ── Status ────────────────────────────────────────────────────────────────────
// const isApproved  = (s: string) => ['approved','confirmed'].includes(s.toLowerCase());
// const statusMeta  = (s: string) => {
//   if (isApproved(s))                      return { color:'#10B981', bg:'#ECFDF5', label:'APPROVED'  };
//   if (['cancelled','canceled'].includes(s.toLowerCase())) return { color:'#EF4444', bg:'#FEF2F2', label:'CANCELLED' };
//   if (s.toLowerCase()==='pending')        return { color:'#F59E0B', bg:'#FFFBEB', label:'PENDING'   };
//   return { color:'#6B5B95', bg:'#F5F3FF', label: s.toUpperCase() };
// };

// const DAYS_SHORT = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

// interface PlacedBlock  { kind:'booking'; entry:RoomBookingEntry; startIdx:number; span:number; }
// interface PlacedRepair { kind:'repair';  entry:RepairEntry;      startIdx:number; span:number; }
// type AnyBlock = PlacedBlock | PlacedRepair;

// const fmtDate = (d?:string) => {
//   if (!d) return '—';
//   const dt = new Date(d);
//   return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
// };
// const fmtTime = (t?:string) => {
//   if (!t) return '';
//   const parts = t.split(':');
//   if (parts.length < 2) return t;
//   const h = parseInt(parts[0]);
//   const m = parts[1];
//   return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
// };
// const fmtMoney = (amount?: number | null, usd?: string | null) => {
//   if (usd && parseFloat(usd) > 0) return `$${parseFloat(usd).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
//   if (amount) return `Rs. ${Number(amount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
//   return 'Rs. 0.00';
// };
// const safeVal = (val?: string | null) => {
//   if (!val || val === 'null' || val.trim() === '') return 'None';
//   return val;
// };
// const safeAddress = (addr?: string | null) => {
//   if (!addr) return 'None';
//   const parts = addr.split(',').map(p => p.trim()).filter(p => p && p !== 'null' && p !== '.');
//   return parts.length > 0 ? parts.join(', ') : 'None';
// };

// // ─────────────────────────────────────────────────────────────────────────────
// const BookingCalendar = () => {
//   const now = new Date();
//   const [year,  setYear]            = useState(now.getFullYear());
//   const [month, setMonth]           = useState(now.getMonth());
//   const [showPicker, setShowPicker] = useState(false);
//   const [data,  setData]            = useState<BookingCalendarResponse | null>(null);
//   const [loading, setLoading]       = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // Detail modal state
//   const [detailVisible, setDetailVisible]   = useState(false);
//   const [detailLoading, setDetailLoading]   = useState(false);
//   const [detailData,    setDetailData]      = useState<BookingDetail | null>(null);
//   const [selRepair,     setSelRepair]       = useState<RepairEntry | null>(null);
//   const [repairVisible, setRepairVisible]   = useState(false);

//   const detailAnim = useRef(new Animated.Value(0)).current;
//   const repairAnim = useRef(new Animated.Value(0)).current;

//   const monthFirstDay = `${year}-${String(month+1).padStart(2,'0')}-01`;
//   const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

//   // ── Fetch calendar ────────────────────────────────────────────────────────
//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await bookingCalendarService.getCalendarBookings(monthFirstDay);
//       setData(res);
//     } catch (err) {
//       Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load');
//     } finally { setLoading(false); setRefreshing(false); }
//   }, [monthFirstDay]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   // ── Month nav ─────────────────────────────────────────────────────────────
//   const goPrev = () => { if (month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
//   const goNext = () => { if (month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };
//   const onPick = (_:any, d?:Date) => {
//     setShowPicker(false);
//     if (d){ setYear(d.getFullYear()); setMonth(d.getMonth()); }
//   };

//   // ── Open booking detail — fetch fresh data ────────────────────────────────
//   const openBookingDetail = async (entry: RoomBookingEntry) => {
//     setDetailData(null);
//     setDetailVisible(true);
//     setDetailLoading(true);
//     detailAnim.setValue(0);
//     Animated.spring(detailAnim,{toValue:1,useNativeDriver:true,tension:80,friction:10}).start();
//     try {
//       const detail = await bookingCalendarService.getBookingDetail(entry.booking_id);
//       setDetailData(detail);
//     } catch {
//       Alert.alert('Error','Could not load booking details');
//       setDetailVisible(false);
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   const closeDetail = () => {
//     Animated.timing(detailAnim,{toValue:0,duration:180,useNativeDriver:true})
//       .start(()=>{ setDetailVisible(false); setDetailData(null); });
//   };

//   // ── Open repair modal ─────────────────────────────────────────────────────
//   const openRepair = (e: RepairEntry) => {
//     setSelRepair(e); setRepairVisible(true);
//     repairAnim.setValue(0);
//     Animated.spring(repairAnim,{toValue:1,useNativeDriver:true,tension:80,friction:10}).start();
//   };
//   const closeRepair = () => {
//     Animated.timing(repairAnim,{toValue:0,duration:180,useNativeDriver:true})
//       .start(()=>{ setRepairVisible(false); setSelRepair(null); });
//   };

//   // ── Day list ──────────────────────────────────────────────────────────────
//   const dayList: string[] = data?.days_in_month ?? [];
//   const totalDayW = dayList.length * DAY_W;

//   const getBlocks = (room: CalendarRoom): AnyBlock[] => {
//     if (!dayList.length) return [];
//     const result: AnyBlock[] = [];
//     const place = (s:string,e:string) => {
//       let si = dayList.indexOf(s), ei = dayList.indexOf(e);
//       if (si<0 && s<dayList[0]) si=0;
//       if (ei<0 && e>dayList[dayList.length-1]) ei=dayList.length;
//       if (si<0||ei<=si) return null;
//       return {startIdx:si, span:Math.max(1,ei-si)};
//     };
//     (room.bookings??[]).forEach(b => { const p=place(b.start_date,b.end_date); if(p) result.push({kind:'booking',entry:b,...p}); });
//     (room.repairs??[]).forEach(r  => { const p=place(r.start_date,r.end_date); if(p) result.push({kind:'repair', entry:r,...p}); });
//     return result;
//   };

//   const counts = useMemo(() => {
//     if (!data) return {approved:0,pending:0,repairs:0};
//     let approved=0,pending=0,repairs=0;
//     data.categories.forEach(cat=>cat.rooms.forEach(room=>{
//       (room.bookings??[]).forEach(b=>{
//         const st=b.status.toLowerCase();
//         if(st==='approved'||st==='confirmed') approved++;
//         else if(st==='pending') pending++;
//       });
//       repairs+=(room.repairs??[]).length;
//     }));
//     return {approved,pending,repairs};
//   },[data]);

//   const monthLabel = new Date(year,month).toLocaleDateString('en-US',{month:'long',year:'numeric'});

//   // ── Render category ───────────────────────────────────────────────────────
//   const renderCategory = (cat: CalendarCategory) => (
//     <View key={`cat-${cat.category_id}`} style={s.catCard}>
//       <View style={s.catBar}>
//         <Ionicons name="bed" size={16} color="#fff"/>
//         <Text style={s.catBarTxt}>{cat.category_name}</Text>
//         <View style={s.catBadge}><Text style={s.catBadgeTxt}>{cat.rooms.length} rooms</Text></View>
//       </View>

//       <View style={s.tableWrap}>
//         {/* Sticky column */}
//         <View style={s.stickyCol}>
//           <View style={s.stickyHead}><Text style={s.stickyHeadTxt}>ROOM</Text></View>
//           {cat.rooms.map((room,idx) => (
//             <View key={`sc-${cat.category_id}-${room.room_id}`}
//               style={[s.stickyCell, idx===cat.rooms.length-1&&s.noBorder]}>
//               <Text style={s.stickyCellTxt}>{room.room_number}</Text>
//             </View>
//           ))}
//         </View>

//         {/* Scrollable grid */}
//         <ScrollView horizontal showsHorizontalScrollIndicator persistentScrollbar style={s.hScroll}>
//           <View style={{width:totalDayW}}>
//             {/* Day headers */}
//             <View style={s.dayHeadRow}>
//               {dayList.map((dateStr,i) => {
//                 const d=new Date(dateStr), isWE=d.getDay()===0||d.getDay()===6, isTD=dateStr===todayStr;
//                 return (
//                   <View key={`dh-${cat.category_id}-${i}`}
//                     style={[s.dayHead,{width:DAY_W},isWE&&s.dayHeadWE,isTD&&s.dayHeadToday]}>
//                     <Text style={[s.dayNum,isTD&&s.dayNumToday]}>{d.getDate()}</Text>
//                     <Text style={[s.dayDow,isTD&&s.dayDowToday]}>{DAYS_SHORT[d.getDay()]}</Text>
//                   </View>
//                 );
//               })}
//             </View>

//             {/* Room rows */}
//             {cat.rooms.map((room,rIdx) => {
//               const blocks = getBlocks(room);
//               return (
//                 <View key={`row-${cat.category_id}-${room.room_id}`}
//                   style={[s.gridRow,{width:totalDayW},rIdx===cat.rooms.length-1&&s.noBorder]}>
//                   {dayList.map((dateStr,i) => {
//                     const dow=new Date(dateStr).getDay(), isWE=dow===0||dow===6, isTD=dateStr===todayStr;
//                     return <View key={`bg-${cat.category_id}-${room.room_id}-${i}`}
//                       style={[s.dayBg,{width:DAY_W},isWE&&s.dayBgWE,isTD&&s.dayBgToday]}/>;
//                   })}

//                   {blocks.map(blk => {
//                     const left=blk.startIdx*DAY_W+1, width=blk.span*DAY_W-2;
//                     if (blk.kind==='repair') return (
//                       <TouchableOpacity key={`rep-${cat.category_id}-${room.room_id}-${blk.startIdx}`}
//                         activeOpacity={0.8} onPress={()=>openRepair(blk.entry)}
//                         style={[s.block,s.blockRepair,{left,width}]}>
//                         <View style={s.repairDot}/>
//                         <Text style={s.repairName} numberOfLines={1} ellipsizeMode="tail">
//                           {blk.entry.description??blk.entry.note??'Repair'}
//                         </Text>
//                       </TouchableOpacity>
//                     );
//                     const b=blk.entry, color=getBlockColor(b), otaImg=getOtaImage(b.method);
//                     return (
//                       <TouchableOpacity key={`bk-${cat.category_id}-${room.room_id}-${b.booking_id}-${blk.startIdx}`}
//                         activeOpacity={0.82} onPress={()=>openBookingDetail(b)}
//                         style={[s.block,{left,width,backgroundColor:color}]}>
//                         {otaImg&&width>55&&(
//                           <View style={s.blockIconWrap}>
//                             <Image source={otaImg} style={s.blockIcon} resizeMode="contain"/>
//                           </View>
//                         )}
//                         <Text style={s.blockName} numberOfLines={1} ellipsizeMode="tail">{b.guest_name}</Text>
//                       </TouchableOpacity>
//                     );
//                   })}
//                 </View>
//               );
//             })}
//           </View>
//         </ScrollView>
//       </View>
//     </View>
//   );

//   // ── Booking Detail Modal (Web-style) ──────────────────────────────────────
//   const renderDetailModal = () => {
//     const b      = detailData;
//     const method = b?.booking_method;
//     const color  = getDetailColor(method);
//     const scale  = detailAnim.interpolate({inputRange:[0,1],outputRange:[0.92,1]});

//     // Room counts from booking_room_count
//     const roomCountMap: Record<string,number> = {};
//     let totalRooms = 0;
//     (b?.booking_room_count ?? []).forEach(rc => {
//       const catName = rc.room_categories?.category_name ?? rc.room_categories?.category ?? 'Room';
//       const cnt = Number(rc.room_count ?? 0);
//       roomCountMap[catName] = cnt;
//       totalRooms += cnt;
//     });

//     // Payment amounts
//     const totalAmt   = fmtMoney(b?.total_amount, b?.usd_amount);
//     const advanceAmt = b?.advance_payment
//       ? `Rs. ${Number(b.advance_payment).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`
//       : 'Rs. 0.00';
//     const balanceAmt = b?.balance
//       ? `Rs. ${Number(b.balance).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`
//       : 'Rs. 0.00';

//     const fullName = b ? `${b.first_name} ${b.last_name}` : '';
//     const country  = b?.country && b.country !== 'null' ? b.country : null;

//     // Build info rows matching the web UI exactly
//     const infoRows = b ? [
//       { label: 'WhatsApp Number', value: safeVal(b.w_number), isLink: !!b.w_number && b.w_number !== 'None', linkUrl: b.w_number ? `https://wa.me/${b.w_number.replace(/\D/g,'')}` : '' },
//       { label: 'Mobile Number',   value: safeVal(b.phone),    isLink: !!b.phone,    linkUrl: `tel:${b.phone}` },
//       { label: 'Email',           value: safeVal(b.email),    isLink: !!b.email && b.email !== 'null', linkUrl: `mailto:${b.email}` },
//       { label: 'Address',         value: safeAddress(b.address), isLink: false, linkUrl: '' },
//       { label: 'Passport',        value: safeVal(b.passport),  isLink: false, linkUrl: '' },
//       { label: 'Breakfast',       value: safeVal(b.breakfast), isLink: false, linkUrl: '' },
//       { label: 'Booking Method',  value: safeVal(b.booking_method), isLink: false, linkUrl: '' },
//       { label: 'Total Person',    value: b.total_person ?? b.adults ?? '—', isLink: false, linkUrl: '' },
//       { label: 'Adults',          value: b.adults ?? '—',      isLink: false, linkUrl: '' },
//       { label: 'Children',        value: b.children ?? '0',    isLink: false, linkUrl: '' },
//       { label: 'Check In Date',   value: b.checking_date ?? '—', isLink: false, linkUrl: '' },
//       { label: 'Check Out Date',  value: b.checkout_date ?? '—', isLink: false, linkUrl: '' },
//       { label: 'Payment Status',  value: safeVal(b.payment),  isLink: false, linkUrl: '' },
//       { label: 'Checking Time',   value: b.checking_time ?? '—', isLink: false, linkUrl: '' },
//       { label: 'Checkout Time',   value: b.checkout_time ?? '—', isLink: false, linkUrl: '' },
//     ] : [];

//     const hasNote = b && (b.note || b.additional_note);
//     const noteText = b?.note ?? b?.additional_note ?? '';

//     return (
//       <Modal transparent animationType="none" visible={detailVisible} onRequestClose={closeDetail}>
//         <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={closeDetail}>
//           <Animated.View style={[s.modalCard, {opacity:detailAnim, transform:[{scale}]}]}>
//             <TouchableOpacity activeOpacity={1} onPress={()=>{}}>

//               {detailLoading ? (
//                 <>
//                   <View style={[s.wHead, {backgroundColor:'#f8f8f8'}]}>
//                     <TouchableOpacity onPress={closeDetail} style={s.wCloseBtn}>
//                       <Ionicons name="close" size={20} color="#666"/>
//                     </TouchableOpacity>
//                   </View>
//                   <View style={s.detailLoader}>
//                     <ActivityIndicator size="large" color={color}/>
//                     <Text style={[s.detailLoaderTxt,{color}]}>Fetching booking details…</Text>
//                   </View>
//                 </>
//               ) : b ? (
//                 <>
//                   {/* ── WEB-STYLE HEADER ── */}
//                   <View style={s.wHead}>
//                     <View style={s.wHeadContent}>
//                       <Text style={s.wGuestName}>{fullName || 'Guest'}</Text>
//                       {country && (
//                         <Text style={[s.wCountry, {color}]}>Country - {country}</Text>
//                       )}
//                     </View>
//                     <TouchableOpacity onPress={closeDetail} style={s.wCloseBtn}>
//                       <Ionicons name="close" size={20} color="#999"/>
//                     </TouchableOpacity>
//                   </View>

//                   {/* ── BILL SUMMARY ROW ── */}
//                   <View style={s.wBillRow}>
//                     <View style={s.wBillLeft}>
//                       <Text style={s.wBillSectionLabel}>Bill Details</Text>
//                     </View>
//                     <View style={s.wBillCol}>
//                       <Text style={s.wBillColLabel}>Amount</Text>
//                       <Text style={s.wBillColVal}>{totalAmt}</Text>
//                     </View>
//                     <View style={s.wBillCol}>
//                       <Text style={s.wBillColLabel}>Payment</Text>
//                       <Text style={s.wBillColVal}>{advanceAmt}</Text>
//                     </View>
//                     <View style={s.wBillCol}>
//                       <Text style={s.wBillColLabel}>Due</Text>
//                       <Text style={[s.wBillColVal, {color:'#F59E0B'}]}>{balanceAmt}</Text>
//                     </View>
//                   </View>

//                   {/* ── INFO ROWS ── */}
//                   <ScrollView style={{maxHeight:370}} showsVerticalScrollIndicator={false}>
//                     <View style={s.wInfoSection}>
//                       {infoRows.map((row, i) => {
//                         const isNone = row.value === 'None' || row.value === 'null' || row.value === '—';
//                         const isLinkable = row.isLink && !isNone;
//                         return (
//                           <TouchableOpacity
//                             key={`row-${i}`}
//                             activeOpacity={isLinkable ? 0.7 : 1}
//                             onPress={isLinkable ? () => Linking.openURL(row.linkUrl) : undefined}
//                             style={[s.wRow, i === infoRows.length - 1 && {borderBottomWidth: 0}]}
//                           >
//                             <Text style={s.wRowLabel}>{row.label}</Text>
//                             <View style={s.wRowRight}>
//                               <Text style={s.wRowDash}>-</Text>
//                               <Text
//                                 style={[
//                                   s.wRowVal,
//                                   isNone && {color: '#F59E0B'},
//                                   isLinkable && {color: '#F59E0B'},
//                                 ]}
//                                 numberOfLines={1}
//                               >
//                                 {row.value}
//                               </Text>
//                             </View>
//                           </TouchableOpacity>
//                         );
//                       })}

//                       {/* Special Note row */}
//                       {hasNote && (
//                         <View style={s.wNoteRow}>
//                           <Text style={s.wRowLabel}>Note</Text>
//                           <View style={[s.wRowRight, {flex:1, alignItems:'flex-start'}]}>
//                             <Text style={s.wRowDash}>-</Text>
//                             <Text style={[s.wRowVal, {flex:1, textAlign:'left', color:'#374151'}]}>
//                               {noteText}
//                             </Text>
//                           </View>
//                         </View>
//                       )}
//                     </View>

//                     {/* ── ROOM DETAILS SECTION ── */}
//                     <View style={s.wRoomSection}>
//                       <Text style={s.wRoomSectionTitle}>Room Details</Text>

//                       <View style={s.wRoomTable}>
//                         {/* Total Room Count */}
//                         <View style={s.wRoomRow}>
//                           <Text style={s.wRoomLabel}>Total Room Count</Text>
//                           <View style={s.wRowRight}>
//                             <Text style={s.wRowDash}>-</Text>
//                             <Text style={[s.wRoomVal, totalRooms > 0 && {color:'#F59E0B'}]}>
//                               {totalRooms}
//                             </Text>
//                           </View>
//                         </View>

//                         {/* Each room category */}
//                         {Object.entries(roomCountMap).map(([catName, cnt], i) => (
//                           <View key={`rcat-${i}`} style={s.wRoomRow}>
//                             <Text style={s.wRoomLabel}>{catName}</Text>
//                             <View style={s.wRowRight}>
//                               <Text style={s.wRowDash}>-</Text>
//                               <Text style={[s.wRoomVal, cnt > 0 && {color:'#F59E0B'}]}>
//                                 {cnt}
//                               </Text>
//                             </View>
//                           </View>
//                         ))}
//                       </View>
//                     </View>

//                     <View style={{height:20}}/>
//                   </ScrollView>
//                 </>
//               ) : null}
//             </TouchableOpacity>
//           </Animated.View>
//         </TouchableOpacity>
//       </Modal>
//     );
//   };

//   // ── Repair Modal ──────────────────────────────────────────────────────────
//   const renderRepairModal = () => {
//     if (!selRepair) return null;
//     const r = selRepair;
//     const scale = repairAnim.interpolate({inputRange:[0,1],outputRange:[0.88,1]});
//     return (
//       <Modal transparent animationType="none" visible={repairVisible} onRequestClose={closeRepair}>
//         <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={closeRepair}>
//           <Animated.View style={[s.modalCard,{opacity:repairAnim,transform:[{scale}]}]}>
//             <TouchableOpacity activeOpacity={1} onPress={()=>{}}>
//               <View style={[s.mHead,{backgroundColor:'#6B7280'}]}>
//                 <View style={s.mHeadLeft}>
//                   <View style={s.mOtaFb}><Ionicons name="construct" size={22} color="#fff"/></View>
//                   <View style={{flex:1}}>
//                     <Text style={s.mName}>Room Repair</Text>
//                     <Text style={s.mMethod}>{r.description??r.note??'Under maintenance'}</Text>
//                   </View>
//                 </View>
//                 <TouchableOpacity onPress={closeRepair} hitSlop={{top:12,bottom:12,left:12,right:12}}>
//                   <Ionicons name="close-circle" size={26} color="rgba(255,255,255,0.9)"/>
//                 </TouchableOpacity>
//               </View>
//               <View style={[s.mStatus,{backgroundColor:'#F3F4F6'}]}>
//                 <View style={[s.mDot,{backgroundColor:'#6B7280'}]}/>
//                 <Text style={[s.mStatusTxt,{color:'#6B7280'}]}>UNDER REPAIR</Text>
//               </View>
//               <View style={s.mBody}>
//                 {[
//                   {icon:'calendar-outline',label:'Start Date',val:fmtDate(r.start_date)},
//                   {icon:'calendar-outline',label:'End Date',  val:fmtDate(r.end_date)},
//                 ].map(row=>(
//                   <View key={row.label} style={s.mRow}>
//                     <View style={s.mRowLeft}>
//                       <Ionicons name={row.icon as any} size={15} color="#6B7280"/>
//                       <Text style={[s.mLabel,{color:'#6B7280'}]}>{row.label}</Text>
//                     </View>
//                     <Text style={s.mVal}>{row.val}</Text>
//                   </View>
//                 ))}
//                 {(r.description||r.note)&&(
//                   <View style={[s.mRow,{borderBottomWidth:0,alignItems:'flex-start'}]}>
//                     <View style={s.mRowLeft}>
//                       <Ionicons name="document-text-outline" size={15} color="#6B7280"/>
//                       <Text style={[s.mLabel,{color:'#6B7280'}]}>Note</Text>
//                     </View>
//                     <Text style={[s.mVal,{maxWidth:'65%'}]}>{r.description??r.note}</Text>
//                   </View>
//                 )}
//               </View>
//             </TouchableOpacity>
//           </Animated.View>
//         </TouchableOpacity>
//       </Modal>
//     );
//   };

//   // ── Main UI ───────────────────────────────────────────────────────────────
//   return (
//     <View style={s.container}>
//       <HeaderWithMenu title="Booking Calendar" subtitle="Monthly room availability overview"
//         showNotification showMenuToggle/>

//       {/* Month bar */}
//       <View style={s.monthBar}>
//         <TouchableOpacity onPress={goPrev} style={s.navBtn} activeOpacity={0.7}>
//           <Ionicons name="chevron-back-circle" size={34} color="#6B5B95"/>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={()=>setShowPicker(true)} style={s.monthBtn} activeOpacity={0.8}>
//           <Ionicons name="calendar" size={17} color="#6B5B95"/>
//           <Text style={s.monthBtnTxt}>{monthLabel}</Text>
//           <Ionicons name="chevron-down" size={15} color="#9CA3AF"/>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={goNext} style={s.navBtn} activeOpacity={0.7}>
//           <Ionicons name="chevron-forward-circle" size={34} color="#6B5B95"/>
//         </TouchableOpacity>
//       </View>

//       {showPicker&&(
//         <DateTimePicker value={new Date(year,month,1)} mode="date" display="spinner"
//           onChange={onPick} accentColor="#6B5B95" themeVariant="light"/>
//       )}

//       {/* Stats bar */}
//       <View style={s.statsBar}>
//         {([
//           {label:'Approved',color:'#10B981',icon:'checkmark-circle',count:counts.approved},
//           {label:'Pending', color:'#F59E0B',icon:'time',            count:counts.pending},
//           {label:'Repairs', color:'#6B7280',icon:'construct',       count:counts.repairs},
//         ] as const).map(({label,color,icon,count})=>(
//           <View key={label} style={[s.statPill,{borderColor:color+'55',backgroundColor:color+'14'}]}>
//             <Ionicons name={icon} size={14} color={color}/>
//             <Text style={[s.statLabel,{color}]}>{label}</Text>
//             <View style={[s.statBadge,{backgroundColor:color}]}>
//               <Text style={s.statBadgeTxt}>{count}</Text>
//             </View>
//           </View>
//         ))}
//       </View>

//       {/* OTA legend */}
//       <ScrollView horizontal showsHorizontalScrollIndicator={false}
//         style={s.otaScroll} contentContainerStyle={s.otaContent}>
//         {([
//           {label:'Booking.com',color:'#003580',key:'booking'},
//           {label:'Airbnb',     color:'#FF5A5F',key:'airbnb'},
//           {label:'Expedia',    color:'#FFC72C',key:'expedia'},
//           {label:'Agoda',      color:'#E4002B',key:'agoda'},
//           {label:'Agency',     color:'#2E4057',key:'agency'},
//           {label:'Online',     color:'#6B5B95',key:'online'},
//           {label:'Walk-in',    color:'#2F9E44',key:'walking'},
//           {label:'Phone',      color:'#1098AD',key:'phone'},
//           {label:'Direct',     color:'#495057',key:'direct'},
//           {label:'Repair',     color:'#6B7280',key:''},
//         ]).map(({label,color,key},i)=>(
//           <View key={`ota-${i}`} style={s.otaChip}>
//             <View style={[s.otaChipDot,{backgroundColor:color}]}/>
//             {key&&OTA_IMAGES[key]&&<Image source={OTA_IMAGES[key]} style={s.otaChipImg} resizeMode="contain"/>}
//             {!key&&<Ionicons name="construct" size={10} color={color}/>}
//             <Text style={s.otaChipTxt}>{label}</Text>
//           </View>
//         ))}
//       </ScrollView>

//       {/* Calendar body */}
//       {loading&&!refreshing ? (
//         <View style={s.loadWrap}>
//           <ActivityIndicator size="large" color="#6B5B95"/>
//           <Text style={s.loadTxt}>Loading calendar...</Text>
//         </View>
//       ) : (
//         <ScrollView style={s.scroll}
//           refreshControl={<RefreshControl refreshing={refreshing}
//             onRefresh={()=>{setRefreshing(true);fetchData();}}
//             tintColor="#6B5B95" colors={['#6B5B95']}/>}>
//           {!data||data.categories.length===0 ? (
//             <View style={s.emptyWrap}>
//               <Ionicons name="calendar-outline" size={62} color="#D1D5DB"/>
//               <Text style={s.emptyTitle}>No Bookings This Month</Text>
//               <Text style={s.emptySub}>Pull down to refresh</Text>
//             </View>
//           ) : data.categories.map(cat=>renderCategory(cat))}
//           <View style={{height:80}}/>
//         </ScrollView>
//       )}

//       {renderDetailModal()}
//       {renderRepairModal()}
//     </View>
//   );
// };

// export default BookingCalendar;

// // ── Styles ────────────────────────────────────────────────────────────────────
// const s = StyleSheet.create({
//   container:{flex:1,backgroundColor:'#F0EEF8'},
//   scroll:   {flex:1},

//   monthBar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'#fff',paddingHorizontal:14,paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#E5E7EB',shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:4,elevation:3},
//   navBtn:  {padding:4},
//   monthBtn:{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:9,paddingHorizontal:18,backgroundColor:'#F5F3FF',borderRadius:12,borderWidth:1.5,borderColor:'#C4B5FD'},
//   monthBtnTxt:{fontSize:15,fontWeight:'700',color:'#1F2937'},

//   statsBar:{flexDirection:'row',justifyContent:'center',gap:8,paddingVertical:8,paddingHorizontal:8,backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:'#E5E7EB',flexWrap:'wrap'},
//   statPill:{flexDirection:'row',alignItems:'center',gap:5,paddingVertical:5,paddingHorizontal:10,borderRadius:20,borderWidth:1},
//   statLabel:{fontSize:11,fontWeight:'600'},
//   statBadge:{borderRadius:10,paddingHorizontal:6,paddingVertical:1,minWidth:22,alignItems:'center'},
//   statBadgeTxt:{fontSize:11,fontWeight:'800',color:'#fff'},

//   otaScroll:  {maxHeight:36,backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:'#E5E7EB'},
//   otaContent: {paddingHorizontal:12,paddingVertical:8,flexDirection:'row',gap:8},
//   otaChip:    {flexDirection:'row',alignItems:'center',gap:4,paddingHorizontal:8,paddingVertical:3,backgroundColor:'#F3F4F6',borderRadius:12},
//   otaChipDot: {width:8,height:8,borderRadius:4},
//   otaChipImg: {width:14,height:14,borderRadius:2},
//   otaChipTxt: {fontSize:10,fontWeight:'600',color:'#374151'},

//   catCard:{backgroundColor:'#fff',marginHorizontal:12,marginTop:14,borderRadius:14,overflow:'hidden',shadowColor:'#000',shadowOffset:{width:0,height:3},shadowOpacity:0.09,shadowRadius:10,elevation:5},
//   catBar: {flexDirection:'row',alignItems:'center',gap:8,paddingVertical:11,paddingHorizontal:16,backgroundColor:'#6B5B95'},
//   catBarTxt:{fontSize:15,fontWeight:'800',color:'#fff',flex:1},
//   catBadge: {backgroundColor:'rgba(255,255,255,0.25)',borderRadius:10,paddingHorizontal:8,paddingVertical:2},
//   catBadgeTxt:{fontSize:11,fontWeight:'700',color:'#fff'},

//   tableWrap:{flexDirection:'row'},
//   stickyCol:{width:ROOM_W,zIndex:10},
//   stickyHead:{width:ROOM_W,height:HEAD_H,justifyContent:'center',alignItems:'center',backgroundColor:'#EDE9F6',borderRightWidth:1.5,borderRightColor:'#D1C4E9',borderBottomWidth:1.5,borderBottomColor:'#D1C4E9'},
//   stickyHeadTxt:{fontSize:10,fontWeight:'700',color:'#6B5B95',textTransform:'uppercase'},
//   stickyCell:{width:ROOM_W,height:ROW_H,justifyContent:'center',alignItems:'center',backgroundColor:'#F9F7FF',borderRightWidth:1.5,borderRightColor:'#D1C4E9',borderBottomWidth:1,borderBottomColor:'#EDE9F6'},
//   stickyCellTxt:{fontSize:13,fontWeight:'700',color:'#6B5B95'},
//   noBorder:{borderBottomWidth:0},

//   hScroll:    {flex:1},
//   dayHeadRow: {flexDirection:'row',borderBottomWidth:1.5,borderBottomColor:'#D1C4E9'},
//   dayHead:    {height:HEAD_H,justifyContent:'center',alignItems:'center',borderRightWidth:1,borderRightColor:'#EDE9F6',backgroundColor:'#F5F3FF'},
//   dayHeadWE:  {backgroundColor:'#EDE9F6'},
//   dayHeadToday:{backgroundColor:'#6B5B95'},
//   dayNum:     {fontSize:13,fontWeight:'700',color:'#374151'},
//   dayNumToday:{color:'#fff'},
//   dayDow:     {fontSize:9,fontWeight:'600',color:'#9CA3AF',marginTop:1},
//   dayDowToday:{color:'rgba(255,255,255,0.85)'},

//   gridRow:   {flexDirection:'row',position:'relative',height:ROW_H,borderBottomWidth:1,borderBottomColor:'#F0EEF8'},
//   dayBg:     {height:ROW_H,borderRightWidth:1,borderRightColor:'#F3F0FF'},
//   dayBgWE:   {backgroundColor:'#FAF7FF'},
//   dayBgToday:{backgroundColor:'#EEF2FF'},

//   block:{position:'absolute',top:5,height:40,borderRadius:7,flexDirection:'row',alignItems:'center',paddingHorizontal:6,gap:4,overflow:'hidden',shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.28,shadowRadius:4,elevation:6},
//   blockIconWrap:{width:18,height:18,borderRadius:4,backgroundColor:'rgba(255,255,255,0.25)',justifyContent:'center',alignItems:'center',flexShrink:0},
//   blockIcon:    {width:14,height:14},
//   blockName:    {fontSize:11,fontWeight:'700',color:'#fff',flexShrink:1},

//   blockRepair:{backgroundColor:'#6B7280',borderWidth:1,borderColor:'#9CA3AF'},
//   repairDot:  {width:6,height:6,borderRadius:3,backgroundColor:'#fff',flexShrink:0},
//   repairName: {fontSize:11,fontWeight:'600',color:'#fff',flexShrink:1},

//   loadWrap: {flex:1,justifyContent:'center',alignItems:'center',paddingTop:120},
//   loadTxt:  {color:'#6B5B95',fontSize:15,marginTop:12,fontWeight:'600'},
//   emptyWrap:{paddingTop:80,alignItems:'center'},
//   emptyTitle:{fontSize:17,fontWeight:'700',color:'#1F2937',marginTop:16},
//   emptySub:  {fontSize:13,color:'#9CA3AF',marginTop:6},

//   // ── OLD modal styles (kept for repair modal) ──
//   overlay:   {flex:1,backgroundColor:'rgba(0,0,0,0.52)',justifyContent:'center',alignItems:'center',padding:16},
//   modalCard: {backgroundColor:'#fff',borderRadius:16,overflow:'hidden',width:'100%',maxWidth:430,shadowColor:'#000',shadowOffset:{width:0,height:14},shadowOpacity:0.25,shadowRadius:28,elevation:22},
//   mHead:     {flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16},
//   mHeadLeft: {flexDirection:'row',alignItems:'center',gap:10,flex:1},
//   mOtaImg:   {width:42,height:42,borderRadius:10,backgroundColor:'rgba(255,255,255,0.15)'},
//   mOtaFb:    {width:42,height:42,borderRadius:10,backgroundColor:'rgba(255,255,255,0.2)',justifyContent:'center',alignItems:'center'},
//   mName:     {fontSize:16,fontWeight:'800',color:'#fff'},
//   mMethod:   {fontSize:12,color:'rgba(255,255,255,0.85)',marginTop:2},
//   mStatus:   {flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:16,paddingVertical:9},
//   mDot:      {width:8,height:8,borderRadius:4},
//   mStatusTxt:{fontSize:11,fontWeight:'800',letterSpacing:0.8},
//   mCode:     {fontSize:11,color:'#9CA3AF',fontWeight:'600'},
//   mBody:     {paddingHorizontal:16,paddingBottom:12,paddingTop:4},
//   mSection:  {marginBottom:14},
//   mSectionTitle:{fontSize:10,fontWeight:'800',color:'#9CA3AF',letterSpacing:1.2,marginBottom:6,marginTop:8},
//   mRow:      {flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#F3F4F6'},
//   mRowLeft:  {flexDirection:'row',alignItems:'center',gap:7},
//   mLabel:    {fontSize:12,fontWeight:'600',color:'#6B7280'},
//   mVal:      {fontSize:13,fontWeight:'700',color:'#1F2937',maxWidth:'60%',textAlign:'right'},
//   mNote:     {fontSize:12,color:'#374151',lineHeight:18,paddingVertical:8,paddingHorizontal:4,backgroundColor:'#F9FAFB',borderRadius:8},

//   detailLoader:    {paddingVertical:40,alignItems:'center',gap:12},
//   detailLoaderTxt: {fontSize:13,fontWeight:'600'},

//   // ── WEB-STYLE MODAL ──
//   wHead:       {flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',paddingHorizontal:20,paddingTop:20,paddingBottom:14,borderBottomWidth:1,borderBottomColor:'#E5E7EB',backgroundColor:'#fff'},
//   wHeadContent:{flex:1},
//   wGuestName:  {fontSize:22,fontWeight:'700',color:'#1a1a2e',letterSpacing:0.2},
//   wCountry:    {fontSize:13,fontWeight:'500',marginTop:3},
//   wCloseBtn:   {padding:4,marginLeft:8},

//   wBillRow:    {flexDirection:'row',alignItems:'center',paddingHorizontal:12,paddingVertical:12,backgroundColor:'#f9f9f9',borderBottomWidth:1,borderBottomColor:'#E5E7EB'},
//   wBillLeft:   {flex:1},
//   wBillSectionLabel:{fontSize:12,fontWeight:'700',color:'#374151'},
//   wBillCol:    {alignItems:'center',paddingHorizontal:8,minWidth:80},
//   wBillColLabel:{fontSize:11,fontWeight:'500',color:'#6B7280',marginBottom:3},
//   wBillColVal: {fontSize:12,fontWeight:'700',color:'#1F2937'},

//   wInfoSection:{paddingHorizontal:0},
//   wRow:        {flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:11,paddingHorizontal:20,borderBottomWidth:1,borderBottomColor:'#F0F0F0'},
//   wNoteRow:    {flexDirection:'row',alignItems:'flex-start',paddingVertical:11,paddingHorizontal:20,borderBottomWidth:1,borderBottomColor:'#F0F0F0'},
//   wRowLabel:   {fontSize:13,fontWeight:'500',color:'#374151',flex:1},
//   wRowRight:   {flexDirection:'row',alignItems:'center',gap:8,flex:1,justifyContent:'flex-end'},
//   wRowDash:    {fontSize:13,color:'#9CA3AF'},
//   wRowVal:     {fontSize:13,fontWeight:'600',color:'#1F2937',textAlign:'right',maxWidth:160},

//   wRoomSection:    {backgroundColor:'#fff',borderTopWidth:1,borderTopColor:'#E5E7EB',marginTop:8},
//   wRoomSectionTitle:{fontSize:18,fontWeight:'700',color:'#1a1a2e',textAlign:'center',paddingVertical:18,borderBottomWidth:1,borderBottomColor:'#E5E7EB'},
//   wRoomTable:      {paddingVertical:6},
//   wRoomRow:        {flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:11,paddingHorizontal:20,borderBottomWidth:1,borderBottomColor:'#F0F0F0'},
//   wRoomLabel:      {fontSize:13,fontWeight:'500',color:'#374151',flex:1},
//   wRoomVal:        {fontSize:13,fontWeight:'700',color:'#1F2937'},
// });

// app/calendar/index.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, RefreshControl, Modal,
  Animated, Image, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderWithMenu from '../../components/HeaderWithMenu';
import bookingCalendarService, {
  BookingCalendarResponse,
  CalendarCategory,
  CalendarRoom,
  RoomBookingEntry,
  RepairEntry,
  BookingDetail,
} from '../../services/bookingCalendar';

// ── Layout ────────────────────────────────────────────────────────────────────
const DAY_W  = 54;
const ROOM_W = 62;
const ROW_H  = 50;
const HEAD_H = 46;

// ── OTA images & colours ──────────────────────────────────────────────────────
const OTA_IMAGES: Record<string, any> = {
  airbnb:                      require('../../assets/adult/airbnb.png'),
  'air bnb':                   require('../../assets/adult/airbnb.png'),
  booking:                     require('../../assets/adult/booking.png'),
  'booking.com':               require('../../assets/adult/booking.png'),
  agoda:                       require('../../assets/adult/agoda.png'),
  expedia:                     require('../../assets/adult/expedia.png'),
  'expedia affiliate network': require('../../assets/adult/expedia.png'),
  online:                      require('../../assets/adult/online.png'),
  agency:                      require('../../assets/adult/agency.png'),
  ai:                          require('../../assets/adult/Ai.png'),
  ravan:                       require('../../assets/adult/ravan.png'),
  walking:                     require('../../assets/adult/walking.png'),
  'walk in':                   require('../../assets/adult/walking.png'),
  walkin:                      require('../../assets/adult/walking.png'),
  phone:                       require('../../assets/adult/phone.png'),
  direct:                      require('../../assets/adult/a.png'),
};
const OTA_COLORS: Record<string, string> = {
  airbnb:'#FF5A5F','air bnb':'#FF5A5F',
  booking:'#003580','booking.com':'#003580',
  agoda:'#E4002B',
  expedia:'#FFC72C','expedia affiliate network':'#FFC72C',
  online:'#6B5B95', agency:'#2E4057',
  walking:'#2F9E44','walk in':'#2F9E44',walkin:'#2F9E44',
  phone:'#1098AD', direct:'#495057', ravan:'#C2255C',
};
const FALLBACK_COLORS = [
  '#3B5BDB','#E03131','#2F9E44','#E67700','#7048E8',
  '#1098AD','#C2255C','#0CA678','#F76707','#6741D9',
];

const getOtaKey = (method?: string | null) => {
  if (!method) return '';
  const k = method.toLowerCase().trim();
  if (OTA_IMAGES[k]) return k;
  for (const key of Object.keys(OTA_IMAGES)) {
    if (k.includes(key) || key.includes(k)) return key;
  }
  return '';
};
const getOtaImage    = (method?: string | null) => { const k = getOtaKey(method); return k ? OTA_IMAGES[k] : null; };
const getOtaColor    = (method?: string | null) => { const k = getOtaKey(method); return k && OTA_COLORS[k] ? OTA_COLORS[k] : null; };
const getBlockColor  = (b: RoomBookingEntry) => getOtaColor(b.method) ?? FALLBACK_COLORS[Math.abs(b.booking_id) % FALLBACK_COLORS.length];
const getDetailColor = (method?: string) => getOtaColor(method) ?? '#6B5B95';

// ── Status ────────────────────────────────────────────────────────────────────
const statusMeta = (s: string) => {
  const sl = s.toLowerCase();
  if (['approved','confirmed'].includes(sl)) return { color:'#10B981', bg:'#ECFDF5', label:'APPROVED'  };
  if (['cancelled','canceled'].includes(sl))  return { color:'#EF4444', bg:'#FEF2F2', label:'CANCELLED' };
  if (sl === 'pending')                        return { color:'#F59E0B', bg:'#FFFBEB', label:'PENDING'   };
  return { color:'#6B5B95', bg:'#F5F3FF', label: s.toUpperCase() };
};

const DAYS_SHORT = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

interface PlacedBlock  { kind:'booking'; entry:RoomBookingEntry; startIdx:number; span:number; }
interface PlacedRepair { kind:'repair';  entry:RepairEntry;      startIdx:number; span:number; }
type AnyBlock = PlacedBlock | PlacedRepair;

const fmtDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
};
const fmtTime = (t?: string) => {
  if (!t) return '—';
  const parts = t.split(':');
  if (parts.length < 2) return t;
  const h = parseInt(parts[0]);
  return `${h % 12 || 12}:${parts[1]} ${h < 12 ? 'AM' : 'PM'}`;
};
const fmtRs = (amount?: number | null): string => {
  if (!amount || isNaN(Number(amount))) return 'Rs. 0.00';
  return `Rs. ${Number(amount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
};
const safeVal = (val?: string | null) => {
  if (!val || val === 'null' || val.trim() === '') return 'None';
  return val;
};
const safeAddress = (addr?: string | null) => {
  if (!addr) return 'None';
  const parts = addr.split(',').map(p => p.trim()).filter(p => p && p !== 'null' && p !== '.');
  return parts.length > 0 ? parts.join(', ') : 'None';
};

// ─────────────────────────────────────────────────────────────────────────────
const BookingCalendar = () => {
  const now = new Date();
  const [year,  setYear]          = useState(now.getFullYear());
  const [month, setMonth]         = useState(now.getMonth());
  const [showPicker, setShowPicker] = useState(false);
  const [data,  setData]          = useState<BookingCalendarResponse | null>(null);
  const [loading, setLoading]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData,    setDetailData]    = useState<BookingDetail | null>(null);
  const [selRepair,     setSelRepair]     = useState<RepairEntry | null>(null);
  const [repairVisible, setRepairVisible] = useState(false);

  const detailAnim = useRef(new Animated.Value(0)).current;
  const repairAnim = useRef(new Animated.Value(0)).current;

  const monthFirstDay = `${year}-${String(month+1).padStart(2,'0')}-01`;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingCalendarService.getCalendarBookings(monthFirstDay);
      setData(res);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load');
    } finally { setLoading(false); setRefreshing(false); }
  }, [monthFirstDay]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const goPrev = () => { if (month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
  const goNext = () => { if (month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };
  const onPick = (_:any, d?:Date) => {
    setShowPicker(false);
    if (d){ setYear(d.getFullYear()); setMonth(d.getMonth()); }
  };

  const openBookingDetail = async (entry: RoomBookingEntry) => {
    setDetailData(null);
    setDetailVisible(true);
    setDetailLoading(true);
    detailAnim.setValue(0);
    Animated.spring(detailAnim,{toValue:1,useNativeDriver:true,tension:80,friction:10}).start();
    try {
      const detail = await bookingCalendarService.getBookingDetail(entry.booking_id);
      setDetailData(detail);
    } catch {
      Alert.alert('Error','Could not load booking details');
      setDetailVisible(false);
    } finally { setDetailLoading(false); }
  };

  const closeDetail = () => {
    Animated.timing(detailAnim,{toValue:0,duration:200,useNativeDriver:true})
      .start(()=>{ setDetailVisible(false); setDetailData(null); });
  };

  const openRepair = (e: RepairEntry) => {
    setSelRepair(e); setRepairVisible(true);
    repairAnim.setValue(0);
    Animated.spring(repairAnim,{toValue:1,useNativeDriver:true,tension:80,friction:10}).start();
  };
  const closeRepair = () => {
    Animated.timing(repairAnim,{toValue:0,duration:180,useNativeDriver:true})
      .start(()=>{ setRepairVisible(false); setSelRepair(null); });
  };

  const dayList: string[] = data?.days_in_month ?? [];
  const totalDayW = dayList.length * DAY_W;

  const getBlocks = (room: CalendarRoom): AnyBlock[] => {
    if (!dayList.length) return [];
    const result: AnyBlock[] = [];
    const place = (s:string,e:string) => {
      let si = dayList.indexOf(s), ei = dayList.indexOf(e);
      if (si<0 && s<dayList[0]) si=0;
      if (ei<0 && e>dayList[dayList.length-1]) ei=dayList.length;
      if (si<0||ei<=si) return null;
      return {startIdx:si, span:Math.max(1,ei-si)};
    };
    (room.bookings??[]).forEach(b => { const p=place(b.start_date,b.end_date); if(p) result.push({kind:'booking',entry:b,...p}); });
    (room.repairs??[]).forEach(r  => { const p=place(r.start_date,r.end_date); if(p) result.push({kind:'repair', entry:r,...p}); });
    return result;
  };

  const counts = useMemo(() => {
    if (!data) return {approved:0,pending:0,repairs:0};
    let approved=0,pending=0,repairs=0;
    data.categories.forEach(cat=>cat.rooms.forEach(room=>{
      (room.bookings??[]).forEach(b=>{
        const st=b.status.toLowerCase();
        if(st==='approved'||st==='confirmed') approved++;
        else if(st==='pending') pending++;
      });
      repairs+=(room.repairs??[]).length;
    }));
    return {approved,pending,repairs};
  },[data]);

  const monthLabel = new Date(year,month).toLocaleDateString('en-US',{month:'long',year:'numeric'});

  // ── Render category ───────────────────────────────────────────────────────
  const renderCategory = (cat: CalendarCategory) => (
    <View key={`cat-${cat.category_id}`} style={s.catCard}>
      <View style={s.catBar}>
        <Ionicons name="bed" size={16} color="#fff"/>
        <Text style={s.catBarTxt}>{cat.category_name}</Text>
        <View style={s.catBadge}><Text style={s.catBadgeTxt}>{cat.rooms.length} rooms</Text></View>
      </View>
      <View style={s.tableWrap}>
        <View style={s.stickyCol}>
          <View style={s.stickyHead}><Text style={s.stickyHeadTxt}>ROOM</Text></View>
          {cat.rooms.map((room,idx) => (
            <View key={`sc-${cat.category_id}-${room.room_id}`}
              style={[s.stickyCell, idx===cat.rooms.length-1&&s.noBorder]}>
              <Text style={s.stickyCellTxt}>{room.room_number}</Text>
            </View>
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator persistentScrollbar style={s.hScroll}>
          <View style={{width:totalDayW}}>
            <View style={s.dayHeadRow}>
              {dayList.map((dateStr,i) => {
                const d=new Date(dateStr), isWE=d.getDay()===0||d.getDay()===6, isTD=dateStr===todayStr;
                return (
                  <View key={`dh-${cat.category_id}-${i}`}
                    style={[s.dayHead,{width:DAY_W},isWE&&s.dayHeadWE,isTD&&s.dayHeadToday]}>
                    <Text style={[s.dayNum,isTD&&s.dayNumToday]}>{d.getDate()}</Text>
                    <Text style={[s.dayDow,isTD&&s.dayDowToday]}>{DAYS_SHORT[d.getDay()]}</Text>
                  </View>
                );
              })}
            </View>
            {cat.rooms.map((room,rIdx) => {
              const blocks = getBlocks(room);
              return (
                <View key={`row-${cat.category_id}-${room.room_id}`}
                  style={[s.gridRow,{width:totalDayW},rIdx===cat.rooms.length-1&&s.noBorder]}>
                  {dayList.map((dateStr,i) => {
                    const dow=new Date(dateStr).getDay(), isWE=dow===0||dow===6, isTD=dateStr===todayStr;
                    return <View key={`bg-${i}`} style={[s.dayBg,{width:DAY_W},isWE&&s.dayBgWE,isTD&&s.dayBgToday]}/>;
                  })}
                  {blocks.map(blk => {
                    const left=blk.startIdx*DAY_W+1, width=blk.span*DAY_W-2;
                    if (blk.kind==='repair') return (
                      <TouchableOpacity key={`rep-${cat.category_id}-${room.room_id}-${blk.startIdx}`}
                        activeOpacity={0.8} onPress={()=>openRepair(blk.entry)}
                        style={[s.block,s.blockRepair,{left,width}]}>
                        <View style={s.repairDot}/>
                        <Text style={s.repairName} numberOfLines={1} ellipsizeMode="tail">
                          {blk.entry.description??blk.entry.note??'Repair'}
                        </Text>
                      </TouchableOpacity>
                    );
                    const b=blk.entry, color=getBlockColor(b), otaImg=getOtaImage(b.method);
                    return (
                      <TouchableOpacity key={`bk-${b.booking_id}-${blk.startIdx}`}
                        activeOpacity={0.82} onPress={()=>openBookingDetail(b)}
                        style={[s.block,{left,width,backgroundColor:color}]}>
                        {otaImg&&width>55&&(
                          <View style={s.blockIconWrap}>
                            <Image source={otaImg} style={s.blockIcon} resizeMode="contain"/>
                          </View>
                        )}
                        <Text style={s.blockName} numberOfLines={1} ellipsizeMode="tail">{b.guest_name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  // ── Booking Detail Modal ──────────────────────────────────────────────────
  const renderDetailModal = () => {
    const b           = detailData;
    const method      = b?.booking_method;
    const accentColor = getDetailColor(method);
    const otaImg      = getOtaImage(method);
    const scale       = detailAnim.interpolate({inputRange:[0,1],outputRange:[0.94,1]});
    const translateY  = detailAnim.interpolate({inputRange:[0,1],outputRange:[28,0]});

    // Room counts
    const roomCountMap: Record<string,number> = {};
    let totalRooms = 0;
    (b?.booking_room_count ?? []).forEach(rc => {
      const catName = rc.room_categories?.category_name ?? rc.room_categories?.category ?? 'Room';
      const cnt = Number(rc.room_count ?? 0);
      roomCountMap[catName] = cnt;
      totalRooms += cnt;
    });

    // ── Payment: use total_amount as the source of truth ──────────────────
    const totalAmount   = Number(b?.total_amount   ?? 0);
    const advanceAmount = Number(b?.advance_payment ?? 0);
    // balance comes from API or derived
    const balanceAmount = Number(b?.balance ?? Math.max(0, totalAmount - advanceAmount));

    const fullName = b ? `${b.first_name ?? ''} ${b.last_name ?? ''}`.trim() : '';
    const country  = b?.country && b.country !== 'null' ? b.country : null;
    const sm       = b?.status ? statusMeta(b.status) : null;

    const infoRows = b ? [
      { icon:'logo-whatsapp',    label:'WhatsApp',       value:safeVal(b.w_number),         isLink:!!b.w_number && b.w_number!=='None',                          linkUrl:`https://wa.me/${(b.w_number??'').replace(/\D/g,'')}` },
      { icon:'call-outline',     label:'Mobile',         value:safeVal(b.phone),             isLink:!!b.phone && b.phone!=='None',                                linkUrl:`tel:${b.phone}` },
      { icon:'mail-outline',     label:'Email',          value:safeVal(b.email),             isLink:!!b.email && b.email!=='null' && b.email!=='None',             linkUrl:`mailto:${b.email}` },
      { icon:'location-outline', label:'Address',        value:safeAddress(b.address),       isLink:false, linkUrl:'' },
      { icon:'card-outline',     label:'Passport',       value:safeVal(b.passport),          isLink:false, linkUrl:'' },
      { icon:'cafe-outline',     label:'Breakfast',      value:safeVal(b.breakfast),         isLink:false, linkUrl:'' },
      { icon:'globe-outline',    label:'Booking Method', value:safeVal(b.booking_method),    isLink:false, linkUrl:'' },
      { icon:'people-outline',   label:'Total Persons',  value:String(b.total_person ?? b.adults ?? '—'), isLink:false, linkUrl:'' },
      { icon:'person-outline',   label:'Adults',         value:String(b.adults ?? '—'),      isLink:false, linkUrl:'' },
      { icon:'happy-outline',    label:'Children',       value:String(b.children ?? '0'),    isLink:false, linkUrl:'' },
      { icon:'log-in-outline',   label:'Check In',       value:b.checking_date ?? '—',       isLink:false, linkUrl:'' },
      { icon:'log-out-outline',  label:'Check Out',      value:b.checkout_date ?? '—',       isLink:false, linkUrl:'' },
      { icon:'wallet-outline',   label:'Payment Status', value:safeVal(b.payment),           isLink:false, linkUrl:'' },
      { icon:'time-outline',     label:'Check-In Time',  value:b.checking_time  ? fmtTime(b.checking_time)  : '—', isLink:false, linkUrl:'' },
      { icon:'time-outline',     label:'Check-Out Time', value:b.checkout_time  ? fmtTime(b.checkout_time)  : '—', isLink:false, linkUrl:'' },
    ] : [];

    const hasNote = b && (b.note || b.additional_note);
    const noteText = b?.note ?? b?.additional_note ?? '';

    return (
      <Modal transparent animationType="none" visible={detailVisible} onRequestClose={closeDetail}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={closeDetail}>
          <Animated.View style={[s.modalCard,{opacity:detailAnim,transform:[{scale},{translateY}]}]}>
            <TouchableOpacity activeOpacity={1} onPress={()=>{}}>

              {detailLoading ? (
                <View style={s.loaderWrap}>
                  <TouchableOpacity onPress={closeDetail} style={s.loaderClose}>
                    <Ionicons name="close" size={17} color="#6B7280"/>
                  </TouchableOpacity>
                  <ActivityIndicator size="large" color={accentColor}/>
                  <Text style={[s.loaderTxt,{color:accentColor}]}>Loading booking…</Text>
                </View>
              ) : b ? (
                <>
                  {/* ── HERO HEADER ─────────────────────────────────── */}
                  <View style={[s.heroHeader,{borderTopColor:accentColor}]}>
                    <View style={[s.heroAvatar,{backgroundColor:accentColor+'18',borderColor:accentColor+'40'}]}>
                      {otaImg
                        ? <Image source={otaImg} style={s.heroAvatarImg} resizeMode="contain"/>
                        : <Text style={[s.heroInitial,{color:accentColor}]}>{(fullName||'G').charAt(0).toUpperCase()}</Text>
                      }
                    </View>
                    <View style={s.heroInfo}>
                      <Text style={s.heroName} numberOfLines={1}>{fullName||'Guest'}</Text>
                      <View style={s.heroMeta}>
                        {country&&(
                          <View style={s.metaChip}>
                            <Ionicons name="location" size={10} color="#9CA3AF"/>
                            <Text style={s.metaChipTxt}>{country}</Text>
                          </View>
                        )}
                        {sm&&(
                          <View style={[s.statusChip,{backgroundColor:sm.bg,borderColor:sm.color+'50'}]}>
                            <View style={[s.statusDot,{backgroundColor:sm.color}]}/>
                            <Text style={[s.statusChipTxt,{color:sm.color}]}>{sm.label}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity onPress={closeDetail} style={s.heroClose}>
                      <Ionicons name="close" size={15} color="#6B7280"/>
                    </TouchableOpacity>
                  </View>

                  {/* ── PAYMENT CARDS ───────────────────────────────── */}
                  <View style={s.payRow}>
                    {/* Amount = total_amount */}
                    <View style={[s.payCard,{borderColor:accentColor+'35',backgroundColor:accentColor+'0A'}]}>
                      <Ionicons name="receipt-outline" size={15} color={accentColor}/>
                      <Text style={s.payLabel}>Amount</Text>
                      <Text style={[s.payValue,{color:accentColor}]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                        {fmtRs(totalAmount)}
                      </Text>
                    </View>

                    {/* Paid = advance_payment */}
                    <View style={[s.payCard,{borderColor:'#10B98135',backgroundColor:'#10B9810A'}]}>
                      <Ionicons name="checkmark-circle-outline" size={15} color="#10B981"/>
                      <Text style={s.payLabel}>Paid</Text>
                      <Text style={[s.payValue,{color:'#10B981'}]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                        {fmtRs(advanceAmount)}
                      </Text>
                    </View>

                    {/* Due = balance (total_amount - advance_payment) */}
                    <View style={[s.payCard,{
                      borderColor: balanceAmount>0 ? '#F59E0B35' : '#10B98135',
                      backgroundColor: balanceAmount>0 ? '#F59E0B0A' : '#10B9810A',
                    }]}>
                      <Ionicons name={balanceAmount>0 ? 'alert-circle-outline' : 'checkmark-done-circle-outline'} size={15} color={balanceAmount>0?'#F59E0B':'#10B981'}/>
                      <Text style={s.payLabel}>Due</Text>
                      <Text style={[s.payValue,{color:balanceAmount>0?'#F59E0B':'#10B981'}]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                        {fmtRs(balanceAmount)}
                      </Text>
                    </View>
                  </View>

                  {/* ── INFO ROWS ────────────────────────────────────── */}
                  <ScrollView style={{maxHeight:380}} showsVerticalScrollIndicator={false}>
                    <View>
                      {infoRows.map((row,i) => {
                        const isNone     = ['None','null','—'].includes(row.value);
                        const isLinkable = row.isLink && !isNone;
                        return (
                          <TouchableOpacity
                            key={`ir-${i}`}
                            activeOpacity={isLinkable ? 0.65 : 1}
                            onPress={isLinkable ? ()=>Linking.openURL(row.linkUrl) : undefined}
                            style={[s.infoRow, i===infoRows.length-1&&{borderBottomWidth:0}]}
                          >
                            <View style={s.infoLeft}>
                              <View style={s.infoIcon}>
                                <Ionicons name={row.icon as any} size={12} color="#9CA3AF"/>
                              </View>
                              <Text style={s.infoLabel}>{row.label}</Text>
                            </View>
                            <Text style={[
                              s.infoVal,
                              isNone&&s.infoValNone,
                              isLinkable&&{color:accentColor,textDecorationLine:'underline'},
                            ]} numberOfLines={1}>
                              {row.value}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}

                      {hasNote&&(
                        <View style={[s.infoRow,{alignItems:'flex-start',borderBottomWidth:0}]}>
                          <View style={s.infoLeft}>
                            <View style={s.infoIcon}>
                              <Ionicons name="document-text-outline" size={12} color="#9CA3AF"/>
                            </View>
                            <Text style={s.infoLabel}>Note</Text>
                          </View>
                          <Text style={[s.infoVal,{maxWidth:'58%',textAlign:'left',color:'#374151',fontWeight:'400',lineHeight:18}]}>
                            {noteText}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* ── ROOM DETAILS ─────────────────────────────── */}
                    {totalRooms>0&&(
                      <View style={s.roomSection}>
                        <View style={s.roomHead}>
                          <Ionicons name="bed-outline" size={13} color="#6B5B95"/>
                          <Text style={s.roomTitle}>Room Details</Text>
                          <View style={s.roomTotalBadge}>
                            <Text style={s.roomTotalTxt}>{totalRooms} total</Text>
                          </View>
                        </View>
                        {Object.entries(roomCountMap).map(([catName,cnt],i,arr)=>(
                          <View key={`rc-${i}`} style={[s.roomRow,i===arr.length-1&&{borderBottomWidth:0}]}>
                            <Text style={s.roomLabel}>{catName}</Text>
                            <View style={[s.roomBadge,{backgroundColor:accentColor+'14',borderColor:accentColor+'38'}]}>
                              <Text style={[s.roomBadgeTxt,{color:accentColor}]}>{cnt}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={{height:24}}/>
                  </ScrollView>
                </>
              ) : null}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ── Repair Modal ──────────────────────────────────────────────────────────
  const renderRepairModal = () => {
    if (!selRepair) return null;
    const r = selRepair;
    const scale = repairAnim.interpolate({inputRange:[0,1],outputRange:[0.88,1]});
    return (
      <Modal transparent animationType="none" visible={repairVisible} onRequestClose={closeRepair}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={closeRepair}>
          <Animated.View style={[s.modalCard,{opacity:repairAnim,transform:[{scale}]}]}>
            <TouchableOpacity activeOpacity={1} onPress={()=>{}}>
              <View style={[s.mHead,{backgroundColor:'#6B7280'}]}>
                <View style={s.mHeadLeft}>
                  <View style={s.mOtaFb}><Ionicons name="construct" size={22} color="#fff"/></View>
                  <View style={{flex:1}}>
                    <Text style={s.mName}>Room Repair</Text>
                    <Text style={s.mMethod}>{r.description??r.note??'Under maintenance'}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={closeRepair} hitSlop={{top:12,bottom:12,left:12,right:12}}>
                  <Ionicons name="close-circle" size={26} color="rgba(255,255,255,0.9)"/>
                </TouchableOpacity>
              </View>
              <View style={[s.mStatus,{backgroundColor:'#F3F4F6'}]}>
                <View style={[s.mDot,{backgroundColor:'#6B7280'}]}/>
                <Text style={[s.mStatusTxt,{color:'#6B7280'}]}>UNDER REPAIR</Text>
              </View>
              <View style={s.mBody}>
                {[
                  {icon:'calendar-outline',label:'Start Date',val:fmtDate(r.start_date)},
                  {icon:'calendar-outline',label:'End Date',  val:fmtDate(r.end_date)},
                ].map(row=>(
                  <View key={row.label} style={s.mRow}>
                    <View style={s.mRowLeft}>
                      <Ionicons name={row.icon as any} size={15} color="#6B7280"/>
                      <Text style={[s.mLabel,{color:'#6B7280'}]}>{row.label}</Text>
                    </View>
                    <Text style={s.mVal}>{row.val}</Text>
                  </View>
                ))}
                {(r.description||r.note)&&(
                  <View style={[s.mRow,{borderBottomWidth:0,alignItems:'flex-start'}]}>
                    <View style={s.mRowLeft}>
                      <Ionicons name="document-text-outline" size={15} color="#6B7280"/>
                      <Text style={[s.mLabel,{color:'#6B7280'}]}>Note</Text>
                    </View>
                    <Text style={[s.mVal,{maxWidth:'65%'}]}>{r.description??r.note}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <HeaderWithMenu title="Booking Calendar" subtitle="Monthly room availability overview"
        showNotification showMenuToggle/>

      <View style={s.monthBar}>
        <TouchableOpacity onPress={goPrev} style={s.navBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back-circle" size={34} color="#6B5B95"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setShowPicker(true)} style={s.monthBtn} activeOpacity={0.8}>
          <Ionicons name="calendar" size={17} color="#6B5B95"/>
          <Text style={s.monthBtnTxt}>{monthLabel}</Text>
          <Ionicons name="chevron-down" size={15} color="#9CA3AF"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNext} style={s.navBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-forward-circle" size={34} color="#6B5B95"/>
        </TouchableOpacity>
      </View>

      {showPicker&&(
        <DateTimePicker value={new Date(year,month,1)} mode="date" display="spinner"
          onChange={onPick} accentColor="#6B5B95" themeVariant="light"/>
      )}

      <View style={s.statsBar}>
        {([
          {label:'Approved',color:'#10B981',icon:'checkmark-circle',count:counts.approved},
          {label:'Pending', color:'#F59E0B',icon:'time',            count:counts.pending},
          {label:'Repairs', color:'#6B7280',icon:'construct',       count:counts.repairs},
        ] as const).map(({label,color,icon,count})=>(
          <View key={label} style={[s.statPill,{borderColor:color+'55',backgroundColor:color+'14'}]}>
            <Ionicons name={icon} size={14} color={color}/>
            <Text style={[s.statLabel,{color}]}>{label}</Text>
            <View style={[s.statBadge,{backgroundColor:color}]}>
              <Text style={s.statBadgeTxt}>{count}</Text>
            </View>
          </View>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={s.otaScroll} contentContainerStyle={s.otaContent}>
        {([
          {label:'Booking.com',color:'#003580',key:'booking'},
          {label:'Airbnb',     color:'#FF5A5F',key:'airbnb'},
          {label:'Expedia',    color:'#FFC72C',key:'expedia'},
          {label:'Agoda',      color:'#E4002B',key:'agoda'},
          {label:'Agency',     color:'#2E4057',key:'agency'},
          {label:'Online',     color:'#6B5B95',key:'online'},
          {label:'Walk-in',    color:'#2F9E44',key:'walking'},
          {label:'Phone',      color:'#1098AD',key:'phone'},
          {label:'Direct',     color:'#495057',key:'direct'},
          {label:'Repair',     color:'#6B7280',key:''},
        ]).map(({label,color,key},i)=>(
          <View key={`ota-${i}`} style={s.otaChip}>
            <View style={[s.otaChipDot,{backgroundColor:color}]}/>
            {key&&OTA_IMAGES[key]&&<Image source={OTA_IMAGES[key]} style={s.otaChipImg} resizeMode="contain"/>}
            {!key&&<Ionicons name="construct" size={10} color={color}/>}
            <Text style={s.otaChipTxt}>{label}</Text>
          </View>
        ))}
      </ScrollView>

      {loading&&!refreshing ? (
        <View style={s.loadWrap}>
          <ActivityIndicator size="large" color="#6B5B95"/>
          <Text style={s.loadTxt}>Loading calendar...</Text>
        </View>
      ) : (
        <ScrollView style={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing}
            onRefresh={()=>{setRefreshing(true);fetchData();}}
            tintColor="#6B5B95" colors={['#6B5B95']}/>}>
          {!data||data.categories.length===0 ? (
            <View style={s.emptyWrap}>
              <Ionicons name="calendar-outline" size={62} color="#D1D5DB"/>
              <Text style={s.emptyTitle}>No Bookings This Month</Text>
              <Text style={s.emptySub}>Pull down to refresh</Text>
            </View>
          ) : data.categories.map(cat=>renderCategory(cat))}
          <View style={{height:80}}/>
        </ScrollView>
      )}

      {renderDetailModal()}
      {renderRepairModal()}
    </View>
  );
};

export default BookingCalendar;

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F0EEF8'},
  scroll:   {flex:1},

  monthBar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'#fff',paddingHorizontal:14,paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#E5E7EB',shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:4,elevation:3},
  navBtn:  {padding:4},
  monthBtn:{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:9,paddingHorizontal:18,backgroundColor:'#F5F3FF',borderRadius:12,borderWidth:1.5,borderColor:'#C4B5FD'},
  monthBtnTxt:{fontSize:15,fontWeight:'700',color:'#1F2937'},

  statsBar:{flexDirection:'row',justifyContent:'center',gap:8,paddingVertical:8,paddingHorizontal:8,backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:'#E5E7EB',flexWrap:'wrap'},
  statPill:{flexDirection:'row',alignItems:'center',gap:5,paddingVertical:5,paddingHorizontal:10,borderRadius:20,borderWidth:1},
  statLabel:{fontSize:11,fontWeight:'600'},
  statBadge:{borderRadius:10,paddingHorizontal:6,paddingVertical:1,minWidth:22,alignItems:'center'},
  statBadgeTxt:{fontSize:11,fontWeight:'800',color:'#fff'},

  otaScroll:  {maxHeight:36,backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:'#E5E7EB'},
  otaContent: {paddingHorizontal:12,paddingVertical:8,flexDirection:'row',gap:8},
  otaChip:    {flexDirection:'row',alignItems:'center',gap:4,paddingHorizontal:8,paddingVertical:3,backgroundColor:'#F3F4F6',borderRadius:12},
  otaChipDot: {width:8,height:8,borderRadius:4},
  otaChipImg: {width:14,height:14,borderRadius:2},
  otaChipTxt: {fontSize:10,fontWeight:'600',color:'#374151'},

  catCard:{backgroundColor:'#fff',marginHorizontal:12,marginTop:14,borderRadius:14,overflow:'hidden',shadowColor:'#000',shadowOffset:{width:0,height:3},shadowOpacity:0.09,shadowRadius:10,elevation:5},
  catBar: {flexDirection:'row',alignItems:'center',gap:8,paddingVertical:11,paddingHorizontal:16,backgroundColor:'#6B5B95'},
  catBarTxt:{fontSize:15,fontWeight:'800',color:'#fff',flex:1},
  catBadge: {backgroundColor:'rgba(255,255,255,0.25)',borderRadius:10,paddingHorizontal:8,paddingVertical:2},
  catBadgeTxt:{fontSize:11,fontWeight:'700',color:'#fff'},

  tableWrap:{flexDirection:'row'},
  stickyCol:{width:ROOM_W,zIndex:10},
  stickyHead:{width:ROOM_W,height:HEAD_H,justifyContent:'center',alignItems:'center',backgroundColor:'#EDE9F6',borderRightWidth:1.5,borderRightColor:'#D1C4E9',borderBottomWidth:1.5,borderBottomColor:'#D1C4E9'},
  stickyHeadTxt:{fontSize:10,fontWeight:'700',color:'#6B5B95',textTransform:'uppercase'},
  stickyCell:{width:ROOM_W,height:ROW_H,justifyContent:'center',alignItems:'center',backgroundColor:'#F9F7FF',borderRightWidth:1.5,borderRightColor:'#D1C4E9',borderBottomWidth:1,borderBottomColor:'#EDE9F6'},
  stickyCellTxt:{fontSize:13,fontWeight:'700',color:'#6B5B95'},
  noBorder:{borderBottomWidth:0},

  hScroll:    {flex:1},
  dayHeadRow: {flexDirection:'row',borderBottomWidth:1.5,borderBottomColor:'#D1C4E9'},
  dayHead:    {height:HEAD_H,justifyContent:'center',alignItems:'center',borderRightWidth:1,borderRightColor:'#EDE9F6',backgroundColor:'#F5F3FF'},
  dayHeadWE:  {backgroundColor:'#EDE9F6'},
  dayHeadToday:{backgroundColor:'#6B5B95'},
  dayNum:     {fontSize:13,fontWeight:'700',color:'#374151'},
  dayNumToday:{color:'#fff'},
  dayDow:     {fontSize:9,fontWeight:'600',color:'#9CA3AF',marginTop:1},
  dayDowToday:{color:'rgba(255,255,255,0.85)'},

  gridRow:   {flexDirection:'row',position:'relative',height:ROW_H,borderBottomWidth:1,borderBottomColor:'#F0EEF8'},
  dayBg:     {height:ROW_H,borderRightWidth:1,borderRightColor:'#F3F0FF'},
  dayBgWE:   {backgroundColor:'#FAF7FF'},
  dayBgToday:{backgroundColor:'#EEF2FF'},

  block:{position:'absolute',top:5,height:40,borderRadius:7,flexDirection:'row',alignItems:'center',paddingHorizontal:6,gap:4,overflow:'hidden',shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.28,shadowRadius:4,elevation:6},
  blockIconWrap:{width:18,height:18,borderRadius:4,backgroundColor:'rgba(255,255,255,0.25)',justifyContent:'center',alignItems:'center',flexShrink:0},
  blockIcon:    {width:14,height:14},
  blockName:    {fontSize:11,fontWeight:'700',color:'#fff',flexShrink:1},
  blockRepair:  {backgroundColor:'#6B7280',borderWidth:1,borderColor:'#9CA3AF'},
  repairDot:    {width:6,height:6,borderRadius:3,backgroundColor:'#fff',flexShrink:0},
  repairName:   {fontSize:11,fontWeight:'600',color:'#fff',flexShrink:1},

  loadWrap: {flex:1,justifyContent:'center',alignItems:'center',paddingTop:120},
  loadTxt:  {color:'#6B5B95',fontSize:15,marginTop:12,fontWeight:'600'},
  emptyWrap:{paddingTop:80,alignItems:'center'},
  emptyTitle:{fontSize:17,fontWeight:'700',color:'#1F2937',marginTop:16},
  emptySub:  {fontSize:13,color:'#9CA3AF',marginTop:6},

  // ── OVERLAY & BASE CARD ──
  overlay:   {flex:1,backgroundColor:'rgba(0,0,0,0.55)',justifyContent:'center',alignItems:'center',padding:16},
  modalCard: {backgroundColor:'#fff',borderRadius:20,overflow:'hidden',width:'100%',maxWidth:430,shadowColor:'#000',shadowOffset:{width:0,height:20},shadowOpacity:0.26,shadowRadius:32,elevation:28},

  // Loader state
  loaderWrap:{paddingVertical:52,alignItems:'center',gap:14},
  loaderTxt: {fontSize:13,fontWeight:'600'},
  loaderClose:{position:'absolute',top:14,right:14,width:30,height:30,borderRadius:15,backgroundColor:'#F3F4F6',justifyContent:'center',alignItems:'center'},

  // Hero header
  heroHeader:  {flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:16,paddingTop:18,paddingBottom:14,borderBottomWidth:1,borderBottomColor:'#F3F4F6',borderTopWidth:3},
  heroAvatar:  {width:48,height:48,borderRadius:13,borderWidth:1.5,justifyContent:'center',alignItems:'center',flexShrink:0},
  heroAvatarImg:{width:30,height:30,borderRadius:6},
  heroInitial: {fontSize:20,fontWeight:'800'},
  heroInfo:    {flex:1,gap:4},
  heroName:    {fontSize:18,fontWeight:'800',color:'#111827',letterSpacing:-0.3},
  heroMeta:    {flexDirection:'row',flexWrap:'wrap',gap:5},
  metaChip:    {flexDirection:'row',alignItems:'center',gap:3,backgroundColor:'#F9FAFB',paddingHorizontal:7,paddingVertical:3,borderRadius:6},
  metaChipTxt: {fontSize:11,color:'#6B7280',fontWeight:'500'},
  statusChip:  {flexDirection:'row',alignItems:'center',gap:4,paddingHorizontal:8,paddingVertical:3,borderRadius:6,borderWidth:1},
  statusDot:   {width:5,height:5,borderRadius:3},
  statusChipTxt:{fontSize:10,fontWeight:'700',letterSpacing:0.5},
  heroClose:   {width:28,height:28,borderRadius:9,backgroundColor:'#F3F4F6',justifyContent:'center',alignItems:'center',flexShrink:0},

  // Payment cards
  payRow:  {flexDirection:'row',gap:8,padding:12,backgroundColor:'#FAFAFA',borderBottomWidth:1,borderBottomColor:'#F0F0F0'},
  payCard: {flex:1,alignItems:'center',paddingVertical:11,paddingHorizontal:4,borderRadius:12,borderWidth:1.5,gap:3},
  payLabel:{fontSize:10,fontWeight:'600',color:'#9CA3AF',textTransform:'uppercase',letterSpacing:0.4},
  payValue:{fontSize:12,fontWeight:'800',letterSpacing:-0.2},

  // Info rows
  infoRow:    {flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:11,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:'#F7F7F7'},
  infoLeft:   {flexDirection:'row',alignItems:'center',gap:8,flex:1},
  infoIcon:   {width:22,height:22,borderRadius:6,backgroundColor:'#F3F4F6',justifyContent:'center',alignItems:'center'},
  infoLabel:  {fontSize:13,fontWeight:'500',color:'#374151'},
  infoVal:    {fontSize:13,fontWeight:'600',color:'#111827',maxWidth:175,textAlign:'right'},
  infoValNone:{color:'#D1D5DB',fontWeight:'400',fontStyle:'italic'},

  // Room section
  roomSection:{backgroundColor:'#FAFAFA',borderTopWidth:1,borderTopColor:'#F0F0F0',marginTop:4,paddingBottom:4},
  roomHead:   {flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:16,paddingTop:12,paddingBottom:8},
  roomTitle:  {fontSize:13,fontWeight:'700',color:'#1F2937',flex:1},
  roomTotalBadge:{backgroundColor:'#6B5B9518',paddingHorizontal:8,paddingVertical:2,borderRadius:7},
  roomTotalTxt:  {fontSize:11,fontWeight:'700',color:'#6B5B95'},
  roomRow:    {flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:9,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:'#F0F0F0'},
  roomLabel:  {fontSize:13,fontWeight:'500',color:'#374151'},
  roomBadge:  {borderRadius:7,borderWidth:1,paddingHorizontal:10,paddingVertical:3},
  roomBadgeTxt:{fontSize:13,fontWeight:'800'},

  // Repair modal
  mHead:    {flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16},
  mHeadLeft:{flexDirection:'row',alignItems:'center',gap:10,flex:1},
  mOtaFb:   {width:42,height:42,borderRadius:10,backgroundColor:'rgba(255,255,255,0.2)',justifyContent:'center',alignItems:'center'},
  mName:    {fontSize:16,fontWeight:'800',color:'#fff'},
  mMethod:  {fontSize:12,color:'rgba(255,255,255,0.85)',marginTop:2},
  mStatus:  {flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:16,paddingVertical:9},
  mDot:     {width:8,height:8,borderRadius:4},
  mStatusTxt:{fontSize:11,fontWeight:'800',letterSpacing:0.8},
  mBody:    {paddingHorizontal:16,paddingBottom:12,paddingTop:4},
  mRow:     {flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#F3F4F6'},
  mRowLeft: {flexDirection:'row',alignItems:'center',gap:7},
  mLabel:   {fontSize:12,fontWeight:'600',color:'#6B7280'},
  mVal:     {fontSize:13,fontWeight:'700',color:'#1F2937',maxWidth:'60%',textAlign:'right'},
});