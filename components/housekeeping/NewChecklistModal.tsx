import {
    Room, TemplateHousekeepingItem, getChecklistTemplate, saveChecklist
} from '@/services/housekeepingService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Alert,
    Animated,
    Dimensions, Image,
    Modal,
    ScrollView,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from 'react-native';
import LocalImageStrip, { LocalImage } from './LocalImageStrip';

const { height } = Dimensions.get('window');

interface NewChecklistModalProps {
    visible: boolean;
    room: Room | null;
    onClose: () => void;
    onSuccess: () => void;
    onGoFinalize: (room: Room) => void;
}

const C = {
    purple: '#6B5B95',
    purpleLight: '#EDE9FE',
    purpleDark: '#4C3D7A',
    gold: '#C8A84B',
    goldLight: '#FEF3C7',
    goldDark: '#A07830',
    red: '#EF4444',
    bg: '#F3F4F6',
    white: '#FFFFFF',
    textSecond: '#6B7280',
    textPrimary: '#111827',
};

const NewChecklistModal: React.FC<NewChecklistModalProps> = ({
    visible, room, onClose, onSuccess, onGoFinalize,
}) => {
    const slideAnim = useRef(new Animated.Value(height)).current;
    const [tmplLoading, setTmplLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [items, setItems] = useState<TemplateHousekeepingItem[]>([]);
    const [answers, setAnswers] = useState<Record<number, 'Yes' | 'No' | null>>({});
    const [noTemplate, setNoTemplate] = useState(false);
    const [localImages, setLocalImages] = useState<LocalImage[]>([]);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        if (visible) Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
        else Animated.timing(slideAnim, { toValue: height, duration: 280, useNativeDriver: true }).start();
    }, [visible]);

    useEffect(() => { if (visible && room) loadTemplate(); }, [visible, room]);

    const loadTemplate = async () => {
        if (!room) return;
        setTmplLoading(true); setNoTemplate(false); setItems([]); setAnswers({});
        setLocalImages([]); setShowPopup(false);
        try {
            const tmpl = await getChecklistTemplate(room.id);
            if (!tmpl || !tmpl.housekeeping_items.length) { setNoTemplate(true); return; }
            setItems(tmpl.housekeeping_items);
            const init: Record<number, 'Yes' | 'No' | null> = {};
            tmpl.housekeeping_items.forEach(i => { init[i.id] = null; });
            setAnswers(init);
        } catch { setNoTemplate(true); }
        finally { setTmplLoading(false); }
    };

    const toggle = (id: number, val: 'Yes' | 'No') =>
        setAnswers(prev => ({ ...prev, [id]: prev[id] === val ? null : val }));

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

    const handleViewChecklist = () => {
        const unanswered = items.filter(i => answers[i.id] === null).length;
        if (unanswered > 0) {
            Alert.alert('Incomplete', `Please answer all ${unanswered} remaining item(s).`);
            return;
        }
        setShowPopup(true);
    };

    const handleSave = async () => {
        if (!room) return;
        setShowPopup(false);
        setSaving(true);
        try {
            await saveChecklist({
                location_id: room.id, type: 'room',
                check_list_items: items.map(i => ({
                    housekeeping_id: i.id,
                    status: answers[i.id] as 'Yes' | 'No',
                })),
                images: localImages.length > 0 ? localImages : undefined,
            });
            onSuccess();
            onClose();
            setTimeout(() => onGoFinalize(room), 400);
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to save checklist');
        } finally { setSaving(false); }
    };

    if (!room) return null;
    const answeredCount = items.filter(i => answers[i.id] !== null).length;
    const progress = items.length > 0 ? answeredCount / items.length : 0;
    const yesCount = items.filter(i => answers[i.id] === 'Yes').length;
    const noCount = items.filter(i => answers[i.id] === 'No').length;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
            <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
                <LinearGradient colors={[C.purple, C.purpleDark]} style={s.gradHeader}>
                    <View style={s.handle} />
                    <View style={s.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.headerSub}>{room.room_category?.custome_name || room.room_category?.category}</Text>
                            <Text style={s.headerTitle}>Room {room.room_number} — New Checklist</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <Ionicons name="close" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    {items.length > 0 && (
                        <View style={s.progressWrap}>
                            <View style={s.progressTrack}>
                                <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
                            </View>
                            <Text style={s.progressLabel}>{answeredCount}/{items.length} answered</Text>
                        </View>
                    )}
                </LinearGradient>

                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 130 }}>
                    {tmplLoading ? (
                        <View style={[s.centered, { paddingVertical: 60 }]}>
                            <ActivityIndicator size="large" color={C.purple} />
                            <Text style={s.loadText}>Loading checklist items...</Text>
                        </View>
                    ) : noTemplate ? (
                        <View style={[s.empty, { paddingVertical: 60 }]}>
                            <Ionicons name="alert-circle-outline" size={52} color="#D1D5DB" />
                            <Text style={s.emptyTitle}>No Template Found</Text>
                            <Text style={s.emptyText}>No checklist layout assigned to this room</Text>
                        </View>
                    ) : (
                        <>
                            <View style={s.statsRow}>
                                <View style={[s.statBox, { backgroundColor: C.purpleLight }]}>
                                    <Text style={[s.statNum, { color: C.purple }]}>{yesCount}</Text>
                                    <Text style={[s.statLabel, { color: C.purpleDark }]}>Yes</Text>
                                </View>
                                <View style={[s.statBox, { backgroundColor: C.goldLight }]}>
                                    <Text style={[s.statNum, { color: C.goldDark }]}>{noCount}</Text>
                                    <Text style={[s.statLabel, { color: C.goldDark }]}>No</Text>
                                </View>
                                <View style={[s.statBox, { backgroundColor: '#F3F4F6' }]}>
                                    <Text style={[s.statNum, { color: C.textSecond }]}>{items.length - answeredCount}</Text>
                                    <Text style={[s.statLabel, { color: C.textSecond }]}>Pending</Text>
                                </View>
                            </View>

                            <View style={s.tableCard}>
                                <View style={[s.tableHead, { backgroundColor: C.purpleLight }]}>
                                    <Text style={[s.tableHeadCell, { flex: 3 }]}>Item Name</Text>
                                    <Text style={[s.tableHeadCell, { flex: 2, textAlign: 'center' }]}>Yes / No</Text>
                                </View>
                                {items.map((item, idx) => {
                                    const ans = answers[item.id];
                                    const isNo = ans === 'No'; const isYes = ans === 'Yes';
                                    return (
                                        <View key={item.id}
                                            style={[s.tableRow, idx % 2 !== 0 && s.rowOdd,
                                            isNo && s.rowFail, isYes && s.rowPass]}>
                                            <View style={[s.cell, { flex: 3, gap: 5 }]}>
                                                {ans === null && <View style={s.greyDot} />}
                                                {isNo && <View style={s.redDot} />}
                                                {isYes && <Ionicons name="checkmark-circle" size={13} color={C.purple} style={{ marginRight: 2 }} />}
                                                <Text style={[s.cellText, isNo && s.cellFail, isYes && { color: C.purpleDark }]} numberOfLines={3}>
                                                    {item.item_name}
                                                </Text>
                                            </View>
                                            <View style={[s.cell, { flex: 2, justifyContent: 'center', gap: 7 }]}>
                                                <TouchableOpacity style={[s.ansBtn, { borderColor: C.purple }, isYes && { backgroundColor: C.purple }]}
                                                    onPress={() => toggle(item.id, 'Yes')}>
                                                    <Text style={[s.ansBtnText, { color: isYes ? '#fff' : C.purple }]}>Yes</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[s.ansBtn, { borderColor: C.gold }, isNo && { backgroundColor: C.gold }]}
                                                    onPress={() => toggle(item.id, 'No')}>
                                                    <Text style={[s.ansBtnText, { color: isNo ? '#fff' : C.gold }]}>No</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={[s.imageCard, { marginTop: 14 }]}>
                                <LocalImageStrip images={localImages} onAdd={pickImage}
                                    onRemove={i => setLocalImages(prev => prev.filter((_, idx) => idx !== i))} />
                            </View>
                        </>
                    )}
                </ScrollView>

                {!tmplLoading && !noTemplate && items.length > 0 && (
                    <View style={s.btnWrap}>
                        <LinearGradient colors={[C.purple, C.purpleDark]} style={s.gradBtn}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <TouchableOpacity style={s.gradBtnInner} onPress={handleViewChecklist} disabled={saving}>
                                {saving ? <ActivityIndicator size="small" color="#fff" /> : (
                                    <>
                                        <Ionicons name="list-outline" size={19} color="#fff" />
                                        <Text style={s.gradBtnText}>View Check List</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                )}
            </Animated.View>

            <Modal visible={showPopup} transparent animationType="fade" onRequestClose={() => setShowPopup(false)}>
                <View style={s.popupOverlay}>
                    <View style={s.popupSheet}>
                        <LinearGradient colors={[C.gold, C.goldDark]} style={s.popupHeader}>
                            <Text style={s.popupTitle}>Checklist Summary</Text>
                            <Text style={s.popupSub}>Room {room.room_number} — confirm before saving</Text>
                        </LinearGradient>

                        <ScrollView style={s.popupScroll} showsVerticalScrollIndicator={false}>
                            <View style={[s.tableHead, { marginHorizontal: 0 }]}>
                                <Text style={[s.tableHeadCell, { flex: 3 }]}>Item</Text>
                                <Text style={[s.tableHeadCell, { flex: 1, textAlign: 'center' }]}>Status</Text>
                            </View>
                            {items.map((item, idx) => {
                                const ans = answers[item.id]; const isNo = ans === 'No';
                                return (
                                    <View key={item.id}
                                        style={[s.tableRow, idx % 2 !== 0 && s.rowOdd,
                                        isNo && s.rowFail, { paddingHorizontal: 12 }]}>
                                        <View style={[s.cell, { flex: 3, gap: 4 }]}>
                                            {isNo && <View style={s.redDot} />}
                                            <Text style={[s.cellText, isNo && s.cellFail]} numberOfLines={2}>
                                                {item.item_name}
                                            </Text>
                                        </View>
                                        <View style={[s.cell, { flex: 1, justifyContent: 'center' }]}>
                                            <View style={[s.pill, { backgroundColor: isNo ? '#FEE2E2' : C.purpleLight }]}>
                                                <Text style={[s.pillText, { color: isNo ? C.red : C.purple }]}>
                                                    {ans || '—'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                            {localImages.length > 0 && (
                                <View style={{ padding: 12 }}>
                                    <Text style={[s.imgTitle, { marginBottom: 6, fontSize: 12 }]}>
                                        📷 {localImages.length} photo{localImages.length > 1 ? 's' : ''} attached
                                    </Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {localImages.map((img, i) => (
                                            <Image key={i} source={{ uri: img.uri }}
                                                style={[s.thumb, { marginRight: 6, borderRadius: 8 }]} resizeMode="cover" />
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </ScrollView>

                        <View style={s.popupBtns}>
                            <TouchableOpacity style={[s.popupBtn, { backgroundColor: '#E5E7EB' }]}
                                onPress={() => setShowPopup(false)}>
                                <Ionicons name="close-outline" size={16} color={C.textSecond} />
                                <Text style={[s.popupBtnText, { color: C.textSecond }]}>Cancel</Text>
                            </TouchableOpacity>
                            <LinearGradient colors={[C.gold, C.goldDark]} style={s.popupBtnGrad}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                <TouchableOpacity style={s.popupBtnInner} onPress={handleSave}>
                                    <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
                                    <Text style={[s.popupBtnText, { color: '#fff' }]}>Save Check List</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </View>
                </View>
            </Modal>
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
    statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 16, marginBottom: 2 },
    statBox: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
    statNum: { fontSize: 22, fontWeight: '800' },
    statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    tableCard: { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    tableHead: { flexDirection: 'row', backgroundColor: C.purpleLight, paddingHorizontal: 16, paddingVertical: 11 },
    tableHeadCell: { fontSize: 13, fontWeight: '700', color: C.purple },
    tableRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
    rowOdd: { backgroundColor: '#FAFAFA' },
    rowFail: { backgroundColor: '#FFF5F5' },
    rowPass: { backgroundColor: '#F5F3FF' },
    cell: { flexDirection: 'row', alignItems: 'center' },
    cellText: { fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 },
    cellFail: { color: '#DC2626', fontWeight: '600' },
    redDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.red, marginRight: 4, flexShrink: 0 },
    greyDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D1D5DB', marginRight: 4, flexShrink: 0 },
    ansBtn: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 5 },
    ansBtnText: { fontSize: 12, fontWeight: '700' },
    imageCard: { backgroundColor: C.white, marginHorizontal: 16, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    btnWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    gradBtn: { borderRadius: 14, overflow: 'hidden' },
    gradBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
    gradBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
    popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 },
    popupSheet: { backgroundColor: C.white, borderRadius: 20, width: '100%', maxHeight: height * 0.76, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 12 },
    popupHeader: { paddingVertical: 18, paddingHorizontal: 20, alignItems: 'center' },
    popupTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
    popupSub: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
    popupScroll: { maxHeight: height * 0.48 },
    popupBtns: { flexDirection: 'row', padding: 14, gap: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    popupBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: 11 },
    popupBtnGrad: { flex: 1, borderRadius: 11, overflow: 'hidden' },
    popupBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13 },
    popupBtnText: { fontSize: 13, fontWeight: '700' },
    pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    pillText: { fontSize: 12, fontWeight: '700' },
    imgTitle: { fontSize: 14, fontWeight: '700', color: C.textPrimary },
    thumb: { width: 130, height: 98, backgroundColor: '#F3F4F6' },
});

export default NewChecklistModal;
