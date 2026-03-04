// app/nav/house_keeping.tsx
import DashboardHeader from '@/components/HeaderWithMenu';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Services
import bookingCalendarService from '@/services/bookingCalendar';
import {
  getChecklistByRoom,
  getRooms,
  getRoomStatusColor, OtherLocation, Room, RoomChecklist,
} from '@/services/housekeepingService';

// Modular Components
import ChecklistDetailModal from '@/components/housekeeping/ChecklistDetailModal';
import FinalizeChecklistModal from '@/components/housekeeping/FinalizeChecklistModal';
import NewChecklistModal from '@/components/housekeeping/NewChecklistModal';
import RoomCard from '@/components/housekeeping/RoomCard';

const { width } = Dimensions.get('window');

type TabType = 'rooms' | 'other';
type FilterType = 'all' | 'occupied' | 'clean' | 'dirty' | 'touch_up' | 'need_clean';

const IMAGE_BASE_URL = 'https://demo.trackerstay.com/storage';

const C = {
  purple: '#6B5B95',
  purpleLight: '#EDE9FE',
  purpleDark: '#4C3D7A',
  gold: '#C8A84B',
  goldLight: '#FEF3C7',
  goldDark: '#A07830',
  amber: '#D97706',
  red: '#EF4444',
  green: '#10B981',
  blue: '#3B82F6',
  blueLight: '#DBEAFE',
  violet: '#8B5CF6',
  violetLight: '#EDE9FE',
  bg: '#F3F4F6',
  white: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecond: '#6B7280',
  textMuted: '#9CA3AF',
};

const HousekeepingPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [otherLocations, setOtherLocations] = useState<OtherLocation[]>([]);
  const [filtered, setFiltered] = useState<Room[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [checklist, setChecklist] = useState<RoomChecklist | null>(null);
  const [checklistLoading, setChecklistLoading] = useState(false);

  const [showNewCL, setShowNewCL] = useState(false);
  const [newCLRoom, setNewCLRoom] = useState<Room | null>(null);
  const [showFinalize, setShowFinalize] = useState(false);
  const [finalizeRoom, setFinalizeRoom] = useState<Room | null>(null);

  const [dotRoom, setDotRoom] = useState<Room | null>(null);
  const [showDotMenu, setShowDotMenu] = useState(false);
  const dotAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const roomRes = await getRooms();
      let roomList = roomRes.rooms || [];

      try {
        const today = new Date().toISOString().split('T')[0];
        const calendarRes = await bookingCalendarService.getCalendarBookings(today);
        const calendarRooms = calendarRes.categories.flatMap(c => c.rooms);

        roomList = roomList.map(r => {
          const cRoom = calendarRooms.find(cr => cr.room_id === r.id);
          if (cRoom && cRoom.bookings && cRoom.bookings.length > 0) {
            const activeBooking = cRoom.bookings.find(b => b.start_date <= today && b.end_date >= today);
            if (activeBooking) {
              return {
                ...r,
                current_booking: {
                  booking_id: activeBooking.booking_id,
                  guest_name: activeBooking.guest_name,
                  start_date: activeBooking.start_date,
                  end_date: activeBooking.end_date,
                  status: activeBooking.status
                }
              };
            }
          }
          return r;
        });
      } catch (calErr) {
        console.warn('Could not fetch calendar bookings', calErr);
      }

      setRooms(roomList);
      setOtherLocations(roomRes.other_locations || []);
    } catch {
      Alert.alert('Error', 'Failed to load rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, []);

  useEffect(() => { loadRooms(); }, []);

  useEffect(() => {
    let list: Room[] = [];

    // 1. Tab filtering
    if (activeTab === 'other') {
      list = otherLocations.map(loc => ({
        id: loc.id,
        room_number: loc.name,
        room_category: {
          id: 0,
          category: loc.category,
          custome_name: loc.category,
          room_type: 'other',
          status: 'Active',
          price: 0,
          num_of_bed: 0,
          max_adults_limit: 0,
          max_children_limit: 0,
          image: null
        } as any,
        check_list: null,
        created_at: loc.created_at,
        updated_at: loc.updated_at,
      } as Room));
    } else {
      list = rooms.filter(r =>
        r.room_type?.toLowerCase() !== 'other' &&
        r.room_category?.room_type?.toLowerCase() !== 'other'
      );
    }

    // 2. Search filtering
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.room_number.toLowerCase().includes(q) ||
        r.room_category?.custome_name?.toLowerCase().includes(q) ||
        r.room_category?.category?.toLowerCase().includes(q)
      );
    }

    // 3. Status filtering
    const statusFiltered = statusFilter === 'all'
      ? list
      : list.filter(r => {
        const label = getRoomStatusColor(r).label;
        if (statusFilter === 'occupied') return label === 'Occupied';
        if (statusFilter === 'clean') return label === 'Clean';
        if (statusFilter === 'dirty') return label === 'Dirty';
        if (statusFilter === 'touch_up') return label === 'Need to Touch Up';
        if (statusFilter === 'need_clean') return label === 'Need to Clean';
        return true;
      });

    setFiltered(statusFiltered);
  }, [rooms, otherLocations, search, statusFilter, activeTab]);

  const openDetail = async (room: Room) => {
    setSelectedRoom(room); setChecklist(null); setShowDetail(true); setChecklistLoading(true);
    try { setChecklist(await getChecklistByRoom(room.id)); }
    catch (e) { console.error(e); }
    finally { setChecklistLoading(false); }
  };

  const openDotMenu = (room: Room) => {
    setDotRoom(room); setShowDotMenu(true);
    dotAnim.setValue(0);
    Animated.spring(dotAnim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }).start();
  };

  const closeDotMenu = () => setShowDotMenu(false);
  const closeDetail = () => { setShowDetail(false); setTimeout(() => { setSelectedRoom(null); setChecklist(null); }, 350); };
  const openNewCL = (room: Room) => { setNewCLRoom(room); setShowNewCL(true); };
  const closeNewCL = () => { setShowNewCL(false); setTimeout(() => setNewCLRoom(null), 350); };
  const openFinalize = (room: Room) => { setFinalizeRoom(room); setShowFinalize(true); };
  const closeFinalize = () => { setShowFinalize(false); setTimeout(() => setFinalizeRoom(null), 350); };
  const handleGoFinalize = (room: Room) => openFinalize(room);

  // Use a helper to get items for the current tab (for stats calculation)
  const getTabBaseItems = useCallback(() => {
    if (activeTab === 'other') {
      return otherLocations.map(loc => ({
        id: loc.id,
        room_number: loc.name,
        room_category: { category: loc.category, custome_name: loc.category } as any,
        check_list: null,
      } as Room));
    }
    return rooms.filter(r =>
      r.room_type?.toLowerCase() !== 'other' &&
      r.room_category?.room_type?.toLowerCase() !== 'other'
    );
  }, [rooms, otherLocations, activeTab]);

  const tabBaseItems = getTabBaseItems();

  const stats = {
    total: tabBaseItems.length,
    occupied: tabBaseItems.filter(r => getRoomStatusColor(r).label === 'Occupied').length,
    clean: tabBaseItems.filter(r => getRoomStatusColor(r).label === 'Clean').length,
    dirty: tabBaseItems.filter(r => getRoomStatusColor(r).label === 'Dirty').length,
    touchUp: tabBaseItems.filter(r => getRoomStatusColor(r).label === 'Need to Touch Up').length,
    needClean: tabBaseItems.filter(r => getRoomStatusColor(r).label === 'Need to Clean').length,
  };

  const summaryItems = [
    { key: 'all' as FilterType, label: 'All', count: stats.total, color: C.purple, bg: C.purpleLight, icon: 'grid-outline' as const },
    { key: 'occupied' as FilterType, label: 'Occupied', count: stats.occupied, color: C.blue, bg: C.blueLight, icon: 'person-outline' as const },
    { key: 'clean' as FilterType, label: 'Clean', count: stats.clean, color: C.green, bg: '#D1FAE5', icon: 'checkmark-circle-outline' as const },
    { key: 'dirty' as FilterType, label: 'Dirty', count: stats.dirty, color: C.red, bg: '#FEE2E2', icon: 'warning-outline' as const },
    { key: 'touch_up' as FilterType, label: 'Touch Up', count: stats.touchUp, color: C.violet, bg: C.violetLight, icon: 'brush-outline' as const },
    { key: 'need_clean' as FilterType, label: 'Need Clean', count: stats.needClean, color: C.amber, bg: C.goldLight, icon: 'water-outline' as const },
  ];

  const roomTabCount = rooms.filter(r =>
    r.room_type?.toLowerCase() !== 'other' &&
    r.room_category?.room_type?.toLowerCase() !== 'other'
  ).length;

  const otherTabCount = otherLocations.length;

  return (
    <View style={s.container}>
      <DashboardHeader title="Housekeeping" subtitle="Room cleanliness & status" currentPage="housekeeping" />

      <View style={s.tabBar}>
        {(['rooms', 'other'] as TabType[]).map(tab => (
          <TouchableOpacity key={tab} style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === 'rooms' ? `Rooms (${roomTabCount})` : `Other Location (${otherTabCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={16} color={C.textMuted} />
          <TextInput style={s.searchInput} placeholder="Room ID"
            placeholderTextColor={C.textMuted} value={search} onChangeText={setSearch} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={s.resetBtn} onPress={() => { setSearch(''); setStatusFilter('all'); }}>
          <Text style={s.resetBtnText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={s.summaryWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.summaryScroll}>
          {summaryItems.map((item) => {
            const isActive = statusFilter === item.key;
            return (
              <TouchableOpacity key={item.key}
                style={[s.sumItem, isActive && { backgroundColor: item.bg }]}
                onPress={() => setStatusFilter(isActive ? 'all' : item.key)}
                activeOpacity={0.7}>
                <View style={[s.sumIcon, { backgroundColor: isActive ? item.color : item.bg }]}>
                  <Ionicons name={item.icon} size={13} color={isActive ? '#fff' : item.color} />
                </View>
                <Text style={[s.sumCount, { color: isActive ? item.color : C.textPrimary }]}>{item.count}</Text>
                <Text style={[s.sumLabel, { color: isActive ? item.color : C.textSecond }]}>{item.label}</Text>
                {isActive && <View style={[s.sumActiveLine, { backgroundColor: item.color }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={C.purple} />
          <Text style={s.loadText}>Loading rooms...</Text>
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={filtered} keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <RoomCard item={item} onOpenDotMenu={openDotMenu} />}
            numColumns={2} columnWrapperStyle={s.row} contentContainerStyle={s.grid}
            refreshControl={
              <RefreshControl refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadRooms(); }}
                colors={[C.purple]} tintColor={C.purple} />
            }
            ListEmptyComponent={
              <View style={s.empty}>
                <Ionicons name="bed-outline" size={52} color="#D1D5DB" />
                <Text style={s.emptyTitle}>No Rooms Found</Text>
                <Text style={s.emptyText}>Try adjusting your search or filters</Text>
              </View>
            }
          />
        </Animated.View>
      )}

      <Modal visible={showDotMenu} transparent animationType="none" onRequestClose={closeDotMenu}>
        <TouchableOpacity style={s.dotBackdrop} activeOpacity={1} onPress={closeDotMenu} />
        <Animated.View style={[s.dotDropdown, {
          opacity: dotAnim,
          transform: [{
            scale: dotAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
          }, {
            translateY: dotAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }),
          }],
        }]}>
          <View style={s.dotDropHeader}>
            <View style={s.dotDropHeaderLeft}>
              <View style={[s.dotDropRoomBadge, { backgroundColor: C.purpleLight }]}>
                <Ionicons name="bed-outline" size={13} color={C.purple} />
                <Text style={s.dotDropRoomText}>Room {dotRoom?.room_number}</Text>
              </View>
              <Text style={s.dotDropCat} numberOfLines={1}>
                {dotRoom?.room_category?.custome_name || dotRoom?.room_category?.category}
              </Text>
            </View>
            <TouchableOpacity onPress={closeDotMenu} style={s.dotDropClose}>
              <Ionicons name="close" size={18} color={C.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.dotDropItem}
            onPress={() => { closeDotMenu(); if (dotRoom) setTimeout(() => openDetail(dotRoom), 180); }}
            activeOpacity={0.72}>
            <View style={[s.dotDropIconWrap, { backgroundColor: C.purpleLight }]}>
              <Ionicons name="eye-outline" size={19} color={C.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.dotDropItemLabel}>View Checklist</Text>
            </View>
          </TouchableOpacity>

          <View style={s.dotDropDivider} />

          <TouchableOpacity style={s.dotDropItem}
            onPress={() => { closeDotMenu(); if (dotRoom) setTimeout(() => openNewCL(dotRoom), 180); }}
            activeOpacity={0.72}>
            <View style={[s.dotDropIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="add-outline" size={19} color={C.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.dotDropItemLabel}>New Checklist</Text>
            </View>
          </TouchableOpacity>

          <View style={s.dotDropDivider} />

          <TouchableOpacity style={[s.dotDropItem, { borderBottomWidth: 0 }]}
            onPress={() => { closeDotMenu(); if (dotRoom) setTimeout(() => openFinalize(dotRoom), 180); }}
            activeOpacity={0.72}>
            <View style={[s.dotDropIconWrap, { backgroundColor: C.goldLight }]}>
              <Ionicons name="sync-outline" size={19} color={C.goldDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.dotDropItemLabel}>Recheck</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      <ChecklistDetailModal
        visible={showDetail} room={selectedRoom} checklist={checklist}
        checklistLoading={checklistLoading} onClose={closeDetail} imageBaseUrl={IMAGE_BASE_URL} />

      <NewChecklistModal
        visible={showNewCL} room={newCLRoom} onClose={closeNewCL}
        onSuccess={loadRooms} onGoFinalize={handleGoFinalize} />

      <FinalizeChecklistModal
        visible={showFinalize} room={finalizeRoom} onClose={closeFinalize}
        onSuccess={loadRooms} imageBaseUrl={IMAGE_BASE_URL} />
    </View>
  );
};

export default HousekeepingPage;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  tabBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.white },
  tab: { paddingBottom: 10, marginRight: 24 },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: C.purple },
  tabText: { fontSize: 13, fontWeight: '500', color: C.textSecond },
  tabTextActive: { color: C.purple, fontWeight: '700' },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.textPrimary },
  resetBtn: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: C.purple },
  resetBtnText: { fontSize: 12, color: C.purple, fontWeight: '600' },
  summaryWrap: { paddingTop: 12, paddingBottom: 4 },
  summaryScroll: { paddingHorizontal: 12 },
  sumItem: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12, position: 'relative', minWidth: 68 },
  sumIcon: { width: 28, height: 28, borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  sumCount: { fontSize: 18, fontWeight: '800' },
  sumLabel: { fontSize: 9, fontWeight: '500', textAlign: 'center', marginTop: 2 },
  sumActiveLine: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadText: { fontSize: 14, color: C.textMuted },
  empty: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: C.textPrimary, marginTop: 16 },
  emptyText: { fontSize: 14, color: C.textMuted, textAlign: 'center', marginTop: 6 },
  grid: { paddingHorizontal: 12, paddingBottom: 24, paddingTop: 10 },
  row: { justifyContent: 'space-between' },
  dotBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.22)' },
  dotDropdown: { position: 'absolute', top: '26%', left: 22, right: 22, backgroundColor: C.white, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 16, overflow: 'hidden' },
  dotDropHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dotDropHeaderLeft: { flex: 1 },
  dotDropRoomBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, marginBottom: 4 },
  dotDropRoomText: { fontSize: 12, fontWeight: '700', color: C.purple },
  dotDropCat: { fontSize: 13, color: C.textSecond, fontWeight: '500' },
  dotDropClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  dotDropItem: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 18, paddingVertical: 15 },
  dotDropIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dotDropItemLabel: { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 1 },
  dotDropItemSub: { fontSize: 11, color: C.textMuted },
  dotDropDivider: { height: 1, backgroundColor: '#F9FAFB' },
});
