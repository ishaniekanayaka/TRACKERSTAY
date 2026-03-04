// // app/dashboard/housekeeping/index.tsx
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   StyleSheet, Text, View, TouchableOpacity, FlatList,
//   ActivityIndicator, Alert, RefreshControl, Modal, Animated,
//   ScrollView, TextInput, Dimensions, Image,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker';
// import DashboardHeader from '@/components/HeaderWithMenu';
// import {
//   getRooms, getChecklistByRoom, getChecklistTemplate, saveChecklist,
//   getFinalizeTemplate, saveFinalize, getRoomStatusColor, getTimeAgo,
//   Room, RoomChecklist, ChecklistImage,
//   TemplateHousekeepingItem, FinalizeTemplate,
// } from '@/services/housekeepingService';

// const { width, height } = Dimensions.get('window');
// type TabType    = 'rooms' | 'other';
// type FilterType = 'all' | 'ready' | 'dirty' | 'repair' | 'pending';

// const C = {
//   purple:      '#6B5B95',
//   purpleLight: '#EDE9FE',
//   purpleDark:  '#4C3D7A',
//   gold:        '#C8A84B',
//   goldLight:   '#FEF3C7',
//   goldDark:    '#A07830',
//   amber:       '#D97706',
//   red:         '#EF4444',
//   green:       '#10B981',
//   bg:          '#F3F4F6',
//   white:       '#FFFFFF',
//   border:      '#E5E7EB',
//   textPrimary: '#111827',
//   textSecond:  '#6B7280',
//   textMuted:   '#9CA3AF',
// };

// // ─── Info row ──────────────────────────────────────────────────────────────────
// const InfoRow = ({ label, value, icon, valueColor, isLast }: {
//   label: string; value: string;
//   icon: React.ComponentProps<typeof Ionicons>['name'];
//   valueColor?: string; isLast?: boolean;
// }) => (
//   <View style={[s.infoRow, !isLast && s.infoRowBorder]}>
//     <View style={s.infoLeft}>
//       <Ionicons name={icon} size={15} color={C.purple} />
//       <Text style={s.infoLabel}>{label} :</Text>
//     </View>
//     <Text style={[s.infoValue, valueColor ? { color: valueColor, fontWeight: '700' } : {}]}>{value}</Text>
//   </View>
// );

// // ─── Server image gallery ──────────────────────────────────────────────────────
// const ImageGallery = ({ images }: { images: ChecklistImage[] }) => {
//   const [fsIdx, setFsIdx] = useState<number | null>(null);
//   if (!images?.length) return null;
//   return (
//     <View style={s.imageCard}>
//       <View style={s.imgHeader}>
//         <Ionicons name="images-outline" size={16} color={C.purple} />
//         <Text style={s.imgTitle}>Checklist Images ({images.length})</Text>
//       </View>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//         {images.map((img, idx) => (
//           <TouchableOpacity key={img.id} onPress={() => setFsIdx(idx)}
//             style={[s.thumbWrap, { marginLeft: idx === 0 ? 0 : 8 }]} activeOpacity={0.85}>
//             <Image source={{ uri: img.image_url }} style={s.thumb} resizeMode="cover" />
//             <View style={s.expandIcon}><Ionicons name="expand-outline" size={12} color="#fff" /></View>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
//       <Modal visible={fsIdx !== null} transparent animationType="fade" onRequestClose={() => setFsIdx(null)}>
//         <View style={s.fsOverlay}>
//           <TouchableOpacity style={s.fsClose} onPress={() => setFsIdx(null)}>
//             <Ionicons name="close-circle" size={40} color="#fff" />
//           </TouchableOpacity>
//           {fsIdx !== null && (
//             <>
//               <Image source={{ uri: images[fsIdx].image_url }}
//                 style={{ width, height: width * 1.3 }} resizeMode="contain" />
//               <Text style={s.fsCounter}>{fsIdx + 1} / {images.length}</Text>
//               {images.length > 1 && (
//                 <View style={s.fsNav}>
//                   <TouchableOpacity
//                     onPress={() => setFsIdx(i => (i! > 0 ? i! - 1 : images.length - 1))}
//                     style={s.fsNavBtn}>
//                     <Ionicons name="chevron-back" size={28} color="#fff" />
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     onPress={() => setFsIdx(i => (i! < images.length - 1 ? i! + 1 : 0))}
//                     style={s.fsNavBtn}>
//                     <Ionicons name="chevron-forward" size={28} color="#fff" />
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </>
//           )}
//         </View>
//       </Modal>
//     </View>
//   );
// };

// // ─── Local image strip ─────────────────────────────────────────────────────────
// interface LocalImage { uri: string; name: string; type: string; }
// const LocalImageStrip = ({ images, onAdd, onRemove }: {
//   images: LocalImage[]; onAdd: () => void; onRemove: (i: number) => void;
// }) => (
//   <View>
//     <View style={s.imgHeader}>
//       <Ionicons name="camera-outline" size={16} color={C.purple} />
//       <Text style={s.imgTitle}>Add Photos</Text>
//     </View>
//     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//       <TouchableOpacity onPress={onAdd} style={s.addPhotoBtn} activeOpacity={0.75}>
//         <Ionicons name="add" size={26} color={C.purple} />
//         <Text style={s.addPhotoText}>Add</Text>
//       </TouchableOpacity>
//       {images.map((img, idx) => (
//         <View key={idx} style={[s.thumbWrap, { marginLeft: 8 }]}>
//           <Image source={{ uri: img.uri }} style={s.thumb} resizeMode="cover" />
//           <TouchableOpacity style={s.removeBtn} onPress={() => onRemove(idx)}
//             hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
//             <Ionicons name="close-circle" size={20} color={C.red} />
//           </TouchableOpacity>
//         </View>
//       ))}
//     </ScrollView>
//   </View>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // VIEW CHECKLIST MODAL
// // ─────────────────────────────────────────────────────────────────────────────
// const ChecklistDetailModal: React.FC<{
//   visible: boolean; room: Room | null; checklist: RoomChecklist | null;
//   checklistLoading: boolean; onClose: () => void;
// }> = ({ visible, room, checklist, checklistLoading, onClose }) => {
//   const slideAnim = useRef(new Animated.Value(height)).current;
//   useEffect(() => {
//     if (visible) Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
//     else Animated.timing(slideAnim, { toValue: height, duration: 280, useNativeDriver: true }).start();
//   }, [visible]);
//   if (!room) return null;

//   const statusInfo = getRoomStatusColor(room);
//   const items  = checklist?.check_list_detail ?? [];
//   const images = checklist?.check_list_image   ?? [];
//   const issueCount = items.filter(i => i.housekeeper_status === 'No').length;
//   const hkName = checklist?.housekeeper
//     ? `${checklist.housekeeper.name} ${checklist.housekeeper.lname}`.trim() : '—';
//   const svName = checklist?.supervisor
//     ? `${checklist.supervisor.name} ${checklist.supervisor.lname}`.trim() : '—';

//   return (
//     <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
//       <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
//       <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
//         <LinearGradient colors={[C.purple, '#8B7BAF']} style={s.gradHeader}>
//           <View style={s.handle} />
//           <View style={s.headerRow}>
//             <View style={{ flex: 1 }}>
//               <Text style={s.headerSub}>{room.room_category?.custome_name || room.room_category?.category}</Text>
//               <Text style={s.headerTitle}>Room {room.room_number} — Checklist</Text>
//             </View>
//             <TouchableOpacity onPress={onClose} style={s.closeBtn}>
//               <Ionicons name="close" size={22} color="#fff" />
//             </TouchableOpacity>
//           </View>
//           <View style={s.badgeRow}>
//             <View style={[s.badge, { backgroundColor: statusInfo.bg }]}>
//               <Text style={[s.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
//             </View>
//             {issueCount > 0 && (
//               <View style={[s.badge, { backgroundColor: '#FEE2E2' }]}>
//                 <Ionicons name="warning-outline" size={12} color={C.red} />
//                 <Text style={[s.badgeText, { color: C.red }]}>
//                   {issueCount} Issue{issueCount !== 1 ? 's' : ''}
//                 </Text>
//               </View>
//             )}
//           </View>
//         </LinearGradient>

//         <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 40 }}>
//           {checklistLoading ? (
//             <View style={[s.centered, { paddingVertical: 60 }]}>
//               <ActivityIndicator size="large" color={C.purple} />
//               <Text style={s.loadText}>Loading checklist...</Text>
//             </View>
//           ) : !checklist ? (
//             <View style={[s.empty, { paddingVertical: 60 }]}>
//               <Ionicons name="document-outline" size={52} color="#D1D5DB" />
//               <Text style={s.emptyTitle}>No Checklist Found</Text>
//               <Text style={s.emptyText}>No finalized checklist for this room yet</Text>
//             </View>
//           ) : (
//             <>
//               <View style={s.infoCard}>
//                 <InfoRow icon="person-outline"           label="Checked"    value={hkName} />
//                 <InfoRow icon="shield-checkmark-outline" label="Supervised" value={svName} />
//                 <InfoRow icon="home-outline" label="Status" value={checklist.room_status || '—'}
//                   valueColor={checklist.room_status === 'Ready' ? C.green : C.red} />
//                 <InfoRow icon="alert-circle-outline" label="Issues" value={String(issueCount)}
//                   valueColor={issueCount > 0 ? C.red : C.green} isLast />
//               </View>
//               <View style={s.tableCard}>
//                 <View style={s.tableHead}>
//                   <Text style={[s.tableHeadCell, { flex: 3 }]}>Item Name</Text>
//                   <Text style={[s.tableHeadCell, { flex: 1, textAlign: 'right' }]}>HK Status</Text>
//                 </View>
//                 {items.length === 0
//                   ? <View style={s.tableCenter}>
//                       <Ionicons name="list-outline" size={36} color="#D1D5DB" />
//                       <Text style={s.helperText}>No items</Text>
//                     </View>
//                   : items.map((item, idx) => {
//                     const isNo = item.housekeeper_status === 'No';
//                     return (
//                       <View key={item.id}
//                         style={[s.tableRow, idx % 2 !== 0 && s.rowOdd, isNo && s.rowFail]}>
//                         <View style={[s.cell, { flex: 3, gap: 5 }]}>
//                           {isNo && <View style={s.redDot} />}
//                           <Text style={[s.cellText, isNo && s.cellFail]} numberOfLines={3}>
//                             {item.housekeeping?.item_name ?? '—'}
//                           </Text>
//                         </View>
//                         <View style={[s.cell, { flex: 1, justifyContent: 'flex-end' }]}>
//                           <View style={[s.pill, { backgroundColor: isNo ? '#FEE2E2' : '#D1FAE5' }]}>
//                             <Text style={[s.pillText, { color: isNo ? C.red : C.green }]}>
//                               {item.housekeeper_status || '—'}
//                             </Text>
//                           </View>
//                         </View>
//                       </View>
//                     );
//                   })
//                 }
//               </View>
//               {images.length > 0 && <ImageGallery images={images} />}
//             </>
//           )}
//         </ScrollView>
//       </Animated.View>
//     </Modal>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // NEW CHECKLIST MODAL
// // All items Yes/No → "View Check List" → confirm popup → Save → auto Finalize
// // ─────────────────────────────────────────────────────────────────────────────
// interface NewChecklistModalProps {
//   visible: boolean; room: Room | null;
//   onClose: () => void; onSuccess: () => void;
//   onGoFinalize: (room: Room) => void;
// }

// const NewChecklistModal: React.FC<NewChecklistModalProps> = ({
//   visible, room, onClose, onSuccess, onGoFinalize,
// }) => {
//   const slideAnim = useRef(new Animated.Value(height)).current;
//   const [tmplLoading, setTmplLoading] = useState(false);
//   const [saving,      setSaving]      = useState(false);
//   const [items,       setItems]       = useState<TemplateHousekeepingItem[]>([]);
//   const [answers,     setAnswers]     = useState<Record<number, 'Yes' | 'No' | null>>({});
//   const [noTemplate,  setNoTemplate]  = useState(false);
//   const [localImages, setLocalImages] = useState<LocalImage[]>([]);
//   const [showPopup,   setShowPopup]   = useState(false);

//   useEffect(() => {
//     if (visible) Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
//     else Animated.timing(slideAnim, { toValue: height, duration: 280, useNativeDriver: true }).start();
//   }, [visible]);

//   useEffect(() => { if (visible && room) loadTemplate(); }, [visible, room]);

//   const loadTemplate = async () => {
//     if (!room) return;
//     setTmplLoading(true); setNoTemplate(false); setItems([]); setAnswers({});
//     setLocalImages([]); setShowPopup(false);
//     try {
//       const tmpl = await getChecklistTemplate(room.id);
//       if (!tmpl || !tmpl.housekeeping_items.length) { setNoTemplate(true); return; }
//       setItems(tmpl.housekeeping_items);
//       const init: Record<number, 'Yes' | 'No' | null> = {};
//       tmpl.housekeeping_items.forEach(i => { init[i.id] = null; });
//       setAnswers(init);
//     } catch { setNoTemplate(true); }
//     finally { setTmplLoading(false); }
//   };

//   const toggle = (id: number, val: 'Yes' | 'No') =>
//     setAnswers(prev => ({ ...prev, [id]: prev[id] === val ? null : val }));

//   const pickImage = async () => {
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true, quality: 0.8,
//     });
//     if (!res.canceled)
//       setLocalImages(prev => [...prev, ...res.assets.map(a => ({
//         uri: a.uri,
//         name: a.fileName || `img_${Date.now()}.jpg`,
//         type: a.mimeType || 'image/jpeg',
//       }))]);
//   };

//   const handleViewChecklist = () => {
//     const unanswered = items.filter(i => answers[i.id] === null).length;
//     if (unanswered > 0) {
//       Alert.alert('Incomplete', `Please answer all ${unanswered} remaining item(s).`);
//       return;
//     }
//     setShowPopup(true);
//   };

//   // Save → close → auto open finalize
//   const handleSave = async () => {
//     if (!room) return;
//     setShowPopup(false);
//     setSaving(true);
//     try {
//       await saveChecklist({
//         location_id: room.id, type: 'room',
//         check_list_items: items.map(i => ({
//           housekeeping_id: i.id,
//           status: answers[i.id] as 'Yes' | 'No',
//         })),
//         images: localImages.length > 0 ? localImages : undefined,
//       });
//       onSuccess();
//       onClose();
//       setTimeout(() => onGoFinalize(room), 400);
//     } catch (e: any) {
//       Alert.alert('Error', e?.response?.data?.message || 'Failed to save checklist');
//     } finally { setSaving(false); }
//   };

//   if (!room) return null;
//   const answeredCount = items.filter(i => answers[i.id] !== null).length;
//   const progress      = items.length > 0 ? answeredCount / items.length : 0;
//   const yesCount      = items.filter(i => answers[i.id] === 'Yes').length;
//   const noCount       = items.filter(i => answers[i.id] === 'No').length;

//   return (
//     <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
//       <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
//       <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>

//         <LinearGradient colors={[C.purple, C.purpleDark]} style={s.gradHeader}>
//           <View style={s.handle} />
//           <View style={s.headerRow}>
//             <View style={{ flex: 1 }}>
//               <Text style={s.headerSub}>{room.room_category?.custome_name || room.room_category?.category}</Text>
//               <Text style={s.headerTitle}>Room {room.room_number} — New Checklist</Text>
//             </View>
//             <TouchableOpacity onPress={onClose} style={s.closeBtn}>
//               <Ionicons name="close" size={22} color="#fff" />
//             </TouchableOpacity>
//           </View>
//           {items.length > 0 && (
//             <View style={s.progressWrap}>
//               <View style={s.progressTrack}>
//                 <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
//               </View>
//               <Text style={s.progressLabel}>{answeredCount}/{items.length} answered</Text>
//             </View>
//           )}
//         </LinearGradient>

//         <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 130 }}>
//           {tmplLoading ? (
//             <View style={[s.centered, { paddingVertical: 60 }]}>
//               <ActivityIndicator size="large" color={C.purple} />
//               <Text style={s.loadText}>Loading checklist items...</Text>
//             </View>
//           ) : noTemplate ? (
//             <View style={[s.empty, { paddingVertical: 60 }]}>
//               <Ionicons name="alert-circle-outline" size={52} color="#D1D5DB" />
//               <Text style={s.emptyTitle}>No Template Found</Text>
//               <Text style={s.emptyText}>No checklist layout assigned to this room</Text>
//             </View>
//           ) : (
//             <>
//               <View style={s.statsRow}>
//                 <View style={[s.statBox, { backgroundColor: C.purpleLight }]}>
//                   <Text style={[s.statNum, { color: C.purple }]}>{yesCount}</Text>
//                   <Text style={[s.statLabel, { color: C.purpleDark }]}>Yes</Text>
//                 </View>
//                 <View style={[s.statBox, { backgroundColor: C.goldLight }]}>
//                   <Text style={[s.statNum, { color: C.goldDark }]}>{noCount}</Text>
//                   <Text style={[s.statLabel, { color: C.goldDark }]}>No</Text>
//                 </View>
//                 <View style={[s.statBox, { backgroundColor: '#F3F4F6' }]}>
//                   <Text style={[s.statNum, { color: C.textSecond }]}>{items.length - answeredCount}</Text>
//                   <Text style={[s.statLabel, { color: C.textSecond }]}>Pending</Text>
//                 </View>
//               </View>

//               <View style={s.tableCard}>
//                 <View style={[s.tableHead, { backgroundColor: C.purpleLight }]}>
//                   <Text style={[s.tableHeadCell, { flex: 3 }]}>Item Name</Text>
//                   <Text style={[s.tableHeadCell, { flex: 2, textAlign: 'center' }]}>Yes / No</Text>
//                 </View>
//                 {items.map((item, idx) => {
//                   const ans = answers[item.id];
//                   const isNo = ans === 'No'; const isYes = ans === 'Yes';
//                   return (
//                     <View key={item.id}
//                       style={[s.tableRow, idx % 2 !== 0 && s.rowOdd,
//                         isNo && s.rowFail, isYes && s.rowPass]}>
//                       <View style={[s.cell, { flex: 3, gap: 5 }]}>
//                         {ans === null && <View style={s.greyDot} />}
//                         {isNo  && <View style={s.redDot} />}
//                         {isYes && (
//                           <Ionicons name="checkmark-circle" size={13} color={C.purple}
//                             style={{ marginRight: 2 }} />
//                         )}
//                         <Text style={[s.cellText, isNo && s.cellFail,
//                           isYes && { color: C.purpleDark }]} numberOfLines={3}>
//                           {item.item_name}
//                         </Text>
//                       </View>
//                       <View style={[s.cell, { flex: 2, justifyContent: 'center', gap: 7 }]}>
//                         <TouchableOpacity
//                           style={[s.ansBtn, { borderColor: C.purple },
//                             isYes && { backgroundColor: C.purple }]}
//                           onPress={() => toggle(item.id, 'Yes')}>
//                           <Text style={[s.ansBtnText, { color: isYes ? '#fff' : C.purple }]}>Yes</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           style={[s.ansBtn, { borderColor: C.gold },
//                             isNo && { backgroundColor: C.gold }]}
//                           onPress={() => toggle(item.id, 'No')}>
//                           <Text style={[s.ansBtnText, { color: isNo ? '#fff' : C.gold }]}>No</Text>
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   );
//                 })}
//               </View>

//               <View style={[s.imageCard, { marginTop: 14 }]}>
//                 <LocalImageStrip images={localImages} onAdd={pickImage}
//                   onRemove={i => setLocalImages(prev => prev.filter((_, idx) => idx !== i))} />
//               </View>
//             </>
//           )}
//         </ScrollView>

//         {!tmplLoading && !noTemplate && items.length > 0 && (
//           <View style={s.btnWrap}>
//             <LinearGradient colors={[C.purple, C.purpleDark]} style={s.gradBtn}
//               start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
//               <TouchableOpacity style={s.gradBtnInner} onPress={handleViewChecklist} disabled={saving}>
//                 {saving ? <ActivityIndicator size="small" color="#fff" /> : (
//                   <>
//                     <Ionicons name="list-outline" size={19} color="#fff" />
//                     <Text style={s.gradBtnText}>View Check List</Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </LinearGradient>
//           </View>
//         )}
//       </Animated.View>

