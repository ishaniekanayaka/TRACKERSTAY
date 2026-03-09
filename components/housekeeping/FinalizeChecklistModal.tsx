import {
    FinalizeTemplate, getFinalizeTemplate,
    Room,
    saveFinalize
} from '@/services/housekeepingService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Alert,
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import ImageGallery from './ImageGallery';
import InfoRow from './InfoRow';
import LocalImageStrip, { LocalImage } from './LocalImageStrip';

const { height } = Dimensions.get('window');

interface FinalizeModalProps {
    visible: boolean;
    room: Room | null;
    onClose: () => void;
    onSuccess: () => void;
    imageBaseUrl: string;
}

const C = {
    purple: '#6B5B95',
    purpleLight: '#EDE9FE',
    gold: '#C8A84B',
    goldLight: '#FEF3C7',
    goldDark: '#A07830',
    amber: '#D97706',
    red: '#EF4444',
    green: '#10B981',
    bg: '#F3F4F6',
    white: '#FFFFFF',
    textSecond: '#6B7280',
    textPrimary: '#111827',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
};

const FinalizeChecklistModal: React.FC<FinalizeModalProps> = ({
    visible, room, onClose, onSuccess, imageBaseUrl,
}) => {
    const slideAnim = useRef(new Animated.Value(height)).current;
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [template, setTemplate] = useState<FinalizeTemplate | null>(null);
    const [noPending, setNoPending] = useState(false);
    const [roomStatus, setRoomStatus] = useState<'Ready' | 'Not Ready' | null>(null);
    const [svAnswers, setSvAnswers] = useState<Record<number, 'Yes' | 'No' | null>>({});
    const [reasons, setReasons] = useState<Record<number, string>>({});
    const [refillingQty, setRefillingQty] = useState<Record<number, string>>({});
    const [localImages, setLocalImages] = useState<LocalImage[]>([]);

    useEffect(() => {
        if (visible) Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
        else Animated.timing(slideAnim, { toValue: height, duration: 280, useNativeDriver: true }).start();
    }, [visible]);

    useEffect(() => { if (visible && room) loadTemplate(); }, [visible, room]);

    const loadTemplate = async () => {
        if (!room) return;
        setLoading(true); setNoPending(false); setTemplate(null); setRoomStatus(null);
        setSvAnswers({}); setReasons({}); setRefillingQty({}); setLocalImages([]);
        try {
            const tmpl = await getFinalizeTemplate(room.id);
            if (!tmpl) { setNoPending(true); return; }
            setTemplate(tmpl);
            const init: Record<number, 'Yes' | 'No' | null> = {};
            tmpl.checklist.check_list_detail.forEach(d => {
                init[d.id] = d.housekeeper_status === 'Yes' ? 'Yes' : null;
            });
            setSvAnswers(init);
        } catch { setNoPending(true); }
        finally { setLoading(false); }
    };

    const toggleSv = (detailId: number, val: 'Yes' | 'No') => {
        setSvAnswers(prev => ({ ...prev, [detailId]: prev[detailId] === val ? null : val }));
        if (val === 'Yes') setReasons(prev => { const n = { ...prev }; delete n[detailId]; return n; });
    };

    const pickImage = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true, quality: 0.8,
        });
        if (!res.canceled)
            setLocalImages(prev => [...prev, ...res.assets.map(a => ({
                uri: a.uri,
                name: a.fileName || `img_${Date.now()}.jpg`,
                type: a.mimeType || 'image/jpeg',
            }))]);
    };

    const handleSave = async () => {
        if (!room || !template) return;
        const details = template.checklist.check_list_detail;
        const unanswered = details.filter(d => svAnswers[d.id] === null);
        if (unanswered.length > 0) {
            Alert.alert('Incomplete', `Please review all ${unanswered.length} remaining item(s).`);
            return;
        }
        if (!roomStatus) {
            Alert.alert('Room Status', 'Please select Room Status (Ready / Not Ready).');
            return;
        }
        setSaving(true);
        try {
            const refillingUsages = template.refilling_items
                .filter(r => refillingQty[r.id] && Number(refillingQty[r.id]) > 0)
                .map(r => ({ refilling_item_id: r.id, quantity: Number(refillingQty[r.id]) }));

            await saveFinalize(
                template.checklist.id,
                {
                    type: 'room', room_status: roomStatus,
                    items: details.map(d => ({
                        detail_id: d.id,
                        supervisor_status: svAnswers[d.id] as 'Yes' | 'No',
                        ...(reasons[d.id] ? { reason: reasons[d.id] } : {}),
                    })),
                    ...(refillingUsages.length > 0 ? { refilling_usages: refillingUsages } : {}),
                },
                localImages.length > 0 ? localImages : undefined,
            );
            Alert.alert('Success', 'Checklist finalized successfully!');
            onSuccess(); onClose();
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to finalize checklist');
        } finally { setSaving(false); }
    };

    if (!room) return null;
    const details = template?.checklist.check_list_detail ?? [];
    const svImages = template?.checklist.check_list_image ?? [];
    const refillingItems = template?.refilling_items ?? [];
    const answeredCount = details.filter(d => svAnswers[d.id] !== null).length;
    const progress = details.length > 0 ? answeredCount / details.length : 0;
    const hkName = template?.checklist.housekeeper
        ? `${template.checklist.housekeeper.name} ${template.checklist.housekeeper.lname ?? ''}`.trim() : '—';

    const pendingReviewCount = details.filter(d =>
        d.housekeeper_status === 'No' && svAnswers[d.id] === null
    ).length;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
            <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>

                <LinearGradient colors={[C.gold, C.amber]} style={s.gradHeader}>
                    <View style={s.handle} />
                    <View style={s.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.headerSub}>{room.room_category?.custome_name || room.room_category?.category}</Text>
                            <Text style={s.headerTitle}>Room {room.room_number} — Finalize</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <Ionicons name="close" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    {details.length > 0 && (
                        <View style={s.progressWrap}>
                            <View style={s.progressTrack}>
                                <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
                            </View>
                            <Text style={s.progressLabel}>{answeredCount}/{details.length} reviewed</Text>
                        </View>
                    )}
                </LinearGradient>

                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 130 }}>
                    {loading ? (
                        <View style={[s.centered, { paddingVertical: 60 }]}>
                            <ActivityIndicator size="large" color={C.gold} />
                            <Text style={s.loadText}>Loading pending checklist...</Text>
                        </View>
                    ) : noPending ? (
                        <View style={[s.empty, { paddingVertical: 60 }]}>
                            <Ionicons name="checkmark-done-circle-outline" size={52} color="#D1D5DB" />
                            <Text style={s.emptyTitle}>No Pending Checklist</Text>
                            <Text style={s.emptyText}>There is no pending checklist to finalize for this room</Text>
                        </View>
                    ) : (
                        <>
                            <View style={s.infoCard}>
                                <InfoRow icon="person-outline" label="Housekeeper" value={hkName} />
                                <InfoRow icon="document-outline" label="CL Status" value={template?.checklist.status || '—'} />
                                <InfoRow icon="checkmark-circle-outline" label="Pre-filled"
                                    value="HK Yes items auto-filled" isLast />
                            </View>

                            {pendingReviewCount > 0 && (
                                <View style={s.reviewAlert}>
                                    <Ionicons name="alert-circle-outline" size={16} color={C.amber} />
                                    <Text style={s.reviewAlertText}>
                                        {pendingReviewCount} item{pendingReviewCount > 1 ? 's' : ''} marked No by HK — please review
                                    </Text>
                                </View>
                            )}

                            <View style={s.statusCard}>
                                <Text style={s.statusCardTitle}>Room Status</Text>
                                <View style={s.statusBtnRow}>
                                    {(['Ready', 'Not Ready'] as const).map(s2 => (
                                        <TouchableOpacity key={s2}
                                            style={[s.statusBtn,
                                            roomStatus === s2 && {
                                                backgroundColor: s2 === 'Ready' ? C.purple : C.red,
                                                borderColor: s2 === 'Ready' ? C.purple : C.red,
                                            }]}
                                            onPress={() => setRoomStatus(s2)}>
                                            <Ionicons
                                                name={s2 === 'Ready' ? 'checkmark-circle-outline' : 'close-circle-outline'}
                                                size={15}
                                                color={roomStatus === s2 ? '#fff' : s2 === 'Ready' ? C.purple : C.red} />
                                            <Text style={[s.statusBtnText,
                                            { color: roomStatus === s2 ? '#fff' : s2 === 'Ready' ? C.purple : C.red }]}>
                                                {s2}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={s.tableCard}>
                                <View style={[s.tableHead, { backgroundColor: C.goldLight }]}>
                                    <Text style={[s.tableHeadCell, { flex: 3, color: '#92400E' }]}>Item Name</Text>
                                    <Text style={[s.tableHeadCell, { flex: 1, color: '#92400E', fontSize: 11 }]}>HK</Text>
                                    <Text style={[s.tableHeadCell, { flex: 2, textAlign: 'center', color: '#92400E' }]}>Supervisor</Text>
                                </View>
                                {details.map((item, idx) => {
                                    const sv = svAnswers[item.id];
                                    const hkNo = item.housekeeper_status === 'No';
                                    const svNo = sv === 'No'; const svYes = sv === 'Yes';
                                    return (
                                        <View key={item.id}>
                                            <View style={[s.tableRow, idx % 2 !== 0 && s.rowOdd,
                                            svNo && s.rowFail, svYes && s.rowPass,
                                            (hkNo && sv === null) && s.rowNeedsReview]}>
                                                <View style={[s.cell, { flex: 3, gap: 4 }]}>
                                                    {hkNo && <View style={[s.redDot, { backgroundColor: C.gold }]} />}
                                                    <Text style={[s.cellText, svNo && s.cellFail]} numberOfLines={2}>
                                                        {item.housekeeping?.item_name ?? '—'}
                                                    </Text>
                                                </View>
                                                <View style={[s.cell, { flex: 1 }]}>
                                                    <View style={[s.pill, {
                                                        backgroundColor: hkNo ? '#FEE2E2' : '#D1FAE5', paddingHorizontal: 5,
                                                    }]}>
                                                        <Text style={[s.pillText, {
                                                            fontSize: 10, color: hkNo ? C.red : C.green,
                                                        }]}>{item.housekeeper_status || '—'}</Text>
                                                    </View>
                                                </View>
                                                <View style={[s.cell, { flex: 2, justifyContent: 'center', gap: 6 }]}>
                                                    <TouchableOpacity
                                                        style={[s.ansBtn, { borderColor: C.purple, paddingHorizontal: 9 },
                                                        svYes && { backgroundColor: C.purple }]}
                                                        onPress={() => toggleSv(item.id, 'Yes')}>
                                                        <Text style={[s.ansBtnText, { color: svYes ? '#fff' : C.purple }]}>Yes</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[s.ansBtn, { borderColor: C.gold, paddingHorizontal: 9 },
                                                        svNo && { backgroundColor: C.gold }]}
                                                        onPress={() => toggleSv(item.id, 'No')}>
                                                        <Text style={[s.ansBtnText, { color: svNo ? '#fff' : C.gold }]}>No</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            {svNo && (
                                                <View style={s.reasonRow}>
                                                    <Ionicons name="create-outline" size={13} color={C.textMuted} />
                                                    <TextInput
                                                        style={s.reasonInput}
                                                        placeholder="Reason (optional)"
                                                        placeholderTextColor="#D1D5DB"
                                                        value={reasons[item.id] || ''}
                                                        onChangeText={t => setReasons(prev => ({ ...prev, [item.id]: t }))} />
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>

                            {refillingItems.length > 0 && (
                                <View style={s.refillCard}>
                                    <View style={s.refillHeader}>
                                        <Ionicons name="cube-outline" size={16} color={C.purple} />
                                        <Text style={s.refillTitle}>Refill Items</Text>
                                    </View>
                                    <View style={s.refillColHeader}>
                                        <Text style={[s.refillColText, { flex: 2 }]}>Item Name</Text>
                                        <Text style={[s.refillColText, { flex: 1, textAlign: 'center' }]}>Unit</Text>
                                        <Text style={[s.refillColText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
                                    </View>
                                    {refillingItems.map((r, idx) => (
                                        <View key={r.id} style={[s.refillRow, idx % 2 !== 0 && { backgroundColor: '#FAFAFA' }]}>
                                            <Text style={[s.refillItemName, { flex: 2 }]} numberOfLines={2}>{r.item?.item ?? '—'}</Text>
                                            <Text style={[s.refillUnit, { flex: 1, textAlign: 'center' }]}>{r.item?.unit ?? '—'}</Text>
                                            <View style={{ flex: 1, alignItems: 'center' }}>
                                                <TextInput
                                                    style={s.refillInput}
                                                    placeholder="0"
                                                    placeholderTextColor="#D1D5DB"
                                                    keyboardType="numeric"
                                                    value={refillingQty[r.id] || ''}
                                                    onChangeText={t => setRefillingQty(prev => ({
                                                        ...prev, [r.id]: t.replace(/[^0-9]/g, ''),
                                                    }))} />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {svImages.length > 0 && <ImageGallery images={svImages} imageBaseUrl={imageBaseUrl} />}

                            <View style={[s.imageCard, { marginTop: 14 }]}>
                                <LocalImageStrip images={localImages} onAdd={pickImage}
                                    onRemove={i => setLocalImages(prev => prev.filter((_, idx) => idx !== i))} />
                            </View>
                        </>
                    )}
                </ScrollView>

                {!loading && !noPending && details.length > 0 && (
                    <View style={s.btnWrap}>
                        <LinearGradient colors={[C.gold, C.goldDark]} style={s.gradBtn}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <TouchableOpacity style={s.gradBtnInner} onPress={handleSave} disabled={saving}>
                                {saving ? <ActivityIndicator size="small" color="#fff" /> : (
                                    <>
                                        <Ionicons name="shield-checkmark-outline" size={19} color="#fff" />
                                        <Text style={s.gradBtnText}>Save Finalize</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                )}
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
    progressWrap: { marginTop: 10 },
    progressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: 4, backgroundColor: '#fff', borderRadius: 2 },
    progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 5, textAlign: 'right' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadText: { fontSize: 14, color: C.textSecond },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary, marginTop: 12 },
    emptyText: { fontSize: 14, color: C.textSecond, marginTop: 6 },
    infoCard: { backgroundColor: C.white, marginHorizontal: 16, marginTop: 16, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    statusCard: { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    statusCardTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
    statusBtnRow: { flexDirection: 'row', gap: 12 },
    statusBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: C.border },
    statusBtnText: { fontSize: 14, fontWeight: '700' },
    tableCard: { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    tableHead: { flexDirection: 'row', backgroundColor: C.goldLight, paddingHorizontal: 16, paddingVertical: 11 },
    tableHeadCell: { fontSize: 13, fontWeight: '700', color: '#92400E' },
    tableRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
    rowOdd: { backgroundColor: '#FAFAFA' },
    rowFail: { backgroundColor: '#FFF5F5' },
    rowPass: { backgroundColor: '#F5F3FF' },
    rowNeedsReview: { backgroundColor: '#FFFBEB' },
    cell: { flexDirection: 'row', alignItems: 'center' },
    cellText: { fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 },
    cellFail: { color: '#DC2626', fontWeight: '600' },
    redDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.red, marginRight: 4, flexShrink: 0 },
    reasonRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', paddingHorizontal: 20, paddingVertical: 7, gap: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    reasonInput: { flex: 1, fontSize: 13, color: '#374151' },
    ansBtn: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 5 },
    ansBtnText: { fontSize: 12, fontWeight: '700' },
    pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    pillText: { fontSize: 12, fontWeight: '700' },
    refillCard: { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    refillHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 13, backgroundColor: C.purpleLight, borderBottomWidth: 1, borderBottomColor: '#E0D9F0' },
    refillTitle: { fontSize: 14, fontWeight: '700', color: C.purple },
    refillColHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F9F8FF', borderBottomWidth: 1, borderBottomColor: '#EDE9FE' },
    refillColText: { fontSize: 12, fontWeight: '700', color: C.purple },
    refillRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    refillItemName: { fontSize: 13, color: '#374151', fontWeight: '500' },
    refillUnit: { fontSize: 12, color: C.textSecond },
    refillInput: { width: 68, borderWidth: 1.5, borderColor: C.purpleLight, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, fontSize: 14, color: C.textPrimary, textAlign: 'center', backgroundColor: '#F9F8FF' },
    imageCard: { backgroundColor: C.white, marginHorizontal: 16, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    btnWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    gradBtn: { borderRadius: 14, overflow: 'hidden' },
    gradBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
    gradBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
    reviewAlert: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 12, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FCD34D', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    reviewAlertText: { flex: 1, fontSize: 13, color: '#92400E', fontWeight: '500' },
});

export default FinalizeChecklistModal;
