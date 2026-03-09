import {
    Room, RoomChecklist, getRoomStatusColor
} from '@/services/housekeepingService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from 'react-native';
import ImageGallery from './ImageGallery';
import InfoRow from './InfoRow';

const { height } = Dimensions.get('window');

interface ChecklistDetailModalProps {
    visible: boolean;
    room: Room | null;
    checklist: RoomChecklist | null;
    checklistLoading: boolean;
    onClose: () => void;
    imageBaseUrl: string;
}

const C = {
    purple: '#6B5B95',
    bg: '#F3F4F6',
    white: '#FFFFFF',
    textMuted: '#9CA3AF',
    green: '#10B981',
    red: '#EF4444',
    purpleLight: '#EDE9FE',
};

const ChecklistDetailModal: React.FC<ChecklistDetailModalProps> = ({
    visible, room, checklist, checklistLoading, onClose, imageBaseUrl
}) => {
    const slideAnim = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
        } else {
            Animated.timing(slideAnim, { toValue: height, duration: 280, useNativeDriver: true }).start();
        }
    }, [visible]);

    if (!room) return null;

    const statusInfo = getRoomStatusColor(room);
    const items = checklist?.check_list_detail ?? [];
    const images = checklist?.check_list_image ?? [];
    const issueCount = items.filter(i => i.housekeeper_status === 'No').length;
    const hkName = checklist?.housekeeper
        ? `${checklist.housekeeper.name} ${checklist.housekeeper.lname ?? ''}`.trim() : '—';
    const svName = checklist?.supervisor
        ? `${checklist.supervisor.name} ${checklist.supervisor.lname ?? ''}`.trim() : '—';

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
            <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
                <LinearGradient colors={[C.purple, '#8B7BAF']} style={s.gradHeader}>
                    <View style={s.handle} />
                    <View style={s.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.headerSub}>{room.room_category?.custome_name || room.room_category?.category}</Text>
                            <Text style={s.headerTitle}>Room {room.room_number} — Checklist</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <Ionicons name="close" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View style={s.badgeRow}>
                        <View style={[s.badge, { backgroundColor: statusInfo.bg }]}>
                            <Text style={[s.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                        </View>
                        {issueCount > 0 && (
                            <View style={[s.badge, { backgroundColor: '#FEE2E2' }]}>
                                <Ionicons name="warning-outline" size={12} color={C.red} />
                                <Text style={[s.badgeText, { color: C.red }]}>
                                    {issueCount} Issue{issueCount !== 1 ? 's' : ''}
                                </Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>

                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}>
                    {checklistLoading ? (
                        <View style={[s.centered, { paddingVertical: 60 }]}>
                            <ActivityIndicator size="large" color={C.purple} />
                            <Text style={s.loadText}>Loading checklist...</Text>
                        </View>
                    ) : !checklist ? (
                        <View style={[s.empty, { paddingVertical: 60 }]}>
                            <Ionicons name="document-outline" size={52} color="#D1D5DB" />
                            <Text style={s.emptyTitle}>No Checklist Found</Text>
                            <Text style={s.emptyText}>No finalized checklist for this room yet</Text>
                        </View>
                    ) : (
                        <>
                            <View style={s.infoCard}>
                                <InfoRow icon="person-outline" label="Checked" value={hkName} />
                                <InfoRow icon="shield-checkmark-outline" label="Supervised" value={svName} />
                                <InfoRow icon="home-outline" label="Status" value={checklist.room_status || '—'}
                                    valueColor={checklist.room_status === 'Ready' ? C.green : C.red} />
                                <InfoRow icon="alert-circle-outline" label="Issues" value={String(issueCount)}
                                    valueColor={issueCount > 0 ? C.red : C.green} isLast />
                            </View>
                            <View style={s.tableCard}>
                                <View style={s.tableHead}>
                                    <Text style={[s.tableHeadCell, { flex: 3 }]}>Item Name</Text>
                                    <Text style={[s.tableHeadCell, { flex: 1, textAlign: 'right' }]}>HK Status</Text>
                                </View>
                                {items.length === 0
                                    ? <View style={s.tableCenter}>
                                        <Ionicons name="list-outline" size={36} color="#D1D5DB" />
                                        <Text style={s.helperText}>No items</Text>
                                    </View>
                                    : items.map((item, idx) => {
                                        const isNo = item.housekeeper_status === 'No';
                                        return (
                                            <View key={item.id}
                                                style={[s.tableRow, idx % 2 !== 0 && s.rowOdd, isNo && s.rowFail]}>
                                                <View style={[s.cell, { flex: 3, gap: 5 }]}>
                                                    {isNo && <View style={s.redDot} />}
                                                    <Text style={[s.cellText, isNo && s.cellFail]} numberOfLines={3}>
                                                        {item.housekeeping?.item_name ?? '—'}
                                                    </Text>
                                                </View>
                                                <View style={[s.cell, { flex: 1, justifyContent: 'flex-end' }]}>
                                                    <View style={[s.pill, { backgroundColor: isNo ? '#FEE2E2' : '#D1FAE5' }]}>
                                                        <Text style={[s.pillText, { color: isNo ? C.red : C.green }]}>
                                                            {item.housekeeper_status || '—'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })
                                }
                            </View>
                            {images.length > 0 && <ImageGallery images={images} imageBaseUrl={imageBaseUrl} />}
                        </>
                    )}
                </ScrollView>
            </Animated.View>
        </Modal>
    );
};

const s = StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
    sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.92, overflow: 'hidden' },
    gradHeader: { paddingTop: 10, paddingBottom: 18, paddingHorizontal: 20 },
    handle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
    headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginBottom: 3 },
    headerTitle: { fontSize: 19, fontWeight: '800', color: '#fff' },
    closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    badgeRow: { flexDirection: 'row', gap: 8 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    badgeText: { fontSize: 12, fontWeight: '700' },
    infoCard: { backgroundColor: C.white, marginHorizontal: 16, marginTop: 16, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    tableCard: { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    tableHead: { flexDirection: 'row', backgroundColor: C.purpleLight, paddingHorizontal: 16, paddingVertical: 11 },
    tableHeadCell: { fontSize: 13, fontWeight: '700', color: C.purple },
    tableRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
    rowOdd: { backgroundColor: '#FAFAFA' },
    rowFail: { backgroundColor: '#FFF5F5' },
    cell: { flexDirection: 'row', alignItems: 'center' },
    cellText: { fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 },
    cellFail: { color: '#DC2626', fontWeight: '600' },
    redDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.red, marginRight: 4, flexShrink: 0 },
    pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    pillText: { fontSize: 12, fontWeight: '700' },
    tableCenter: { flexDirection: 'column', alignItems: 'center', gap: 8, padding: 28 },
    helperText: { fontSize: 14, color: C.textMuted },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadText: { fontSize: 14, color: C.textMuted },
    empty: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: C.textPrimary, marginTop: 16, marginBottom: 6 },
    emptyText: { fontSize: 14, color: C.textMuted, textAlign: 'center' },
});

export default ChecklistDetailModal;