//       {/* ── Confirm Popup ── */}
//       <Modal visible={showPopup} transparent animationType="fade"
//         onRequestClose={() => setShowPopup(false)}>
//         <View style={s.popupOverlay}>
//           <View style={s.popupSheet}>
//             <LinearGradient colors={[C.gold, C.goldDark]} style={s.popupHeader}>
//               <Text style={s.popupTitle}>Checklist Summary</Text>
//               <Text style={s.popupSub}>Room {room.room_number} — confirm before saving</Text>
//             </LinearGradient>

//             <ScrollView style={s.popupScroll} showsVerticalScrollIndicator={false}>
//               <View style={[s.tableHead, { marginHorizontal: 0 }]}>
//                 <Text style={[s.tableHeadCell, { flex: 3 }]}>Item</Text>
//                 <Text style={[s.tableHeadCell, { flex: 1, textAlign: 'center' }]}>Status</Text>
//               </View>
//               {items.map((item, idx) => {
//                 const ans = answers[item.id]; const isNo = ans === 'No';
//                 return (
//                   <View key={item.id}
//                     style={[s.tableRow, idx % 2 !== 0 && s.rowOdd,
//                       isNo && s.rowFail, { paddingHorizontal: 12 }]}>
//                     <View style={[s.cell, { flex: 3, gap: 4 }]}>
//                       {isNo && <View style={s.redDot} />}
//                       <Text style={[s.cellText, isNo && s.cellFail]} numberOfLines={2}>
//                         {item.item_name}
//                       </Text>
//                     </View>
//                     <View style={[s.cell, { flex: 1, justifyContent: 'center' }]}>
//                       <View style={[s.pill, { backgroundColor: isNo ? '#FEE2E2' : C.purpleLight }]}>
//                         <Text style={[s.pillText, { color: isNo ? C.red : C.purple }]}>
//                           {ans || '—'}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                 );
//               })}
//               {localImages.length > 0 && (
//                 <View style={{ padding: 12 }}>
//                   <Text style={[s.imgTitle, { marginBottom: 6, fontSize: 12 }]}>
//                     📷 {localImages.length} photo{localImages.length > 1 ? 's' : ''} attached
//                   </Text>
//                   <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                     {localImages.map((img, i) => (
//                       <Image key={i} source={{ uri: img.uri }}
//                         style={[s.thumb, { marginRight: 6, borderRadius: 8 }]} resizeMode="cover" />
//                     ))}
//                   </ScrollView>
//                 </View>
//               )}
//             </ScrollView>

//             <View style={s.popupBtns}>
//               <TouchableOpacity style={[s.popupBtn, { backgroundColor: '#E5E7EB' }]}
//                 onPress={() => setShowPopup(false)}>
//                 <Ionicons name="close-outline" size={16} color={C.textSecond} />
//                 <Text style={[s.popupBtnText, { color: C.textSecond }]}>Cancel</Text>
//               </TouchableOpacity>
//               <LinearGradient colors={[C.gold, C.goldDark]} style={s.popupBtnGrad}
//                 start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
//                 <TouchableOpacity style={s.popupBtnInner} onPress={handleSave}>
//                   <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
//                   <Text style={[s.popupBtnText, { color: '#fff' }]}>Save Check List</Text>
//                 </TouchableOpacity>
//               </LinearGradient>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </Modal>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // FINALIZE CHECKLIST MODAL
// // HK Yes items pre-filled as SV Yes. HK No items left blank for supervisor.
// // No confirm popup — directly saves on button press.
// // ─────────────────────────────────────────────────────────────────────────────
// interface FinalizeModalProps {
//   visible: boolean; room: Room | null;
//   onClose: () => void; onSuccess: () => void;
// }

// const FinalizeChecklistModal: React.FC<FinalizeModalProps> = ({
//   visible, room, onClose, onSuccess,
// }) => {
//   const slideAnim = useRef(new Animated.Value(height)).current;
//   const [loading,      setLoading]      = useState(false);
//   const [saving,       setSaving]       = useState(false);
//   const [template,     setTemplate]     = useState<FinalizeTemplate | null>(null);
//   const [noPending,    setNoPending]    = useState(false);
//   const [roomStatus,   setRoomStatus]   = useState<'Ready' | 'Not Ready' | null>(null);
//   const [svAnswers,    setSvAnswers]    = useState<Record<number, 'Yes' | 'No' | null>>({});
//   const [reasons,      setReasons]      = useState<Record<number, string>>({});
//   const [refillingQty, setRefillingQty] = useState<Record<number, string>>({});
//   const [localImages,  setLocalImages]  = useState<LocalImage[]>([]);

//   useEffect(() => {
//     if (visible) Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
//     else Animated.timing(slideAnim, { toValue: height, duration: 280, useNativeDriver: true }).start();
//   }, [visible]);

//   useEffect(() => { if (visible && room) loadTemplate(); }, [visible, room]);

//   const loadTemplate = async () => {
//     if (!room) return;
//     setLoading(true); setNoPending(false); setTemplate(null); setRoomStatus(null);
//     setSvAnswers({}); setReasons({}); setRefillingQty({}); setLocalImages([]);
//     try {
//       const tmpl = await getFinalizeTemplate(room.id);
//       if (!tmpl) { setNoPending(true); return; }
//       setTemplate(tmpl);
//       // Pre-fill: HK Yes → SV Yes automatically; HK No → leave null (supervisor decides)
//       const init: Record<number, 'Yes' | 'No' | null> = {};
//       tmpl.checklist.check_list_detail.forEach(d => {
//         init[d.id] = d.housekeeper_status === 'Yes' ? 'Yes' : null;
//       });
//       setSvAnswers(init);
//     } catch { setNoPending(true); }
//     finally { setLoading(false); }
//   };

//   const toggleSv = (detailId: number, val: 'Yes' | 'No') => {
//     setSvAnswers(prev => ({ ...prev, [detailId]: prev[detailId] === val ? null : val }));
//     if (val === 'Yes') setReasons(prev => { const n = { ...prev }; delete n[detailId]; return n; });
//   };

//   const pickImage = async () => {
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true, quality: 0.8,
//     });
//     if (!res.canceled)
//       setLocalImages(prev => [...prev, ...res.assets.map(a => ({
//         uri: a.uri,
//         name: a.fileName || `img_${Date.now()}.jpg`,
//         type: a.mimeType || 'image/jpeg',
//       }))]);
//   };

//   // Direct save — no confirm popup
//   const handleSave = async () => {
//     if (!room || !template) return;
//     const details    = template.checklist.check_list_detail;
//     const unanswered = details.filter(d => svAnswers[d.id] === null);
//     if (unanswered.length > 0) {
//       Alert.alert('Incomplete', `Please review all ${unanswered.length} remaining item(s).`);
//       return;
//     }
//     if (!roomStatus) {
//       Alert.alert('Room Status', 'Please select Room Status (Ready / Not Ready).');
//       return;
//     }
//     setSaving(true);
//     try {
//       const refillingUsages = template.refilling_items
//         .filter(r => refillingQty[r.id] && Number(refillingQty[r.id]) > 0)
//         .map(r => ({ refilling_item_id: r.id, quantity: Number(refillingQty[r.id]) }));

//       await saveFinalize(
//         template.checklist.id,
//         {
//           type: 'room', room_status: roomStatus,
//           items: details.map(d => ({
//             detail_id: d.id,
//             supervisor_status: svAnswers[d.id] as 'Yes' | 'No',
//             ...(reasons[d.id] ? { reason: reasons[d.id] } : {}),
//           })),
//           ...(refillingUsages.length > 0 ? { refilling_usages: refillingUsages } : {}),
//         },
//         localImages.length > 0 ? localImages : undefined,
//       );
//       Alert.alert('Success', 'Checklist finalized successfully!');
//       onSuccess(); onClose();
//     } catch (e: any) {
//       Alert.alert('Error', e?.response?.data?.message || 'Failed to finalize checklist');
//     } finally { setSaving(false); }
//   };

//   if (!room) return null;
//   const details        = template?.checklist.check_list_detail ?? [];
//   const svImages       = template?.checklist.check_list_image   ?? [];
//   const refillingItems = template?.refilling_items ?? [];
//   const answeredCount  = details.filter(d => svAnswers[d.id] !== null).length;
//   const progress       = details.length > 0 ? answeredCount / details.length : 0;
//   const hkName         = template?.checklist.housekeeper
//     ? `${template.checklist.housekeeper.name} ${template.checklist.housekeeper.lname}`.trim() : '—';

//   // Count how many HK No items need SV review
//   const pendingReviewCount = details.filter(d =>
//     d.housekeeper_status === 'No' && svAnswers[d.id] === null
//   ).length;

//   return (
//     <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
//       <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
//       <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>

//         <LinearGradient colors={[C.gold, C.amber]} style={s.gradHeader}>
//           <View style={s.handle} />
//           <View style={s.headerRow}>
//             <View style={{ flex: 1 }}>
//               <Text style={s.headerSub}>{room.room_category?.custome_name || room.room_category?.category}</Text>
//               <Text style={s.headerTitle}>Room {room.room_number} — Finalize</Text>
//             </View>
//             <TouchableOpacity onPress={onClose} style={s.closeBtn}>
//               <Ionicons name="close" size={22} color="#fff" />
//             </TouchableOpacity>
//           </View>
//           {details.length > 0 && (
//             <View style={s.progressWrap}>
//               <View style={s.progressTrack}>
//                 <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
//               </View>
//               <Text style={s.progressLabel}>{answeredCount}/{details.length} reviewed</Text>
//             </View>
//           )}
//         </LinearGradient>

//         <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 130 }}>
//           {loading ? (
//             <View style={[s.centered, { paddingVertical: 60 }]}>
//               <ActivityIndicator size="large" color={C.gold} />
//               <Text style={s.loadText}>Loading pending checklist...</Text>
//             </View>
//           ) : noPending ? (
//             <View style={[s.empty, { paddingVertical: 60 }]}>
//               <Ionicons name="checkmark-done-circle-outline" size={52} color="#D1D5DB" />
//               <Text style={s.emptyTitle}>No Pending Checklist</Text>
//               <Text style={s.emptyText}>There is no pending checklist to finalize for this room</Text>
//             </View>
//           ) : (
//             <>
//               <View style={s.infoCard}>
//                 <InfoRow icon="person-outline"   label="Housekeeper" value={hkName} />
//                 <InfoRow icon="document-outline" label="CL Status"   value={template?.checklist.status || '—'} />
//                 <InfoRow icon="checkmark-circle-outline" label="Pre-filled"
//                   value="HK Yes items auto-filled" isLast />
//               </View>

//               {/* Alert for items needing SV review */}
//               {pendingReviewCount > 0 && (
//                 <View style={s.reviewAlert}>
//                   <Ionicons name="alert-circle-outline" size={16} color={C.amber} />
//                   <Text style={s.reviewAlertText}>
//                     {pendingReviewCount} item{pendingReviewCount > 1 ? 's' : ''} marked No by HK — please review
//                   </Text>
//                 </View>
//               )}

//               {/* Room Status */}
//               <View style={s.statusCard}>
//                 <Text style={s.statusCardTitle}>Room Status</Text>
//                 <View style={s.statusBtnRow}>
//                   {(['Ready', 'Not Ready'] as const).map(s2 => (
//                     <TouchableOpacity key={s2}
//                       style={[s.statusBtn,
//                         roomStatus === s2 && {
//                           backgroundColor: s2 === 'Ready' ? C.purple : C.red,
//                           borderColor: s2 === 'Ready' ? C.purple : C.red,
//                         }]}
//                       onPress={() => setRoomStatus(s2)}>
//                       <Ionicons
//                         name={s2 === 'Ready' ? 'checkmark-circle-outline' : 'close-circle-outline'}
//                         size={15}
//                         color={roomStatus === s2 ? '#fff' : s2 === 'Ready' ? C.purple : C.red} />
//                       <Text style={[s.statusBtnText,
//                         { color: roomStatus === s2 ? '#fff' : s2 === 'Ready' ? C.purple : C.red }]}>
//                         {s2}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>

//               {/* Supervisor review table */}
//               <View style={s.tableCard}>
//                 <View style={[s.tableHead, { backgroundColor: C.goldLight }]}>
//                   <Text style={[s.tableHeadCell, { flex: 3, color: '#92400E' }]}>Item Name</Text>
//                   <Text style={[s.tableHeadCell, { flex: 1, color: '#92400E', fontSize: 11 }]}>HK</Text>
//                   <Text style={[s.tableHeadCell, { flex: 2, textAlign: 'center', color: '#92400E' }]}>
//                     Supervisor
//                   </Text>
//                 </View>
//                 {details.map((item, idx) => {
//                   const sv   = svAnswers[item.id];
//                   const hkNo = item.housekeeper_status === 'No';
//                   const svNo = sv === 'No'; const svYes = sv === 'Yes';
//                   return (
//                     <View key={item.id}>
//                       <View style={[s.tableRow, idx % 2 !== 0 && s.rowOdd,
//                         svNo && s.rowFail, svYes && s.rowPass,
//                         // Highlight HK No items that still need review
//                         (hkNo && sv === null) && s.rowNeedsReview]}>
//                         <View style={[s.cell, { flex: 3, gap: 4 }]}>
//                           {hkNo && <View style={[s.redDot, { backgroundColor: C.gold }]} />}
//                           <Text style={[s.cellText, svNo && s.cellFail]} numberOfLines={2}>
//                             {item.housekeeping?.item_name ?? '—'}
//                           </Text>
//                         </View>
//                         <View style={[s.cell, { flex: 1 }]}>
//                           <View style={[s.pill, {
//                             backgroundColor: hkNo ? '#FEE2E2' : '#D1FAE5', paddingHorizontal: 5,
//                           }]}>
//                             <Text style={[s.pillText, {
//                               fontSize: 10, color: hkNo ? C.red : C.green,
//                             }]}>{item.housekeeper_status || '—'}</Text>
//                           </View>
//                         </View>
//                         <View style={[s.cell, { flex: 2, justifyContent: 'center', gap: 6 }]}>
//                           <TouchableOpacity
//                             style={[s.ansBtn, { borderColor: C.purple, paddingHorizontal: 9 },
//                               svYes && { backgroundColor: C.purple }]}
//                             onPress={() => toggleSv(item.id, 'Yes')}>
//                             <Text style={[s.ansBtnText, { color: svYes ? '#fff' : C.purple }]}>Yes</Text>
//                           </TouchableOpacity>
//                           <TouchableOpacity
//                             style={[s.ansBtn, { borderColor: C.gold, paddingHorizontal: 9 },
//                               svNo && { backgroundColor: C.gold }]}
//                             onPress={() => toggleSv(item.id, 'No')}>
//                             <Text style={[s.ansBtnText, { color: svNo ? '#fff' : C.gold }]}>No</Text>
//                           </TouchableOpacity>
//                         </View>
//                       </View>
//                       {svNo && (
//                         <View style={s.reasonRow}>
//                           <Ionicons name="create-outline" size={13} color={C.textMuted} />
//                           <TextInput
//                             style={s.reasonInput}
//                             placeholder="Reason (optional)"
//                             placeholderTextColor="#D1D5DB"
//                             value={reasons[item.id] || ''}
//                             onChangeText={t => setReasons(prev => ({ ...prev, [item.id]: t }))} />
//                         </View>
//                       )}
//                     </View>
//                   );
//                 })}
//               </View>

//               {/* Refill items */}
//               {refillingItems.length > 0 && (
//                 <View style={s.refillCard}>
//                   <View style={s.refillHeader}>
//                     <Ionicons name="cube-outline" size={16} color={C.purple} />
//                     <Text style={s.refillTitle}>Refill Items</Text>
//                   </View>
//                   <View style={s.refillColHeader}>
//                     <Text style={[s.refillColText, { flex: 2 }]}>Item Name</Text>
//                     <Text style={[s.refillColText, { flex: 1, textAlign: 'center' }]}>Unit</Text>
//                     <Text style={[s.refillColText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
//                   </View>
//                   {refillingItems.map((r, idx) => (
//                     <View key={r.id}
//                       style={[s.refillRow, idx % 2 !== 0 && { backgroundColor: '#FAFAFA' }]}>
//                       <Text style={[s.refillItemName, { flex: 2 }]} numberOfLines={2}>
//                         {r.item?.item ?? '—'}
//                       </Text>
//                       <Text style={[s.refillUnit, { flex: 1, textAlign: 'center' }]}>
//                         {r.item?.unit ?? '—'}
//                       </Text>
//                       <View style={{ flex: 1, alignItems: 'center' }}>
//                         <TextInput
//                           style={s.refillInput}
//                           placeholder="0"
//                           placeholderTextColor="#D1D5DB"
//                           keyboardType="numeric"
//                           value={refillingQty[r.id] || ''}
//                           onChangeText={t => setRefillingQty(prev => ({
//                             ...prev, [r.id]: t.replace(/[^0-9]/g, ''),
//                           }))} />
//                       </View>
//                     </View>
//                   ))}
//                 </View>
//               )}

//               {/* HK images */}
//               {svImages.length > 0 && <ImageGallery images={svImages} />}

//               {/* Supervisor adds images */}
//               <View style={[s.imageCard, { marginTop: 14 }]}>
//                 <LocalImageStrip images={localImages} onAdd={pickImage}
//                   onRemove={i => setLocalImages(prev => prev.filter((_, idx) => idx !== i))} />
//               </View>
//             </>
//           )}
//         </ScrollView>

//         {/* Direct save — no confirm popup */}
//         {!loading && !noPending && details.length > 0 && (
//           <View style={s.btnWrap}>
//             <LinearGradient colors={[C.gold, C.goldDark]} style={s.gradBtn}
//               start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
//               <TouchableOpacity style={s.gradBtnInner} onPress={handleSave} disabled={saving}>
//                 {saving ? <ActivityIndicator size="small" color="#fff" /> : (
//                   <>
//                     <Ionicons name="shield-checkmark-outline" size={19} color="#fff" />
//                     <Text style={s.gradBtnText}>Save Finalize</Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </LinearGradient>
//           </View>
//         )}
//       </Animated.View>
//     </Modal>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN PAGE
// // ─────────────────────────────────────────────────────────────────────────────
// const HousekeepingPage = () => {
//   const [activeTab,    setActiveTab]    = useState<TabType>('rooms');
//   const [rooms,        setRooms]        = useState<Room[]>([]);
//   const [filtered,     setFiltered]     = useState<Room[]>([]);
//   const [search,       setSearch]       = useState('');
//   const [statusFilter, setStatusFilter] = useState<FilterType>('all');
//   const [loading,      setLoading]      = useState(false);
//   const [refreshing,   setRefreshing]   = useState(false);

//   const [selectedRoom,     setSelectedRoom]     = useState<Room | null>(null);
//   const [showDetail,       setShowDetail]       = useState(false);
//   const [checklist,        setChecklist]        = useState<RoomChecklist | null>(null);
//   const [checklistLoading, setChecklistLoading] = useState(false);

//   const [showNewCL,    setShowNewCL]    = useState(false);
//   const [newCLRoom,    setNewCLRoom]    = useState<Room | null>(null);
//   const [showFinalize, setShowFinalize] = useState(false);
//   const [finalizeRoom, setFinalizeRoom] = useState<Room | null>(null);

//   // Dot dropdown
//   const [dotRoom,     setDotRoom]     = useState<Room | null>(null);
//   const [showDotMenu, setShowDotMenu] = useState(false);
//   const dotAnim = useRef(new Animated.Value(0)).current;

//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   const loadRooms = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await getRooms();
//       if (res.status && res.rooms) setRooms(res.rooms);
//     } catch { Alert.alert('Error', 'Failed to load rooms'); }
//     finally {
//       setLoading(false); setRefreshing(false);
//       Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
//     }
//   }, []);

//   useEffect(() => { loadRooms(); }, []);

//   useEffect(() => {
//     let list = [...rooms];
//     if (activeTab === 'other')
//       list = list.filter(r => r.room_category?.room_type?.toLowerCase() === 'other');
//     else
//       list = list.filter(r => r.room_category?.room_type?.toLowerCase() !== 'other');
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       list = list.filter(r =>
//         r.room_number.toLowerCase().includes(q) ||
//         r.room_category?.custome_name?.toLowerCase().includes(q) ||
//         r.room_category?.category?.toLowerCase().includes(q));
//     }
//     if (statusFilter !== 'all') {
//       list = list.filter(r => {
//         const sl = getRoomStatusColor(r).label;
//         if (statusFilter === 'ready')   return sl === 'Ready';
//         if (statusFilter === 'dirty')   return sl === 'Dirty';
//         if (statusFilter === 'repair')  return sl === 'Under Repair';
//         if (statusFilter === 'pending')
//           return sl === 'Pending Review' || sl === 'Need to clean up';
//         return true;
//       });
//     }
//     setFiltered(list);
//   }, [rooms, search, statusFilter, activeTab]);

//   const openDetail = async (room: Room) => {
//     setSelectedRoom(room); setChecklist(null); setShowDetail(true); setChecklistLoading(true);
//     try { setChecklist(await getChecklistByRoom(room.id)); }
//     catch (e) { console.error(e); }
//     finally { setChecklistLoading(false); }
//   };

//   const openDotMenu = (room: Room) => {
//     setDotRoom(room); setShowDotMenu(true);
//     dotAnim.setValue(0);
//     Animated.spring(dotAnim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }).start();
//   };
//   const closeDotMenu  = () => setShowDotMenu(false);
//   const closeDetail   = () => { setShowDetail(false);   setTimeout(() => { setSelectedRoom(null); setChecklist(null); }, 350); };
//   const openNewCL     = (room: Room) => { setNewCLRoom(room);    setShowNewCL(true);    };
//   const closeNewCL    = () => { setShowNewCL(false);    setTimeout(() => setNewCLRoom(null),    350); };
//   const openFinalize  = (room: Room) => { setFinalizeRoom(room); setShowFinalize(true); };
//   const closeFinalize = () => { setShowFinalize(false); setTimeout(() => setFinalizeRoom(null), 350); };
//   const handleGoFinalize = (room: Room) => openFinalize(room);

//   const stats = {
//     total:   rooms.length,
//     ready:   rooms.filter(r => getRoomStatusColor(r).label === 'Ready').length,
//     dirty:   rooms.filter(r => getRoomStatusColor(r).label === 'Dirty').length,
//     repair:  rooms.filter(r => getRoomStatusColor(r).label === 'Under Repair').length,
//     pending: rooms.filter(r =>
//       ['Pending Review', 'Need to clean up'].includes(getRoomStatusColor(r).label)).length,
//   };

//   const summaryItems = [
//     { key: 'all'     as FilterType, label: 'All',     count: stats.total,   color: C.purple,  bg: C.purpleLight, icon: 'grid-outline'            as const },
//     { key: 'ready'   as FilterType, label: 'Ready',   count: stats.ready,   color: C.green,   bg: '#D1FAE5',     icon: 'checkmark-circle-outline' as const },
//     { key: 'dirty'   as FilterType, label: 'Dirty',   count: stats.dirty,   color: C.red,     bg: '#FEE2E2',     icon: 'warning-outline'          as const },
//     { key: 'pending' as FilterType, label: 'Pending', count: stats.pending, color: C.gold,    bg: C.goldLight,   icon: 'brush-outline'            as const },
//     { key: 'repair'  as FilterType, label: 'Repair',  count: stats.repair,  color: '#6366F1', bg: '#E0E7FF',     icon: 'construct-outline'        as const },
//   ];

//   const roomTabCount  = rooms.filter(r => r.room_category?.room_type?.toLowerCase() !== 'other').length;
//   const otherTabCount = rooms.filter(r => r.room_category?.room_type?.toLowerCase() === 'other').length;

//   const renderRoom = ({ item }: { item: Room }) => {
//     const si = getRoomStatusColor(item);
//     const timeAgo = item.check_list?.updated_at ? getTimeAgo(item.check_list.updated_at) : null;
//     return (
//       <View style={[s.card, { borderColor: si.border, backgroundColor: si.bg }]}>
//         <TouchableOpacity style={s.dotMenuBtn} onPress={() => openDotMenu(item)}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
//           <Ionicons name="ellipsis-horizontal" size={18} color={C.textMuted} />
//         </TouchableOpacity>
//         <View style={[s.cardDot, { backgroundColor: si.color }]} />
//         <Text style={s.cardCat}>{item.room_category?.custome_name || item.room_category?.category}</Text>
//         <Text style={s.cardNum}>{item.room_number}</Text>
//         <Text style={[s.cardStatus, { color: si.color }]}>{si.label}</Text>
//         {timeAgo && <Text style={s.cardTime}>{timeAgo}</Text>}
//       </View>
//     );
//   };

//   return (
//     <View style={s.container}>
//       <DashboardHeader title="Housekeeping" subtitle="Room cleanliness & status"
//         currentPage="housekeeping" />

//       {/* Tabs */}
//       <View style={s.tabBar}>
//         {(['rooms', 'other'] as TabType[]).map(tab => (
//           <TouchableOpacity key={tab} style={[s.tab, activeTab === tab && s.tabActive]}
//             onPress={() => setActiveTab(tab)}>
//             <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
//               {tab === 'rooms' ? `Rooms (${roomTabCount})` : `Other Location (${otherTabCount})`}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Search */}
//       <View style={s.searchRow}>
//         <View style={s.searchBox}>
//           <Ionicons name="search-outline" size={16} color={C.textMuted} />
//           <TextInput style={s.searchInput} placeholder="Search by Room Number or Name"
//             placeholderTextColor={C.textMuted} value={search} onChangeText={setSearch} />
//           {search.length > 0 && (
//             <TouchableOpacity onPress={() => setSearch('')}>
//               <Ionicons name="close-circle" size={16} color={C.textMuted} />
//             </TouchableOpacity>
//           )}
//         </View>
//         <TouchableOpacity style={s.resetBtn}
//           onPress={() => { setSearch(''); setStatusFilter('all'); }}>
//           <Text style={s.resetBtnText}>Reset</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Summary strip */}
//       <View style={s.summaryWrap}>
//         <View style={s.summaryCard}>
//           {summaryItems.map((item, index) => {
//             const isActive = statusFilter === item.key;
//             const isLast   = index === summaryItems.length - 1;
//             return (
//               <React.Fragment key={item.key}>
//                 <TouchableOpacity
//                   style={[s.sumItem, isActive && { backgroundColor: item.bg }]}
//                   onPress={() => setStatusFilter(isActive ? 'all' : item.key)}
//                   activeOpacity={0.7}>
//                   <View style={[s.sumIcon, { backgroundColor: isActive ? item.color : item.bg }]}>
//                     <Ionicons name={item.icon} size={13} color={isActive ? '#fff' : item.color} />
//                   </View>
//                   <Text style={[s.sumCount, { color: isActive ? item.color : C.textPrimary }]}>
//                     {item.count}
//                   </Text>
//                   <Text style={[s.sumLabel, { color: isActive ? item.color : C.textSecond }]}>
//                     {item.label}
//                   </Text>
//                   {isActive && <View style={[s.sumActiveLine, { backgroundColor: item.color }]} />}
//                 </TouchableOpacity>
//                 {!isLast && <View style={s.sumDivider} />}
//               </React.Fragment>
//             );
//           })}
//         </View>
//       </View>

//       {statusFilter !== 'all' && (
//         <View style={s.pillRow}>
//           <View style={s.pill2}>
//             <Ionicons name="funnel" size={11} color={C.purple} />
//             <Text style={s.pill2Text}>
//               {summaryItems.find(si => si.key === statusFilter)?.label} ({filtered.length})
//             </Text>
//             <TouchableOpacity onPress={() => setStatusFilter('all')}
//               hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
//               <Ionicons name="close-circle" size={14} color={C.purple} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {/* Grid */}
//       {loading ? (
//         <View style={s.centered}>
//           <ActivityIndicator size="large" color={C.purple} />
//           <Text style={s.loadText}>Loading rooms...</Text>
//         </View>
//       ) : (
//         <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
//           <FlatList
//             data={filtered} keyExtractor={item => item.id.toString()} renderItem={renderRoom}
//             numColumns={2} columnWrapperStyle={s.row} contentContainerStyle={s.grid}
//             refreshControl={
//               <RefreshControl refreshing={refreshing}
//                 onRefresh={() => { setRefreshing(true); loadRooms(); }}
//                 colors={[C.purple]} tintColor={C.purple} />
//             }
//             ListEmptyComponent={
//               <View style={s.empty}>
//                 <Ionicons name="bed-outline" size={52} color="#D1D5DB" />
//                 <Text style={s.emptyTitle}>No Rooms Found</Text>
//                 <Text style={s.emptyText}>Try adjusting your search or filters</Text>
//               </View>
//             }
//           />
//         </Animated.View>
//       )}

//       {/* ── Dot Dropdown — card-style popup centered on screen ──────────── */}
//       <Modal visible={showDotMenu} transparent animationType="none" onRequestClose={closeDotMenu}>
//         <TouchableOpacity style={s.dotBackdrop} activeOpacity={1} onPress={closeDotMenu} />
//         <Animated.View style={[s.dotDropdown, {
//           opacity: dotAnim,
//           transform: [{
//             scale: dotAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
//           }, {
//             translateY: dotAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }),
//           }],
//         }]}>
//           {/* Header */}
//           <View style={s.dotDropHeader}>
//             <View style={s.dotDropHeaderLeft}>
//               <View style={[s.dotDropRoomBadge, { backgroundColor: C.purpleLight }]}>
//                 <Ionicons name="bed-outline" size={13} color={C.purple} />
//                 <Text style={s.dotDropRoomText}>Room {dotRoom?.room_number}</Text>
//               </View>
//               <Text style={s.dotDropCat} numberOfLines={1}>
//                 {dotRoom?.room_category?.custome_name || dotRoom?.room_category?.category}
//               </Text>
//             </View>
//             <TouchableOpacity onPress={closeDotMenu} style={s.dotDropClose}>
//               <Ionicons name="close" size={18} color={C.textMuted} />
//             </TouchableOpacity>
//           </View>

//           {/* View Checklist */}
//           <TouchableOpacity style={s.dotDropItem}
//             onPress={() => { closeDotMenu(); if (dotRoom) setTimeout(() => openDetail(dotRoom), 180); }}
//             activeOpacity={0.72}>
//             <View style={[s.dotDropIconWrap, { backgroundColor: C.purpleLight }]}>
//               <Ionicons name="eye-outline" size={19} color={C.purple} />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={s.dotDropItemLabel}>View Checklist</Text>
//               <Text style={s.dotDropItemSub}>See latest finalized checklist</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
//           </TouchableOpacity>

//           <View style={s.dotDropDivider} />

//           {/* New Checklist */}
//           <TouchableOpacity style={s.dotDropItem}
//             onPress={() => { closeDotMenu(); if (dotRoom) setTimeout(() => openNewCL(dotRoom), 180); }}
//             activeOpacity={0.72}>
//             <View style={[s.dotDropIconWrap, { backgroundColor: '#F0FDF4' }]}>
//               <Ionicons name="add-circle-outline" size={19} color={C.green} />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={s.dotDropItemLabel}>New Checklist</Text>
//               <Text style={s.dotDropItemSub}>Create a new housekeeping checklist</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
//           </TouchableOpacity>

//           <View style={s.dotDropDivider} />

//           {/* Finalize */}
//           <TouchableOpacity style={[s.dotDropItem, { borderBottomWidth: 0 }]}
//             onPress={() => { closeDotMenu(); if (dotRoom) setTimeout(() => openFinalize(dotRoom), 180); }}
//             activeOpacity={0.72}>
//             <View style={[s.dotDropIconWrap, { backgroundColor: C.goldLight }]}>
//               <Ionicons name="shield-checkmark-outline" size={19} color={C.goldDark} />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={s.dotDropItemLabel}>Finalize Checklist</Text>
//               <Text style={s.dotDropItemSub}>Supervisor approval & room status</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
//           </TouchableOpacity>
//         </Animated.View>
//       </Modal>

//       <ChecklistDetailModal visible={showDetail} room={selectedRoom} checklist={checklist}
//         checklistLoading={checklistLoading} onClose={closeDetail} />

//       <NewChecklistModal visible={showNewCL} room={newCLRoom}
//         onClose={closeNewCL} onSuccess={loadRooms} onGoFinalize={handleGoFinalize} />

//       <FinalizeChecklistModal visible={showFinalize} room={finalizeRoom}
//         onClose={closeFinalize} onSuccess={loadRooms} />
//     </View>
//   );
// };

// export default HousekeepingPage;

// // ─────────────────────────────────────────────────────────────────────────────
// // STYLES
// // ─────────────────────────────────────────────────────────────────────────────
// const s = StyleSheet.create({
//   container: { flex: 1, backgroundColor: C.bg },

//   tabBar:        { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.white },
//   tab:           { paddingBottom: 10, marginRight: 24 },
//   tabActive:     { borderBottomWidth: 2.5, borderBottomColor: C.purple },
//   tabText:       { fontSize: 14, fontWeight: '500', color: C.textSecond },
//   tabTextActive: { color: C.purple, fontWeight: '700' },

//   searchRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   searchBox:    { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, gap: 8 },
//   searchInput:  { flex: 1, fontSize: 14, color: C.textPrimary },
//   resetBtn:     { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: C.purple },
//   resetBtnText: { fontSize: 12, color: C.purple, fontWeight: '600' },

//   summaryWrap:   { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
//   summaryCard:   { flexDirection: 'row', backgroundColor: C.white, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3, overflow: 'hidden' },
//   sumItem:       { flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 2, position: 'relative' },
//   sumIcon:       { width: 28, height: 28, borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
//   sumCount:      { fontSize: 18, fontWeight: '800', lineHeight: 22 },
//   sumLabel:      { fontSize: 9, fontWeight: '500', textAlign: 'center', marginTop: 2 },
//   sumActiveLine: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
//   sumDivider:    { width: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },

//   pillRow:  { paddingHorizontal: 16, paddingTop: 8 },
//   pill2:    { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: C.purpleLight, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20 },
//   pill2Text:{ fontSize: 12, color: C.purple, fontWeight: '600' },

//   grid: { paddingHorizontal: 12, paddingBottom: 24, paddingTop: 10 },
//   row:  { justifyContent: 'space-between' },

//   card:       { width: (width - 36) / 2, borderRadius: 12, borderWidth: 1.5, padding: 16, marginBottom: 12, position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
//   cardDot:    { width: 9, height: 9, borderRadius: 5, marginBottom: 6 },
//   dotMenuBtn: { position: 'absolute', top: 10, right: 10, padding: 4 },
//   cardCat:    { fontSize: 12, color: C.textSecond, fontWeight: '500', marginBottom: 2 },
//   cardNum:    { fontSize: 28, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
//   cardStatus: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
//   cardTime:   { fontSize: 11, color: C.textMuted },

//   // Dot dropdown popup
//   dotBackdrop:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.22)' },
//   dotDropdown:      { position: 'absolute', top: '26%', left: 22, right: 22, backgroundColor: C.white, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 16, overflow: 'hidden' },
//   dotDropHeader:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   dotDropHeaderLeft:{ flex: 1 },
//   dotDropRoomBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, marginBottom: 4 },
//   dotDropRoomText:  { fontSize: 12, fontWeight: '700', color: C.purple },
//   dotDropCat:       { fontSize: 13, color: C.textSecond, fontWeight: '500' },
//   dotDropClose:     { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
//   dotDropItem:      { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 18, paddingVertical: 15 },
//   dotDropIconWrap:  { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
//   dotDropItemLabel: { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 1 },
//   dotDropItemSub:   { fontSize: 11, color: C.textMuted },
//   dotDropDivider:   { height: 1, backgroundColor: '#F9FAFB', marginHorizontal: 0 },

//   centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
//   loadText:   { fontSize: 14, color: C.textMuted },
//   empty:      { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 },
//   emptyTitle: { fontSize: 18, fontWeight: '600', color: C.textPrimary, marginTop: 16, marginBottom: 6 },
//   emptyText:  { fontSize: 14, color: C.textMuted, textAlign: 'center' },

//   backdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
//   sheet:       { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.92, overflow: 'hidden' },
//   gradHeader:  { paddingTop: 10, paddingBottom: 18, paddingHorizontal: 20 },
//   handle:      { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
//   headerRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
//   headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginBottom: 3 },
//   headerTitle: { fontSize: 19, fontWeight: '800', color: '#fff' },
//   closeBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
//   badgeRow:    { flexDirection: 'row', gap: 8 },
//   badge:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
//   badgeText:   { fontSize: 12, fontWeight: '700' },

//   infoCard:      { backgroundColor: C.white, marginHorizontal: 16, marginTop: 16, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
//   infoRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 13 },
//   infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   infoLeft:      { flexDirection: 'row', alignItems: 'center', gap: 9 },
//   infoLabel:     { fontSize: 14, color: C.textSecond, fontWeight: '500' },
//   infoValue:     { fontSize: 14, color: C.textPrimary, fontWeight: '600' },

//   tableCard:     { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
//   tableHead:     { flexDirection: 'row', backgroundColor: C.purpleLight, paddingHorizontal: 16, paddingVertical: 11 },
//   tableHeadCell: { fontSize: 13, fontWeight: '700', color: C.purple },
//   tableRow:      { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
//   rowOdd:        { backgroundColor: '#FAFAFA' },
//   rowFail:       { backgroundColor: '#FFF5F5' },
//   rowPass:       { backgroundColor: '#F5F3FF' },
//   rowNeedsReview:{ backgroundColor: '#FFFBEB' },
//   cell:          { flexDirection: 'row', alignItems: 'center' },
//   cellText:      { fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 },
//   cellFail:      { color: '#DC2626', fontWeight: '600' },
//   redDot:        { width: 7, height: 7, borderRadius: 4, backgroundColor: C.red, marginRight: 4, flexShrink: 0 },
//   greyDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D1D5DB', marginRight: 4, flexShrink: 0 },
//   pill:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
//   pillText:      { fontSize: 12, fontWeight: '700' },
//   tableCenter:   { flexDirection: 'column', alignItems: 'center', gap: 8, padding: 28 },
//   helperText:    { fontSize: 14, color: C.textMuted },

//   reasonRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', paddingHorizontal: 20, paddingVertical: 7, gap: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   reasonInput: { flex: 1, fontSize: 13, color: '#374151' },

//   ansBtn:     { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 5 },
//   ansBtnText: { fontSize: 12, fontWeight: '700' },

//   statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 16, marginBottom: 2 },
//   statBox:  { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
//   statNum:  { fontSize: 22, fontWeight: '800' },
//   statLabel:{ fontSize: 11, fontWeight: '600', marginTop: 2 },

//   progressWrap:  { marginTop: 10 },
//   progressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
//   progressFill:  { height: 4, backgroundColor: '#fff', borderRadius: 2 },
//   progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 5, textAlign: 'right' },

//   btnWrap:      { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
//   gradBtn:      { borderRadius: 14, overflow: 'hidden' },
//   gradBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
//   gradBtnText:  { fontSize: 16, fontWeight: '800', color: '#fff' },

//   imageCard:   { backgroundColor: C.white, marginHorizontal: 16, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
//   imgHeader:   { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
//   imgTitle:    { fontSize: 14, fontWeight: '700', color: C.textPrimary },
//   thumbWrap:   { borderRadius: 10, overflow: 'hidden', position: 'relative', width: 130, height: 98 },
//   thumb:       { width: 130, height: 98, backgroundColor: '#F3F4F6' },
//   expandIcon:  { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.45)', padding: 3, borderRadius: 5 },
//   addPhotoBtn: { width: 78, height: 98, borderRadius: 10, borderWidth: 2, borderColor: '#E0D9F0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F8FF' },
//   addPhotoText:{ fontSize: 11, color: C.purple, fontWeight: '600', marginTop: 3 },
//   removeBtn:   { position: 'absolute', top: 3, right: 3, backgroundColor: C.white, borderRadius: 10 },

//   fsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)', justifyContent: 'center', alignItems: 'center' },
//   fsClose:   { position: 'absolute', top: 52, right: 20, zIndex: 10 },
//   fsCounter: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 10 },
//   fsNav:     { flexDirection: 'row', gap: 60, marginTop: 20 },
//   fsNavBtn:  { padding: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 30 },

//   popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 },
//   popupSheet:   { backgroundColor: C.white, borderRadius: 20, width: '100%', maxHeight: height * 0.76, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 12 },
//   popupHeader:  { paddingVertical: 18, paddingHorizontal: 20, alignItems: 'center' },
//   popupTitle:   { fontSize: 17, fontWeight: '800', color: '#fff' },
//   popupSub:     { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
//   popupScroll:  { maxHeight: height * 0.48 },
//   popupBtns:    { flexDirection: 'row', padding: 14, gap: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
//   popupBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: 11 },
//   popupBtnGrad: { flex: 1, borderRadius: 11, overflow: 'hidden' },
//   popupBtnInner:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13 },
//   popupBtnText: { fontSize: 13, fontWeight: '700' },

//   statusCard:      { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
//   statusCardTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
//   statusBtnRow:    { flexDirection: 'row', gap: 12 },
//   statusBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: C.border },
//   statusBtnText:   { fontSize: 14, fontWeight: '700' },

//   reviewAlert:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 12, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FCD34D', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
//   reviewAlertText: { flex: 1, fontSize: 13, color: '#92400E', fontWeight: '500' },

//   refillCard:      { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
//   refillHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 13, backgroundColor: C.purpleLight, borderBottomWidth: 1, borderBottomColor: '#E0D9F0' },
//   refillTitle:     { fontSize: 14, fontWeight: '700', color: C.purple },
//   refillColHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F9F8FF', borderBottomWidth: 1, borderBottomColor: '#EDE9FE' },
//   refillColText:   { fontSize: 12, fontWeight: '700', color: C.purple },
//   refillRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   refillItemName:  { fontSize: 13, color: '#374151', fontWeight: '500' },
//   refillUnit:      { fontSize: 12, color: C.textSecond },
//   refillInput:     { width: 68, borderWidth: 1.5, borderColor: C.purpleLight, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, fontSize: 14, color: C.textPrimary, textAlign: 'center', backgroundColor: '#F9F8FF' },
// });



// // app/dashboard/housekeeping/index.tsx
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   StyleSheet, Text, View, TouchableOpacity, FlatList,
//   ActivityIndicator, Alert, RefreshControl, Modal, Animated,
//   ScrollView, TextInput, Dimensions, Image,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker';
// import DashboardHeader from '@/components/HeaderWithMenu';
// import {
//   getRooms, getChecklistByRoom, getChecklistTemplate, saveChecklist,
//   getFinalizeTemplate, saveFinalize, getRoomStatusColor, getTimeAgo,
//   resolveImageUrl,
//   Room, RoomChecklist, ChecklistImage,
//   TemplateHousekeepingItem, FinalizeTemplate,
// } from '@/services/housekeepingService';
// import bookingCalendarService from '@/services/bookingCalendar';

// const { width, height } = Dimensions.get('window');
// type TabType    = 'rooms' | 'other';
// type FilterType = 'all' | 'occupied' | 'clean' | 'dirty' | 'touch_up' | 'need_clean' | 'repair' | 'pending';

// // Base URL for image fallback (update to match your server)
// const IMAGE_BASE_URL = 'https://your-domain.com/storage';

// const C = {
//   purple:      '#6B5B95',
//   purpleLight: '#EDE9FE',
//   purpleDark:  '#4C3D7A',
//   gold:        '#C8A84B',
//   goldLight:   '#FEF3C7',
//   goldDark:    '#A07830',
//   amber:       '#D97706',
//   red:         '#EF4444',
//   green:       '#10B981',
//   blue:        '#3B82F6',
//   blueLight:   '#DBEAFE',
//   violet:      '#8B5CF6',
//   violetLight: '#EDE9FE',
//   bg:          '#F3F4F6',
//   white:       '#FFFFFF',
//   border:      '#E5E7EB',
//   textPrimary: '#111827',
//   textSecond:  '#6B7280',
//   textMuted:   '#9CA3AF',
// };

// // ─── Info row ──────────────────────────────────────────────────────────────────
// const InfoRow = ({ label, value, icon, valueColor, isLast }: {
//   label: string; value: string;
//   icon: React.ComponentProps<typeof Ionicons>['name'];
//   valueColor?: string; isLast?: boolean;
// }) => (
//   <View style={[s.infoRow, !isLast && s.infoRowBorder]}>
//     <View style={s.infoLeft}>
//       <Ionicons name={icon} size={15} color={C.purple} />
//       <Text style={s.infoLabel}>{label} :</Text>
//     </View>
//     <Text style={[s.infoValue, valueColor ? { color: valueColor, fontWeight: '700' } : {}]}>{value}</Text>
//   </View>
// );

// // ─── Server image gallery ──────────────────────────────────────────────────────
// const ImageGallery = ({ images }: { images: ChecklistImage[] }) => {
//   const [fsIdx, setFsIdx] = useState<number | null>(null);
//   if (!images?.length) return null;

//   return (
//     <View style={s.imageCard}>
//       <View style={s.imgHeader}>
//         <Ionicons name="images-outline" size={16} color={C.purple} />
//         <Text style={s.imgTitle}>Checklist Images ({images.length})</Text>
//       </View>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//         {images.map((img, idx) => {
//           const uri = resolveImageUrl(img, IMAGE_BASE_URL);
//           return (
//             <TouchableOpacity key={img.id} onPress={() => setFsIdx(idx)}
//               style={[s.thumbWrap, { marginLeft: idx === 0 ? 0 : 8 }]} activeOpacity={0.85}>
//               <Image source={{ uri }} style={s.thumb} resizeMode="cover" />
//               <View style={s.expandIcon}><Ionicons name="expand-outline" size={12} color="#fff" /></View>
//             </TouchableOpacity>
//           );
//         })}
//       </ScrollView>
//       <Modal visible={fsIdx !== null} transparent animationType="fade" onRequestClose={() => setFsIdx(null)}>
//         <View style={s.fsOverlay}>
//           <TouchableOpacity style={s.fsClose} onPress={() => setFsIdx(null)}>
//             <Ionicons name="close-circle" size={40} color="#fff" />
//           </TouchableOpacity>
//           {fsIdx !== null && (
//             <>
//               <Image
//                 source={{ uri: resolveImageUrl(images[fsIdx], IMAGE_BASE_URL) }}
//                 style={{ width, height: width * 1.3 }} resizeMode="contain" />
//               <Text style={s.fsCounter}>{fsIdx + 1} / {images.length}</Text>
//               {images.length > 1 && (
//                 <View style={s.fsNav}>
//                   <TouchableOpacity
//                     onPress={() => setFsIdx(i => (i! > 0 ? i! - 1 : images.length - 1))}
//                     style={s.fsNavBtn}>
//                     <Ionicons name="chevron-back" size={28} color="#fff" />
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     onPress={() => setFsIdx(i => (i! < images.length - 1 ? i! + 1 : 0))}
//                     style={s.fsNavBtn}>
//                     <Ionicons name="chevron-forward" size={28} color="#fff" />
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </>
//           )}
//         </View>
//       </Modal>
//     </View>
//   );
// };

// // ─── Local image strip ─────────────────────────────────────────────────────────
// interface LocalImage { uri: string; name: string; type: string; }
// const LocalImageStrip = ({ images, onAdd, onRemove }: {
//   images: LocalImage[]; onAdd: () => void; onRemove: (i: number) => void;
// }) => (
//   <View>
//     <View style={s.imgHeader}>
//       <Ionicons name="camera-outline" size={16} color={C.purple} />
//       <Text style={s.imgTitle}>Add Photos</Text>
//     </View>
//     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//       <TouchableOpacity onPress={onAdd} style={s.addPhotoBtn} activeOpacity={0.75}>
//         <Ionicons name="add" size={26} color={C.purple} />
//         <Text style={s.addPhotoText}>Add</Text>
//       </TouchableOpacity>
//       {images.map((img, idx) => (
//         <View key={idx} style={[s.thumbWrap, { marginLeft: 8 }]}>
//           <Image source={{ uri: img.uri }} style={s.thumb} resizeMode="cover" />
//           <TouchableOpacity style={s.removeBtn} onPress={() => onRemove(idx)}
//             hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
//             <Ionicons name="close-circle" size={20} color={C.red} />
//           </TouchableOpacity>
//         </View>
//       ))}
//     </ScrollView>
//   </View>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // VIEW CHECKLIST MODAL
// // ─────────────────────────────────────────────────────────────────────────────
// const ChecklistDetailModal: React.FC<{
//   visible: boolean; room: Room | null; checklist: RoomChecklist | null;
//   checklistLoading: boolean; onClose: () => void;
// }> = ({ visible, room, checklist, checklistLoading, onClose }) => {
//   const slideAnim = useRef(new Animated.Value(height)).current;
//   useEffect(() => {
//     if (visible) Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
//     else Animated.timing(slideAnim, { toValue: height, duration: 280, useNativeDriver: true }).start();
//   }, [visible]);
//   if (!room) return null;

//   const statusInfo = getRoomStatusColor(room);
//   const items  = checklist?.check_list_detail ?? [];
//   const images = checklist?.check_list_image   ?? [];
//   const issueCount = items.filter(i => i.housekeeper_status === 'No').length;
//   const hkName = checklist?.housekeeper
//     ? `${checklist.housekeeper.name} ${checklist.housekeeper.lname}`.trim() : '—';
//   const svName = checklist?.supervisor
//     ? `${checklist.supervisor.name} ${checklist.supervisor.lname}`.trim() : '—';

//   return (
//     <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
//       <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
//       <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
//         <LinearGradient colors={[C.purple, '#8B7BAF']} style={s.gradHeader}>
//           <View style={s.handle} />
//           <View style={s.headerRow}>
//             <View style={{ flex: 1 }}>
//               <Text style={s.headerSub}>{room.room_category?.custome_name || room.room_category?.category}</Text>
//               <Text style={s.headerTitle}>Room {room.room_number} — Checklist</Text>
//             </View>
//             <TouchableOpacity onPress={onClose} style={s.closeBtn}>
//               <Ionicons name="close" size={22} color="#fff" />
//             </TouchableOpacity>
//           </View>
//           <View style={s.badgeRow}>
//             <View style={[s.badge, { backgroundColor: statusInfo.bg }]}>
//               <Text style={[s.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
//             </View>
//             {issueCount > 0 && (
//               <View style={[s.badge, { backgroundColor: '#FEE2E2' }]}>
//                 <Ionicons name="warning-outline" size={12} color={C.red} />
//                 <Text style={[s.badgeText, { color: C.red }]}>
//                   {issueCount} Issue{issueCount !== 1 ? 's' : ''}
//                 </Text>
//               </View>
//             )}
//           </View>
//         </LinearGradient>

//         <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 40 }}>
//           {checklistLoading ? (
//             <View style={[s.centered, { paddingVertical: 60 }]}>
//               <ActivityIndicator size="large" color={C.purple} />
//               <Text style={s.loadText}>Loading checklist...</Text>
//             </View>
//           ) : !checklist ? (
//             <View style={[s.empty, { paddingVertical: 60 }]}>
//               <Ionicons name="document-outline" size={52} color="#D1D5DB" />
//               <Text style={s.emptyTitle}>No Checklist Found</Text>
//               <Text style={s.emptyText}>No finalized checklist for this room yet</Text>
//             </View>
//           ) : (
//             <>
//               <View style={s.infoCard}>
//                 <InfoRow icon="person-outline"           label="Checked"    value={hkName} />
//                 <InfoRow icon="shield-checkmark-outline" label="Supervised" value={svName} />
//                 <InfoRow icon="home-outline" label="Status" value={checklist.room_status || '—'}
//                   valueColor={checklist.room_status === 'Ready' ? C.green : C.red} />
//                 <InfoRow icon="alert-circle-outline" label="Issues" value={String(issueCount)}
//                   valueColor={issueCount > 0 ? C.red : C.green} isLast />
//               </View>
//               <View style={s.tableCard}>
//                 <View style={s.tableHead}>
//                   <Text style={[s.tableHeadCell, { flex: 3 }]}>Item Name</Text>
//                   <Text style={[s.tableHeadCell, { flex: 1, textAlign: 'right' }]}>HK Status</Text>
//                 </View>
//                 {items.length === 0
//                   ? <View style={s.tableCenter}>
//                       <Ionicons name="list-outline" size={36} color="#D1D5DB" />
//                       <Text style={s.helperText}>No items</Text>
//                     </View>
//                   : items.map((item, idx) => {
//                     const isNo = item.housekeeper_status === 'No';
//                     return (
//                       <View key={item.id}
//                         style={[s.tableRow, idx % 2 !== 0 && s.rowOdd, isNo && s.rowFail]}>
//                         <View style={[s.cell, { flex: 3, gap: 5 }]}>
//                           {isNo && <View style={s.redDot} />}
//                           <Text style={[s.cellText, isNo && s.cellFail]} numberOfLines={3}>
//                             {item.housekeeping?.item_name ?? '—'}
//                           </Text>
//                         </View>
//                         <View style={[s.cell, { flex: 1, justifyContent: 'flex-end' }]}>
//                           <View style={[s.pill, { backgroundColor: isNo ? '#FEE2E2' : '#D1FAE5' }]}>
//                             <Text style={[s.pillText, { color: isNo ? C.red : C.green }]}>
//                               {item.housekeeper_status || '—'}
//                             </Text>
//                           </View>
//                         </View>
//                       </View>
//                     );
//                   })
//                 }
//               </View>
//               {images.length > 0 && <ImageGallery images={images} />}
//             </>
//           )}
//         </ScrollView>
//       </Animated.View>
//     </Modal>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // NEW CHECKLIST MODAL
// // ─────────────────────────────────────────────────────────────────────────────
// interface NewChecklistModalProps {
//   visible: boolean; room: Room | null;
//   onClose: () => void; onSuccess: () => void;
//   onGoFinalize: (room: Room) => void;
// }

// const NewChecklistModal: React.FC<NewChecklistModalProps> = ({
//   visible, room, onClose, onSuccess, onGoFinalize,
// }) => {
//   const slideAnim = useRef(new Animated.Value(height)).current;
//   const [tmplLoading, setTmplLoading] = useState(false);
//   const [saving,      setSaving]      = useState(false);
//   const [items,       setItems]       = useState<TemplateHousekeepingItem[]>([]);
//   const [answers,     setAnswers]     = useState<Record<number, 'Yes' | 'No' | null>>({});
//   const [noTemplate,  setNoTemplate]  = useState(false);
//   const [localImages, setLocalImages] = useState<LocalImage[]>([]);
//   const [showPopup,   setShowPopup]   = useState(false);

//   useEffect(() => {
//     if (visible) Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
//     else Animated.timing(slideAnim, { toValue: height, duration: 280, useNativeDriver: true }).start();
//   }, [visible]);

//   useEffect(() => { if (visible && room) loadTemplate(); }, [visible, room]);

//   const loadTemplate = async () => {
//     if (!room) return;
//     setTmplLoading(true); setNoTemplate(false); setItems([]); setAnswers({});
//     setLocalImages([]); setShowPopup(false);
//     try {
//       const tmpl = await getChecklistTemplate(room.id);
//       if (!tmpl || !tmpl.housekeeping_items.length) { setNoTemplate(true); return; }
//       setItems(tmpl.housekeeping_items);
//       const init: Record<number, 'Yes' | 'No' | null> = {};
//       tmpl.housekeeping_items.forEach(i => { init[i.id] = null; });
//       setAnswers(init);
//     } catch { setNoTemplate(true); }
//     finally { setTmplLoading(false); }
//   };

//   const toggle = (id: number, val: 'Yes' | 'No') =>
//     setAnswers(prev => ({ ...prev, [id]: prev[id] === val ? null : val }));

//   const pickImage = async () => {
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true, quality: 0.8,
//     });
//     if (!res.canceled)
//       setLocalImages(prev => [...prev, ...res.assets.map(a => ({
//         uri: a.uri,
//         name: a.fileName || `img_${Date.now()}.jpg`,
//         type: a.mimeType || 'image/jpeg',
//       }))]);
//   };

//   const handleViewChecklist = () => {
//     const unanswered = items.filter(i => answers[i.id] === null).length;
//     if (unanswered > 0) {
//       Alert.alert('Incomplete', `Please answer all ${unanswered} remaining item(s).`);
//       return;
//     }
//     setShowPopup(true);
//   };

//   const handleSave = async () => {
//     if (!room) return;
//     setShowPopup(false);
//     setSaving(true);
//     try {
//       await saveChecklist({
//         location_id: room.id, type: 'room',
//         check_list_items: items.map(i => ({
//           housekeeping_id: i.id,
//           status: answers[i.id] as 'Yes' | 'No',
//         })),
//         images: localImages.length > 0 ? localImages : undefined,
//       });
//       onSuccess();
//       onClose();
//       setTimeout(() => onGoFinalize(room), 400);
//     } catch (e: any) {
//       Alert.alert('Error', e?.response?.data?.message || 'Failed to save checklist');
//     } finally { setSaving(false); }
//   };

//   if (!room) return null;
//   const answeredCount = items.filter(i => answers[i.id] !== null).length;
//   const progress      = items.length > 0 ? answeredCount / items.length : 0;
//   const yesCount      = items.filter(i => answers[i.id] === 'Yes').length;
//   const noCount       = items.filter(i => answers[i.id] === 'No').length;

//   return (
//     <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
//       <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
//       <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>

//         <LinearGradient colors={[C.purple, C.purpleDark]} style={s.gradHeader}>
//           <View style={s.handle} />
//           <View style={s.headerRow}>
//             <View style={{ flex: 1 }}>
//               <Text style={s.headerSub}>{room.room_category?.custome_name || room.room_category?.category}</Text>
//               <Text style={s.headerTitle}>Room {room.room_number} — New Checklist</Text>
//             </View>
//             <TouchableOpacity onPress={onClose} style={s.closeBtn}>
//               <Ionicons name="close" size={22} color="#fff" />
//             </TouchableOpacity>
//           </View>
//           {items.length > 0 && (
//             <View style={s.progressWrap}>
//               <View style={s.progressTrack}>
//                 <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
//               </View>
//               <Text style={s.progressLabel}>{answeredCount}/{items.length} answered</Text>
//             </View>
//           )}
//         </LinearGradient>

//         <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 130 }}>
//           {tmplLoading ? (
//             <View style={[s.centered, { paddingVertical: 60 }]}>
//               <ActivityIndicator size="large" color={C.purple} />
//               <Text style={s.loadText}>Loading checklist items...</Text>
//             </View>
//           ) : noTemplate ? (
//             <View style={[s.empty, { paddingVertical: 60 }]}>
//               <Ionicons name="alert-circle-outline" size={52} color="#D1D5DB" />
//               <Text style={s.emptyTitle}>No Template Found</Text>
//               <Text style={s.emptyText}>No checklist layout assigned to this room</Text>
//             </View>
//           ) : (
//             <>
//               <View style={s.statsRow}>
//                 <View style={[s.statBox, { backgroundColor: C.purpleLight }]}>
//                   <Text style={[s.statNum, { color: C.purple }]}>{yesCount}</Text>
//                   <Text style={[s.statLabel, { color: C.purpleDark }]}>Yes</Text>
//                 </View>
//                 <View style={[s.statBox, { backgroundColor: C.goldLight }]}>
//                   <Text style={[s.statNum, { color: C.goldDark }]}>{noCount}</Text>
//                   <Text style={[s.statLabel, { color: C.goldDark }]}>No</Text>
//                 </View>
//                 <View style={[s.statBox, { backgroundColor: '#F3F4F6' }]}>
//                   <Text style={[s.statNum, { color: C.textSecond }]}>{items.length - answeredCount}</Text>
//                   <Text style={[s.statLabel, { color: C.textSecond }]}>Pending</Text>
//                 </View>
//               </View>

//               <View style={s.tableCard}>
//                 <View style={[s.tableHead, { backgroundColor: C.purpleLight }]}>
//                   <Text style={[s.tableHeadCell, { flex: 3 }]}>Item Name</Text>
//                   <Text style={[s.tableHeadCell, { flex: 2, textAlign: 'center' }]}>Yes / No</Text>
//                 </View>
//                 {items.map((item, idx) => {
//                   const ans = answers[item.id];
//                   const isNo = ans === 'No'; const isYes = ans === 'Yes';
//                   return (
//                     <View key={item.id}
//                       style={[s.tableRow, idx % 2 !== 0 && s.rowOdd,
//                         isNo && s.rowFail, isYes && s.rowPass]}>
//                       <View style={[s.cell, { flex: 3, gap: 5 }]}>
//                         {ans === null && <View style={s.greyDot} />}
//                         {isNo  && <View style={s.redDot} />}
//                         {isYes && (
//                           <Ionicons name="checkmark-circle" size={13} color={C.purple}
//                             style={{ marginRight: 2 }} />
//                         )}
//                         <Text style={[s.cellText, isNo && s.cellFail,
//                           isYes && { color: C.purpleDark }]} numberOfLines={3}>
//                           {item.item_name}
//                         </Text>
//                       </View>
//                       <View style={[s.cell, { flex: 2, justifyContent: 'center', gap: 7 }]}>
//                         <TouchableOpacity
//                           style={[s.ansBtn, { borderColor: C.purple },
//                             isYes && { backgroundColor: C.purple }]}
//                           onPress={() => toggle(item.id, 'Yes')}>
//                           <Text style={[s.ansBtnText, { color: isYes ? '#fff' : C.purple }]}>Yes</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           style={[s.ansBtn, { borderColor: C.gold },
//                             isNo && { backgroundColor: C.gold }]}
//                           onPress={() => toggle(item.id, 'No')}>
//                           <Text style={[s.ansBtnText, { color: isNo ? '#fff' : C.gold }]}>No</Text>
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   );
//                 })}
//               </View>

//               <View style={[s.imageCard, { marginTop: 14 }]}>
//                 <LocalImageStrip images={localImages} onAdd={pickImage}
//                   onRemove={i => setLocalImages(prev => prev.filter((_, idx) => idx !== i))} />
//               </View>
//             </>
//           )}
//         </ScrollView>

//         {!tmplLoading && !noTemplate && items.length > 0 && (
//           <View style={s.btnWrap}>
//             <LinearGradient colors={[C.purple, C.purpleDark]} style={s.gradBtn}
//               start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
//               <TouchableOpacity style={s.gradBtnInner} onPress={handleViewChecklist} disabled={saving}>
//                 {saving ? <ActivityIndicator size="small" color="#fff" /> : (
//                   <>
//                     <Ionicons name="list-outline" size={19} color="#fff" />
//                     <Text style={s.gradBtnText}>View Check List</Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </LinearGradient>
//           </View>
//         )}
//       </Animated.View>

//       {/* ── Confirm Popup ── */}
//       <Modal visible={showPopup} transparent animationType="fade"
//         onRequestClose={() => setShowPopup(false)}>
//         <View style={s.popupOverlay}>
//           <View style={s.popupSheet}>
//             <LinearGradient colors={[C.gold, C.goldDark]} style={s.popupHeader}>
//               <Text style={s.popupTitle}>Checklist Summary</Text>
//               <Text style={s.popupSub}>Room {room.room_number} — confirm before saving</Text>
//             </LinearGradient>

//             <ScrollView style={s.popupScroll} showsVerticalScrollIndicator={false}>
//               <View style={[s.tableHead, { marginHorizontal: 0 }]}>
//                 <Text style={[s.tableHeadCell, { flex: 3 }]}>Item</Text>
//                 <Text style={[s.tableHeadCell, { flex: 1, textAlign: 'center' }]}>Status</Text>
//               </View>
//               {items.map((item, idx) => {
//                 const ans = answers[item.id]; const isNo = ans === 'No';
//                 return (
//                   <View key={item.id}
//                     style={[s.tableRow, idx % 2 !== 0 && s.rowOdd,
//                       isNo && s.rowFail, { paddingHorizontal: 12 }]}>
//                     <View style={[s.cell, { flex: 3, gap: 4 }]}>
//                       {isNo && <View style={s.redDot} />}
//                       <Text style={[s.cellText, isNo && s.cellFail]} numberOfLines={2}>
//                         {item.item_name}
//                       </Text>
//                     </View>
//                     <View style={[s.cell, { flex: 1, justifyContent: 'center' }]}>
//                       <View style={[s.pill, { backgroundColor: isNo ? '#FEE2E2' : C.purpleLight }]}>
//                         <Text style={[s.pillText, { color: isNo ? C.red : C.purple }]}>
//                           {ans || '—'}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                 );
//               })}
//               {localImages.length > 0 && (
//                 <View style={{ padding: 12 }}>
//                   <Text style={[s.imgTitle, { marginBottom: 6, fontSize: 12 }]}>
//                     📷 {localImages.length} photo{localImages.length > 1 ? 's' : ''} attached
//                   </Text>
//                   <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                     {localImages.map((img, i) => (
//                       <Image key={i} source={{ uri: img.uri }}
//                         style={[s.thumb, { marginRight: 6, borderRadius: 8 }]} resizeMode="cover" />
//                     ))}
//                   </ScrollView>
//                 </View>
//               )}
//             </ScrollView>

//             <View style={s.popupBtns}>
//               <TouchableOpacity style={[s.popupBtn, { backgroundColor: '#E5E7EB' }]}
//                 onPress={() => setShowPopup(false)}>
//                 <Ionicons name="close-outline" size={16} color={C.textSecond} />
//                 <Text style={[s.popupBtnText, { color: C.textSecond }]}>Cancel</Text>
//               </TouchableOpacity>
//               <LinearGradient colors={[C.gold, C.goldDark]} style={s.popupBtnGrad}
//                 start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
//                 <TouchableOpacity style={s.popupBtnInner} onPress={handleSave}>
//                   <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
//                   <Text style={[s.popupBtnText, { color: '#fff' }]}>Save Check List</Text>
//                 </TouchableOpacity>
//               </LinearGradient>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </Modal>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // FINALIZE CHECKLIST MODAL
// // FIX: items are loaded from API only — no duplication
// // ─────────────────────────────────────────────────────────────────────────────
// interface FinalizeModalProps {
//   visible: boolean; room: Room | null;
//   onClose: () => void; onSuccess: () => void;
// }

// const FinalizeChecklistModal: React.FC<FinalizeModalProps> = ({
//   visible, room, onClose, onSuccess,
// }) => {
//   const slideAnim = useRef(new Animated.Value(height)).current;
//   const [loading,      setLoading]      = useState(false);
//   const [saving,       setSaving]       = useState(false);
//   const [template,     setTemplate]     = useState<FinalizeTemplate | null>(null);
//   const [noPending,    setNoPending]    = useState(false);
//   const [roomStatus,   setRoomStatus]   = useState<'Ready' | 'Not Ready' | null>(null);
//   // KEY FIX: use detail item `id` (not housekeeping_id) as key — avoids duplicates
//   const [svAnswers,    setSvAnswers]    = useState<Record<number, 'Yes' | 'No' | null>>({});
//   const [reasons,      setReasons]      = useState<Record<number, string>>({});
//   const [refillingQty, setRefillingQty] = useState<Record<number, string>>({});
//   const [localImages,  setLocalImages]  = useState<LocalImage[]>([]);

//   useEffect(() => {
//     if (visible) Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
//     else Animated.timing(slideAnim, { toValue: height, duration: 280, useNativeDriver: true }).start();
//   }, [visible]);

//   // Reset & load fresh when modal opens for a room
//   useEffect(() => {
//     if (visible && room) {
//       loadTemplate();
//     }
//     if (!visible) {
//       // Reset all state when closed to avoid stale data next open
//       setTemplate(null);
//       setNoPending(false);
//       setRoomStatus(null);
//       setSvAnswers({});
//       setReasons({});
//       setRefillingQty({});
//       setLocalImages([]);
//     }
//   }, [visible, room?.id]); // depend on room.id so re-loads if room changes

//   const loadTemplate = async () => {
//     if (!room) return;
//     setLoading(true);
//     setNoPending(false);
//     setTemplate(null);
//     setRoomStatus(null);
//     setSvAnswers({});
//     setReasons({});
//     setRefillingQty({});
//     setLocalImages([]);
//     try {
//       const tmpl = await getFinalizeTemplate(room.id);
//       if (!tmpl) { setNoPending(true); return; }
//       setTemplate(tmpl);

//       // Pre-fill supervisor answers:
//       // HK Yes → SV Yes automatically
//       // HK No  → null (supervisor must explicitly decide)
//       const init: Record<number, 'Yes' | 'No' | null> = {};
//       // Use detail item `id` as key (unique per item in this checklist)
//       tmpl.checklist.check_list_detail.forEach(d => {
//         init[d.id] = d.housekeeper_status === 'Yes' ? 'Yes' : null;
//       });
//       setSvAnswers(init);
//     } catch {
//       setNoPending(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleSv = (detailId: number, val: 'Yes' | 'No') => {
//     setSvAnswers(prev => ({ ...prev, [detailId]: prev[detailId] === val ? null : val }));
//     if (val === 'Yes') setReasons(prev => { const n = { ...prev }; delete n[detailId]; return n; });
//   };

//   const pickImage = async () => {
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true, quality: 0.8,
//     });
//     if (!res.canceled)
//       setLocalImages(prev => [...prev, ...res.assets.map(a => ({
//         uri: a.uri,
//         name: a.fileName || `img_${Date.now()}.jpg`,
//         type: a.mimeType || 'image/jpeg',
//       }))]);
//   };

//   const handleSave = async () => {
//     if (!room || !template) return;
//     const details    = template.checklist.check_list_detail;
//     const unanswered = details.filter(d => svAnswers[d.id] === null);
//     if (unanswered.length > 0) {
//       Alert.alert('Incomplete', `Please review all ${unanswered.length} remaining item(s).`);
//       return;
//     }
//     if (!roomStatus) {
//       Alert.alert('Room Status', 'Please select Room Status (Ready / Not Ready).');
//       return;
//     }
//     setSaving(true);
//     try {
//       const refillingUsages = template.refilling_items
//         .filter(r => refillingQty[r.id] && Number(refillingQty[r.id]) > 0)
//         .map(r => ({ refilling_item_id: r.id, quantity: Number(refillingQty[r.id]) }));

//       await saveFinalize(
//         template.checklist.id,
//         {
//           type: 'room', room_status: roomStatus,
//           items: details.map(d => ({
//             detail_id: d.id,
//             supervisor_status: svAnswers[d.id] as 'Yes' | 'No',
//             ...(reasons[d.id] ? { reason: reasons[d.id] } : {}),
//           })),
//           ...(refillingUsages.length > 0 ? { refilling_usages: refillingUsages } : {}),
//         },
//         localImages.length > 0 ? localImages : undefined,
//       );
//       Alert.alert('Success', 'Checklist finalized successfully!');
//       onSuccess();
//       onClose();
//     } catch (e: any) {
//       Alert.alert('Error', e?.response?.data?.message || 'Failed to finalize checklist');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!room) return null;

//   // Use template state directly — single source of truth, no duplication
//   const details        = template?.checklist.check_list_detail ?? [];
//   const svImages       = template?.checklist.check_list_image   ?? [];
//   const refillingItems = template?.refilling_items ?? [];
//   const answeredCount  = details.filter(d => svAnswers[d.id] !== null).length;
//   const progress       = details.length > 0 ? answeredCount / details.length : 0;
//   const hkName         = template?.checklist.housekeeper
//     ? `${template.checklist.housekeeper.name} ${template.checklist.housekeeper.lname}`.trim() : '—';

//   const pendingReviewCount = details.filter(d =>
//     d.housekeeper_status === 'No' && svAnswers[d.id] === null
//   ).length;

//   return (
//     <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
//       <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
//       <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>

//         <LinearGradient colors={[C.gold, C.amber]} style={s.gradHeader}>
//           <View style={s.handle} />
//           <View style={s.headerRow}>
//             <View style={{ flex: 1 }}>
//               <Text style={s.headerSub}>{room.room_category?.custome_name || room.room_category?.category}</Text>
//               <Text style={s.headerTitle}>Room {room.room_number} — Finalize</Text>
//             </View>
//             <TouchableOpacity onPress={onClose} style={s.closeBtn}>
//               <Ionicons name="close" size={22} color="#fff" />
//             </TouchableOpacity>
//           </View>
//           {details.length > 0 && (
//             <View style={s.progressWrap}>
//               <View style={s.progressTrack}>
//                 <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
//               </View>
//               <Text style={s.progressLabel}>{answeredCount}/{details.length} reviewed</Text>
//             </View>
//           )}
//         </LinearGradient>

//         <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 130 }}>
//           {loading ? (
//             <View style={[s.centered, { paddingVertical: 60 }]}>
//               <ActivityIndicator size="large" color={C.gold} />
//               <Text style={s.loadText}>Loading pending checklist...</Text>
//             </View>
//           ) : noPending ? (
//             <View style={[s.empty, { paddingVertical: 60 }]}>
//               <Ionicons name="checkmark-done-circle-outline" size={52} color="#D1D5DB" />
//               <Text style={s.emptyTitle}>No Pending Checklist</Text>
//               <Text style={s.emptyText}>There is no pending checklist to finalize for this room</Text>
//             </View>
//           ) : (
//             <>
//               <View style={s.infoCard}>
//                 <InfoRow icon="person-outline"   label="Housekeeper" value={hkName} />
//                 <InfoRow icon="document-outline" label="CL Status"   value={template?.checklist.status || '—'} />
//                 <InfoRow icon="checkmark-circle-outline" label="Pre-filled"
//                   value="HK Yes items auto-filled" isLast />
//               </View>

//               {pendingReviewCount > 0 && (
//                 <View style={s.reviewAlert}>
//                   <Ionicons name="alert-circle-outline" size={16} color={C.amber} />
//                   <Text style={s.reviewAlertText}>
//                     {pendingReviewCount} item{pendingReviewCount > 1 ? 's' : ''} marked No by HK — please review
//                   </Text>
//                 </View>
//               )}

//               {/* Room Status */}
//               <View style={s.statusCard}>
//                 <Text style={s.statusCardTitle}>Room Status</Text>
//                 <View style={s.statusBtnRow}>
//                   {(['Ready', 'Not Ready'] as const).map(s2 => (
//                     <TouchableOpacity key={s2}
//                       style={[s.statusBtn,
//                         roomStatus === s2 && {
//                           backgroundColor: s2 === 'Ready' ? C.purple : C.red,
//                           borderColor: s2 === 'Ready' ? C.purple : C.red,
//                         }]}
//                       onPress={() => setRoomStatus(s2)}>
//                       <Ionicons
//                         name={s2 === 'Ready' ? 'checkmark-circle-outline' : 'close-circle-outline'}
//                         size={15}
//                         color={roomStatus === s2 ? '#fff' : s2 === 'Ready' ? C.purple : C.red} />
//                       <Text style={[s.statusBtnText,
//                         { color: roomStatus === s2 ? '#fff' : s2 === 'Ready' ? C.purple : C.red }]}>
//                         {s2}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>

//               {/* Supervisor review table — renders details array ONCE */}
//               <View style={s.tableCard}>
//                 <View style={[s.tableHead, { backgroundColor: C.goldLight }]}>
//                   <Text style={[s.tableHeadCell, { flex: 3, color: '#92400E' }]}>Item Name</Text>
//                   <Text style={[s.tableHeadCell, { flex: 1, color: '#92400E', fontSize: 11 }]}>HK</Text>
//                   <Text style={[s.tableHeadCell, { flex: 2, textAlign: 'center', color: '#92400E' }]}>
//                     Supervisor
//                   </Text>
//                 </View>
//                 {details.map((item, idx) => {
//                   // Use detail item `id` — guaranteed unique within this checklist
//                   const sv   = svAnswers[item.id];
//                   const hkNo = item.housekeeper_status === 'No';
//                   const svNo = sv === 'No';
//                   const svYes = sv === 'Yes';
//                   return (
//                     <View key={`detail-${item.id}`}>
//                       <View style={[s.tableRow, idx % 2 !== 0 && s.rowOdd,
//                         svNo && s.rowFail, svYes && s.rowPass,
//                         (hkNo && sv === null) && s.rowNeedsReview]}>
//                         <View style={[s.cell, { flex: 3, gap: 4 }]}>
//                           {hkNo && <View style={[s.redDot, { backgroundColor: C.gold }]} />}
//                           <Text style={[s.cellText, svNo && s.cellFail]} numberOfLines={2}>
//                             {item.housekeeping?.item_name ?? '—'}
//                           </Text>
//                         </View>
//                         <View style={[s.cell, { flex: 1 }]}>
//                           <View style={[s.pill, {
//                             backgroundColor: hkNo ? '#FEE2E2' : '#D1FAE5', paddingHorizontal: 5,
//                           }]}>
//                             <Text style={[s.pillText, {
//                               fontSize: 10, color: hkNo ? C.red : C.green,
//                             }]}>{item.housekeeper_status || '—'}</Text>
//                           </View>
//                         </View>
//                         <View style={[s.cell, { flex: 2, justifyContent: 'center', gap: 6 }]}>
//                           <TouchableOpacity
//                             style={[s.ansBtn, { borderColor: C.purple, paddingHorizontal: 9 },
//                               svYes && { backgroundColor: C.purple }]}
//                             onPress={() => toggleSv(item.id, 'Yes')}>
//                             <Text style={[s.ansBtnText, { color: svYes ? '#fff' : C.purple }]}>Yes</Text>
//                           </TouchableOpacity>
//                           <TouchableOpacity
//                             style={[s.ansBtn, { borderColor: C.gold, paddingHorizontal: 9 },
//                               svNo && { backgroundColor: C.gold }]}
//                             onPress={() => toggleSv(item.id, 'No')}>
//                             <Text style={[s.ansBtnText, { color: svNo ? '#fff' : C.gold }]}>No</Text>
//                           </TouchableOpacity>
//                         </View>
//                       </View>
//                       {svNo && (
//                         <View style={s.reasonRow}>
//                           <Ionicons name="create-outline" size={13} color={C.textMuted} />
//                           <TextInput
//                             style={s.reasonInput}
//                             placeholder="Reason (optional)"
//                             placeholderTextColor="#D1D5DB"
//                             value={reasons[item.id] || ''}
//                             onChangeText={t => setReasons(prev => ({ ...prev, [item.id]: t }))} />
//                         </View>
//                       )}
//                     </View>
//                   );
//                 })}
//               </View>

//               {/* Refill items */}
//               {refillingItems.length > 0 && (
//                 <View style={s.refillCard}>
//                   <View style={s.refillHeader}>
//                     <Ionicons name="cube-outline" size={16} color={C.purple} />
//                     <Text style={s.refillTitle}>Refill Items</Text>
//                   </View>
//                   <View style={s.refillColHeader}>
//                     <Text style={[s.refillColText, { flex: 2 }]}>Item Name</Text>
//                     <Text style={[s.refillColText, { flex: 1, textAlign: 'center' }]}>Unit</Text>
//                     <Text style={[s.refillColText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
//                   </View>
//                   {refillingItems.map((r, idx) => (
//                     <View key={`refill-${r.id}`}
//                       style={[s.refillRow, idx % 2 !== 0 && { backgroundColor: '#FAFAFA' }]}>
//                       <Text style={[s.refillItemName, { flex: 2 }]} numberOfLines={2}>
//                         {r.item?.item ?? '—'}
//                       </Text>
//                       <Text style={[s.refillUnit, { flex: 1, textAlign: 'center' }]}>
//                         {r.item?.unit ?? '—'}
//                       </Text>
//                       <View style={{ flex: 1, alignItems: 'center' }}>
//                         <TextInput
//                           style={s.refillInput}
//                           placeholder="0"
//                           placeholderTextColor="#D1D5DB"
//                           keyboardType="numeric"
//                           value={refillingQty[r.id] || ''}
//                           onChangeText={t => setRefillingQty(prev => ({
//                             ...prev, [r.id]: t.replace(/[^0-9]/g, ''),
//                           }))} />
//                       </View>
//                     </View>
//                   ))}
//                 </View>
//               )}

//               {svImages.length > 0 && <ImageGallery images={svImages} />}

//               <View style={[s.imageCard, { marginTop: 14 }]}>
//                 <LocalImageStrip images={localImages} onAdd={pickImage}
//                   onRemove={i => setLocalImages(prev => prev.filter((_, idx) => idx !== i))} />
//               </View>
//             </>
//           )}
//         </ScrollView>

//         {!loading && !noPending && details.length > 0 && (
//           <View style={s.btnWrap}>
//             <LinearGradient colors={[C.gold, C.goldDark]} style={s.gradBtn}
//               start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
//               <TouchableOpacity style={s.gradBtnInner} onPress={handleSave} disabled={saving}>
//                 {saving ? <ActivityIndicator size="small" color="#fff" /> : (
//                   <>
//                     <Ionicons name="shield-checkmark-outline" size={19} color="#fff" />
//                     <Text style={s.gradBtnText}>Save Finalize</Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </LinearGradient>
//           </View>
//         )}
//       </Animated.View>
//     </Modal>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN PAGE
// // ─────────────────────────────────────────────────────────────────────────────
// const HousekeepingPage = () => {
//   const [activeTab,    setActiveTab]    = useState<TabType>('rooms');
//   const [rooms,        setRooms]        = useState<Room[]>([]);
//   const [filtered,     setFiltered]     = useState<Room[]>([]);
//   const [search,       setSearch]       = useState('');
//   const [statusFilter, setStatusFilter] = useState<FilterType>('all');
//   const [loading,      setLoading]      = useState(false);
//   const [refreshing,   setRefreshing]   = useState(false);

//   const [selectedRoom,     setSelectedRoom]     = useState<Room | null>(null);
//   const [showDetail,       setShowDetail]       = useState(false);
//   const [checklist,        setChecklist]        = useState<RoomChecklist | null>(null);
//   const [checklistLoading, setChecklistLoading] = useState(false);

//   const [showNewCL,    setShowNewCL]    = useState(false);
//   const [newCLRoom,    setNewCLRoom]    = useState<Room | null>(null);
//   const [showFinalize, setShowFinalize] = useState(false);
//   const [finalizeRoom, setFinalizeRoom] = useState<Room | null>(null);

//   const [dotRoom,     setDotRoom]     = useState<Room | null>(null);
//   const [showDotMenu, setShowDotMenu] = useState(false);
//   const dotAnim = useRef(new Animated.Value(0)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // ── Load rooms + inject booking data from calendar ──
//   const loadRooms = useCallback(async () => {
//     try {
//       setLoading(true);
//       const [roomsRes, calendarRes] = await Promise.allSettled([
//         getRooms(),
//         bookingCalendarService.getCalendarBookings(
//           new Date().toISOString().split('T')[0]
//         ),
//       ]);

//       let roomList: Room[] = [];
//       if (roomsRes.status === 'fulfilled' && roomsRes.value.status && roomsRes.value.rooms) {
//         roomList = roomsRes.value.rooms;
//       }

//       // Build a map: room_id → current booking for today
//       if (calendarRes.status === 'fulfilled' && calendarRes.value.categories) {
//         const todayStr = new Date().toISOString().split('T')[0];
//         const bookingMap: Record<number, Room['current_booking']> = {};

//         for (const cat of calendarRes.value.categories) {
//           for (const calRoom of cat.rooms) {
//             const roomId = calRoom.room_id;
//             // Find booking that covers today
//             const activeBooking = calRoom.bookings.find(b =>
//               b.start_date <= todayStr && b.end_date >= todayStr
//             );
//             if (activeBooking) {
//               bookingMap[roomId] = {
//                 booking_id: activeBooking.booking_id,
//                 guest_name: activeBooking.guest_name,
//                 start_date: activeBooking.start_date,
//                 end_date:   activeBooking.end_date,
//                 status:     activeBooking.status,
//               };
//             }
//           }
//         }

//         // Inject booking info into rooms
//         roomList = roomList.map(r => ({
//           ...r,
//           current_booking: bookingMap[r.id] ?? null,
//         }));
//       }

//       setRooms(roomList);
//     } catch {
//       Alert.alert('Error', 'Failed to load rooms');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//       Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
//     }
//   }, []);

//   useEffect(() => { loadRooms(); }, []);

//   useEffect(() => {
//     let list = [...rooms];
//     if (activeTab === 'other')
//       list = list.filter(r => r.room_category?.room_type?.toLowerCase() === 'other');
//     else
//       list = list.filter(r => r.room_category?.room_type?.toLowerCase() !== 'other');

//     if (search.trim()) {
//       const q = search.toLowerCase();
//       list = list.filter(r =>
//         r.room_number.toLowerCase().includes(q) ||
//         r.room_category?.custome_name?.toLowerCase().includes(q) ||
//         r.room_category?.category?.toLowerCase().includes(q));
//     }

//     if (statusFilter !== 'all') {
//       list = list.filter(r => {
//         const label = getRoomStatusColor(r).label;
//         if (statusFilter === 'occupied')   return label === 'Occupied';
//         if (statusFilter === 'clean')      return label === 'Clean';
//         if (statusFilter === 'dirty')      return label === 'Dirty';
//         if (statusFilter === 'touch_up')   return label === 'Need to Touch Up';
//         if (statusFilter === 'need_clean') return label === 'Need to Clean';
//         if (statusFilter === 'repair')     return label === 'Under Repair';
//         if (statusFilter === 'pending')    return label === 'Pending Review';
//         return true;
//       });
//     }
//     setFiltered(list);
//   }, [rooms, search, statusFilter, activeTab]);

//   const openDetail = async (room: Room) => {
//     setSelectedRoom(room); setChecklist(null); setShowDetail(true); setChecklistLoading(true);
//     try { setChecklist(await getChecklistByRoom(room.id)); }
//     catch (e) { console.error(e); }
//     finally { setChecklistLoading(false); }
//   };

//   const openDotMenu = (room: Room) => {
//     setDotRoom(room); setShowDotMenu(true);
//     dotAnim.setValue(0);
//     Animated.spring(dotAnim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }).start();
//   };
//   const closeDotMenu  = () => setShowDotMenu(false);
//   const closeDetail   = () => { setShowDetail(false);   setTimeout(() => { setSelectedRoom(null); setChecklist(null); }, 350); };
//   const openNewCL     = (room: Room) => { setNewCLRoom(room);    setShowNewCL(true);    };
//   const closeNewCL    = () => { setShowNewCL(false);    setTimeout(() => setNewCLRoom(null),    350); };
//   const openFinalize  = (room: Room) => { setFinalizeRoom(room); setShowFinalize(true); };
//   const closeFinalize = () => { setShowFinalize(false); setTimeout(() => setFinalizeRoom(null), 350); };
//   const handleGoFinalize = (room: Room) => openFinalize(room);

//   const stats = {
//     total:     rooms.length,
//     occupied:  rooms.filter(r => getRoomStatusColor(r).label === 'Occupied').length,
//     clean:     rooms.filter(r => getRoomStatusColor(r).label === 'Clean').length,
//     dirty:     rooms.filter(r => getRoomStatusColor(r).label === 'Dirty').length,
//     touchUp:   rooms.filter(r => getRoomStatusColor(r).label === 'Need to Touch Up').length,
//     needClean: rooms.filter(r => getRoomStatusColor(r).label === 'Need to Clean').length,
//     repair:    rooms.filter(r => getRoomStatusColor(r).label === 'Under Repair').length,
//   };

//   const summaryItems = [
//     { key: 'all'        as FilterType, label: 'All',        count: stats.total,     color: C.purple,  bg: C.purpleLight, icon: 'grid-outline'            as const },
//     { key: 'occupied'   as FilterType, label: 'Occupied',   count: stats.occupied,  color: C.blue,    bg: C.blueLight,   icon: 'person-outline'          as const },
//     { key: 'clean'      as FilterType, label: 'Clean',      count: stats.clean,     color: C.green,   bg: '#D1FAE5',     icon: 'checkmark-circle-outline' as const },
//     { key: 'dirty'      as FilterType, label: 'Dirty',      count: stats.dirty,     color: C.red,     bg: '#FEE2E2',     icon: 'warning-outline'          as const },
//     { key: 'touch_up'   as FilterType, label: 'Touch Up',   count: stats.touchUp,   color: C.violet,  bg: C.violetLight, icon: 'brush-outline'            as const },
//     { key: 'need_clean' as FilterType, label: 'Need Clean', count: stats.needClean, color: C.amber,   bg: C.goldLight,   icon: 'water-outline'            as const },
//     { key: 'repair'     as FilterType, label: 'Repair',     count: stats.repair,    color: '#6366F1', bg: '#E0E7FF',     icon: 'construct-outline'        as const },
//   ];

//   const roomTabCount  = rooms.filter(r => r.room_category?.room_type?.toLowerCase() !== 'other').length;
//   const otherTabCount = rooms.filter(r => r.room_category?.room_type?.toLowerCase() === 'other').length;

//   const renderRoom = ({ item }: { item: Room }) => {
//     const si = getRoomStatusColor(item);
//     const timeAgo = item.check_list?.updated_at ? getTimeAgo(item.check_list.updated_at) : null;
//     return (
//       <View style={[s.card, { borderColor: si.border, backgroundColor: si.bg }]}>
//         <TouchableOpacity style={s.dotMenuBtn} onPress={() => openDotMenu(item)}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
//           <Ionicons name="ellipsis-horizontal" size={18} color={C.textMuted} />
//         </TouchableOpacity>
//         <View style={[s.cardDot, { backgroundColor: si.color }]} />
//         <Text style={s.cardCat}>{item.room_category?.custome_name || item.room_category?.category}</Text>
//         <Text style={s.cardNum}>{item.room_number}</Text>
//         <Text style={[s.cardStatus, { color: si.color }]}>{si.label}</Text>
//         {item.current_booking && (
//           <Text style={[s.cardGuest, { color: si.color }]} numberOfLines={1}>
//             👤 {item.current_booking.guest_name}
//           </Text>
//         )}
//         {timeAgo && <Text style={s.cardTime}>{timeAgo}</Text>}
//       </View>
//     );
//   };

//   return (
//     <View style={s.container}>
//       <DashboardHeader title="Housekeeping" subtitle="Room cleanliness & status"
//         currentPage="housekeeping" />

//       {/* Tabs */}
//       <View style={s.tabBar}>
//         {(['rooms', 'other'] as TabType[]).map(tab => (
//           <TouchableOpacity key={tab} style={[s.tab, activeTab === tab && s.tabActive]}
//             onPress={() => setActiveTab(tab)}>
//             <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
//               {tab === 'rooms' ? `Rooms (${roomTabCount})` : `Other Location (${otherTabCount})`}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Search */}
//       <View style={s.searchRow}>
//         <View style={s.searchBox}>
//           <Ionicons name="search-outline" size={16} color={C.textMuted} />
//           <TextInput style={s.searchInput} placeholder="Search by Room Number or Name"
//             placeholderTextColor={C.textMuted} value={search} onChangeText={setSearch} />
//           {search.length > 0 && (
//             <TouchableOpacity onPress={() => setSearch('')}>
//               <Ionicons name="close-circle" size={16} color={C.textMuted} />
//             </TouchableOpacity>
//           )}
//         </View>
//         <TouchableOpacity style={s.resetBtn}
//           onPress={() => { setSearch(''); setStatusFilter('all'); }}>
//           <Text style={s.resetBtnText}>Reset</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Summary strip — horizontal scroll for 7 items */}
//       <View style={s.summaryWrap}>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}
//           contentContainerStyle={s.summaryScroll}>
//           {summaryItems.map((item) => {
//             const isActive = statusFilter === item.key;
//             return (
//               <TouchableOpacity key={item.key}
//                 style={[s.sumItem, isActive && { backgroundColor: item.bg }]}
//                 onPress={() => setStatusFilter(isActive ? 'all' : item.key)}
//                 activeOpacity={0.7}>
//                 <View style={[s.sumIcon, { backgroundColor: isActive ? item.color : item.bg }]}>
//                   <Ionicons name={item.icon} size={13} color={isActive ? '#fff' : item.color} />
//                 </View>
//                 <Text style={[s.sumCount, { color: isActive ? item.color : C.textPrimary }]}>
//                   {item.count}
//                 </Text>
//                 <Text style={[s.sumLabel, { color: isActive ? item.color : C.textSecond }]}>
//                   {item.label}
//                 </Text>
//                 {isActive && <View style={[s.sumActiveLine, { backgroundColor: item.color }]} />}
//               </TouchableOpacity>
//             );
//           })}
//         </ScrollView>
//       </View>

//       {statusFilter !== 'all' && (
//         <View style={s.pillRow}>
//           <View style={s.pill2}>
//             <Ionicons name="funnel" size={11} color={C.purple} />
//             <Text style={s.pill2Text}>
//               {summaryItems.find(si => si.key === statusFilter)?.label} ({filtered.length})
//             </Text>
//             <TouchableOpacity onPress={() => setStatusFilter('all')}
//               hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
//               <Ionicons name="close-circle" size={14} color={C.purple} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {/* Grid */}
//       {loading ? (
//         <View style={s.centered}>
//           <ActivityIndicator size="large" color={C.purple} />
//           <Text style={s.loadText}>Loading rooms...</Text>
//         </View>
//       ) : (
//         <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
//           <FlatList
//             data={filtered} keyExtractor={item => item.id.toString()} renderItem={renderRoom}
//             numColumns={2} columnWrapperStyle={s.row} contentContainerStyle={s.grid}
//             refreshControl={
//               <RefreshControl refreshing={refreshing}
//                 onRefresh={() => { setRefreshing(true); loadRooms(); }}
//                 colors={[C.purple]} tintColor={C.purple} />
//             }
//             ListEmptyComponent={
//               <View style={s.empty}>
//                 <Ionicons name="bed-outline" size={52} color="#D1D5DB" />
//                 <Text style={s.emptyTitle}>No Rooms Found</Text>
//                 <Text style={s.emptyText}>Try adjusting your search or filters</Text>
//               </View>
//             }
//           />
//         </Animated.View>
//       )}

//       {/* Dot Dropdown */}
//       <Modal visible={showDotMenu} transparent animationType="none" onRequestClose={closeDotMenu}>
//         <TouchableOpacity style={s.dotBackdrop} activeOpacity={1} onPress={closeDotMenu} />
//         <Animated.View style={[s.dotDropdown, {
//           opacity: dotAnim,
//           transform: [{
//             scale: dotAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
//           }, {
//             translateY: dotAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }),
//           }],
//         }]}>
//           <View style={s.dotDropHeader}>
//             <View style={s.dotDropHeaderLeft}>
//               <View style={[s.dotDropRoomBadge, { backgroundColor: C.purpleLight }]}>
//                 <Ionicons name="bed-outline" size={13} color={C.purple} />
//                 <Text style={s.dotDropRoomText}>Room {dotRoom?.room_number}</Text>
//               </View>
//               <Text style={s.dotDropCat} numberOfLines={1}>
//                 {dotRoom?.room_category?.custome_name || dotRoom?.room_category?.category}
//               </Text>
//             </View>
//             <TouchableOpacity onPress={closeDotMenu} style={s.dotDropClose}>
//               <Ionicons name="close" size={18} color={C.textMuted} />
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity style={s.dotDropItem}
//             onPress={() => { closeDotMenu(); if (dotRoom) setTimeout(() => openDetail(dotRoom), 180); }}
//             activeOpacity={0.72}>
//             <View style={[s.dotDropIconWrap, { backgroundColor: C.purpleLight }]}>
//               <Ionicons name="eye-outline" size={19} color={C.purple} />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={s.dotDropItemLabel}>View Checklist</Text>
//               <Text style={s.dotDropItemSub}>See latest finalized checklist</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
//           </TouchableOpacity>

//           <View style={s.dotDropDivider} />

//           <TouchableOpacity style={s.dotDropItem}
//             onPress={() => { closeDotMenu(); if (dotRoom) setTimeout(() => openNewCL(dotRoom), 180); }}
//             activeOpacity={0.72}>
//             <View style={[s.dotDropIconWrap, { backgroundColor: '#F0FDF4' }]}>
//               <Ionicons name="add-circle-outline" size={19} color={C.green} />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={s.dotDropItemLabel}>New Checklist</Text>
//               <Text style={s.dotDropItemSub}>Create a new housekeeping checklist</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
//           </TouchableOpacity>

//           <View style={s.dotDropDivider} />

//           <TouchableOpacity style={[s.dotDropItem, { borderBottomWidth: 0 }]}
//             onPress={() => { closeDotMenu(); if (dotRoom) setTimeout(() => openFinalize(dotRoom), 180); }}
//             activeOpacity={0.72}>
//             <View style={[s.dotDropIconWrap, { backgroundColor: C.goldLight }]}>
//               <Ionicons name="shield-checkmark-outline" size={19} color={C.goldDark} />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={s.dotDropItemLabel}>Finalize Checklist</Text>
//               <Text style={s.dotDropItemSub}>Supervisor approval & room status</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
//           </TouchableOpacity>
//         </Animated.View>
//       </Modal>

//       <ChecklistDetailModal visible={showDetail} room={selectedRoom} checklist={checklist}
//         checklistLoading={checklistLoading} onClose={closeDetail} />

//       <NewChecklistModal visible={showNewCL} room={newCLRoom}
//         onClose={closeNewCL} onSuccess={loadRooms} onGoFinalize={handleGoFinalize} />

//       <FinalizeChecklistModal visible={showFinalize} room={finalizeRoom}
//         onClose={closeFinalize} onSuccess={loadRooms} />
//     </View>
//   );
// };

// export default HousekeepingPage;

// // ─────────────────────────────────────────────────────────────────────────────
// // STYLES
// // ─────────────────────────────────────────────────────────────────────────────
// const s = StyleSheet.create({
//   container: { flex: 1, backgroundColor: C.bg },

//   tabBar:        { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.white },
//   tab:           { paddingBottom: 10, marginRight: 24 },
//   tabActive:     { borderBottomWidth: 2.5, borderBottomColor: C.purple },
//   tabText:       { fontSize: 14, fontWeight: '500', color: C.textSecond },
//   tabTextActive: { color: C.purple, fontWeight: '700' },

//   searchRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   searchBox:    { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, gap: 8 },
//   searchInput:  { flex: 1, fontSize: 14, color: C.textPrimary },
//   resetBtn:     { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: C.purple },
//   resetBtnText: { fontSize: 12, color: C.purple, fontWeight: '600' },

//   summaryWrap:   { paddingTop: 12, paddingBottom: 4 },
//   summaryScroll: { paddingHorizontal: 12, gap: 8 },
//   sumItem:       { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12, position: 'relative', minWidth: 68 },
//   sumIcon:       { width: 28, height: 28, borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
//   sumCount:      { fontSize: 18, fontWeight: '800', lineHeight: 22 },
//   sumLabel:      { fontSize: 9, fontWeight: '500', textAlign: 'center', marginTop: 2 },
//   sumActiveLine: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 },

//   pillRow:  { paddingHorizontal: 16, paddingTop: 8 },
//   pill2:    { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: C.purpleLight, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20 },
//   pill2Text:{ fontSize: 12, color: C.purple, fontWeight: '600' },

//   grid: { paddingHorizontal: 12, paddingBottom: 24, paddingTop: 10 },
//   row:  { justifyContent: 'space-between' },

//   card:       { width: (width - 36) / 2, borderRadius: 12, borderWidth: 1.5, padding: 16, marginBottom: 12, position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
//   cardDot:    { width: 9, height: 9, borderRadius: 5, marginBottom: 6 },
//   dotMenuBtn: { position: 'absolute', top: 10, right: 10, padding: 4 },
//   cardCat:    { fontSize: 12, color: C.textSecond, fontWeight: '500', marginBottom: 2 },
//   cardNum:    { fontSize: 28, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
//   cardStatus: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
//   cardGuest:  { fontSize: 11, fontWeight: '500', marginBottom: 2 },
//   cardTime:   { fontSize: 11, color: C.textMuted },

//   dotBackdrop:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.22)' },
//   dotDropdown:      { position: 'absolute', top: '26%', left: 22, right: 22, backgroundColor: C.white, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 16, overflow: 'hidden' },
//   dotDropHeader:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   dotDropHeaderLeft:{ flex: 1 },
//   dotDropRoomBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, marginBottom: 4 },
//   dotDropRoomText:  { fontSize: 12, fontWeight: '700', color: C.purple },
//   dotDropCat:       { fontSize: 13, color: C.textSecond, fontWeight: '500' },
//   dotDropClose:     { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
//   dotDropItem:      { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 18, paddingVertical: 15 },
//   dotDropIconWrap:  { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
//   dotDropItemLabel: { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 1 },
//   dotDropItemSub:   { fontSize: 11, color: C.textMuted },
//   dotDropDivider:   { height: 1, backgroundColor: '#F9FAFB', marginHorizontal: 0 },

//   centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
//   loadText:   { fontSize: 14, color: C.textMuted },
//   empty:      { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 },
//   emptyTitle: { fontSize: 18, fontWeight: '600', color: C.textPrimary, marginTop: 16, marginBottom: 6 },
//   emptyText:  { fontSize: 14, color: C.textMuted, textAlign: 'center' },

//   backdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
//   sheet:       { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.92, overflow: 'hidden' },
//   gradHeader:  { paddingTop: 10, paddingBottom: 18, paddingHorizontal: 20 },
//   handle:      { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
//   headerRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
//   headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginBottom: 3 },
//   headerTitle: { fontSize: 19, fontWeight: '800', color: '#fff' },
//   closeBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
//   badgeRow:    { flexDirection: 'row', gap: 8 },
//   badge:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
//   badgeText:   { fontSize: 12, fontWeight: '700' },

//   infoCard:      { backgroundColor: C.white, marginHorizontal: 16, marginTop: 16, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
//   infoRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 13 },
//   infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   infoLeft:      { flexDirection: 'row', alignItems: 'center', gap: 9 },
//   infoLabel:     { fontSize: 14, color: C.textSecond, fontWeight: '500' },
//   infoValue:     { fontSize: 14, color: C.textPrimary, fontWeight: '600' },

//   tableCard:     { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
//   tableHead:     { flexDirection: 'row', backgroundColor: C.purpleLight, paddingHorizontal: 16, paddingVertical: 11 },
//   tableHeadCell: { fontSize: 13, fontWeight: '700', color: C.purple },
//   tableRow:      { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
//   rowOdd:        { backgroundColor: '#FAFAFA' },
//   rowFail:       { backgroundColor: '#FFF5F5' },
//   rowPass:       { backgroundColor: '#F5F3FF' },
//   rowNeedsReview:{ backgroundColor: '#FFFBEB' },
//   cell:          { flexDirection: 'row', alignItems: 'center' },
//   cellText:      { fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 },
//   cellFail:      { color: '#DC2626', fontWeight: '600' },
//   redDot:        { width: 7, height: 7, borderRadius: 4, backgroundColor: C.red, marginRight: 4, flexShrink: 0 },
//   greyDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D1D5DB', marginRight: 4, flexShrink: 0 },
//   pill:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
//   pillText:      { fontSize: 12, fontWeight: '700' },
//   tableCenter:   { flexDirection: 'column', alignItems: 'center', gap: 8, padding: 28 },
//   helperText:    { fontSize: 14, color: C.textMuted },

//   reasonRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', paddingHorizontal: 20, paddingVertical: 7, gap: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   reasonInput: { flex: 1, fontSize: 13, color: '#374151' },

//   ansBtn:     { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 5 },
//   ansBtnText: { fontSize: 12, fontWeight: '700' },

//   statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 16, marginBottom: 2 },
//   statBox:  { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
//   statNum:  { fontSize: 22, fontWeight: '800' },
//   statLabel:{ fontSize: 11, fontWeight: '600', marginTop: 2 },

//   progressWrap:  { marginTop: 10 },
//   progressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
//   progressFill:  { height: 4, backgroundColor: '#fff', borderRadius: 2 },
//   progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 5, textAlign: 'right' },

//   btnWrap:      { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
//   gradBtn:      { borderRadius: 14, overflow: 'hidden' },
//   gradBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
//   gradBtnText:  { fontSize: 16, fontWeight: '800', color: '#fff' },

//   imageCard:   { backgroundColor: C.white, marginHorizontal: 16, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
//   imgHeader:   { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
//   imgTitle:    { fontSize: 14, fontWeight: '700', color: C.textPrimary },
//   thumbWrap:   { borderRadius: 10, overflow: 'hidden', position: 'relative', width: 130, height: 98 },
//   thumb:       { width: 130, height: 98, backgroundColor: '#F3F4F6' },
//   expandIcon:  { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.45)', padding: 3, borderRadius: 5 },
//   addPhotoBtn: { width: 78, height: 98, borderRadius: 10, borderWidth: 2, borderColor: '#E0D9F0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F8FF' },
//   addPhotoText:{ fontSize: 11, color: C.purple, fontWeight: '600', marginTop: 3 },
//   removeBtn:   { position: 'absolute', top: 3, right: 3, backgroundColor: C.white, borderRadius: 10 },

//   fsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)', justifyContent: 'center', alignItems: 'center' },
//   fsClose:   { position: 'absolute', top: 52, right: 20, zIndex: 10 },
//   fsCounter: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 10 },
//   fsNav:     { flexDirection: 'row', gap: 60, marginTop: 20 },
//   fsNavBtn:  { padding: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 30 },

//   popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 },
//   popupSheet:   { backgroundColor: C.white, borderRadius: 20, width: '100%', maxHeight: height * 0.76, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 12 },
//   popupHeader:  { paddingVertical: 18, paddingHorizontal: 20, alignItems: 'center' },
//   popupTitle:   { fontSize: 17, fontWeight: '800', color: '#fff' },
//   popupSub:     { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
//   popupScroll:  { maxHeight: height * 0.48 },
//   popupBtns:    { flexDirection: 'row', padding: 14, gap: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
//   popupBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: 11 },
//   popupBtnGrad: { flex: 1, borderRadius: 11, overflow: 'hidden' },
//   popupBtnInner:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13 },
//   popupBtnText: { fontSize: 13, fontWeight: '700' },

//   statusCard:      { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
//   statusCardTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
//   statusBtnRow:    { flexDirection: 'row', gap: 12 },
//   statusBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: C.border },
//   statusBtnText:   { fontSize: 14, fontWeight: '700' },

//   reviewAlert:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 12, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FCD34D', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
//   reviewAlertText: { flex: 1, fontSize: 13, color: '#92400E', fontWeight: '500' },

//   refillCard:      { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
//   refillHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 13, backgroundColor: C.purpleLight, borderBottomWidth: 1, borderBottomColor: '#E0D9F0' },
//   refillTitle:     { fontSize: 14, fontWeight: '700', color: C.purple },
//   refillColHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F9F8FF', borderBottomWidth: 1, borderBottomColor: '#EDE9FE' },
//   refillColText:   { fontSize: 12, fontWeight: '700', color: C.purple },
//   refillRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   refillItemName:  { fontSize: 13, color: '#374151', fontWeight: '500' },
//   refillUnit:      { fontSize: 12, color: C.textSecond },
//   refillInput:     { width: 68, borderWidth: 1.5, borderColor: C.purpleLight, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, fontSize: 14, color: C.textPrimary, textAlign: 'center', backgroundColor: '#F9F8FF' },
// });



// app/dashboard/housekeeping/index.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, RefreshControl, Modal, Animated,
  ScrollView, TextInput, Dimensions, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DashboardHeader from '@/components/HeaderWithMenu';
import {
  getRooms, getChecklistByRoom, getChecklistTemplate, saveChecklist,
  getFinalizeTemplate, saveFinalize, getRoomStatusColor, getTimeAgo,
  resolveImageUrl,
  Room, RoomChecklist, ChecklistImage,
  TemplateHousekeepingItem, FinalizeTemplate,
} from '@/services/housekeepingService';
import bookingCalendarService from '@/services/bookingCalendar';

const { width, height } = Dimensions.get('window');
type TabType    = 'rooms' | 'other';
type FilterType = 'all' | 'occupied' | 'clean' | 'dirty' | 'touch_up' | 'need_clean';

const IMAGE_BASE_URL = 'https://your-domain.com/storage';

const C = {
  purple:      '#6B5B95',
  purpleLight: '#EDE9FE',
  purpleDark:  '#4C3D7A',
  gold:        '#C8A84B',
  goldLight:   '#FEF3C7',
  goldDark:    '#A07830',
  amber:       '#D97706',
  red:         '#EF4444',
  green:       '#10B981',
  blue:        '#3B82F6',
  blueLight:   '#DBEAFE',
  violet:      '#8B5CF6',
  violetLight: '#EDE9FE',
  bg:          '#F3F4F6',
  white:       '#FFFFFF',
  border:      '#E5E7EB',
  textPrimary: '#111827',
  textSecond:  '#6B7280',
  textMuted:   '#9CA3AF',
};

// ─── Info row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, icon, valueColor, isLast }: {
  label: string; value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  valueColor?: string; isLast?: boolean;
}) => (
  <View style={[s.infoRow, !isLast && s.infoRowBorder]}>
    <View style={s.infoLeft}>
      <Ionicons name={icon} size={15} color={C.purple} />
      <Text style={s.infoLabel}>{label} :</Text>
    </View>
    <Text style={[s.infoValue, valueColor ? { color: valueColor, fontWeight: '700' } : {}]}>{value}</Text>
  </View>
);

// ─── Server image gallery ──────────────────────────────────────────────────────
const ImageGallery = ({ images }: { images: ChecklistImage[] }) => {
  const [fsIdx, setFsIdx] = useState<number | null>(null);
  if (!images?.length) return null;

  return (
    <View style={s.imageCard}>
      <View style={s.imgHeader}>
        <Ionicons name="images-outline" size={16} color={C.purple} />
        <Text style={s.imgTitle}>Checklist Images ({images.length})</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.map((img, idx) => {
          const uri = resolveImageUrl(img, IMAGE_BASE_URL);
          return (
            <TouchableOpacity key={img.id} onPress={() => setFsIdx(idx)}
              style={[s.thumbWrap, { marginLeft: idx === 0 ? 0 : 8 }]} activeOpacity={0.85}>
              <Image source={{ uri }} style={s.thumb} resizeMode="cover" />
              <View style={s.expandIcon}><Ionicons name="expand-outline" size={12} color="#fff" /></View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Modal visible={fsIdx !== null} transparent animationType="fade" onRequestClose={() => setFsIdx(null)}>
        <View style={s.fsOverlay}>
          <TouchableOpacity style={s.fsClose} onPress={() => setFsIdx(null)}>
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>
          {fsIdx !== null && (
            <>
              <Image
                source={{ uri: resolveImageUrl(images[fsIdx], IMAGE_BASE_URL) }}
                style={{ width, height: width * 1.3 }} resizeMode="contain" />
              <Text style={s.fsCounter}>{fsIdx + 1} / {images.length}</Text>
              {images.length > 1 && (
                <View style={s.fsNav}>
                  <TouchableOpacity
                    onPress={() => setFsIdx(i => (i! > 0 ? i! - 1 : images.length - 1))}
                    style={s.fsNavBtn}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFsIdx(i => (i! < images.length - 1 ? i! + 1 : 0))}
                    style={s.fsNavBtn}>
                    <Ionicons name="chevron-forward" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

// ─── Local image strip ─────────────────────────────────────────────────────────
interface LocalImage { uri: string; name: string; type: string; }
const LocalImageStrip = ({ images, onAdd, onRemove }: {
  images: LocalImage[]; onAdd: () => void; onRemove: (i: number) => void;
}) => (
  <View>
    <View style={s.imgHeader}>
      <Ionicons name="camera-outline" size={16} color={C.purple} />
      <Text style={s.imgTitle}>Add Photos</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <TouchableOpacity onPress={onAdd} style={s.addPhotoBtn} activeOpacity={0.75}>
        <Ionicons name="add" size={26} color={C.purple} />
        <Text style={s.addPhotoText}>Add</Text>
      </TouchableOpacity>
      {images.map((img, idx) => (
        <View key={idx} style={[s.thumbWrap, { marginLeft: 8 }]}>
          <Image source={{ uri: img.uri }} style={s.thumb} resizeMode="cover" />
          <TouchableOpacity style={s.removeBtn} onPress={() => onRemove(idx)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
            <Ionicons name="close-circle" size={20} color={C.red} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// VIEW CHECKLIST MODAL
// ─────────────────────────────────────────────────────────────────────────────
const ChecklistDetailModal: React.FC<{
  visible: boolean; room: Room | null; checklist: RoomChecklist | null;
  checklistLoading: boolean; onClose: () => void;
}> = ({ visible, room, checklist, checklistLoading, onClose }) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  useEffect(() => {
    if (visible) Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
    else Animated.timing(slideAnim, { toValue: height, duration: 280, useNativeDriver: true }).start();
  }, [visible]);
  if (!room) return null;

  const statusInfo = getRoomStatusColor(room);
  const items  = checklist?.check_list_detail ?? [];
  const images = checklist?.check_list_image   ?? [];
  const issueCount = items.filter(i => i.housekeeper_status === 'No').length;
  const hkName = checklist?.housekeeper
    ? `${checklist.housekeeper.name} ${checklist.housekeeper.lname}`.trim() : '—';
  const svName = checklist?.supervisor
    ? `${checklist.supervisor.name} ${checklist.supervisor.lname}`.trim() : '—';

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
                <InfoRow icon="person-outline"           label="Checked"    value={hkName} />
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
              {images.length > 0 && <ImageGallery images={images} />}
            </>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW CHECKLIST MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface NewChecklistModalProps {
  visible: boolean; room: Room | null;
  onClose: () => void; onSuccess: () => void;
  onGoFinalize: (room: Room) => void;
}

const NewChecklistModal: React.FC<NewChecklistModalProps> = ({
  visible, room, onClose, onSuccess, onGoFinalize,
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [tmplLoading, setTmplLoading] = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [items,       setItems]       = useState<TemplateHousekeepingItem[]>([]);
  const [answers,     setAnswers]     = useState<Record<number, 'Yes' | 'No' | null>>({});
  const [noTemplate,  setNoTemplate]  = useState(false);
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [showPopup,   setShowPopup]   = useState(false);

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
  const progress      = items.length > 0 ? answeredCount / items.length : 0;
  const yesCount      = items.filter(i => answers[i.id] === 'Yes').length;
  const noCount       = items.filter(i => answers[i.id] === 'No').length;

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
                        {isNo  && <View style={s.redDot} />}
                        {isYes && (
                          <Ionicons name="checkmark-circle" size={13} color={C.purple}
                            style={{ marginRight: 2 }} />
                        )}
                        <Text style={[s.cellText, isNo && s.cellFail,
                          isYes && { color: C.purpleDark }]} numberOfLines={3}>
                          {item.item_name}
                        </Text>
                      </View>
                      <View style={[s.cell, { flex: 2, justifyContent: 'center', gap: 7 }]}>
                        <TouchableOpacity
                          style={[s.ansBtn, { borderColor: C.purple },
                            isYes && { backgroundColor: C.purple }]}
                          onPress={() => toggle(item.id, 'Yes')}>
                          <Text style={[s.ansBtnText, { color: isYes ? '#fff' : C.purple }]}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[s.ansBtn, { borderColor: C.gold },
                            isNo && { backgroundColor: C.gold }]}
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

      {/* ── Confirm Popup ── */}
      <Modal visible={showPopup} transparent animationType="fade"
        onRequestClose={() => setShowPopup(false)}>
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

// ─────────────────────────────────────────────────────────────────────────────
// FINALIZE CHECKLIST MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface FinalizeModalProps {
  visible: boolean; room: Room | null;
  onClose: () => void; onSuccess: () => void;
}

const FinalizeChecklistModal: React.FC<FinalizeModalProps> = ({
  visible, room, onClose, onSuccess,
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [loading,      setLoading]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [template,     setTemplate]     = useState<FinalizeTemplate | null>(null);
  const [noPending,    setNoPending]    = useState(false);
  const [roomStatus,   setRoomStatus]   = useState<'Ready' | 'Not Ready' | null>(null);
  const [svAnswers,    setSvAnswers]    = useState<Record<number, 'Yes' | 'No' | null>>({});
  const [reasons,      setReasons]      = useState<Record<number, string>>({});
  const [refillingQty, setRefillingQty] = useState<Record<number, string>>({});
  const [localImages,  setLocalImages]  = useState<LocalImage[]>([]);

  useEffect(() => {
    if (visible) Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
    else Animated.timing(slideAnim, { toValue: height, duration: 280, useNativeDriver: true }).start();
  }, [visible]);

  useEffect(() => {
    if (visible && room) {
      loadTemplate();
    }
    if (!visible) {
      setTemplate(null);
      setNoPending(false);
      setRoomStatus(null);
      setSvAnswers({});
      setReasons({});
      setRefillingQty({});
      setLocalImages([]);
    }
  }, [visible, room?.id]);

  const loadTemplate = async () => {
    if (!room) return;
    setLoading(true);
    setNoPending(false);
    setTemplate(null);
    setRoomStatus(null);
    setSvAnswers({});
    setReasons({});
    setRefillingQty({});
    setLocalImages([]);
    try {
      const tmpl = await getFinalizeTemplate(room.id);
      if (!tmpl) { setNoPending(true); return; }
      setTemplate(tmpl);
      const init: Record<number, 'Yes' | 'No' | null> = {};
      tmpl.checklist.check_list_detail.forEach(d => {
        init[d.id] = d.housekeeper_status === 'Yes' ? 'Yes' : null;
      });
      setSvAnswers(init);
    } catch {
      setNoPending(true);
    } finally {
      setLoading(false);
    }
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
    const details    = template.checklist.check_list_detail;
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
      onSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to finalize checklist');
    } finally {
      setSaving(false);
    }
  };

  if (!room) return null;

  const details        = template?.checklist.check_list_detail ?? [];
  const svImages       = template?.checklist.check_list_image   ?? [];
  const refillingItems = template?.refilling_items ?? [];
  const answeredCount  = details.filter(d => svAnswers[d.id] !== null).length;
  const progress       = details.length > 0 ? answeredCount / details.length : 0;
  const hkName         = template?.checklist.housekeeper
    ? `${template.checklist.housekeeper.name} ${template.checklist.housekeeper.lname}`.trim() : '—';

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
                <InfoRow icon="person-outline"   label="Housekeeper" value={hkName} />
                <InfoRow icon="document-outline" label="CL Status"   value={template?.checklist.status || '—'} />
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

              {/* Room Status */}
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

              {/* ── FINALIZE TABLE — no "Item Name" header, just HK + Supervisor columns ── */}
              <View style={s.tableCard}>
                <View style={[s.tableHead, { backgroundColor: C.goldLight }]}>
                  {/* REMOVED: Item Name column header */}
                  <Text style={[s.tableHeadCell, { flex: 1, color: '#92400E', fontSize: 11 }]}>HK</Text>
                  <Text style={[s.tableHeadCell, { flex: 2, textAlign: 'center', color: '#92400E' }]}>
                    Supervisor
                  </Text>
                </View>
                {details.map((item, idx) => {
                  const sv    = svAnswers[item.id];
                  const hkNo  = item.housekeeper_status === 'No';
                  const svNo  = sv === 'No';
                  const svYes = sv === 'Yes';
                  return (
                    <View key={`detail-${item.id}`}>
                      <View style={[s.tableRow, idx % 2 !== 0 && s.rowOdd,
                        svNo && s.rowFail, svYes && s.rowPass,
                        (hkNo && sv === null) && s.rowNeedsReview]}>
                        {/* REMOVED: item name cell */}
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

              {/* Refill items */}
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
                    <View key={`refill-${r.id}`}
                      style={[s.refillRow, idx % 2 !== 0 && { backgroundColor: '#FAFAFA' }]}>
                      <Text style={[s.refillItemName, { flex: 2 }]} numberOfLines={2}>
                        {r.item?.item ?? '—'}
                      </Text>
                      <Text style={[s.refillUnit, { flex: 1, textAlign: 'center' }]}>
                        {r.item?.unit ?? '—'}
                      </Text>
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

              {svImages.length > 0 && <ImageGallery images={svImages} />}

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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const HousekeepingPage = () => {
  const [activeTab,    setActiveTab]    = useState<TabType>('rooms');
  const [rooms,        setRooms]        = useState<Room[]>([]);
  const [filtered,     setFiltered]     = useState<Room[]>([]);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [loading,      setLoading]      = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);

  const [selectedRoom,     setSelectedRoom]     = useState<Room | null>(null);
  const [showDetail,       setShowDetail]       = useState(false);
  const [checklist,        setChecklist]        = useState<RoomChecklist | null>(null);
  const [checklistLoading, setChecklistLoading] = useState(false);

  const [showNewCL,    setShowNewCL]    = useState(false);
  const [newCLRoom,    setNewCLRoom]    = useState<Room | null>(null);
  const [showFinalize, setShowFinalize] = useState(false);
  const [finalizeRoom, setFinalizeRoom] = useState<Room | null>(null);

  const [dotRoom,     setDotRoom]     = useState<Room | null>(null);
  const [showDotMenu, setShowDotMenu] = useState(false);
  const dotAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const [roomsRes, calendarRes] = await Promise.allSettled([
        getRooms(),
        bookingCalendarService.getCalendarBookings(
          new Date().toISOString().split('T')[0]
        ),
      ]);

      let roomList: Room[] = [];
      if (roomsRes.status === 'fulfilled' && roomsRes.value.status && roomsRes.value.rooms) {
        roomList = roomsRes.value.rooms;
      }

      if (calendarRes.status === 'fulfilled' && calendarRes.value.categories) {
        const todayStr = new Date().toISOString().split('T')[0];
        const bookingMap: Record<number, Room['current_booking']> = {};

        for (const cat of calendarRes.value.categories) {
          for (const calRoom of cat.rooms) {
            const roomId = calRoom.room_id;
            const activeBooking = calRoom.bookings.find(b =>
              b.start_date <= todayStr && b.end_date >= todayStr
            );
            if (activeBooking) {
              bookingMap[roomId] = {
                booking_id: activeBooking.booking_id,
                guest_name: activeBooking.guest_name,
                start_date: activeBooking.start_date,
                end_date:   activeBooking.end_date,
                status:     activeBooking.status,
              };
            }
          }
        }

        roomList = roomList.map(r => ({
          ...r,
          current_booking: bookingMap[r.id] ?? null,
        }));
      }

      setRooms(roomList);
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
    let list = [...rooms];
    if (activeTab === 'other')
      list = list.filter(r => r.room_category?.room_type?.toLowerCase() === 'other');
    else
      list = list.filter(r => r.room_category?.room_type?.toLowerCase() !== 'other');

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.room_number.toLowerCase().includes(q) ||
        r.room_category?.custome_name?.toLowerCase().includes(q) ||
        r.room_category?.category?.toLowerCase().includes(q));
    }

    if (statusFilter !== 'all') {
      list = list.filter(r => {
        const label = getRoomStatusColor(r).label;
        if (statusFilter === 'occupied')   return label === 'Occupied';
        if (statusFilter === 'clean')      return label === 'Clean';
        if (statusFilter === 'dirty')      return label === 'Dirty';
        if (statusFilter === 'touch_up')   return label === 'Need to Touch Up';
        if (statusFilter === 'need_clean') return label === 'Need to Clean';
        return true;
      });
    }
    setFiltered(list);
  }, [rooms, search, statusFilter, activeTab]);

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
  const closeDotMenu  = () => setShowDotMenu(false);
  const closeDetail   = () => { setShowDetail(false);   setTimeout(() => { setSelectedRoom(null); setChecklist(null); }, 350); };
  const openNewCL     = (room: Room) => { setNewCLRoom(room);    setShowNewCL(true);    };
  const closeNewCL    = () => { setShowNewCL(false);    setTimeout(() => setNewCLRoom(null),    350); };
  const openFinalize  = (room: Room) => { setFinalizeRoom(room); setShowFinalize(true); };
  const closeFinalize = () => { setShowFinalize(false); setTimeout(() => setFinalizeRoom(null), 350); };
  const handleGoFinalize = (room: Room) => openFinalize(room);

  const stats = {
    total:     rooms.length,
    occupied:  rooms.filter(r => getRoomStatusColor(r).label === 'Occupied').length,
    clean:     rooms.filter(r => getRoomStatusColor(r).label === 'Clean').length,
    dirty:     rooms.filter(r => getRoomStatusColor(r).label === 'Dirty').length,
    touchUp:   rooms.filter(r => getRoomStatusColor(r).label === 'Need to Touch Up').length,
    needClean: rooms.filter(r => getRoomStatusColor(r).label === 'Need to Clean').length,
  };

  const summaryItems = [
    { key: 'all'        as FilterType, label: 'All',        count: stats.total,     color: C.purple,  bg: C.purpleLight, icon: 'grid-outline'            as const },
    { key: 'occupied'   as FilterType, label: 'Occupied',   count: stats.occupied,  color: C.blue,    bg: C.blueLight,   icon: 'person-outline'          as const },
    { key: 'clean'      as FilterType, label: 'Clean',      count: stats.clean,     color: C.green,   bg: '#D1FAE5',     icon: 'checkmark-circle-outline' as const },
    { key: 'dirty'      as FilterType, label: 'Dirty',      count: stats.dirty,     color: C.red,     bg: '#FEE2E2',     icon: 'warning-outline'          as const },
    { key: 'touch_up'   as FilterType, label: 'Touch Up',   count: stats.touchUp,   color: C.violet,  bg: C.violetLight, icon: 'brush-outline'            as const },
    { key: 'need_clean' as FilterType, label: 'Need Clean', count: stats.needClean, color: C.amber,   bg: C.goldLight,   icon: 'water-outline'            as const },
  ];

  const roomTabCount  = rooms.filter(r => r.room_category?.room_type?.toLowerCase() !== 'other').length;
  const otherTabCount = rooms.filter(r => r.room_category?.room_type?.toLowerCase() === 'other').length;

  const renderRoom = ({ item }: { item: Room }) => {
    const si = getRoomStatusColor(item);
    const timeAgo = item.check_list?.updated_at ? getTimeAgo(item.check_list.updated_at) : null;
    return (
      <View style={[s.card, { borderColor: si.border, backgroundColor: si.bg }]}>
        <TouchableOpacity style={s.dotMenuBtn} onPress={() => openDotMenu(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="ellipsis-horizontal" size={18} color={C.textMuted} />
        </TouchableOpacity>
        <View style={[s.cardDot, { backgroundColor: si.color }]} />
        <Text style={s.cardCat}>{item.room_category?.custome_name || item.room_category?.category}</Text>
        <Text style={s.cardNum}>{item.room_number}</Text>
        <Text style={[s.cardStatus, { color: si.color }]}>{si.label}</Text>
        {item.current_booking && (
          <Text style={[s.cardGuest, { color: si.color }]} numberOfLines={1}>
            👤 {item.current_booking.guest_name}
          </Text>
        )}
        {timeAgo && <Text style={s.cardTime}>{timeAgo}</Text>}
      </View>
    );
  };

  return (
    <View style={s.container}>
      <DashboardHeader title="Housekeeping" subtitle="Room cleanliness & status"
        currentPage="housekeeping" />

      {/* Tabs */}
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

      {/* Search */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={16} color={C.textMuted} />
          <TextInput style={s.searchInput} placeholder="Search by Room Number or Name"
            placeholderTextColor={C.textMuted} value={search} onChangeText={setSearch} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={s.resetBtn}
          onPress={() => { setSearch(''); setStatusFilter('all'); }}>
          <Text style={s.resetBtnText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Summary strip */}
      <View style={s.summaryWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.summaryScroll}>
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
                <Text style={[s.sumCount, { color: isActive ? item.color : C.textPrimary }]}>
                  {item.count}
                </Text>
                <Text style={[s.sumLabel, { color: isActive ? item.color : C.textSecond }]}>
                  {item.label}
                </Text>
                {isActive && <View style={[s.sumActiveLine, { backgroundColor: item.color }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {statusFilter !== 'all' && (
        <View style={s.pillRow}>
          <View style={s.pill2}>
            <Ionicons name="funnel" size={11} color={C.purple} />
            <Text style={s.pill2Text}>
              {summaryItems.find(si => si.key === statusFilter)?.label} ({filtered.length})
            </Text>
            <TouchableOpacity onPress={() => setStatusFilter('all')}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="close-circle" size={14} color={C.purple} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Grid */}
      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={C.purple} />
          <Text style={s.loadText}>Loading rooms...</Text>
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={filtered} keyExtractor={item => item.id.toString()} renderItem={renderRoom}
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

      {/* Dot Dropdown */}
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
              <Text style={s.dotDropItemSub}>See latest finalized checklist</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
          </TouchableOpacity>

          <View style={s.dotDropDivider} />

          <TouchableOpacity style={s.dotDropItem}
            onPress={() => { closeDotMenu(); if (dotRoom) setTimeout(() => openNewCL(dotRoom), 180); }}
            activeOpacity={0.72}>
            <View style={[s.dotDropIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="add-circle-outline" size={19} color={C.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.dotDropItemLabel}>New Checklist</Text>
              <Text style={s.dotDropItemSub}>Create a new housekeeping checklist</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
          </TouchableOpacity>

          <View style={s.dotDropDivider} />

          <TouchableOpacity style={[s.dotDropItem, { borderBottomWidth: 0 }]}
            onPress={() => { closeDotMenu(); if (dotRoom) setTimeout(() => openFinalize(dotRoom), 180); }}
            activeOpacity={0.72}>
            <View style={[s.dotDropIconWrap, { backgroundColor: C.goldLight }]}>
              <Ionicons name="shield-checkmark-outline" size={19} color={C.goldDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.dotDropItemLabel}>Finalize Checklist</Text>
              <Text style={s.dotDropItemSub}>Supervisor approval & room status</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      <ChecklistDetailModal visible={showDetail} room={selectedRoom} checklist={checklist}
        checklistLoading={checklistLoading} onClose={closeDetail} />

      <NewChecklistModal visible={showNewCL} room={newCLRoom}
        onClose={closeNewCL} onSuccess={loadRooms} onGoFinalize={handleGoFinalize} />

      <FinalizeChecklistModal visible={showFinalize} room={finalizeRoom}
        onClose={closeFinalize} onSuccess={loadRooms} />
    </View>
  );
};

export default HousekeepingPage;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  tabBar:        { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.white },
  tab:           { paddingBottom: 10, marginRight: 24 },
  tabActive:     { borderBottomWidth: 2.5, borderBottomColor: C.purple },
  tabText:       { fontSize: 14, fontWeight: '500', color: C.textSecond },
  tabTextActive: { color: C.purple, fontWeight: '700' },

  searchRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  searchBox:    { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, gap: 8 },
  searchInput:  { flex: 1, fontSize: 14, color: C.textPrimary },
  resetBtn:     { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: C.purple },
  resetBtnText: { fontSize: 12, color: C.purple, fontWeight: '600' },

  summaryWrap:   { paddingTop: 12, paddingBottom: 4 },
  summaryScroll: { paddingHorizontal: 12, gap: 8 },
  sumItem:       { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12, position: 'relative', minWidth: 68 },
  sumIcon:       { width: 28, height: 28, borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  sumCount:      { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  sumLabel:      { fontSize: 9, fontWeight: '500', textAlign: 'center', marginTop: 2 },
  sumActiveLine: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 },

  pillRow:  { paddingHorizontal: 16, paddingTop: 8 },
  pill2:    { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: C.purpleLight, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20 },
  pill2Text:{ fontSize: 12, color: C.purple, fontWeight: '600' },

  grid: { paddingHorizontal: 12, paddingBottom: 24, paddingTop: 10 },
  row:  { justifyContent: 'space-between' },

  card:       { width: (width - 36) / 2, borderRadius: 12, borderWidth: 1.5, padding: 16, marginBottom: 12, position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardDot:    { width: 9, height: 9, borderRadius: 5, marginBottom: 6 },
  dotMenuBtn: { position: 'absolute', top: 10, right: 10, padding: 4 },
  cardCat:    { fontSize: 12, color: C.textSecond, fontWeight: '500', marginBottom: 2 },
  cardNum:    { fontSize: 28, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
  cardStatus: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  cardGuest:  { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  cardTime:   { fontSize: 11, color: C.textMuted },

  dotBackdrop:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.22)' },
  dotDropdown:      { position: 'absolute', top: '26%', left: 22, right: 22, backgroundColor: C.white, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 16, overflow: 'hidden' },
  dotDropHeader:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dotDropHeaderLeft:{ flex: 1 },
  dotDropRoomBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, marginBottom: 4 },
  dotDropRoomText:  { fontSize: 12, fontWeight: '700', color: C.purple },
  dotDropCat:       { fontSize: 13, color: C.textSecond, fontWeight: '500' },
  dotDropClose:     { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  dotDropItem:      { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 18, paddingVertical: 15 },
  dotDropIconWrap:  { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dotDropItemLabel: { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 1 },
  dotDropItemSub:   { fontSize: 11, color: C.textMuted },
  dotDropDivider:   { height: 1, backgroundColor: '#F9FAFB', marginHorizontal: 0 },

  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadText:   { fontSize: 14, color: C.textMuted },
  empty:      { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: C.textPrimary, marginTop: 16, marginBottom: 6 },
  emptyText:  { fontSize: 14, color: C.textMuted, textAlign: 'center' },

  backdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet:       { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.92, overflow: 'hidden' },
  gradHeader:  { paddingTop: 10, paddingBottom: 18, paddingHorizontal: 20 },
  handle:      { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  headerRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginBottom: 3 },
  headerTitle: { fontSize: 19, fontWeight: '800', color: '#fff' },
  closeBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  badgeRow:    { flexDirection: 'row', gap: 8 },
  badge:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText:   { fontSize: 12, fontWeight: '700' },

  infoCard:      { backgroundColor: C.white, marginHorizontal: 16, marginTop: 16, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  infoRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 13 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoLeft:      { flexDirection: 'row', alignItems: 'center', gap: 9 },
  infoLabel:     { fontSize: 14, color: C.textSecond, fontWeight: '500' },
  infoValue:     { fontSize: 14, color: C.textPrimary, fontWeight: '600' },

  tableCard:     { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tableHead:     { flexDirection: 'row', backgroundColor: C.purpleLight, paddingHorizontal: 16, paddingVertical: 11 },
  tableHeadCell: { fontSize: 13, fontWeight: '700', color: C.purple },
  tableRow:      { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
  rowOdd:        { backgroundColor: '#FAFAFA' },
  rowFail:       { backgroundColor: '#FFF5F5' },
  rowPass:       { backgroundColor: '#F5F3FF' },
  rowNeedsReview:{ backgroundColor: '#FFFBEB' },
  cell:          { flexDirection: 'row', alignItems: 'center' },
  cellText:      { fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 },
  cellFail:      { color: '#DC2626', fontWeight: '600' },
  redDot:        { width: 7, height: 7, borderRadius: 4, backgroundColor: C.red, marginRight: 4, flexShrink: 0 },
  greyDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D1D5DB', marginRight: 4, flexShrink: 0 },
  pill:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pillText:      { fontSize: 12, fontWeight: '700' },
  tableCenter:   { flexDirection: 'column', alignItems: 'center', gap: 8, padding: 28 },
  helperText:    { fontSize: 14, color: C.textMuted },

  reasonRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', paddingHorizontal: 20, paddingVertical: 7, gap: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  reasonInput: { flex: 1, fontSize: 13, color: '#374151' },

  ansBtn:     { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 5 },
  ansBtnText: { fontSize: 12, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 16, marginBottom: 2 },
  statBox:  { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
  statNum:  { fontSize: 22, fontWeight: '800' },
  statLabel:{ fontSize: 11, fontWeight: '600', marginTop: 2 },

  progressWrap:  { marginTop: 10 },
  progressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: 4, backgroundColor: '#fff', borderRadius: 2 },
  progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 5, textAlign: 'right' },

  btnWrap:      { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  gradBtn:      { borderRadius: 14, overflow: 'hidden' },
  gradBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  gradBtnText:  { fontSize: 16, fontWeight: '800', color: '#fff' },

  imageCard:   { backgroundColor: C.white, marginHorizontal: 16, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  imgHeader:   { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
  imgTitle:    { fontSize: 14, fontWeight: '700', color: C.textPrimary },
  thumbWrap:   { borderRadius: 10, overflow: 'hidden', position: 'relative', width: 130, height: 98 },
  thumb:       { width: 130, height: 98, backgroundColor: '#F3F4F6' },
  expandIcon:  { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.45)', padding: 3, borderRadius: 5 },
  addPhotoBtn: { width: 78, height: 98, borderRadius: 10, borderWidth: 2, borderColor: '#E0D9F0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F8FF' },
  addPhotoText:{ fontSize: 11, color: C.purple, fontWeight: '600', marginTop: 3 },
  removeBtn:   { position: 'absolute', top: 3, right: 3, backgroundColor: C.white, borderRadius: 10 },

  fsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)', justifyContent: 'center', alignItems: 'center' },
  fsClose:   { position: 'absolute', top: 52, right: 20, zIndex: 10 },
  fsCounter: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 10 },
  fsNav:     { flexDirection: 'row', gap: 60, marginTop: 20 },
  fsNavBtn:  { padding: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 30 },

  popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 },
  popupSheet:   { backgroundColor: C.white, borderRadius: 20, width: '100%', maxHeight: height * 0.76, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 12 },
  popupHeader:  { paddingVertical: 18, paddingHorizontal: 20, alignItems: 'center' },
  popupTitle:   { fontSize: 17, fontWeight: '800', color: '#fff' },
  popupSub:     { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  popupScroll:  { maxHeight: height * 0.48 },
  popupBtns:    { flexDirection: 'row', padding: 14, gap: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  popupBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: 11 },
  popupBtnGrad: { flex: 1, borderRadius: 11, overflow: 'hidden' },
  popupBtnInner:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13 },
  popupBtnText: { fontSize: 13, fontWeight: '700' },

  statusCard:      { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statusCardTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  statusBtnRow:    { flexDirection: 'row', gap: 12 },
  statusBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: C.border },
  statusBtnText:   { fontSize: 14, fontWeight: '700' },

  reviewAlert:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 12, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FCD34D', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  reviewAlertText: { flex: 1, fontSize: 13, color: '#92400E', fontWeight: '500' },

  refillCard:      { backgroundColor: C.white, marginHorizontal: 16, marginTop: 14, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  refillHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 13, backgroundColor: C.purpleLight, borderBottomWidth: 1, borderBottomColor: '#E0D9F0' },
  refillTitle:     { fontSize: 14, fontWeight: '700', color: C.purple },
  refillColHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F9F8FF', borderBottomWidth: 1, borderBottomColor: '#EDE9FE' },
  refillColText:   { fontSize: 12, fontWeight: '700', color: C.purple },
  refillRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  refillItemName:  { fontSize: 13, color: '#374151', fontWeight: '500' },
  refillUnit:      { fontSize: 12, color: C.textSecond },
  refillInput:     { width: 68, borderWidth: 1.5, borderColor: C.purpleLight, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, fontSize: 14, color: C.textPrimary, textAlign: 'center', backgroundColor: '#F9F8FF' },
});