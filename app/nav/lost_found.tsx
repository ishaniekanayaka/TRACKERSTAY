
// // app/lost-found/index.tsx
// import React, { useState, useEffect, useRef, useCallback, memo } from "react";
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
//   ScrollView,
//   Image,
//   TextInput,
//   Platform,
//   Animated,
//   Dimensions,
//   KeyboardAvoidingView,
//   Keyboard,
//   TouchableWithoutFeedback,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { useRouter } from "expo-router";
// import lostFoundService, {
//   LostItem,
//   FoundItem,
//   parseImageUrl,
// } from "@/services/lost_&_found";
// import HeaderWithMenu from "../../components/HeaderWithMenu";

// const { width } = Dimensions.get("window");

// type Tab    = "found" | "lost";
// type Status = "Pending" | "Returned" | "Unclaimed";
// type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// /* ─────────────────────── helpers ─────────────────────── */

// const STATUS_STYLES: Record<string, { bg: string; border: string; text: string }> = {
//   returned:  { bg: "#D1FAE5", border: "#10B981", text: "#065F46" },
//   pending:   { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
//   unclaimed: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
// };

// const getStatusStyle = (s: string) =>
//   STATUS_STYLES[s.toLowerCase()] ?? { bg: "#F3F4F6", border: "#9CA3AF", text: "#374151" };

// const fmtDate = (d: string) =>
//   new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// /* ─────────────────────── component ─────────────────────── */

// const LostFound = () => {
//   const router = useRouter();

//   const [activeTab,  setActiveTab]  = useState<Tab>("found");
//   const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
//   const [lostItems,  setLostItems]  = useState<LostItem[]>([]);
//   const [loading,    setLoading]    = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   /* modals */
//   const [showAddModal,    setShowAddModal]    = useState(false);
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [selectedFound,   setSelectedFound]   = useState<FoundItem | null>(null);
//   const [selectedLost,    setSelectedLost]    = useState<LostItem  | null>(null);

//   /* add-form state */
//   const [addType,    setAddType]    = useState<Tab>("found");
//   const [fName,      setFName]      = useState("");
//   const [fPhone,     setFPhone]     = useState("");
//   const [fEmail,     setFEmail]     = useState("");
//   const [fItem,      setFItem]      = useState("");
//   const [fLocation,  setFLocation]  = useState("");
//   const [fDate,      setFDate]      = useState(new Date());
//   const [fTime,      setFTime]      = useState<Date | null>(null);
//   const [fNotes,     setFNotes]     = useState("");
//   const [fStatus,    setFStatus]    = useState<Status>("Pending");
//   const [fImages,    setFImages]    = useState<{ uri: string; name: string; type: string }[]>([]);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [saving,         setSaving]         = useState(false);

//   /* status dropdown modal */
//   const [showStatusDropdown, setShowStatusDropdown] = useState(false);

//   const tabAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => { load(); }, []);
//   useEffect(() => {
//     Animated.spring(tabAnim, {
//       toValue: activeTab === "found" ? 0 : 1,
//       useNativeDriver: false, tension: 60, friction: 8,
//     }).start();
//   }, [activeTab]);

//   /* ── load ── */
//   const load = async () => {
//     try {
//       setLoading(true);
//       const [f, l] = await Promise.all([
//         lostFoundService.getFoundItems(),
//         lostFoundService.getLostItems(),
//       ]);
//       setFoundItems(f.item ?? []);
//       setLostItems(l.item  ?? []);
//     } catch {
//       Alert.alert("Error", "Failed to load items");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => { setRefreshing(true); load(); };

//   /* ── summary counts ── */
//   const countBy = (items: (FoundItem | LostItem)[], key: Status) =>
//     items.filter((i) => i.status === key).length;

//   const currentItems = activeTab === "found" ? foundItems : lostItems;
//   const summaryData = [
//     { label: "Total",     count: currentItems.length,               color: "#6B5B95", bg: "#EDE9FE", icon: "layers-outline"          as IoniconsName },
//     { label: "Pending",   count: countBy(currentItems, "Pending"),  color: "#F59E0B", bg: "#FEF3C7", icon: "time-outline"             as IoniconsName },
//     { label: "Returned",  count: countBy(currentItems, "Returned"), color: "#10B981", bg: "#D1FAE5", icon: "checkmark-circle-outline" as IoniconsName },
//     { label: "Unclaimed", count: countBy(currentItems,"Unclaimed"), color: "#EF4444", bg: "#FEE2E2", icon: "alert-circle-outline"     as IoniconsName },
//   ];

//   /* ── image picker ── */
//   const pickImages = async () => {
//     const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!perm.granted) { Alert.alert("Permission needed", "Allow photo access."); return; }
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//       quality: 0.8,
//     });
//     if (!result.canceled) {
//       const picked = result.assets.map((a) => ({
//         uri:  a.uri,
//         name: a.fileName ?? `photo_${Date.now()}.jpg`,
//         type: a.mimeType ?? "image/jpeg",
//       }));
//       setFImages((prev) => [...prev, ...picked].slice(0, 5));
//     }
//   };

//   /* ── reset form ── */
//   const resetForm = () => {
//     setFName(""); setFPhone(""); setFEmail(""); setFItem("");
//     setFLocation(""); setFDate(new Date()); setFTime(null);
//     setFNotes(""); setFStatus("Pending"); setFImages([]);
//   };

//   /* ── open add modal ── */
//   const openAdd = (type: Tab) => { setAddType(type); resetForm(); setShowAddModal(true); };

//   /* ── save ── */
//   const handleSave = async () => {
//     if (!fName.trim() || !fPhone.trim() || !fItem.trim() || !fLocation.trim()) {
//       Alert.alert("Required", "Please fill in all required fields."); return;
//     }
//     try {
//       setSaving(true);
//       const dateStr = fDate.toISOString().split("T")[0];
//       const timeStr = fTime ? fTime.toTimeString().split(" ")[0].slice(0, 5) : undefined;

//       if (addType === "found") {
//         await lostFoundService.storeFoundItem({
//           finder_name: fName, telephone: fPhone, email: fEmail || undefined,
//           item_name: fItem, location: fLocation, found_date: dateStr,
//           found_time: timeStr, additional_notes: fNotes || undefined,
//           status: fStatus, file_upload: fImages.length ? fImages : undefined,
//         });
//       } else {
//         await lostFoundService.storeLostItem({
//           guest_name: fName, telephone: fPhone, email: fEmail || undefined,
//           item_name: fItem, location: fLocation, lost_date: dateStr,
//           lost_time: timeStr, additional_notes: fNotes || undefined,
//           status: fStatus, file_upload: fImages.length ? fImages : undefined,
//         });
//       }
//       Alert.alert("Success", `${addType === "found" ? "Found" : "Lost"} item saved!`);
//       setShowAddModal(false);
//       load();
//     } catch (e: any) {
//       Alert.alert("Error", e.message ?? "Failed to save item");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ────────── RENDER CARD ────────── */
//   const renderFoundCard = ({ item }: { item: FoundItem }) => {
//     const ss  = getStatusStyle(item.status);
//     const img = parseImageUrl(item.file_path);
//     return (
//       <TouchableOpacity
//         style={styles.card} activeOpacity={0.75}
//         onPress={() => { setSelectedFound(item); setSelectedLost(null); setShowDetailModal(true); }}
//       >
//         <View style={styles.cardRow}>
//           <View style={styles.thumbWrap}>
//             {img ? (
//               <Image source={{ uri: img }} style={styles.thumb} resizeMode="cover" />
//             ) : (
//               <View style={[styles.thumb, styles.thumbPlaceholder]}>
//                 <Ionicons name="search-circle" size={28} color="#6B5B95" />
//               </View>
//             )}
//           </View>
//           <View style={styles.cardContent}>
//             <View style={styles.cardTitleRow}>
//               <Text style={styles.cardItemName} numberOfLines={1}>{item.item_name}</Text>
//               <View style={[styles.statusBadge, { backgroundColor: ss.bg, borderColor: ss.border }]}>
//                 <Text style={[styles.statusText, { color: ss.text }]}>{item.status}</Text>
//               </View>
//             </View>
//             <Text style={styles.cardSub}>
//               <Ionicons name="person-outline" size={12} color="#6B7280" /> {item.finder_name}
//             </Text>
//             <View style={styles.cardMeta}>
//               <View style={styles.metaChip}>
//                 <Ionicons name="location-outline" size={12} color="#6B5B95" />
//                 <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
//               </View>
//               <View style={styles.metaChip}>
//                 <Ionicons name="calendar-outline" size={12} color="#6B5B95" />
//                 <Text style={styles.metaText}>{fmtDate(item.found_date)}</Text>
//               </View>
//             </View>
//           </View>
//           <Ionicons name="chevron-forward" size={18} color="#D1D5DB" style={{ marginLeft: 4 }} />
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const renderLostCard = ({ item }: { item: LostItem }) => {
//     const ss  = getStatusStyle(item.status);
//     const img = parseImageUrl(item.file_path);
//     return (
//       <TouchableOpacity
//         style={styles.card} activeOpacity={0.75}
//         onPress={() => { setSelectedLost(item); setSelectedFound(null); setShowDetailModal(true); }}
//       >
//         <View style={styles.cardRow}>
//           <View style={styles.thumbWrap}>
//             {img ? (
//               <Image source={{ uri: img }} style={styles.thumb} resizeMode="cover" />
//             ) : (
//               <View style={[styles.thumb, styles.thumbPlaceholder]}>
//                 <Ionicons name="help-circle" size={28} color="#F59E0B" />
//               </View>
//             )}
//           </View>
//           <View style={styles.cardContent}>
//             <View style={styles.cardTitleRow}>
//               <Text style={styles.cardItemName} numberOfLines={1}>{item.item_name}</Text>
//               <View style={[styles.statusBadge, { backgroundColor: ss.bg, borderColor: ss.border }]}>
//                 <Text style={[styles.statusText, { color: ss.text }]}>{item.status}</Text>
//               </View>
//             </View>
//             <Text style={styles.cardSub}>
//               <Ionicons name="person-outline" size={12} color="#6B7280" /> {item.guest_name}
//             </Text>
//             <View style={styles.cardMeta}>
//               <View style={styles.metaChip}>
//                 <Ionicons name="location-outline" size={12} color="#F59E0B" />
//                 <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
//               </View>
//               <View style={styles.metaChip}>
//                 <Ionicons name="calendar-outline" size={12} color="#F59E0B" />
//                 <Text style={styles.metaText}>{fmtDate(item.lost_date)}</Text>
//               </View>
//             </View>
//           </View>
//           <Ionicons name="chevron-forward" size={18} color="#D1D5DB" style={{ marginLeft: 4 }} />
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   /* ────────── DETAIL MODAL ────────── */
//   const renderDetailModal = () => {
//     const item = selectedFound ?? selectedLost;
//     if (!item) return null;

//     const isFound     = !!selectedFound;
//     const ss          = getStatusStyle(item.status);
//     const accentColor = isFound ? "#6B5B95" : "#F59E0B";
//     const img         = parseImageUrl(item.file_path);
//     const name        = isFound ? (item as FoundItem).finder_name : (item as LostItem).guest_name;
//     const date        = isFound ? (item as FoundItem).found_date  : (item as LostItem).lost_date;
//     const time        = isFound ? (item as FoundItem).found_time  : (item as LostItem).lost_time;
//     const note        = isFound ? (item as FoundItem).additional_notes : (item as LostItem).additional_note;

//     const Row = ({ label, value }: { label: string; value: string }) => (
//       <View style={styles.detailRow}>
//         <Text style={styles.detailLabel}>{label}</Text>
//         <Text style={styles.detailValue}>{value}</Text>
//       </View>
//     );

//     return (
//       <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.detailSheet}>
//             <View style={styles.sheetHandle} />
//             <View style={[styles.detailHeader, { borderBottomColor: accentColor + "22" }]}>
//               <View style={[styles.detailHeaderIcon, { backgroundColor: accentColor + "18" }]}>
//                 <Ionicons name={isFound ? "search-circle" : "help-circle"} size={26} color={accentColor} />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.detailItemName}>{item.item_name}</Text>
//                 <Text style={[styles.detailType, { color: accentColor }]}>
//                   {isFound ? "Found Item" : "Lost Item"} · #{item.id}
//                 </Text>
//               </View>
//               <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.closeBtn}>
//                 <Ionicons name="close" size={22} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
//               {img && <Image source={{ uri: img }} style={styles.detailImage} resizeMode="cover" />}
//               <View style={styles.detailStatusRow}>
//                 <View style={[styles.detailStatusBadge, { backgroundColor: ss.bg, borderColor: ss.border }]}>
//                   <Text style={[styles.detailStatusText, { color: ss.text }]}>{item.status}</Text>
//                 </View>
//               </View>
//               <View style={styles.detailSection}>
//                 <Text style={[styles.detailSectionTitle, { color: accentColor }]}>
//                   {isFound ? "Finder" : "Guest"} Information
//                 </Text>
//                 <Row label="Name"  value={name} />
//                 <Row label="Phone" value={item.telephone} />
//                 {item.email && <Row label="Email" value={item.email} />}
//               </View>
//               <View style={styles.detailSection}>
//                 <Text style={[styles.detailSectionTitle, { color: accentColor }]}>Item Details</Text>
//                 <Row label="Item"     value={item.item_name} />
//                 <Row label="Location" value={item.location} />
//                 <Row label="Date"     value={fmtDate(date)} />
//                 {time && <Row label="Time"  value={time} />}
//                 {note && <Row label="Notes" value={note} />}
//               </View>
//               <View style={[styles.detailSection, { borderBottomWidth: 0 }]}>
//                 <Text style={[styles.detailSectionTitle, { color: accentColor }]}>Record Info</Text>
//                 <Row label="Created" value={fmtDate(item.created_at)} />
//                 <Row label="Updated" value={fmtDate(item.updated_at)} />
//               </View>
//             </ScrollView>

//             <View style={styles.detailFooter}>
//               <TouchableOpacity style={styles.closeFullBtn} onPress={() => setShowDetailModal(false)}>
//                 <Text style={styles.closeFullBtnText}>Close</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   /* ══════════════════════════════════════════════════════════════════════════
//      STATUS DROPDOWN MODAL  (utility-style custom dropdown)
//   ══════════════════════════════════════════════════════════════════════════ */
//   const renderStatusDropdown = () => {
//     const isFound     = addType === "found";
//     const accentColor = isFound ? "#6B5B95" : "#F59E0B";

//     const statusConfig: { value: Status; icon: IoniconsName; color: string; bg: string }[] = [
//       { value: "Pending",   icon: "time-outline",             color: "#F59E0B", bg: "#FEF3C7" },
//       { value: "Returned",  icon: "checkmark-circle-outline", color: "#10B981", bg: "#D1FAE5" },
//       { value: "Unclaimed", icon: "alert-circle-outline",     color: "#EF4444", bg: "#FEE2E2" },
//     ];

//     return (
//       <Modal visible={showStatusDropdown} animationType="fade" transparent onRequestClose={() => setShowStatusDropdown(false)}>
//         <TouchableWithoutFeedback onPress={() => setShowStatusDropdown(false)}>
//           <View style={styles.dropdownOverlay}>
//             <TouchableWithoutFeedback>
//               <View style={styles.dropdownBox}>
//                 <View style={styles.dropdownHeader}>
//                   <Text style={styles.dropdownTitle}>Select Status</Text>
//                   <TouchableOpacity onPress={() => setShowStatusDropdown(false)}>
//                     <Ionicons name="close" size={22} color="#6B7280" />
//                   </TouchableOpacity>
//                 </View>
//                 {statusConfig.map(({ value, icon, color, bg }) => {
//                   const isSel = fStatus === value;
//                   return (
//                     <TouchableOpacity
//                       key={value}
//                       style={[styles.dropdownItem, isSel && { backgroundColor: bg }]}
//                       onPress={() => { setFStatus(value); setShowStatusDropdown(false); }}
//                     >
//                       <View style={[styles.dropdownItemIcon, { backgroundColor: isSel ? bg : "#F3F4F6" }]}>
//                         <Ionicons name={icon} size={16} color={isSel ? color : "#9CA3AF"} />
//                       </View>
//                       <Text style={[styles.dropdownItemText, isSel && { color, fontWeight: "700" }]}>
//                         {value}
//                       </Text>
//                       {isSel && <Ionicons name="checkmark" size={18} color={color} style={{ marginLeft: "auto" }} />}
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     );
//   };

//   /* ══════════════════════════════════════════════════════════════════════════
//      ADD MODAL  — utility-style compact design
//   ══════════════════════════════════════════════════════════════════════════ */
//   const renderAddModal = () => {
//     const isFound     = addType === "found";
//     const accentColor = isFound ? "#6B5B95" : "#F59E0B";
//     const accentBg    = isFound ? "#EDE9FE" : "#FEF3C7";
//     const label       = isFound ? "Found" : "Lost";

//     const statusInfo = { Pending: { color: "#F59E0B", bg: "#FEF3C7" }, Returned: { color: "#10B981", bg: "#D1FAE5" }, Unclaimed: { color: "#EF4444", bg: "#FEE2E2" } }[fStatus];

//     return (
//       <Modal
//         visible={showAddModal}
//         transparent
//         animationType="slide"
//         statusBarTranslucent
//         onRequestClose={() => setShowAddModal(false)}
//       >
//         <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
//           <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View style={styles.modalOverlay}>
//               <View style={styles.addSheet}>

//                 {/* ── Handle ── */}
//                 <View style={styles.sheetHandle} />

//                 {/* ── Header ── */}
//                 <View style={[styles.compactModalHeader, { borderBottomColor: accentColor + "22" }]}>
//                   <View style={styles.compactModalTitleRow}>
//                     <View style={[styles.compactModalIcon, { backgroundColor: accentBg }]}>
//                       <Ionicons
//                         name={isFound ? "search-circle-outline" : "help-circle-outline"}
//                         size={18} color={accentColor}
//                       />
//                     </View>
//                     <Text style={styles.compactModalTitle}>
//                       Add {label} Item
//                     </Text>
//                   </View>
//                   <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeBtn}>
//                     <Ionicons name="close" size={20} color="#6B7280" />
//                   </TouchableOpacity>
//                 </View>

//                 {/* ── Scrollable fields ── */}
//                 <ScrollView
//                   style={{ flex: 1 }}
//                   contentContainerStyle={styles.compactFormScroll}
//                   keyboardShouldPersistTaps="always"
//                   showsVerticalScrollIndicator={false}
//                 >

//                   {/* ── Section: Finder/Guest Info ── */}
//                   <Text style={[styles.compactSectionLabel, { color: accentColor }]}>
//                     {isFound ? "Finder" : "Guest"} Info
//                   </Text>

//                   {/* Name */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Name *</Text>
//                     <View style={styles.compactInput}>
//                       <Ionicons name="person-outline" size={16} color={accentColor} />
//                       <TextInput
//                         style={styles.compactTextInput}
//                         placeholder={isFound ? "Finder / Guest Name" : "Guest Name"}
//                         placeholderTextColor="#9CA3AF"
//                         value={fName}
//                         onChangeText={setFName}
//                         blurOnSubmit={false}
//                         returnKeyType="next"
//                       />
//                     </View>
//                   </View>

//                   {/* Phone */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Telephone *</Text>
//                     <View style={styles.compactInput}>
//                       <Ionicons name="call-outline" size={16} color={accentColor} />
//                       <TextInput
//                         style={styles.compactTextInput}
//                         placeholder="Phone number"
//                         placeholderTextColor="#9CA3AF"
//                         value={fPhone}
//                         onChangeText={setFPhone}
//                         keyboardType="phone-pad"
//                         blurOnSubmit={false}
//                         returnKeyType="next"
//                       />
//                     </View>
//                   </View>

//                   {/* Email */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Email</Text>
//                     <View style={styles.compactInput}>
//                       <Ionicons name="mail-outline" size={16} color={accentColor} />
//                       <TextInput
//                         style={styles.compactTextInput}
//                         placeholder="Email address (optional)"
//                         placeholderTextColor="#9CA3AF"
//                         value={fEmail}
//                         onChangeText={setFEmail}
//                         keyboardType="email-address"
//                         blurOnSubmit={false}
//                         returnKeyType="next"
//                       />
//                     </View>
//                   </View>

//                   {/* ── Section: Item Details ── */}
//                   <Text style={[styles.compactSectionLabel, { color: accentColor }]}>
//                     Item Details
//                   </Text>

//                   {/* Item Name */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Item Name *</Text>
//                     <View style={styles.compactInput}>
//                       <Ionicons name="cube-outline" size={16} color={accentColor} />
//                       <TextInput
//                         style={styles.compactTextInput}
//                         placeholder="Describe the item"
//                         placeholderTextColor="#9CA3AF"
//                         value={fItem}
//                         onChangeText={setFItem}
//                         blurOnSubmit={false}
//                         returnKeyType="next"
//                       />
//                     </View>
//                   </View>

//                   {/* Location */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Location *</Text>
//                     <View style={styles.compactInput}>
//                       <Ionicons name="location-outline" size={16} color={accentColor} />
//                       <TextInput
//                         style={styles.compactTextInput}
//                         placeholder="Where was it found/lost?"
//                         placeholderTextColor="#9CA3AF"
//                         value={fLocation}
//                         onChangeText={setFLocation}
//                         blurOnSubmit={false}
//                         returnKeyType="next"
//                       />
//                     </View>
//                   </View>

//                   {/* Date */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>{isFound ? "Found" : "Lost"} Date</Text>
//                     <TouchableOpacity style={styles.compactInput} onPress={() => setShowDatePicker(true)}>
//                       <Ionicons name="calendar-outline" size={16} color={accentColor} />
//                       <Text style={[styles.compactTextInput, { color: "#1F2937" }]}>
//                         {fDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>

//                   {showDatePicker && (
//                     <DateTimePicker
//                       value={fDate} mode="date" display="default"
//                       onChange={(_, d) => { setShowDatePicker(false); if (d) setFDate(d); }}
//                     />
//                   )}

//                   {/* Time — found only */}
//                   {isFound && (
//                     <View style={styles.compactFormGroup}>
//                       <Text style={styles.compactLabel}>Found Time</Text>
//                       <TouchableOpacity style={styles.compactInput} onPress={() => setShowTimePicker(true)}>
//                         <Ionicons name="time-outline" size={16} color={accentColor} />
//                         <Text style={[styles.compactTextInput, { color: fTime ? "#1F2937" : "#9CA3AF" }]}>
//                           {fTime
//                             ? fTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
//                             : "Select time (optional)"}
//                         </Text>
//                       </TouchableOpacity>
//                     </View>
//                   )}

//                   {showTimePicker && (
//                     <DateTimePicker
//                       value={fTime ?? new Date()} mode="time" display="default"
//                       onChange={(_, t) => { setShowTimePicker(false); if (t) setFTime(t); }}
//                     />
//                   )}

//                   {/* Notes */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Additional Notes</Text>
//                     <View style={[styles.compactInput, { alignItems: "flex-start", paddingVertical: 12 }]}>
//                       <Ionicons name="document-text-outline" size={16} color={accentColor} style={{ marginTop: 2 }} />
//                       <TextInput
//                         style={[styles.compactTextInput, { minHeight: 72, textAlignVertical: "top" }]}
//                         placeholder="Any additional details (optional)"
//                         placeholderTextColor="#9CA3AF"
//                         value={fNotes}
//                         onChangeText={setFNotes}
//                         multiline
//                         blurOnSubmit={false}
//                       />
//                     </View>
//                   </View>

//                   {/* ── Section: Status ── */}
//                   <Text style={[styles.compactSectionLabel, { color: accentColor }]}>Status</Text>

//                   <View style={styles.compactFormGroup}>
//                     <TouchableOpacity style={styles.compactInput} onPress={() => setShowStatusDropdown(true)}>
//                       <View style={[styles.statusDot, { backgroundColor: statusInfo.bg }]}>
//                         <View style={[styles.statusDotInner, { backgroundColor: statusInfo.color }]} />
//                       </View>
//                       <Text style={[styles.compactTextInput, { flex: 1, color: "#1F2937" }]}>
//                         {fStatus}
//                       </Text>
//                       <Ionicons name="chevron-down" size={16} color="#6B7280" />
//                     </TouchableOpacity>
//                   </View>

//                   {/* ── Section: Images ── */}
//                   <Text style={[styles.compactSectionLabel, { color: accentColor }]}>
//                     Images (optional, max 5)
//                   </Text>

//                   <View style={styles.imageRow}>
//                     {fImages.map((img, idx) => (
//                       <View key={idx} style={styles.imgThumbWrap}>
//                         <Image source={{ uri: img.uri }} style={styles.imgThumb} resizeMode="cover" />
//                         <TouchableOpacity
//                           style={styles.imgRemove}
//                           onPress={() => setFImages((p) => p.filter((_, i) => i !== idx))}
//                         >
//                           <Ionicons name="close-circle" size={18} color="#EF4444" />
//                         </TouchableOpacity>
//                       </View>
//                     ))}
//                     {fImages.length < 5 && (
//                       <TouchableOpacity
//                         style={[styles.imgAdd, { borderColor: accentColor }]}
//                         onPress={pickImages}
//                       >
//                         <View style={[styles.compactCameraIcon, { backgroundColor: accentBg }]}>
//                           <Ionicons name="camera" size={20} color={accentColor} />
//                         </View>
//                         <Text style={[styles.imgAddText, { color: accentColor }]}>Add Photo</Text>
//                       </TouchableOpacity>
//                     )}
//                   </View>

//                   <View style={{ height: 8 }} />

//                 </ScrollView>

//                 {/* ── Save button — pinned footer ── */}
//                 <View style={styles.submitFooter}>
//                   <TouchableOpacity
//                     style={[styles.compactSubmitButton, saving && { opacity: 0.7 }]}
//                     onPress={handleSave}
//                     disabled={saving}
//                   >
//                     <View style={[styles.compactSubmitGradient, { backgroundColor: accentColor }]}>
//                       {saving ? (
//                         <ActivityIndicator color="#fff" />
//                       ) : (
//                         <>
//                           <Ionicons name="checkmark-circle" size={18} color="#fff" />
//                           <Text style={styles.compactSubmitText}>Save {label} Item</Text>
//                         </>
//                       )}
//                     </View>
//                   </TouchableOpacity>
//                 </View>

//               </View>
//             </View>
//           </TouchableWithoutFeedback>
//         </KeyboardAvoidingView>
//       </Modal>
//     );
//   };

//   /* ─────────────────── RENDER ─────────────────── */
//   return (
//     <View style={styles.container}>
//       <HeaderWithMenu
//         title="Lost & Found"
//         subtitle="Track and manage lost and found items"
//         currentPage=""
//       />

//       {/* ── Tab bar ── */}
//       <View style={styles.tabBar}>
//         {(["found", "lost"] as Tab[]).map((t) => {
//           const isActive = activeTab === t;
//           const color    = t === "found" ? "#6B5B95" : "#F59E0B";
//           return (
//             <TouchableOpacity
//               key={t}
//               style={[styles.tabBtn, isActive && { borderBottomColor: color, borderBottomWidth: 2.5 }]}
//               onPress={() => setActiveTab(t)}
//               activeOpacity={0.8}
//             >
//               <Ionicons
//                 name={t === "found" ? "search-circle-outline" : "help-circle-outline"}
//                 size={18} color={isActive ? color : "#9CA3AF"}
//               />
//               <Text style={[styles.tabLabel, isActive && { color, fontWeight: "700" }]}>
//                 {t === "found" ? "Found Items" : "Lost Items"}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       {/* ── Summary Strip ── */}
//       <View style={styles.summaryStrip}>
//         {summaryData.map((s) => (
//           <View key={s.label} style={[styles.summaryChip, { backgroundColor: s.bg }]}>
//             <Ionicons name={s.icon} size={16} color={s.color} />
//             <Text style={[styles.summaryCount, { color: s.color }]}>{s.count}</Text>
//             <Text style={[styles.summaryLabel, { color: s.color }]}>{s.label}</Text>
//           </View>
//         ))}
//       </View>

//       {/* ── Action buttons ── */}
//       <View style={styles.actionRow}>
//         <TouchableOpacity
//           style={[styles.addBtn, { backgroundColor: "#6B5B95" }]}
//           onPress={() => openAdd("found")} activeOpacity={0.8}
//         >
//           <Ionicons name="add-circle-outline" size={18} color="#fff" />
//           <Text style={styles.addBtnText}>Add Found</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.addBtn, { backgroundColor: "#F59E0B" }]}
//           onPress={() => openAdd("lost")} activeOpacity={0.8}
//         >
//           <Ionicons name="add-circle-outline" size={18} color="#fff" />
//           <Text style={styles.addBtnText}>Add Lost</Text>
//         </TouchableOpacity>
//       </View>

//       {/* ── List ── */}
//       {activeTab === "found" ? (
//         <FlatList
//           data={foundItems} keyExtractor={(i) => `found-${i.id}`}
//           renderItem={renderFoundCard} contentContainerStyle={styles.list}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6B5B95"]} tintColor="#6B5B95" />}
//           ListHeaderComponent={loading ? <View style={styles.loadingWrap}><ActivityIndicator size="large" color="#6B5B95" /></View> : null}
//           ListEmptyComponent={!loading ? (
//             <View style={styles.empty}>
//               <Ionicons name="search-circle-outline" size={56} color="#D1D5DB" />
//               <Text style={styles.emptyTitle}>No Found Items</Text>
//               <Text style={styles.emptySub}>Add a found item using the button above</Text>
//             </View>
//           ) : null}
//         />
//       ) : (
//         <FlatList
//           data={lostItems} keyExtractor={(i) => `lost-${i.id}`}
//           renderItem={renderLostCard} contentContainerStyle={styles.list}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#F59E0B"]} tintColor="#F59E0B" />}
//           ListHeaderComponent={loading ? <View style={styles.loadingWrap}><ActivityIndicator size="large" color="#F59E0B" /></View> : null}
//           ListEmptyComponent={!loading ? (
//             <View style={styles.empty}>
//               <Ionicons name="help-circle-outline" size={56} color="#D1D5DB" />
//               <Text style={styles.emptyTitle}>No Lost Items</Text>
//               <Text style={styles.emptySub}>Add a lost item using the button above</Text>
//             </View>
//           ) : null}
//         />
//       )}

//       {renderDetailModal()}
//       {renderStatusDropdown()}
//       {renderAddModal()}
//     </View>
//   );
// };

// export default LostFound;

// /* ─────────────────────── STYLES ─────────────────────── */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F9FAFB" },

//   /* Tabs */
//   tabBar:   { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
//   tabBtn:   { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14 },
//   tabLabel: { fontSize: 14, fontWeight: "500", color: "#9CA3AF" },

//   /* Summary */
//   summaryStrip: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, gap: 8 },
//   summaryChip:  { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, gap: 3 },
//   summaryCount: { fontSize: 18, fontWeight: "800" },
//   summaryLabel: { fontSize: 10, fontWeight: "500" },

//   /* Action row */
//   actionRow:  { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
//   addBtn:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 10 },
//   addBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },

//   /* List */
//   list:        { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
//   loadingWrap: { paddingVertical: 48, alignItems: "center" },
//   empty:       { alignItems: "center", paddingVertical: 64, paddingHorizontal: 40 },
//   emptyTitle:  { fontSize: 17, fontWeight: "600", color: "#111827", marginTop: 14, marginBottom: 6 },
//   emptySub:    { fontSize: 13, color: "#6B7280", textAlign: "center" },

//   /* Card */
//   card:             { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
//   cardRow:          { flexDirection: "row", alignItems: "center" },
//   thumbWrap:        { marginRight: 12 },
//   thumb:            { width: 64, height: 64, borderRadius: 10 },
//   thumbPlaceholder: { backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center" },
//   cardContent:      { flex: 1 },
//   cardTitleRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
//   cardItemName:     { fontSize: 15, fontWeight: "600", color: "#111827", flex: 1, marginRight: 8 },
//   cardSub:          { fontSize: 12, color: "#6B7280", marginBottom: 6 },
//   cardMeta:         { flexDirection: "row", flexWrap: "wrap", gap: 6 },
//   metaChip:         { flexDirection: "row", alignItems: "center", gap: 3 },
//   metaText:         { fontSize: 11, color: "#6B7280", fontWeight: "500" },
//   statusBadge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
//   statusText:       { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },

//   /* Modals shared */
//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
//   sheetHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginTop: 10, marginBottom: 4 },
//   closeBtn:     { width: 32, height: 32, borderRadius: 16, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center" },

//   /* Detail modal */
//   detailSheet:      { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "88%", flex: 1 },
//   detailHeader:     { flexDirection: "row", alignItems: "center", padding: 16, gap: 12, borderBottomWidth: 1 },
//   detailHeaderIcon: { width: 46, height: 46, borderRadius: 12, justifyContent: "center", alignItems: "center" },
//   detailItemName:   { fontSize: 17, fontWeight: "700", color: "#111827" },
//   detailType:       { fontSize: 12, fontWeight: "600", marginTop: 2 },
//   detailImage:      { width: "100%", height: 200 },
//   detailStatusRow:  { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
//   detailStatusBadge:{ alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5 },
//   detailStatusText: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
//   detailSection:    { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
//   detailSectionTitle:{ fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
//   detailRow:        { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
//   detailLabel:      { fontSize: 13, color: "#6B7280", fontWeight: "500", width: "38%" },
//   detailValue:      { fontSize: 13, color: "#111827", fontWeight: "500", flex: 1, textAlign: "right" },
//   detailFooter:     { padding: 20, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
//   closeFullBtn:     { backgroundColor: "#F3F4F6", borderRadius: 10, paddingVertical: 14, alignItems: "center" },
//   closeFullBtnText: { fontSize: 15, fontWeight: "600", color: "#374151" },

//   /* Status dropdown modal */
//   dropdownOverlay:        { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
//   dropdownBox:            { backgroundColor: "#FFFFFF", borderRadius: 16, width: "100%", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 },
//   dropdownHeader:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
//   dropdownTitle:          { fontSize: 16, fontWeight: "700", color: "#1F2937" },
//   dropdownItem:           { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
//   dropdownItemIcon:       { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
//   dropdownItemText:       { fontSize: 15, color: "#374151", fontWeight: "500" },

//   /* Add modal — compact utility style */
//   addSheet:            { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "92%", flex: 1 },
//   compactModalHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
//   compactModalTitleRow:{ flexDirection: "row", alignItems: "center", gap: 10 },
//   compactModalIcon:    { width: 34, height: 34, borderRadius: 9, justifyContent: "center", alignItems: "center" },
//   compactModalTitle:   { fontSize: 16, fontWeight: "700", color: "#1F2937" },
//   compactFormScroll:   { padding: 16 },
//   compactSectionLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10, marginTop: 14 },
//   compactFormGroup:    { marginBottom: 12 },
//   compactLabel:        { fontSize: 12, fontWeight: "600", color: "#374151", marginBottom: 6 },
//   compactInput:        { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === "ios" ? 13 : 10, gap: 8 },
//   compactTextInput:    { flex: 1, fontSize: 14, color: "#111827", paddingVertical: 0 },

//   /* Status dot indicator */
//   statusDot:      { width: 20, height: 20, borderRadius: 10, justifyContent: "center", alignItems: "center" },
//   statusDotInner: { width: 10, height: 10, borderRadius: 5 },

//   /* Image row */
//   imageRow:    { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
//   imgThumbWrap:{ position: "relative" },
//   imgThumb:    { width: 72, height: 72, borderRadius: 8 },
//   imgRemove:   { position: "absolute", top: -6, right: -6, backgroundColor: "#fff", borderRadius: 10 },
//   imgAdd:      { width: 90, height: 72, borderRadius: 8, backgroundColor: "#F9FAFB", borderWidth: 1.5, borderStyle: "dashed", justifyContent: "center", alignItems: "center", gap: 4 },
//   compactCameraIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
//   imgAddText:  { fontSize: 10, fontWeight: "600" },

//   /* Submit footer */
//   submitFooter:        { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6", backgroundColor: "#FFFFFF" },
//   compactSubmitButton: { borderRadius: 12, overflow: "hidden" },
//   compactSubmitGradient:{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 15, gap: 8, borderRadius: 12 },
//   compactSubmitText:   { color: "#fff", fontSize: 15, fontWeight: "700" },
// });


// // // app/lost-found/index.tsx
// // import React, { useState, useEffect, useRef } from "react";
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
// //   ScrollView,
// //   Image,
// //   TextInput,
// //   Platform,
// //   Animated,
// //   Dimensions,
// //   KeyboardAvoidingView,
// //   Keyboard,
// //   TouchableWithoutFeedback,
// // } from "react-native";
// // import { Ionicons } from "@expo/vector-icons";
// // import * as ImagePicker from "expo-image-picker";
// // import DateTimePicker from "@react-native-community/datetimepicker";
// // import { useRouter } from "expo-router";
// // import lostFoundService, {
// //   LostItem,
// //   FoundItem,
// //   parseImageUrl,
// // } from "@/services/lost_&_found";
// // import HeaderWithMenu from "../../components/HeaderWithMenu";

// // const { width } = Dimensions.get("window");

// // type Tab    = "found" | "lost";
// // type Status = "Pending" | "Returned" | "Unclaimed";
// // type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// // /* ─────────────────────── status config ─────────────────────── */
// // const STATUS_META: Record<Status, { color: string; bg: string; border: string; text: string; icon: IoniconsName; sub: string }> = {
// //   Pending:   { color: "#F59E0B", bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", icon: "time-outline",             sub: "Awaiting resolution"    },
// //   Returned:  { color: "#10B981", bg: "#D1FAE5", border: "#10B981", text: "#065F46", icon: "checkmark-circle-outline", sub: "Item returned to owner" },
// //   Unclaimed: { color: "#EF4444", bg: "#FEE2E2", border: "#EF4444", text: "#991B1B", icon: "alert-circle-outline",     sub: "No owner identified yet"},
// // };

// // const getStatusStyle = (s: string) =>
// //   STATUS_META[s as Status] ?? { bg: "#F3F4F6", border: "#9CA3AF", text: "#374151", color: "#9CA3AF", icon: "help-circle-outline" as IoniconsName, sub: "" };

// // const fmtDate = (d: string) =>
// //   new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// // /* ═══════════════════════════════════════════════════════════════
// //    COMPONENT
// // ═══════════════════════════════════════════════════════════════ */
// // const LostFound = () => {
// //   const router = useRouter();

// //   const [activeTab,  setActiveTab]  = useState<Tab>("found");
// //   const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
// //   const [lostItems,  setLostItems]  = useState<LostItem[]>([]);
// //   const [loading,    setLoading]    = useState(false);
// //   const [refreshing, setRefreshing] = useState(false);

// //   /* modals */
// //   const [showAddModal,    setShowAddModal]    = useState(false);
// //   const [showDetailModal, setShowDetailModal] = useState(false);
// //   const [selectedFound,   setSelectedFound]   = useState<FoundItem | null>(null);
// //   const [selectedLost,    setSelectedLost]    = useState<LostItem  | null>(null);

// //   /* form */
// //   const [addType,   setAddType]   = useState<Tab>("found");
// //   const [fName,     setFName]     = useState("");
// //   const [fPhone,    setFPhone]    = useState("");
// //   const [fEmail,    setFEmail]    = useState("");
// //   const [fItem,     setFItem]     = useState("");
// //   const [fLocation, setFLocation] = useState("");
// //   const [fDate,     setFDate]     = useState(new Date());
// //   const [fTime,     setFTime]     = useState<Date | null>(null);
// //   const [fNotes,    setFNotes]    = useState("");
// //   const [fStatus,   setFStatus]   = useState<Status>("Pending");
// //   const [fImages,   setFImages]   = useState<{ uri: string; name: string; type: string }[]>([]);

// //   const [showDatePicker,  setShowDatePicker]  = useState(false);
// //   const [showTimePicker,  setShowTimePicker]  = useState(false);
// //   const [saving,          setSaving]          = useState(false);
// //   const [showStatusModal, setShowStatusModal] = useState(false);
// //   const [showCameraModal, setShowCameraModal] = useState(false);

// //   const tabAnim = useRef(new Animated.Value(0)).current;

// //   /* ── effects ── */
// //   useEffect(() => { load(); requestPermissions(); }, []);
// //   useEffect(() => {
// //     Animated.spring(tabAnim, { toValue: activeTab === "found" ? 0 : 1, useNativeDriver: false, tension: 60, friction: 8 }).start();
// //   }, [activeTab]);

// //   /* ── permissions ── */
// //   const requestPermissions = async () => {
// //     const { status: cam }   = await ImagePicker.requestCameraPermissionsAsync();
// //     const { status: media } = await ImagePicker.requestMediaLibraryPermissionsAsync();
// //     if (cam !== "granted" || media !== "granted")
// //       Alert.alert("Permissions Required", "Camera and gallery permissions are needed.");
// //   };

// //   /* ── load ── */
// //   const load = async () => {
// //     try {
// //       setLoading(true);
// //       const [f, l] = await Promise.all([lostFoundService.getFoundItems(), lostFoundService.getLostItems()]);
// //       setFoundItems(f.item ?? []);
// //       setLostItems(l.item  ?? []);
// //     } catch { Alert.alert("Error", "Failed to load items"); }
// //     finally  { setLoading(false); setRefreshing(false); }
// //   };
// //   const onRefresh = () => { setRefreshing(true); load(); };

// //   /* ── summary ── */
// //   const countBy = (items: (FoundItem | LostItem)[], key: Status) => items.filter(i => i.status === key).length;
// //   const currentItems = activeTab === "found" ? foundItems : lostItems;
// //   const summaryData = [
// //     { label: "Total",     count: currentItems.length,               color: "#6B5B95", bg: "#EDE9FE", icon: "layers-outline"          as IoniconsName },
// //     { label: "Pending",   count: countBy(currentItems, "Pending"),  color: "#F59E0B", bg: "#FEF3C7", icon: "time-outline"             as IoniconsName },
// //     { label: "Returned",  count: countBy(currentItems, "Returned"), color: "#10B981", bg: "#D1FAE5", icon: "checkmark-circle-outline" as IoniconsName },
// //     { label: "Unclaimed", count: countBy(currentItems, "Unclaimed"),color: "#EF4444", bg: "#FEE2E2", icon: "alert-circle-outline"     as IoniconsName },
// //   ];

// //   /* ════════════════════════════════════════════════
// //      IMAGE PICKER — same pattern as utility.tsx
// //   ════════════════════════════════════════════════ */
// //   const pickImage = async (source: "camera" | "gallery") => {
// //     setShowCameraModal(false);
// //     try {
// //       const opts = {
// //         mediaTypes: ["images" as const],
// //         allowsEditing: true,
// //         aspect: [4, 3] as [number, number],
// //         quality: 0.7,
// //       };
// //       const result = source === "camera"
// //         ? await ImagePicker.launchCameraAsync(opts)
// //         : await ImagePicker.launchImageLibraryAsync(opts);

// //       if (!result.canceled && result.assets[0]) {
// //         const { uri, fileName, mimeType } = result.assets[0];
// //         setFImages(prev =>
// //           [...prev, { uri, name: fileName ?? `photo_${Date.now()}.jpg`, type: mimeType ?? "image/jpeg" }].slice(0, 5)
// //         );
// //       }
// //     } catch { Alert.alert("Error", "Failed to pick image"); }
// //   };

// //   /* ── reset / open ── */
// //   const resetForm = () => {
// //     setFName(""); setFPhone(""); setFEmail(""); setFItem("");
// //     setFLocation(""); setFDate(new Date()); setFTime(null);
// //     setFNotes(""); setFStatus("Pending"); setFImages([]);
// //   };
// //   const openAdd = (type: Tab) => { setAddType(type); resetForm(); setShowAddModal(true); };

// //   /* ── save ── */
// //   const handleSave = async () => {
// //     if (!fName.trim() || !fPhone.trim() || !fItem.trim() || !fLocation.trim()) {
// //       Alert.alert("Required", "Please fill in all required fields."); return;
// //     }
// //     try {
// //       setSaving(true);
// //       const dateStr = fDate.toISOString().split("T")[0];
// //       const timeStr = fTime ? fTime.toTimeString().split(" ")[0].slice(0, 5) : undefined;
// //       if (addType === "found") {
// //         await lostFoundService.storeFoundItem({
// //           finder_name: fName, telephone: fPhone, email: fEmail || undefined,
// //           item_name: fItem, location: fLocation, found_date: dateStr,
// //           found_time: timeStr, additional_notes: fNotes || undefined,
// //           status: fStatus, file_upload: fImages.length ? fImages : undefined,
// //         });
// //       } else {
// //         await lostFoundService.storeLostItem({
// //           guest_name: fName, telephone: fPhone, email: fEmail || undefined,
// //           item_name: fItem, location: fLocation, lost_date: dateStr,
// //           lost_time: timeStr, additional_notes: fNotes || undefined,
// //           status: fStatus, file_upload: fImages.length ? fImages : undefined,
// //         });
// //       }
// //       setShowAddModal(false);
// //       setTimeout(() => Alert.alert("Success", `${addType === "found" ? "Found" : "Lost"} item saved!`,
// //         [{ text: "OK", onPress: () => { resetForm(); load(); } }]
// //       ), 300);
// //     } catch (e: any) { Alert.alert("Error", e.message ?? "Failed to save item"); }
// //     finally { setSaving(false); }
// //   };

// //   /* ═══════════════════════════════════════════════
// //      CARDS
// //   ═══════════════════════════════════════════════ */
// //   const renderFoundCard = ({ item }: { item: FoundItem }) => {
// //     const ss  = getStatusStyle(item.status);
// //     const img = parseImageUrl(item.file_path);
// //     return (
// //       <TouchableOpacity style={styles.card} activeOpacity={0.75}
// //         onPress={() => { setSelectedFound(item); setSelectedLost(null); setShowDetailModal(true); }}>
// //         <View style={styles.cardRow}>
// //           <View style={styles.thumbWrap}>
// //             {img
// //               ? <Image source={{ uri: img }} style={styles.thumb} resizeMode="cover" />
// //               : <View style={[styles.thumb, styles.thumbPlaceholder]}><Ionicons name="search-circle" size={28} color="#6B5B95" /></View>}
// //           </View>
// //           <View style={styles.cardContent}>
// //             <View style={styles.cardTitleRow}>
// //               <Text style={styles.cardItemName} numberOfLines={1}>{item.item_name}</Text>
// //               <View style={[styles.statusBadge, { backgroundColor: ss.bg, borderColor: ss.border }]}>
// //                 <Text style={[styles.statusText, { color: ss.text }]}>{item.status}</Text>
// //               </View>
// //             </View>
// //             <Text style={styles.cardSub}><Ionicons name="person-outline" size={12} color="#6B7280" /> {item.finder_name}</Text>
// //             <View style={styles.cardMeta}>
// //               <View style={styles.metaChip}><Ionicons name="location-outline" size={12} color="#6B5B95" /><Text style={styles.metaText} numberOfLines={1}>{item.location}</Text></View>
// //               <View style={styles.metaChip}><Ionicons name="calendar-outline" size={12} color="#6B5B95" /><Text style={styles.metaText}>{fmtDate(item.found_date)}</Text></View>
// //             </View>
// //           </View>
// //           <Ionicons name="chevron-forward" size={18} color="#D1D5DB" style={{ marginLeft: 4 }} />
// //         </View>
// //       </TouchableOpacity>
// //     );
// //   };

// //   const renderLostCard = ({ item }: { item: LostItem }) => {
// //     const ss  = getStatusStyle(item.status);
// //     const img = parseImageUrl(item.file_path);
// //     return (
// //       <TouchableOpacity style={styles.card} activeOpacity={0.75}
// //         onPress={() => { setSelectedLost(item); setSelectedFound(null); setShowDetailModal(true); }}>
// //         <View style={styles.cardRow}>
// //           <View style={styles.thumbWrap}>
// //             {img
// //               ? <Image source={{ uri: img }} style={styles.thumb} resizeMode="cover" />
// //               : <View style={[styles.thumb, styles.thumbPlaceholder]}><Ionicons name="help-circle" size={28} color="#F59E0B" /></View>}
// //           </View>
// //           <View style={styles.cardContent}>
// //             <View style={styles.cardTitleRow}>
// //               <Text style={styles.cardItemName} numberOfLines={1}>{item.item_name}</Text>
// //               <View style={[styles.statusBadge, { backgroundColor: ss.bg, borderColor: ss.border }]}>
// //                 <Text style={[styles.statusText, { color: ss.text }]}>{item.status}</Text>
// //               </View>
// //             </View>
// //             <Text style={styles.cardSub}><Ionicons name="person-outline" size={12} color="#6B7280" /> {item.guest_name}</Text>
// //             <View style={styles.cardMeta}>
// //               <View style={styles.metaChip}><Ionicons name="location-outline" size={12} color="#F59E0B" /><Text style={styles.metaText} numberOfLines={1}>{item.location}</Text></View>
// //               <View style={styles.metaChip}><Ionicons name="calendar-outline" size={12} color="#F59E0B" /><Text style={styles.metaText}>{fmtDate(item.lost_date)}</Text></View>
// //             </View>
// //           </View>
// //           <Ionicons name="chevron-forward" size={18} color="#D1D5DB" style={{ marginLeft: 4 }} />
// //         </View>
// //       </TouchableOpacity>
// //     );
// //   };

// //   /* ═══════════════════════════════════════════════
// //      DETAIL MODAL
// //   ═══════════════════════════════════════════════ */
// //   const renderDetailModal = () => {
// //     const item = selectedFound ?? selectedLost;
// //     if (!item) return null;
// //     const isFound     = !!selectedFound;
// //     const ss          = getStatusStyle(item.status);
// //     const accentColor = isFound ? "#6B5B95" : "#F59E0B";
// //     const img         = parseImageUrl(item.file_path);
// //     const name        = isFound ? (item as FoundItem).finder_name : (item as LostItem).guest_name;
// //     const date        = isFound ? (item as FoundItem).found_date  : (item as LostItem).lost_date;
// //     const time        = isFound ? (item as FoundItem).found_time  : (item as LostItem).lost_time;
// //     const note        = isFound ? (item as FoundItem).additional_notes : (item as LostItem).additional_note;
// //     const Row = ({ label, value }: { label: string; value: string }) => (
// //       <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>
// //     );
// //     return (
// //       <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.detailSheet}>
// //             <View style={styles.sheetHandle} />
// //             <View style={[styles.detailHeader, { borderBottomColor: accentColor + "22" }]}>
// //               <View style={[styles.detailHeaderIcon, { backgroundColor: accentColor + "18" }]}>
// //                 <Ionicons name={isFound ? "search-circle" : "help-circle"} size={26} color={accentColor} />
// //               </View>
// //               <View style={{ flex: 1 }}>
// //                 <Text style={styles.detailItemName}>{item.item_name}</Text>
// //                 <Text style={[styles.detailType, { color: accentColor }]}>{isFound ? "Found Item" : "Lost Item"} · #{item.id}</Text>
// //               </View>
// //               <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.closeBtn}>
// //                 <Ionicons name="close" size={22} color="#6B7280" />
// //               </TouchableOpacity>
// //             </View>
// //             <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
// //               {img && <Image source={{ uri: img }} style={styles.detailImage} resizeMode="cover" />}
// //               <View style={styles.detailStatusRow}>
// //                 <View style={[styles.detailStatusBadge, { backgroundColor: ss.bg, borderColor: ss.border }]}>
// //                   <Ionicons name={ss.icon as IoniconsName} size={13} color={ss.text} />
// //                   <Text style={[styles.detailStatusText, { color: ss.text }]}>{item.status}</Text>
// //                 </View>
// //               </View>
// //               <View style={styles.detailSection}>
// //                 <Text style={[styles.detailSectionTitle, { color: accentColor }]}>{isFound ? "Finder" : "Guest"} Information</Text>
// //                 <Row label="Name" value={name} />
// //                 <Row label="Phone" value={item.telephone} />
// //                 {item.email && <Row label="Email" value={item.email} />}
// //               </View>
// //               <View style={styles.detailSection}>
// //                 <Text style={[styles.detailSectionTitle, { color: accentColor }]}>Item Details</Text>
// //                 <Row label="Item"     value={item.item_name} />
// //                 <Row label="Location" value={item.location} />
// //                 <Row label="Date"     value={fmtDate(date)} />
// //                 {time && <Row label="Time"  value={time} />}
// //                 {note && <Row label="Notes" value={note} />}
// //               </View>
// //               <View style={[styles.detailSection, { borderBottomWidth: 0 }]}>
// //                 <Text style={[styles.detailSectionTitle, { color: accentColor }]}>Record Info</Text>
// //                 <Row label="Created" value={fmtDate(item.created_at)} />
// //                 <Row label="Updated" value={fmtDate(item.updated_at)} />
// //               </View>
// //             </ScrollView>
// //             <View style={styles.detailFooter}>
// //               <TouchableOpacity style={styles.closeFullBtn} onPress={() => setShowDetailModal(false)}>
// //                 <Text style={styles.closeFullBtnText}>Close</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
// //     );
// //   };

// //   /* ═══════════════════════════════════════════════
// //      STATUS DROPDOWN MODAL
// //   ═══════════════════════════════════════════════ */
// //   const renderStatusModal = () => (
// //     <Modal visible={showStatusModal} animationType="fade" transparent onRequestClose={() => setShowStatusModal(false)}>
// //       <TouchableWithoutFeedback onPress={() => setShowStatusModal(false)}>
// //         <View style={styles.dropdownOverlay}>
// //           <TouchableWithoutFeedback>
// //             <View style={styles.dropdownBox}>
// //               <View style={styles.dropdownHeader}>
// //                 <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
// //                   <View style={[styles.dropdownHeaderIcon, { backgroundColor: "#F3F4F6" }]}>
// //                     <Ionicons name="shield-checkmark-outline" size={17} color="#6B7280" />
// //                   </View>
// //                   <Text style={styles.dropdownTitle}>Select Status</Text>
// //                 </View>
// //                 <TouchableOpacity onPress={() => setShowStatusModal(false)} style={styles.closeBtn}>
// //                   <Ionicons name="close" size={20} color="#6B7280" />
// //                 </TouchableOpacity>
// //               </View>
// //               {(Object.entries(STATUS_META) as [Status, typeof STATUS_META[Status]][]).map(([value, meta]) => {
// //                 const isSel = fStatus === value;
// //                 return (
// //                   <TouchableOpacity
// //                     key={value}
// //                     style={[styles.dropdownItem, isSel && { backgroundColor: meta.bg }]}
// //                     onPress={() => { setFStatus(value); setShowStatusModal(false); }}
// //                   >
// //                     <View style={[styles.dropdownItemIcon, { backgroundColor: isSel ? meta.bg : "#F3F4F6" }]}>
// //                       <Ionicons name={meta.icon} size={18} color={isSel ? meta.color : "#9CA3AF"} />
// //                     </View>
// //                     <View style={{ flex: 1 }}>
// //                       <Text style={[styles.dropdownItemText, isSel && { color: meta.color }]}>{value}</Text>
// //                       <Text style={styles.dropdownItemSub}>{meta.sub}</Text>
// //                     </View>
// //                     {isSel && <Ionicons name="checkmark-circle" size={20} color={meta.color} />}
// //                   </TouchableOpacity>
// //                 );
// //               })}
// //             </View>
// //           </TouchableWithoutFeedback>
// //         </View>
// //       </TouchableWithoutFeedback>
// //     </Modal>
// //   );

// //   /* ═══════════════════════════════════════════════
// //      CAMERA DROPDOWN MODAL — utility style, 3 rows
// //   ═══════════════════════════════════════════════ */
// //   const renderCameraModal = () => {
// //     const isFound     = addType === "found";
// //     const accentColor = isFound ? "#6B5B95" : "#F59E0B";
// //     const accentBg    = isFound ? "#EDE9FE" : "#FEF3C7";

// //     const options: { label: string; sub: string; icon: IoniconsName; action: () => void; danger?: boolean }[] = [
// //       { label: "Take Photo",          sub: "Use your camera",         icon: "camera-outline",       action: () => pickImage("camera")         },
// //       { label: "Choose from Gallery", sub: "Select from your photos", icon: "images-outline",       action: () => pickImage("gallery")        },
// //       { label: "Cancel",              sub: "Close this menu",         icon: "close-circle-outline", action: () => setShowCameraModal(false), danger: true },
// //     ];

// //     return (
// //       <Modal visible={showCameraModal} animationType="fade" transparent onRequestClose={() => setShowCameraModal(false)}>
// //         <TouchableWithoutFeedback onPress={() => setShowCameraModal(false)}>
// //           <View style={styles.dropdownOverlay}>
// //             <TouchableWithoutFeedback>
// //               <View style={styles.dropdownBox}>
// //                 <View style={styles.dropdownHeader}>
// //                   <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
// //                     <View style={[styles.dropdownHeaderIcon, { backgroundColor: accentBg }]}>
// //                       <Ionicons name="camera" size={17} color={accentColor} />
// //                     </View>
// //                     <Text style={styles.dropdownTitle}>Add Photo</Text>
// //                   </View>
// //                   <TouchableOpacity onPress={() => setShowCameraModal(false)} style={styles.closeBtn}>
// //                     <Ionicons name="close" size={20} color="#6B7280" />
// //                   </TouchableOpacity>
// //                 </View>
// //                 {options.map((opt, idx) => (
// //                   <TouchableOpacity
// //                     key={opt.label}
// //                     style={[
// //                       styles.dropdownItem,
// //                       idx === options.length - 1 && { borderBottomWidth: 0 },
// //                       opt.danger && { backgroundColor: "#FFF5F5" },
// //                     ]}
// //                     onPress={opt.action}
// //                   >
// //                     <View style={[styles.dropdownItemIcon, { backgroundColor: opt.danger ? "#FEE2E2" : accentBg }]}>
// //                       <Ionicons name={opt.icon} size={18} color={opt.danger ? "#EF4444" : accentColor} />
// //                     </View>
// //                     <View style={{ flex: 1 }}>
// //                       <Text style={[styles.dropdownItemText, opt.danger && { color: "#EF4444" }]}>{opt.label}</Text>
// //                       <Text style={styles.dropdownItemSub}>{opt.sub}</Text>
// //                     </View>
// //                     {!opt.danger && <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />}
// //                   </TouchableOpacity>
// //                 ))}
// //               </View>
// //             </TouchableWithoutFeedback>
// //           </View>
// //         </TouchableWithoutFeedback>
// //       </Modal>
// //     );
// //   };

// //   /* ═══════════════════════════════════════════════
// //      ADD MODAL
// //   ═══════════════════════════════════════════════ */
// //   const renderAddModal = () => {
// //     const isFound     = addType === "found";
// //     const accentColor = isFound ? "#6B5B95" : "#F59E0B";
// //     const accentBg    = isFound ? "#EDE9FE" : "#FEF3C7";
// //     const label       = isFound ? "Found" : "Lost";
// //     const sm          = STATUS_META[fStatus];

// //     return (
// //       <Modal
// //         visible={showAddModal} transparent animationType="slide" statusBarTranslucent
// //         onRequestClose={() => { setShowAddModal(false); resetForm(); }}
// //       >
// //         <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
// //           <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
// //             <View style={styles.modalOverlay}>
// //               <View style={styles.addSheet}>

// //                 {/* Handle */}
// //                 <View style={styles.sheetHandle} />

// //                 {/* Header */}
// //                 <View style={[styles.compactModalHeader, { borderBottomColor: accentColor + "22" }]}>
// //                   <View style={styles.compactModalTitleRow}>
// //                     <View style={[styles.compactModalIcon, { backgroundColor: accentBg }]}>
// //                       <Ionicons name={isFound ? "search-circle-outline" : "help-circle-outline"} size={18} color={accentColor} />
// //                     </View>
// //                     <Text style={styles.compactModalTitle}>{isFound ? "Add Found Item" : "Add Lost Item"}</Text>
// //                   </View>
// //                   <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }} style={styles.closeBtn}>
// //                     <Ionicons name="close" size={20} color="#6B7280" />
// //                   </TouchableOpacity>
// //                 </View>

// //                 {/* Scrollable fields */}
// //                 <ScrollView
// //                   style={{ flex: 1 }}
// //                   contentContainerStyle={styles.formScroll}
// //                   keyboardShouldPersistTaps="handled"
// //                   showsVerticalScrollIndicator={false}
// //                 >
// //                   {/* ── Person Info ── */}
// //                   <Text style={[styles.sectionLabel, { color: accentColor }]}>{isFound ? "Finder" : "Guest"} Info</Text>

// //                   <View style={styles.fg}>
// //                     <Text style={styles.fl}>Name *</Text>
// //                     <View style={styles.fi}>
// //                       <Ionicons name="person-outline" size={16} color={accentColor} />
// //                       <TextInput style={styles.ft} placeholder={isFound ? "Finder / Guest Name" : "Guest Name"} placeholderTextColor="#9CA3AF" value={fName} onChangeText={setFName} returnKeyType="next" />
// //                     </View>
// //                   </View>

// //                   <View style={styles.fg}>
// //                     <Text style={styles.fl}>Telephone *</Text>
// //                     <View style={styles.fi}>
// //                       <Ionicons name="call-outline" size={16} color={accentColor} />
// //                       <TextInput style={styles.ft} placeholder="Phone number" placeholderTextColor="#9CA3AF" value={fPhone} onChangeText={setFPhone} keyboardType="phone-pad" returnKeyType="next" />
// //                     </View>
// //                   </View>

// //                   <View style={styles.fg}>
// //                     <Text style={styles.fl}>Email <Text style={styles.optionalTag}>(optional)</Text></Text>
// //                     <View style={styles.fi}>
// //                       <Ionicons name="mail-outline" size={16} color={accentColor} />
// //                       <TextInput style={styles.ft} placeholder="Email address" placeholderTextColor="#9CA3AF" value={fEmail} onChangeText={setFEmail} keyboardType="email-address" returnKeyType="next" />
// //                     </View>
// //                   </View>

// //                   {/* ── Item Details ── */}
// //                   <Text style={[styles.sectionLabel, { color: accentColor }]}>Item Details</Text>

// //                   <View style={styles.fg}>
// //                     <Text style={styles.fl}>Item Name *</Text>
// //                     <View style={styles.fi}>
// //                       <Ionicons name="cube-outline" size={16} color={accentColor} />
// //                       <TextInput style={styles.ft} placeholder="Describe the item" placeholderTextColor="#9CA3AF" value={fItem} onChangeText={setFItem} returnKeyType="next" />
// //                     </View>
// //                   </View>

// //                   <View style={styles.fg}>
// //                     <Text style={styles.fl}>Location *</Text>
// //                     <View style={styles.fi}>
// //                       <Ionicons name="location-outline" size={16} color={accentColor} />
// //                       <TextInput style={styles.ft} placeholder="Where was it found/lost?" placeholderTextColor="#9CA3AF" value={fLocation} onChangeText={setFLocation} returnKeyType="next" />
// //                     </View>
// //                   </View>

// //                   {/* Date */}
// //                   <View style={styles.fg}>
// //                     <Text style={styles.fl}>{isFound ? "Found" : "Lost"} Date</Text>
// //                     <TouchableOpacity style={styles.fi} onPress={() => setShowDatePicker(true)}>
// //                       <Ionicons name="calendar-outline" size={16} color={accentColor} />
// //                       <Text style={[styles.ft, { color: "#1F2937" }]}>
// //                         {fDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
// //                       </Text>
// //                     </TouchableOpacity>
// //                   </View>
// //                   {showDatePicker && (
// //                     <DateTimePicker value={fDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"}
// //                       onChange={(_, d) => { setShowDatePicker(Platform.OS === "ios"); if (d) setFDate(d); }} />
// //                   )}

// //                   {/* Time (found only) */}
// //                   {isFound && (
// //                     <View style={styles.fg}>
// //                       <Text style={styles.fl}>Found Time <Text style={styles.optionalTag}>(optional)</Text></Text>
// //                       <TouchableOpacity style={styles.fi} onPress={() => setShowTimePicker(true)}>
// //                         <Ionicons name="time-outline" size={16} color={accentColor} />
// //                         <Text style={[styles.ft, { color: fTime ? "#1F2937" : "#9CA3AF" }]}>
// //                           {fTime ? fTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "Select time"}
// //                         </Text>
// //                       </TouchableOpacity>
// //                     </View>
// //                   )}
// //                   {showTimePicker && (
// //                     <DateTimePicker value={fTime ?? new Date()} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"}
// //                       onChange={(_, t) => { setShowTimePicker(Platform.OS === "ios"); if (t) setFTime(t); }} />
// //                   )}

// //                   {/* Notes */}
// //                   <View style={styles.fg}>
// //                     <Text style={styles.fl}>Additional Notes <Text style={styles.optionalTag}>(optional)</Text></Text>
// //                     <View style={[styles.fi, { alignItems: "flex-start", paddingVertical: 12 }]}>
// //                       <Ionicons name="document-text-outline" size={16} color={accentColor} style={{ marginTop: 2 }} />
// //                       <TextInput style={[styles.ft, { minHeight: 72, textAlignVertical: "top" }]} placeholder="Any additional details..." placeholderTextColor="#9CA3AF" value={fNotes} onChangeText={setFNotes} multiline returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
// //                     </View>
// //                   </View>

// //                   {/* ── Status — custom dropdown ── */}
// //                   <Text style={[styles.sectionLabel, { color: accentColor }]}>Status</Text>
// //                   <View style={styles.fg}>
// //                     <TouchableOpacity style={styles.fi} onPress={() => setShowStatusModal(true)}>
// //                       {/* colored icon badge — identical to utility category field */}
// //                       <View style={[styles.fieldIconBadge, { backgroundColor: sm.bg }]}>
// //                         <Ionicons name={sm.icon} size={14} color={sm.color} />
// //                       </View>
// //                       <Text style={[styles.ft, { flex: 1, color: "#1F2937" }]}>{fStatus}</Text>
// //                       <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
// //                     </TouchableOpacity>
// //                   </View>

// //                   {/* ── Item Photo — camera dropdown ── */}
// //                   <Text style={[styles.sectionLabel, { color: accentColor }]}>
// //                     Item Photo{" "}
// //                     {fImages.length > 0
// //                       ? <Text style={{ color: accentColor }}>({fImages.length}/5)</Text>
// //                       : <Text style={styles.optionalTag}>(optional)</Text>}
// //                   </Text>
// //                   <View style={styles.fg}>
// //                     <TouchableOpacity
// //                       style={[styles.imagePicker, { borderColor: accentColor }]}
// //                       onPress={() => fImages.length < 5 ? setShowCameraModal(true) : Alert.alert("Max Photos", "You can add up to 5 photos.")}
// //                     >
// //                       {fImages.length > 0 ? (
// //                         <View style={styles.imagePreviewRow}>
// //                           <Image source={{ uri: fImages[fImages.length - 1].uri }} style={styles.imagePreviewThumb} />
// //                           <View style={{ flex: 1, gap: 3 }}>
// //                             <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
// //                               <Ionicons name="checkmark-circle" size={16} color="#10B981" />
// //                               <Text style={styles.imagePreviewText}>{fImages.length} photo{fImages.length > 1 ? "s" : ""} selected</Text>
// //                             </View>
// //                             <Text style={styles.imageTapText}>Tap to add more</Text>
// //                           </View>
// //                         </View>
// //                       ) : (
// //                         <View style={styles.imageEmptyRow}>
// //                           <View style={[styles.cameraIconBox, { backgroundColor: accentBg }]}>
// //                             <Ionicons name="camera" size={22} color={accentColor} />
// //                           </View>
// //                           <View>
// //                             <Text style={[styles.imagePickerTitle, { color: accentColor }]}>Take Photo / Choose Gallery</Text>
// //                             <Text style={styles.imagePickerSub}>Up to 5 photos allowed</Text>
// //                           </View>
// //                         </View>
// //                       )}
// //                     </TouchableOpacity>
// //                   </View>

// //                   {/* Thumbnail strip */}
// //                   {fImages.length > 1 && (
// //                     <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
// //                       <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 2 }}>
// //                         {fImages.map((img, idx) => (
// //                           <View key={idx} style={styles.thumbWrapSmall}>
// //                             <Image source={{ uri: img.uri }} style={styles.thumbSmall} resizeMode="cover" />
// //                             <TouchableOpacity style={styles.thumbRemove} onPress={() => setFImages(p => p.filter((_, i) => i !== idx))}>
// //                               <Ionicons name="close-circle" size={18} color="#EF4444" />
// //                             </TouchableOpacity>
// //                           </View>
// //                         ))}
// //                       </View>
// //                     </ScrollView>
// //                   )}

// //                   <View style={{ height: 8 }} />
// //                 </ScrollView>

// //                 {/* ── Pinned submit button — outside ScrollView ── */}
// //                 <View style={styles.submitFooter}>
// //                   <TouchableOpacity style={[styles.submitBtn, saving && { opacity: 0.65 }]} onPress={handleSave} disabled={saving}>
// //                     <View style={[styles.submitGradient, { backgroundColor: saving ? "#9CA3AF" : accentColor }]}>
// //                       {saving ? <ActivityIndicator color="#fff" /> : (
// //                         <>
// //                           <Ionicons name={isFound ? "search-circle" : "help-circle"} size={18} color="#fff" />
// //                           <Text style={styles.submitText}>Save {label} Item</Text>
// //                         </>
// //                       )}
// //                     </View>
// //                   </TouchableOpacity>
// //                 </View>

// //               </View>
// //             </View>
// //           </TouchableWithoutFeedback>
// //         </KeyboardAvoidingView>
// //       </Modal>
// //     );
// //   };

// //   /* ═══════════════════════════════════════════════
// //      MAIN RENDER
// //   ═══════════════════════════════════════════════ */
// //   return (
// //     <View style={styles.container}>
// //       <HeaderWithMenu title="Lost & Found" subtitle="Track and manage lost and found items" currentPage="" />

// //       {/* Tab bar */}
// //       <View style={styles.tabBar}>
// //         {(["found", "lost"] as Tab[]).map(t => {
// //           const isActive = activeTab === t;
// //           const color    = t === "found" ? "#6B5B95" : "#F59E0B";
// //           return (
// //             <TouchableOpacity key={t} style={[styles.tabBtn, isActive && { borderBottomColor: color, borderBottomWidth: 2.5 }]} onPress={() => setActiveTab(t)} activeOpacity={0.8}>
// //               <Ionicons name={t === "found" ? "search-circle-outline" : "help-circle-outline"} size={18} color={isActive ? color : "#9CA3AF"} />
// //               <Text style={[styles.tabLabel, isActive && { color, fontWeight: "700" }]}>{t === "found" ? "Found Items" : "Lost Items"}</Text>
// //             </TouchableOpacity>
// //           );
// //         })}
// //       </View>

// //       {/* Summary strip */}
// //       <View style={styles.summaryStrip}>
// //         {summaryData.map(s => (
// //           <View key={s.label} style={[styles.summaryChip, { backgroundColor: s.bg }]}>
// //             <Ionicons name={s.icon} size={16} color={s.color} />
// //             <Text style={[styles.summaryCount, { color: s.color }]}>{s.count}</Text>
// //             <Text style={[styles.summaryLabel, { color: s.color }]}>{s.label}</Text>
// //           </View>
// //         ))}
// //       </View>

// //       {/* Action buttons */}
// //       <View style={styles.actionRow}>
// //         <TouchableOpacity style={[styles.addBtn, { backgroundColor: "#6B5B95" }]} onPress={() => openAdd("found")} activeOpacity={0.8}>
// //           <Ionicons name="add-circle-outline" size={18} color="#fff" />
// //           <Text style={styles.addBtnText}>Add Found</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity style={[styles.addBtn, { backgroundColor: "#F59E0B" }]} onPress={() => openAdd("lost")} activeOpacity={0.8}>
// //           <Ionicons name="add-circle-outline" size={18} color="#fff" />
// //           <Text style={styles.addBtnText}>Add Lost</Text>
// //         </TouchableOpacity>
// //       </View>

// //       {/* Lists */}
// //       {activeTab === "found" ? (
// //         <FlatList
// //           data={foundItems} keyExtractor={i => `found-${i.id}`} renderItem={renderFoundCard}
// //           contentContainerStyle={styles.list}
// //           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6B5B95"]} tintColor="#6B5B95" />}
// //           ListHeaderComponent={loading ? <View style={styles.loadingWrap}><ActivityIndicator size="large" color="#6B5B95" /></View> : null}
// //           ListEmptyComponent={!loading ? <View style={styles.empty}><Ionicons name="search-circle-outline" size={56} color="#D1D5DB" /><Text style={styles.emptyTitle}>No Found Items</Text><Text style={styles.emptySub}>Add a found item using the button above</Text></View> : null}
// //         />
// //       ) : (
// //         <FlatList
// //           data={lostItems} keyExtractor={i => `lost-${i.id}`} renderItem={renderLostCard}
// //           contentContainerStyle={styles.list}
// //           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#F59E0B"]} tintColor="#F59E0B" />}
// //           ListHeaderComponent={loading ? <View style={styles.loadingWrap}><ActivityIndicator size="large" color="#F59E0B" /></View> : null}
// //           ListEmptyComponent={!loading ? <View style={styles.empty}><Ionicons name="help-circle-outline" size={56} color="#D1D5DB" /><Text style={styles.emptyTitle}>No Lost Items</Text><Text style={styles.emptySub}>Add a lost item using the button above</Text></View> : null}
// //         />
// //       )}

// //       {renderDetailModal()}
// //       {renderStatusModal()}
// //       {renderCameraModal()}
// //       {renderAddModal()}
// //     </View>
// //   );
// // };

// // export default LostFound;

// // /* ═══════════════════════════════════════════════════════════════
// //    STYLES
// // ═══════════════════════════════════════════════════════════════ */
// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: "#F9FAFB" },

// //   /* tabs */
// //   tabBar:   { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
// //   tabBtn:   { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14 },
// //   tabLabel: { fontSize: 14, fontWeight: "500", color: "#9CA3AF" },

// //   /* summary */
// //   summaryStrip: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, gap: 8 },
// //   summaryChip:  { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, gap: 3 },
// //   summaryCount: { fontSize: 18, fontWeight: "800" },
// //   summaryLabel: { fontSize: 10, fontWeight: "500" },

// //   /* action */
// //   actionRow:  { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
// //   addBtn:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 10 },
// //   addBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },

// //   /* list */
// //   list:        { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
// //   loadingWrap: { paddingVertical: 48, alignItems: "center" },
// //   empty:       { alignItems: "center", paddingVertical: 64, paddingHorizontal: 40 },
// //   emptyTitle:  { fontSize: 17, fontWeight: "600", color: "#111827", marginTop: 14, marginBottom: 6 },
// //   emptySub:    { fontSize: 13, color: "#6B7280", textAlign: "center" },

// //   /* card */
// //   card:             { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
// //   cardRow:          { flexDirection: "row", alignItems: "center" },
// //   thumbWrap:        { marginRight: 12 },
// //   thumb:            { width: 64, height: 64, borderRadius: 10 },
// //   thumbPlaceholder: { backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center" },
// //   cardContent:      { flex: 1 },
// //   cardTitleRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
// //   cardItemName:     { fontSize: 15, fontWeight: "600", color: "#111827", flex: 1, marginRight: 8 },
// //   cardSub:          { fontSize: 12, color: "#6B7280", marginBottom: 6 },
// //   cardMeta:         { flexDirection: "row", flexWrap: "wrap", gap: 6 },
// //   metaChip:         { flexDirection: "row", alignItems: "center", gap: 3 },
// //   metaText:         { fontSize: 11, color: "#6B7280", fontWeight: "500" },
// //   statusBadge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
// //   statusText:       { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },

// //   /* shared modal */
// //   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.48)", justifyContent: "flex-end" },
// //   sheetHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginTop: 10, marginBottom: 4 },
// //   closeBtn:     { width: 32, height: 32, borderRadius: 16, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center" },

// //   /* detail */
// //   detailSheet:       { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "88%", flex: 1 },
// //   detailHeader:      { flexDirection: "row", alignItems: "center", padding: 16, gap: 12, borderBottomWidth: 1 },
// //   detailHeaderIcon:  { width: 46, height: 46, borderRadius: 12, justifyContent: "center", alignItems: "center" },
// //   detailItemName:    { fontSize: 17, fontWeight: "700", color: "#111827" },
// //   detailType:        { fontSize: 12, fontWeight: "600", marginTop: 2 },
// //   detailImage:       { width: "100%", height: 200 },
// //   detailStatusRow:   { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
// //   detailStatusBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5 },
// //   detailStatusText:  { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
// //   detailSection:     { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
// //   detailSectionTitle:{ fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
// //   detailRow:         { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
// //   detailLabel:       { fontSize: 13, color: "#6B7280", fontWeight: "500", width: "38%" },
// //   detailValue:       { fontSize: 13, color: "#111827", fontWeight: "500", flex: 1, textAlign: "right" },
// //   detailFooter:      { padding: 20, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
// //   closeFullBtn:      { backgroundColor: "#F3F4F6", borderRadius: 10, paddingVertical: 14, alignItems: "center" },
// //   closeFullBtnText:  { fontSize: 15, fontWeight: "600", color: "#374151" },

// //   /* dropdown modals (status + camera) */
// //   dropdownOverlay:   { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", paddingHorizontal: 28 },
// //   dropdownBox:       { backgroundColor: "#FFFFFF", borderRadius: 18, width: "100%", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 12 },
// //   dropdownHeader:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
// //   dropdownHeaderIcon:{ width: 34, height: 34, borderRadius: 9, justifyContent: "center", alignItems: "center" },
// //   dropdownTitle:     { fontSize: 16, fontWeight: "700", color: "#1F2937" },
// //   dropdownItem:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
// //   dropdownItemIcon:  { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
// //   dropdownItemText:  { fontSize: 15, color: "#1F2937", fontWeight: "600" },
// //   dropdownItemSub:   { fontSize: 12, color: "#9CA3AF", marginTop: 2 },

// //   /* add modal */
// //   addSheet:            { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "93%", flex: 1 },
// //   compactModalHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
// //   compactModalTitleRow:{ flexDirection: "row", alignItems: "center", gap: 10 },
// //   compactModalIcon:    { width: 34, height: 34, borderRadius: 9, justifyContent: "center", alignItems: "center" },
// //   compactModalTitle:   { fontSize: 16, fontWeight: "700", color: "#1F2937" },
// //   formScroll:          { padding: 16 },

// //   /* section + field */
// //   sectionLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 10, marginTop: 18 },
// //   optionalTag:  { fontSize: 10, fontWeight: "500", color: "#9CA3AF", textTransform: "none" },
// //   fg:           { marginBottom: 12 },
// //   fl:           { fontSize: 12, fontWeight: "600", color: "#374151", marginBottom: 6 },
// //   fi:           { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === "ios" ? 13 : 10, gap: 8 },
// //   ft:           { flex: 1, fontSize: 14, color: "#111827", paddingVertical: 0 },

// //   /* field icon badge */
// //   fieldIconBadge: { width: 28, height: 28, borderRadius: 7, justifyContent: "center", alignItems: "center" },

// //   /* image picker */
// //   imagePicker:      { backgroundColor: "#F9FAFB", borderWidth: 1.5, borderStyle: "dashed", borderRadius: 12, overflow: "hidden" },
// //   imageEmptyRow:    { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
// //   cameraIconBox:    { width: 46, height: 46, borderRadius: 11, justifyContent: "center", alignItems: "center" },
// //   imagePickerTitle: { fontSize: 13, fontWeight: "700" },
// //   imagePickerSub:   { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
// //   imagePreviewRow:  { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
// //   imagePreviewThumb:{ width: 60, height: 60, borderRadius: 8 },
// //   imagePreviewText: { fontSize: 13, fontWeight: "600", color: "#10B981" },
// //   imageTapText:     { fontSize: 11, color: "#9CA3AF", marginTop: 2 },

// //   /* thumbnail strip */
// //   thumbWrapSmall: { position: "relative" },
// //   thumbSmall:     { width: 72, height: 72, borderRadius: 8 },
// //   thumbRemove:    { position: "absolute", top: -6, right: -6, backgroundColor: "#fff", borderRadius: 10 },

// //   /* submit */
// //   submitFooter:  { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6", backgroundColor: "#FFFFFF" },
// //   submitBtn:     { borderRadius: 12, overflow: "hidden" },
// //   submitGradient:{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 15, gap: 8, borderRadius: 12 },
// //   submitText:    { color: "#fff", fontSize: 15, fontWeight: "700" },
// // });






// // app/lost&found/index.tsx
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
//   TextInput,
//   Image,
//   Platform,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import { useRouter } from 'expo-router';
// import HeaderWithMenu from '../../components/HeaderWithMenu';
// import lostFoundService, { 
//   LostItem, 
//   FoundItem, 
//   parseImageUrl 
// } from '@/services/lost_&_found';

// const { width, height } = Dimensions.get('window');

// type ItemType = 'lost' | 'found';
// type StatusType = 'Pending' | 'Returned' | 'Unclaimed';

// interface StatusStyle {
//   backgroundColor: string;
//   borderColor: string;
//   textColor: string;
// }

// interface ImageFile {
//   uri: string;
//   name: string;
//   type: string;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// const LostAndFound = () => {
//   const router = useRouter();

//   const [activeTab, setActiveTab] = useState<ItemType>('lost');
//   const [lostItems, setLostItems] = useState<LostItem[]>([]);
//   const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<LostItem | FoundItem | null>(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState<any>({});
//   const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
//   const [existingImages, setExistingImages] = useState<string[]>([]);
//   const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(30)).current;

//   useEffect(() => {
//     loadData();
//   }, [activeTab]);

//   useEffect(() => {
//     if (!loading) return;
//     Animated.parallel([
//       Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
//       Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
//     ]).start();
//   }, [loading]);

//   // Request permissions for camera and gallery
//   const requestPermissions = async () => {
//     if (Platform.OS !== 'web') {
//       const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
//       const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
//       if (cameraStatus !== 'granted') {
//         Alert.alert('Permission Needed', 'Camera permission is required to take photos');
//       }
//       if (libraryStatus !== 'granted') {
//         Alert.alert('Permission Needed', 'Gallery permission is required to select images');
//       }
//     }
//   };

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       if (activeTab === 'lost') {
//         const response = await lostFoundService.getLostItems();
//         if (response?.item) {
//           setLostItems(response.item);
//         }
//       } else {
//         const response = await lostFoundService.getFoundItems();
//         if (response?.item) {
//           setFoundItems(response.item);
//         }
//       }
//     } catch (error) {
//       console.error('Error loading lost & found data:', error);
//       Alert.alert('Error', 'Failed to load data');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     loadData();
//   };

//   const getCurrentItems = (): (LostItem | FoundItem)[] => {
//     return activeTab === 'lost' ? lostItems : foundItems;
//   };

//   const getStatusStyle = (status: string): StatusStyle => {
//     switch (status.toLowerCase()) {
//       case 'pending':
//         return { backgroundColor: '#FEF3C7', borderColor: '#F59E0B', textColor: '#92400E' };
//       case 'returned':
//         return { backgroundColor: '#D1FAE5', borderColor: '#10B981', textColor: '#065F46' };
//       case 'unclaimed':
//         return { backgroundColor: '#FEE2E2', borderColor: '#EF4444', textColor: '#991B1B' };
//       default:
//         return { backgroundColor: '#F3F4F6', borderColor: '#9CA3AF', textColor: '#374151' };
//     }
//   };

//   const getStatusIcon = (status: string): string => {
//     switch (status.toLowerCase()) {
//       case 'pending': return 'time-outline';
//       case 'returned': return 'checkmark-circle-outline';
//       case 'unclaimed': return 'alert-circle-outline';
//       default: return 'help-circle-outline';
//     }
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const diffDays = Math.floor(Math.abs(Date.now() - date.getTime()) / 86400000);
//     if (diffDays === 0) return 'Today';
//     if (diffDays === 1) return 'Yesterday';
//     if (diffDays < 7) return `${diffDays} days ago`;
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined });
//   };

//   // Image Picker Functions
//   const pickImageFromGallery = async () => {
//     await requestPermissions();
    
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 0.8,
//       base64: false,
//     });

//     if (!result.canceled && result.assets[0]) {
//       const imageUri = result.assets[0].uri;
//       const filename = imageUri.split('/').pop() || 'image.jpg';
//       setSelectedImages([{
//         uri: imageUri,
//         name: filename,
//         type: 'image/jpeg',
//       }]);
//     }
//   };

//   const takePhotoWithCamera = async () => {
//     await requestPermissions();
    
//     const result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       quality: 0.8,
//       base64: false,
//     });

//     if (!result.canceled && result.assets[0]) {
//       const imageUri = result.assets[0].uri;
//       const filename = imageUri.split('/').pop() || 'photo.jpg';
//       setSelectedImages([{
//         uri: imageUri,
//         name: filename,
//         type: 'image/jpeg',
//       }]);
//     }
//   };

//   const showImagePickerOptions = () => {
//     Alert.alert(
//       'Add Image',
//       'Choose an option',
//       [
//         { text: 'Take Photo', onPress: takePhotoWithCamera },
//         { text: 'Choose from Gallery', onPress: pickImageFromGallery },
//         { text: 'Cancel', style: 'cancel' },
//       ],
//       { cancelable: true }
//     );
//   };

//   const removeImage = () => {
//     setSelectedImages([]);
//   };

//   const viewFullImage = (imageUrl: string) => {
//     setFullScreenImage(imageUrl);
//     setShowImageModal(true);
//   };

//   // Extract images from file_path
//   const getItemImages = (item: LostItem | FoundItem): string[] => {
//     if (!item.file_path) return [];
//     try {
//       const paths = JSON.parse(item.file_path) as string[];
//       const baseUrl = 'https://hotel-api.guesty-clean.com/storage/';
//       return paths.map(path => `${baseUrl}${path.replace(/\\/g, '/')}`);
//     } catch {
//       return [];
//     }
//   };

//   const handleAddNew = () => {
//     setIsEditing(false);
//     setSelectedImages([]);
//     setFormData({
//       guest_name: '',
//       finder_name: '',
//       telephone: '',
//       email: '',
//       item_name: '',
//       location: '',
//       date: new Date().toISOString().split('T')[0],
//       time: '',
//       additional_notes: '',
//       status: 'Pending',
//     });
//     setShowAddModal(true);
//   };

//   const handleEdit = (item: LostItem | FoundItem) => {
//     setIsEditing(true);
//     setSelectedItem(item);
//     setExistingImages(getItemImages(item));
    
//     if (activeTab === 'lost') {
//       const lostItem = item as LostItem;
//       setFormData({
//         id: lostItem.id,
//         guest_name: lostItem.guest_name,
//         telephone: lostItem.telephone,
//         email: lostItem.email,
//         item_name: lostItem.item_name,
//         location: lostItem.location,
//         date: lostItem.lost_date,
//         time: lostItem.lost_time || '',
//         additional_notes: lostItem.additional_note || '',
//         status: lostItem.status,
//       });
//     } else {
//       const foundItem = item as FoundItem;
//       setFormData({
//         id: foundItem.id,
//         finder_name: foundItem.finder_name,
//         telephone: foundItem.telephone,
//         email: foundItem.email,
//         item_name: foundItem.item_name,
//         location: foundItem.location,
//         date: foundItem.found_date,
//         time: foundItem.found_time || '',
//         additional_notes: foundItem.additional_notes || '',
//         status: foundItem.status,
//       });
//     }
//     setShowAddModal(true);
//   };

//   const handleDelete = (item: LostItem | FoundItem) => {
//     Alert.alert(
//       'Confirm Delete',
//       `Are you sure you want to delete this ${activeTab} item?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               if (activeTab === 'lost') {
//                 await lostFoundService.deleteLostItem(item.id);
//               } else {
//                 await lostFoundService.deleteFoundItem(item.id);
//               }
//               Alert.alert('Success', 'Item deleted successfully');
//               loadData();
//             } catch (error) {
//               console.error('Error deleting item:', error);
//               Alert.alert('Error', 'Failed to delete item');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleSave = async () => {
//     try {
//       // Prepare file upload data
//       const fileUpload = selectedImages.length > 0 ? selectedImages.map(img => ({
//         uri: img.uri,
//         name: img.name,
//         type: img.type,
//       })) : undefined;

//       if (activeTab === 'lost') {
//         if (isEditing) {
//           await lostFoundService.updateLostItem({
//             id: formData.id,
//             guest_name: formData.guest_name,
//             telephone: formData.telephone,
//             email: formData.email,
//             item_name: formData.item_name,
//             location: formData.location,
//             lost_date: formData.date,
//             lost_time: formData.time,
//             additional_notes: formData.additional_notes,
//             status: formData.status,
//             file_upload: fileUpload,
//           });
//         } else {
//           await lostFoundService.storeLostItem({
//             guest_name: formData.guest_name,
//             telephone: formData.telephone,
//             email: formData.email,
//             item_name: formData.item_name,
//             location: formData.location,
//             lost_date: formData.date,
//             lost_time: formData.time,
//             additional_notes: formData.additional_notes,
//             status: formData.status,
//             file_upload: fileUpload,
//           });
//         }
//       } else {
//         if (isEditing) {
//           await lostFoundService.updateFoundItem({
//             id: formData.id,
//             finder_name: formData.finder_name,
//             telephone: formData.telephone,
//             email: formData.email,
//             item_name: formData.item_name,
//             location: formData.location,
//             found_date: formData.date,
//             found_time: formData.time,
//             additional_notes: formData.additional_notes,
//             status: formData.status,
//             file_upload: fileUpload,
//           });
//         } else {
//           await lostFoundService.storeFoundItem({
//             finder_name: formData.finder_name,
//             telephone: formData.telephone,
//             email: formData.email,
//             item_name: formData.item_name,
//             location: formData.location,
//             found_date: formData.date,
//             found_time: formData.time,
//             additional_notes: formData.additional_notes,
//             status: formData.status,
//             file_upload: fileUpload,
//           });
//         }
//       }
//       Alert.alert('Success', `Item ${isEditing ? 'updated' : 'added'} successfully`);
//       setShowAddModal(false);
//       setSelectedImages([]);
//       loadData();
//     } catch (error) {
//       console.error('Error saving item:', error);
//       Alert.alert('Error', 'Failed to save item');
//     }
//   };

//   // Summary counts
//   const summaryItems = [
//     {
//       key: 'lost' as ItemType,
//       label: 'Lost Items',
//       count: lostItems.length,
//       color: '#F59E0B',
//       bg: '#FEF3C7',
//       icon: 'help-circle-outline' as any,
//     },
//     {
//       key: 'found' as ItemType,
//       label: 'Found Items',
//       count: foundItems.length,
//       color: '#10B981',
//       bg: '#D1FAE5',
//       icon: 'checkmark-circle-outline' as any,
//     },
//   ];

//   const renderItemCard = ({ item }: { item: LostItem | FoundItem }) => {
//     const statusStyle = getStatusStyle(item.status);
//     const timeAgo = formatDate(item.created_at);
//     const isLost = activeTab === 'lost';
//     const images = getItemImages(item);
//     const name = isLost ? (item as LostItem).guest_name || 'Anonymous' : (item as FoundItem).finder_name || 'Anonymous';
//     const dateField = isLost ? (item as LostItem).lost_date : (item as FoundItem).found_date;

//     return (
//       <TouchableOpacity
//         onPress={() => {
//           setSelectedItem(item);
//           setShowDetailsModal(true);
//         }}
//         activeOpacity={0.7}
//         style={styles.itemCard}
//       >
//         <View style={styles.itemHeader}>
//           <View style={[styles.statusIconContainer, { backgroundColor: statusStyle.backgroundColor }]}>
//             <Ionicons name={getStatusIcon(item.status) as any} size={20} color={statusStyle.textColor} />
//           </View>
//           <View style={styles.itemContent}>
//             <View style={styles.itemTitleRow}>
//               <Text style={styles.itemTitle}>{item.item_name}</Text>
//               <Text style={styles.itemTime}>{timeAgo}</Text>
//             </View>
//             <Text style={styles.itemPerson}>{name}</Text>
//             <View style={styles.itemMeta}>
//               <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
//                 <Text style={[styles.statusText, { color: statusStyle.textColor }]}>{item.status}</Text>
//               </View>
//               <View style={styles.separatorDot} />
//               <View style={styles.locationInfo}>
//                 <Ionicons name="location-outline" size={14} color="#6B7280" />
//                 <Text style={styles.locationText}>{item.location}</Text>
//               </View>
//             </View>
//             {images.length > 0 && (
//               <View style={styles.imagePreviewContainer}>
//                 <TouchableOpacity onPress={() => viewFullImage(images[0])}>
//                   <Image source={{ uri: images[0] }} style={styles.thumbnailImage} />
//                 </TouchableOpacity>
//                 {images.length > 1 && (
//                   <View style={styles.imageCountBadge}>
//                     <Text style={styles.imageCountText}>+{images.length - 1}</Text>
//                   </View>
//                 )}
//               </View>
//             )}
//             <View style={styles.itemFooter}>
//               <View>
//                 <Text style={styles.dateLabel}>Date</Text>
//                 <Text style={styles.dateValue}>{dateField}</Text>
//               </View>
//               <View style={styles.actionButtons}>
//                 <TouchableOpacity
//                   onPress={() => handleEdit(item)}
//                   style={styles.iconButton}
//                 >
//                   <Ionicons name="create-outline" size={20} color="#6B5B95" />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   onPress={() => handleDelete(item)}
//                   style={styles.iconButton}
//                 >
//                   <Ionicons name="trash-outline" size={20} color="#EF4444" />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//           <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const renderDetailsModal = () => {
//     if (!selectedItem) return null;
//     const isLost = activeTab === 'lost';
//     const statusStyle = getStatusStyle(selectedItem.status);
//     const images = getItemImages(selectedItem);
//     const name = isLost ? (selectedItem as LostItem).guest_name : (selectedItem as FoundItem).finder_name;
//     const dateField = isLost ? (selectedItem as LostItem).lost_date : (selectedItem as FoundItem).found_date;
//     const timeField = isLost ? (selectedItem as LostItem).lost_time : (selectedItem as FoundItem).found_time;
//     const notesField = isLost ? (selectedItem as LostItem).additional_note : (selectedItem as FoundItem).additional_notes;

//     const DetailRow = ({ label, value }: { label: string; value: string }) => (
//       <View style={styles.detailRow}>
//         <Text style={styles.detailLabel}>{label}</Text>
//         <Text style={styles.detailValue}>{value || 'N/A'}</Text>
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
//             <View style={styles.modalHeader}>
//               <View style={styles.modalTitleContainer}>
//                 <View style={[styles.modalEventIcon, { backgroundColor: statusStyle.backgroundColor }]}>
//                   <Ionicons name={getStatusIcon(selectedItem.status) as any} size={24} color={statusStyle.textColor} />
//                 </View>
//                 <View>
//                   <Text style={styles.modalTitle}>
//                     {isLost ? 'Lost Item Details' : 'Found Item Details'}
//                   </Text>
//                   <Text style={styles.modalSubtitle}>
//                     {selectedItem.item_name} • {formatDate(selectedItem.created_at)}
//                   </Text>
//                 </View>
//               </View>
//               <TouchableOpacity onPress={() => setShowDetailsModal(false)} style={styles.closeButton}>
//                 <Ionicons name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={styles.modalScroll}>
//               <View style={styles.detailSection}>
//                 <View style={styles.sectionHeader}>
//                   <Ionicons name="person-circle-outline" size={20} color="#6B5B95" />
//                   <Text style={styles.sectionTitle}>Contact Information</Text>
//                 </View>
//                 <DetailRow 
//                   label={isLost ? "Guest Name" : "Finder Name"} 
//                   value={name || 'Not provided'} 
//                 />
//                 <DetailRow label="Telephone" value={selectedItem.telephone || 'Not provided'} />
//                 {selectedItem.email && <DetailRow label="Email" value={selectedItem.email} />}
//               </View>

//               <View style={styles.detailSection}>
//                 <View style={styles.sectionHeader}>
//                   <Ionicons name="cube-outline" size={20} color="#6B5B95" />
//                   <Text style={styles.sectionTitle}>Item Details</Text>
//                 </View>
//                 <DetailRow label="Item Name" value={selectedItem.item_name} />
//                 <DetailRow label="Location" value={selectedItem.location} />
//                 <DetailRow label={isLost ? "Lost Date" : "Found Date"} value={dateField || 'Not specified'} />
//                 {timeField && <DetailRow label={isLost ? "Lost Time" : "Found Time"} value={timeField} />}
                
//                 {/* Status - Read Only */}
//                 <View style={styles.statusRow}>
//                   <Text style={styles.detailLabel}>Status</Text>
//                   <View style={[styles.statusBadgeLarge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
//                     <Text style={[styles.statusTextLarge, { color: statusStyle.textColor }]}>
//                       {selectedItem.status}
//                     </Text>
//                   </View>
//                 </View>
                
//                 {notesField && <DetailRow label="Additional Notes" value={notesField} />}
//               </View>

//               {/* Images Section */}
//               {images.length > 0 && (
//                 <View style={styles.detailSection}>
//                   <View style={styles.sectionHeader}>
//                     <Ionicons name="images-outline" size={20} color="#6B5B95" />
//                     <Text style={styles.sectionTitle}>Images ({images.length})</Text>
//                   </View>
//                   <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
//                     {images.map((img, index) => (
//                       <TouchableOpacity key={index} onPress={() => viewFullImage(img)}>
//                         <Image source={{ uri: img }} style={styles.detailImage} />
//                       </TouchableOpacity>
//                     ))}
//                   </ScrollView>
//                 </View>
//               )}

//               <View style={styles.detailSection}>
//                 <View style={styles.sectionHeader}>
//                   <Ionicons name="information-circle-outline" size={20} color="#6B5B95" />
//                   <Text style={styles.sectionTitle}>System Information</Text>
//                 </View>
//                 <DetailRow label="Item ID" value={`#${selectedItem.id}`} />
//                 <DetailRow label="Created" value={new Date(selectedItem.created_at).toLocaleString()} />
//                 <DetailRow label="Last Updated" value={new Date(selectedItem.updated_at).toLocaleString()} />
//               </View>
//             </ScrollView>

//             <View style={styles.modalFooter}>
//               <TouchableOpacity style={[styles.actionButton, styles.closeButtonModal]} onPress={() => setShowDetailsModal(false)}>
//                 <Text style={[styles.actionButtonText, { color: '#6B5B95' }]}>Close</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   const renderAddModal = () => {
//     const isLost = activeTab === 'lost';

//     return (
//       <Modal
//         visible={showAddModal}
//         transparent
//         animationType="slide"
//         onRequestClose={() => {
//           setShowAddModal(false);
//           setSelectedImages([]);
//         }}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContainer, { width: '95%', maxHeight: '90%' }]}>
//             <View style={styles.modalHeader}>
//               <View style={styles.modalTitleContainer}>
//                 <View style={[styles.modalEventIcon, { backgroundColor: isLost ? '#FEF3C7' : '#D1FAE5' }]}>
//                   <Ionicons name={isLost ? "help-circle-outline" : "checkmark-circle-outline"} size={24} color={isLost ? '#F59E0B' : '#10B981'} />
//                 </View>
//                 <View>
//                   <Text style={styles.modalTitle}>
//                     {isEditing ? 'Edit' : 'Add New'} {isLost ? 'Lost' : 'Found'} Item
//                   </Text>
//                 </View>
//               </View>
//               <TouchableOpacity onPress={() => {
//                 setShowAddModal(false);
//                 setSelectedImages([]);
//               }} style={styles.closeButton}>
//                 <Ionicons name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={styles.modalScroll}>
//               <View style={styles.formSection}>
//                 <Text style={styles.formLabel}>
//                   {isLost ? 'Guest Name' : 'Finder Name'} *
//                 </Text>
//                 <TextInput
//                   style={styles.formInput}
//                   value={isLost ? formData.guest_name : formData.finder_name}
//                   onChangeText={(text) => setFormData({ ...formData, [isLost ? 'guest_name' : 'finder_name']: text })}
//                   placeholder={`Enter ${isLost ? 'guest' : 'finder'} name`}
//                 />
//               </View>

//               <View style={styles.formSection}>
//                 <Text style={styles.formLabel}>Telephone *</Text>
//                 <TextInput
//                   style={styles.formInput}
//                   value={formData.telephone}
//                   onChangeText={(text) => setFormData({ ...formData, telephone: text })}
//                   placeholder="Enter telephone number"
//                   keyboardType="phone-pad"
//                 />
//               </View>

//               <View style={styles.formSection}>
//                 <Text style={styles.formLabel}>Email</Text>
//                 <TextInput
//                   style={styles.formInput}
//                   value={formData.email}
//                   onChangeText={(text) => setFormData({ ...formData, email: text })}
//                   placeholder="Enter email address"
//                   keyboardType="email-address"
//                 />
//               </View>

//               <View style={styles.formSection}>
//                 <Text style={styles.formLabel}>Item Name *</Text>
//                 <TextInput
//                   style={styles.formInput}
//                   value={formData.item_name}
//                   onChangeText={(text) => setFormData({ ...formData, item_name: text })}
//                   placeholder="Enter item name"
//                 />
//               </View>

//               <View style={styles.formSection}>
//                 <Text style={styles.formLabel}>Location *</Text>
//                 <TextInput
//                   style={styles.formInput}
//                   value={formData.location}
//                   onChangeText={(text) => setFormData({ ...formData, location: text })}
//                   placeholder="Enter location (e.g., Pool, Room 112)"
//                 />
//               </View>

//               <View style={styles.formSection}>
//                 <Text style={styles.formLabel}>{isLost ? 'Lost Date' : 'Found Date'} *</Text>
//                 <TextInput
//                   style={styles.formInput}
//                   value={formData.date}
//                   onChangeText={(text) => setFormData({ ...formData, date: text })}
//                   placeholder="YYYY-MM-DD"
//                 />
//               </View>

//               <View style={styles.formSection}>
//                 <Text style={styles.formLabel}>{isLost ? 'Lost Time' : 'Found Time'}</Text>
//                 <TextInput
//                   style={styles.formInput}
//                   value={formData.time}
//                   onChangeText={(text) => setFormData({ ...formData, time: text })}
//                                   placeholder="HH:MM:SS (optional)"
//                 />
//               </View>

//               {/* Image Upload Section */}
//               <View style={styles.formSection}>
//                 <Text style={styles.formLabel}>Image</Text>
//                 <View style={styles.imageUploadContainer}>
//                   {selectedImages.length > 0 ? (
//                     <View style={styles.selectedImagePreview}>
//                       <Image source={{ uri: selectedImages[0].uri }} style={styles.previewImage} />
//                       <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
//                         <Ionicons name="close-circle" size={24} color="#EF4444" />
//                       </TouchableOpacity>
//                     </View>
//                   ) : (
//                     <TouchableOpacity style={styles.imageUploadButton} onPress={showImagePickerOptions}>
//                       <Ionicons name="camera-outline" size={32} color="#6B5B95" />
//                       <Text style={styles.imageUploadText}>Take Photo or Choose from Gallery</Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
//                 {existingImages.length > 0 && !selectedImages.length && (
//                   <Text style={styles.existingImageNote}>Existing image will be kept if no new image is selected</Text>
//                 )}
//               </View>

//               <View style={styles.formSection}>
//                 <Text style={styles.formLabel}>Additional Notes</Text>
//                 <TextInput
//                   style={[styles.formInput, styles.textArea]}
//                   value={formData.additional_notes}
//                   onChangeText={(text) => setFormData({ ...formData, additional_notes: text })}
//                   placeholder="Enter additional notes"
//                   multiline
//                   numberOfLines={4}
//                 />
//               </View>

//               {/* Status - Read Only in Add/Edit mode (set to Pending by default) */}
//               <View style={styles.formSection}>
//                 <Text style={styles.formLabel}>Status</Text>
//                 <View style={styles.statusReadOnly}>
//                   <View style={[styles.statusBadgeLarge, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
//                     <Text style={[styles.statusTextLarge, { color: '#92400E' }]}>Pending</Text>
//                   </View>
//                   <Text style={styles.statusNote}>Status is automatically set to Pending and can only be changed by admin</Text>
//                 </View>
//               </View>
//             </ScrollView>

//             <View style={styles.modalFooter}>
//               <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => {
//                 setShowAddModal(false);
//                 setSelectedImages([]);
//               }}>
//                 <Text style={styles.actionButtonText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
//                 <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Save</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   // Full Screen Image Modal
//   const renderFullScreenImageModal = () => {
//     if (!fullScreenImage) return null;

//     return (
//       <Modal
//         visible={showImageModal}
//         transparent
//         animationType="fade"
//         onRequestClose={() => {
//           setShowImageModal(false);
//           setFullScreenImage(null);
//         }}
//       >
//         <View style={styles.fullScreenOverlay}>
//           <TouchableOpacity 
//             style={styles.fullScreenClose}
//             onPress={() => {
//               setShowImageModal(false);
//               setFullScreenImage(null);
//             }}
//           >
//             <Ionicons name="close-circle" size={40} color="#FFFFFF" />
//           </TouchableOpacity>
//           <Image source={{ uri: fullScreenImage }} style={styles.fullScreenImage} resizeMode="contain" />
//         </View>
//       </Modal>
//     );
//   };

//   const currentItems = getCurrentItems();

//   return (
//     <View style={styles.container}>
//       <HeaderWithMenu
//         title="Lost & Found"
//         subtitle="Track lost and found items"
//         currentPage=""
//       />

//       {/* Summary Strip */}
//       <View style={styles.summaryWrapper}>
//         <View style={styles.summaryPeriodRow}>
//           <Text style={styles.summaryPeriodTitle}>Lost & Found Summary</Text>
//           <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
//             <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
//             <Text style={styles.addButtonText}>Add New</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.summaryCard}>
//           {summaryItems.map((item, index) => {
//             const isActive = activeTab === item.key;
//             const isLast = index === summaryItems.length - 1;
//             return (
//               <React.Fragment key={item.key}>
//                 <TouchableOpacity
//                   style={[styles.summaryItem, isActive && { backgroundColor: item.bg }]}
//                   onPress={() => setActiveTab(isActive ? 'lost' : item.key)}
//                   activeOpacity={0.7}
//                 >
//                   <View style={[
//                     styles.summaryIconWrap,
//                     { backgroundColor: isActive ? item.color : item.bg },
//                   ]}>
//                     <Ionicons name={item.icon} size={15} color={isActive ? '#fff' : item.color} />
//                   </View>
//                   <Text style={[styles.summaryCount, { color: isActive ? item.color : '#111827' }]}>
//                     {item.count}
//                   </Text>
//                   <Text style={[styles.summaryLabel, { color: isActive ? item.color : '#6B7280' }]}>
//                     {item.label}
//                   </Text>
//                   {isActive && (
//                     <View style={[styles.summaryActiveLine, { backgroundColor: item.color }]} />
//                   )}
//                 </TouchableOpacity>
//                 {!isLast && <View style={styles.summaryDivider} />}
//               </React.Fragment>
//             );
//           })}
//         </View>
//       </View>

//       {/* List */}
//       <FlatList
//         data={currentItems}
//         keyExtractor={(item) => `${item.id}-${item.updated_at}`}
//         renderItem={renderItemCard}
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
//             <Ionicons name={activeTab === 'lost' ? "help-circle-outline" : "checkmark-circle-outline"} size={64} color="#D1D5DB" />
//             <Text style={styles.emptyTitle}>No Items Found</Text>
//             <Text style={styles.emptySubtitle}>
//               No {activeTab} items found. Click the + button to add a new item.
//             </Text>
//             <TouchableOpacity style={styles.emptyButton} onPress={handleAddNew}>
//               <Text style={styles.emptyButtonText}>Add New Item</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         }
//         ListHeaderComponent={
//           loading ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#6B5B95" />
//               <Text style={styles.loadingText}>Loading items...</Text>
//             </View>
//           ) : null
//         }
//       />

//       {renderDetailsModal()}
//       {renderAddModal()}
//       {renderFullScreenImageModal()}
//     </View>
//   );
// };

// export default LostAndFound;

// // ─────────────────────────────────────────────────────────────────────────────
// // STYLES
// // ─────────────────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F9FAFB' },

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
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#6B5B95',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//     gap: 4,
//   },
//   addButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
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

//   itemCard: {
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
//   itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
//   statusIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
//   itemContent: { flex: 1 },
//   itemTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
//   itemTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
//   itemTime: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
//   itemPerson: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
//   itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
//   statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
//   statusText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
//   separatorDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' },
//   locationInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   locationText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
//   imagePreviewContainer: {
//     position: 'relative',
//     marginBottom: 12,
//   },
//   thumbnailImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     backgroundColor: '#F3F4F6',
//   },
//   imageCountBadge: {
//     position: 'absolute',
//     bottom: -5,
//     right: -5,
//     backgroundColor: '#6B5B95',
//     borderRadius: 12,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     minWidth: 24,
//     alignItems: 'center',
//   },
//   imageCountText: {
//     color: '#FFFFFF',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
//   dateLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 2 },
//   dateValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
//   actionButtons: { flexDirection: 'row', gap: 12 },
//   iconButton: { padding: 8 },

//   listContainer: { paddingTop: 8, paddingBottom: 24 },
//   loadingContainer: { paddingVertical: 32, alignItems: 'center' },
//   loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280', fontWeight: '500' },

//   emptyState: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 48 },
//   emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 8 },
//   emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
//   emptyButton: { backgroundColor: '#6B5B95', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
//   emptyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
//   modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, width: '90%', maxHeight: '85%', overflow: 'hidden' },
//   modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   modalTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
//   modalEventIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
//   modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
//   modalSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
//   closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
//   closeButtonModal: { backgroundColor: '#F3F4F6' },
//   modalScroll: { maxHeight: height * 0.6 },

//   detailSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
//   sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },

//   detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
//   detailLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500', width: '40%' },
//   detailValue: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },

//   statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
//   statusBadgeLarge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5 },
//   statusTextLarge: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
//   statusReadOnly: { alignItems: 'center', gap: 8 },
//   statusNote: { fontSize: 12, color: '#6B7280', textAlign: 'center', fontStyle: 'italic', marginTop: 8 },

//   imageScrollView: { flexDirection: 'row', gap: 12 },
//   detailImage: { width: 100, height: 100, borderRadius: 8, marginRight: 12, backgroundColor: '#F3F4F6' },

//   modalFooter: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
//   actionButton: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center' },
//   cancelButton: { backgroundColor: '#F3F4F6' },
//   saveButton: { backgroundColor: '#6B5B95' },
//   actionButtonText: { fontSize: 15, fontWeight: '600', color: '#111827' },

//   formSection: { paddingHorizontal: 20, paddingTop: 16 },
//   formLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
//   formInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: '#FFFFFF' },
//   textArea: { height: 100, textAlignVertical: 'top' },

//   // Image Upload Styles
//   imageUploadContainer: {
//     marginTop: 8,
//   },
//   imageUploadButton: {
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderStyle: 'dashed',
//     borderRadius: 12,
//     padding: 24,
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//   },
//   imageUploadText: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   selectedImagePreview: {
//     position: 'relative',
//     alignItems: 'center',
//   },
//   previewImage: {
//     width: 150,
//     height: 150,
//     borderRadius: 12,
//     backgroundColor: '#F3F4F6',
//   },
//   removeImageButton: {
//     position: 'absolute',
//     top: -10,
//     right: -10,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//   },
//   existingImageNote: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 8,
//     fontStyle: 'italic',
//     textAlign: 'center',
//   },

//   // Full Screen Image Modal
//   fullScreenOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.95)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   fullScreenClose: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     zIndex: 10,
//   },
//   fullScreenImage: {
//     width: '100%',
//     height: '100%',
//   },
// });



// app/lost&found/index.tsx
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
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import HeaderWithMenu from '../../components/HeaderWithMenu';
import lostFoundService, { 
  LostItem, 
  FoundItem, 
  parseImageUrl,
  parseImageUrls 
} from '@/services/lost_&_found';

const { width, height } = Dimensions.get('window');

type ItemType = 'lost' | 'found';
type StatusType = 'Pending' | 'Returned' | 'Unclaimed';

interface StatusStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

// Status configuration for buttons
const STATUS_CONFIG = {
  Pending: { color: '#F59E0B', bg: '#FEF3C7', border: '#F59E0B', icon: 'time-outline' },
  Returned: { color: '#10B981', bg: '#D1FAE5', border: '#10B981', icon: 'checkmark-circle-outline' },
  Unclaimed: { color: '#EF4444', bg: '#FEE2E2', border: '#EF4444', icon: 'alert-circle-outline' },
};

// ─────────────────────────────────────────────────────────────────────────────
const LostAndFound = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ItemType>('lost');
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostItem | FoundItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (!loading) return;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [loading]);

  // Request permissions for camera and gallery
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission Needed', 'Camera permission is required to take photos');
      }
      if (libraryStatus !== 'granted') {
        Alert.alert('Permission Needed', 'Gallery permission is required to select images');
      }
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'lost') {
        const response = await lostFoundService.getLostItems();
        if (response?.item) {
          setLostItems(response.item);
        }
      } else {
        const response = await lostFoundService.getFoundItems();
        if (response?.item) {
          setFoundItems(response.item);
        }
      }
    } catch (error) {
      console.error('Error loading lost & found data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getCurrentItems = (): (LostItem | FoundItem)[] => {
    return activeTab === 'lost' ? lostItems : foundItems;
  };

  const getStatusStyle = (status: string): StatusStyle => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { backgroundColor: '#FEF3C7', borderColor: '#F59E0B', textColor: '#92400E' };
      case 'returned':
        return { backgroundColor: '#D1FAE5', borderColor: '#10B981', textColor: '#065F46' };
      case 'unclaimed':
        return { backgroundColor: '#FEE2E2', borderColor: '#EF4444', textColor: '#991B1B' };
      default:
        return { backgroundColor: '#F3F4F6', borderColor: '#9CA3AF', textColor: '#374151' };
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return 'time-outline';
      case 'returned': return 'checkmark-circle-outline';
      case 'unclaimed': return 'alert-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffDays = Math.floor(Math.abs(Date.now() - date.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined });
  };

  // Image Picker Functions
  const pickImageFromGallery = async () => {
    await requestPermissions();
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      const filename = imageUri.split('/').pop() || 'image.jpg';
      setSelectedImages([{
        uri: imageUri,
        name: filename,
        type: 'image/jpeg',
      }]);
    }
  };

  const takePhotoWithCamera = async () => {
    await requestPermissions();
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      setSelectedImages([{
        uri: imageUri,
        name: filename,
        type: 'image/jpeg',
      }]);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Add Image',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhotoWithCamera },
        { text: 'Choose from Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const removeImage = () => {
    setSelectedImages([]);
  };

  const viewFullImage = (imageUrl: string) => {
    setFullScreenImage(imageUrl);
    setShowImageModal(true);
  };

  // Extract images from file_path
  const getItemImages = (item: LostItem | FoundItem): string[] => {
    return parseImageUrls(item.file_path);
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setSelectedImages([]);
    setFormData({
      guest_name: '',
      finder_name: '',
      telephone: '',
      email: '',
      item_name: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      additional_notes: '',
      status: 'Pending',
    });
    setShowAddModal(true);
  };

  const handleEdit = (item: LostItem | FoundItem) => {
    setIsEditing(true);
    setSelectedItem(item);
    setExistingImages(getItemImages(item));
    setSelectedImages([]);
    
    if (activeTab === 'lost') {
      const lostItem = item as LostItem;
      setFormData({
        id: lostItem.id,
        guest_name: lostItem.guest_name,
        telephone: lostItem.telephone,
        email: lostItem.email,
        item_name: lostItem.item_name,
        location: lostItem.location,
        date: lostItem.lost_date,
        time: lostItem.lost_time || '',
        additional_notes: lostItem.additional_note || '',
        status: lostItem.status,
      });
    } else {
      const foundItem = item as FoundItem;
      setFormData({
        id: foundItem.id,
        finder_name: foundItem.finder_name,
        telephone: foundItem.telephone,
        email: foundItem.email,
        item_name: foundItem.item_name,
        location: foundItem.location,
        date: foundItem.found_date,
        time: foundItem.found_time || '',
        additional_notes: foundItem.additional_notes || '',
        status: foundItem.status,
      });
    }
    setShowAddModal(true);
  };

  const handleDelete = (item: LostItem | FoundItem) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this ${activeTab} item?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (activeTab === 'lost') {
                await lostFoundService.deleteLostItem(item.id);
              } else {
                await lostFoundService.deleteFoundItem(item.id);
              }
              Alert.alert('Success', 'Item deleted successfully');
              loadData();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    // Validate required fields
    const nameField = activeTab === 'lost' ? formData.guest_name : formData.finder_name;
    if (!nameField || !nameField.trim()) {
      Alert.alert('Required', `Please enter ${activeTab === 'lost' ? 'guest' : 'finder'} name`);
      return;
    }
    if (!formData.telephone || !formData.telephone.trim()) {
      Alert.alert('Required', 'Please enter telephone number');
      return;
    }
    if (!formData.item_name || !formData.item_name.trim()) {
      Alert.alert('Required', 'Please enter item name');
      return;
    }
    if (!formData.location || !formData.location.trim()) {
      Alert.alert('Required', 'Please enter location');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare file upload data
      const fileUpload = selectedImages.length > 0 ? selectedImages.map(img => ({
        uri: img.uri,
        name: img.name,
        type: img.type,
      })) : undefined;

      if (activeTab === 'lost') {
        if (isEditing) {
          await lostFoundService.updateLostItem({
            id: formData.id,
            guest_name: formData.guest_name,
            telephone: formData.telephone,
            email: formData.email,
            item_name: formData.item_name,
            location: formData.location,
            lost_date: formData.date,
            lost_time: formData.time,
            additional_notes: formData.additional_notes,
            status: formData.status,
            file_upload: fileUpload,
          });
        } else {
          await lostFoundService.storeLostItem({
            guest_name: formData.guest_name,
            telephone: formData.telephone,
            email: formData.email,
            item_name: formData.item_name,
            location: formData.location,
            lost_date: formData.date,
            lost_time: formData.time,
            additional_notes: formData.additional_notes,
            status: 'Pending',
            file_upload: fileUpload,
          });
        }
      } else {
        if (isEditing) {
          await lostFoundService.updateFoundItem({
            id: formData.id,
            finder_name: formData.finder_name,
            telephone: formData.telephone,
            email: formData.email,
            item_name: formData.item_name,
            location: formData.location,
            found_date: formData.date,
            found_time: formData.time,
            additional_notes: formData.additional_notes,
            status: formData.status,
            file_upload: fileUpload,
          });
        } else {
          await lostFoundService.storeFoundItem({
            finder_name: formData.finder_name,
            telephone: formData.telephone,
            email: formData.email,
            item_name: formData.item_name,
            location: formData.location,
            found_date: formData.date,
            found_time: formData.time,
            additional_notes: formData.additional_notes,
            status: 'Pending',
            file_upload: fileUpload,
          });
        }
      }
      
      Alert.alert('Success', `Item ${isEditing ? 'updated' : 'added'} successfully`);
      setShowAddModal(false);
      setSelectedImages([]);
      loadData();
    } catch (error: any) {
      console.error('Error saving item:', error);
      Alert.alert('Error', error?.message || 'Failed to save item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Summary counts
  const summaryItems = [
    {
      key: 'lost' as ItemType,
      label: 'Lost Items',
      count: lostItems.length,
      color: '#F59E0B',
      bg: '#FEF3C7',
      icon: 'help-circle-outline' as any,
    },
    {
      key: 'found' as ItemType,
      label: 'Found Items',
      count: foundItems.length,
      color: '#10B981',
      bg: '#D1FAE5',
      icon: 'checkmark-circle-outline' as any,
    },
  ];

  const renderItemCard = ({ item }: { item: LostItem | FoundItem }) => {
    const statusStyle = getStatusStyle(item.status);
    const timeAgo = formatDate(item.created_at);
    const isLost = activeTab === 'lost';
    const images = getItemImages(item);
    const name = isLost ? (item as LostItem).guest_name || 'Anonymous' : (item as FoundItem).finder_name || 'Anonymous';
    const dateField = isLost ? (item as LostItem).lost_date : (item as FoundItem).found_date;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedItem(item);
          setShowDetailsModal(true);
        }}
        activeOpacity={0.7}
        style={styles.itemCard}
      >
        <View style={styles.itemHeader}>
          <View style={[styles.statusIconContainer, { backgroundColor: statusStyle.backgroundColor }]}>
            <Ionicons name={getStatusIcon(item.status) as any} size={20} color={statusStyle.textColor} />
          </View>
          <View style={styles.itemContent}>
            <View style={styles.itemTitleRow}>
              <Text style={styles.itemTitle}>{item.item_name}</Text>
              <Text style={styles.itemTime}>{timeAgo}</Text>
            </View>
            <Text style={styles.itemPerson}>{name}</Text>
            <View style={styles.itemMeta}>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
                <Text style={[styles.statusText, { color: statusStyle.textColor }]}>{item.status}</Text>
              </View>
              <View style={styles.separatorDot} />
              <View style={styles.locationInfo}>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text style={styles.locationText}>{item.location}</Text>
              </View>
            </View>
            {images.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                <TouchableOpacity onPress={() => viewFullImage(images[0])}>
                  <Image source={{ uri: images[0] }} style={styles.thumbnailImage} />
                </TouchableOpacity>
                {images.length > 1 && (
                  <View style={styles.imageCountBadge}>
                    <Text style={styles.imageCountText}>+{images.length - 1}</Text>
                  </View>
                )}
              </View>
            )}
            <View style={styles.itemFooter}>
              <View>
                <Text style={styles.dateLabel}>Date</Text>
                <Text style={styles.dateValue}>{dateField}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => handleEdit(item)}
                  style={styles.iconButton}
                >
                  <Ionicons name="create-outline" size={20} color="#6B5B95" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  style={styles.iconButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailsModal = () => {
    if (!selectedItem) return null;
    const isLost = activeTab === 'lost';
    const statusStyle = getStatusStyle(selectedItem.status);
    const images = getItemImages(selectedItem);
    const name = isLost ? (selectedItem as LostItem).guest_name : (selectedItem as FoundItem).finder_name;
    const dateField = isLost ? (selectedItem as LostItem).lost_date : (selectedItem as FoundItem).found_date;
    const timeField = isLost ? (selectedItem as LostItem).lost_time : (selectedItem as FoundItem).found_time;
    const notesField = isLost ? (selectedItem as LostItem).additional_note : (selectedItem as FoundItem).additional_notes;

    const DetailRow = ({ label, value }: { label: string; value: string }) => (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'N/A'}</Text>
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
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={[styles.modalEventIcon, { backgroundColor: statusStyle.backgroundColor }]}>
                  <Ionicons name={getStatusIcon(selectedItem.status) as any} size={24} color={statusStyle.textColor} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {isLost ? 'Lost Item Details' : 'Found Item Details'}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedItem.item_name} • {formatDate(selectedItem.created_at)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-circle-outline" size={20} color="#6B5B95" />
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                </View>
                <DetailRow 
                  label={isLost ? "Guest Name" : "Finder Name"} 
                  value={name || 'Not provided'} 
                />
                <DetailRow label="Telephone" value={selectedItem.telephone || 'Not provided'} />
                {selectedItem.email && <DetailRow label="Email" value={selectedItem.email} />}
              </View>

              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="cube-outline" size={20} color="#6B5B95" />
                  <Text style={styles.sectionTitle}>Item Details</Text>
                </View>
                <DetailRow label="Item Name" value={selectedItem.item_name} />
                <DetailRow label="Location" value={selectedItem.location} />
                <DetailRow label={isLost ? "Lost Date" : "Found Date"} value={dateField || 'Not specified'} />
                {timeField && <DetailRow label={isLost ? "Lost Time" : "Found Time"} value={timeField} />}
                
                {/* Status - Read Only */}
                <View style={styles.statusRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[styles.statusBadgeLarge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
                    <Text style={[styles.statusTextLarge, { color: statusStyle.textColor }]}>
                      {selectedItem.status}
                    </Text>
                  </View>
                </View>
                
                {notesField && <DetailRow label="Additional Notes" value={notesField} />}
              </View>

              {/* Images Section */}
              {images.length > 0 && (
                <View style={styles.detailSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="images-outline" size={20} color="#6B5B95" />
                    <Text style={styles.sectionTitle}>Images ({images.length})</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                    {images.map((img, index) => (
                      <TouchableOpacity key={index} onPress={() => viewFullImage(img)}>
                        <Image source={{ uri: img }} style={styles.detailImage} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="information-circle-outline" size={20} color="#6B5B95" />
                  <Text style={styles.sectionTitle}>System Information</Text>
                </View>
                <DetailRow label="Item ID" value={`#${selectedItem.id}`} />
                <DetailRow label="Created" value={new Date(selectedItem.created_at).toLocaleString()} />
                <DetailRow label="Last Updated" value={new Date(selectedItem.updated_at).toLocaleString()} />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.actionButton, styles.closeButtonModal]} onPress={() => setShowDetailsModal(false)}>
                <Text style={[styles.actionButtonText, { color: '#6B5B95' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderAddModal = () => {
    const isLost = activeTab === 'lost';
    const isSaving = loading;
    const currentStatus = formData.status as StatusType;

    return (
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          setSelectedImages([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { width: '95%', maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={[styles.modalEventIcon, { backgroundColor: isLost ? '#FEF3C7' : '#D1FAE5' }]}>
                  <Ionicons name={isLost ? "help-circle-outline" : "checkmark-circle-outline"} size={24} color={isLost ? '#F59E0B' : '#10B981'} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {isEditing ? 'Edit' : 'Add New'} {isLost ? 'Lost' : 'Found'} Item
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => {
                setShowAddModal(false);
                setSelectedImages([]);
              }} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>
                  {isLost ? 'Guest Name' : 'Finder Name'} *
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={isLost ? formData.guest_name : formData.finder_name}
                  onChangeText={(text) => setFormData({ ...formData, [isLost ? 'guest_name' : 'finder_name']: text })}
                  placeholder={`Enter ${isLost ? 'guest' : 'finder'} name`}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Telephone *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.telephone}
                  onChangeText={(text) => setFormData({ ...formData, telephone: text })}
                  placeholder="Enter telephone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Item Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.item_name}
                  onChangeText={(text) => setFormData({ ...formData, item_name: text })}
                  placeholder="Enter item name"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Location *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  placeholder="Enter location (e.g., Pool, Room 112)"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>{isLost ? 'Lost Date' : 'Found Date'} *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>{isLost ? 'Lost Time' : 'Found Time'}</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.time}
                  onChangeText={(text) => setFormData({ ...formData, time: text })}
                  placeholder="HH:MM:SS (optional)"
                />
              </View>

              {/* Image Upload Section */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Image</Text>
                <View style={styles.imageUploadContainer}>
                  {selectedImages.length > 0 ? (
                    <View style={styles.selectedImagePreview}>
                      <Image source={{ uri: selectedImages[0].uri }} style={styles.previewImage} />
                      <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ) : existingImages.length > 0 && !isEditing ? (
                    <View style={styles.selectedImagePreview}>
                      <Image source={{ uri: existingImages[0] }} style={styles.previewImage} />
                      <Text style={styles.existingImageLabel}>Current image will be kept</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.imageUploadButton} onPress={showImagePickerOptions}>
                      <Ionicons name="camera-outline" size={32} color="#6B5B95" />
                      <Text style={styles.imageUploadText}>Take Photo or Choose from Gallery</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Additional Notes</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={formData.additional_notes}
                  onChangeText={(text) => setFormData({ ...formData, additional_notes: text })}
                  placeholder="Enter additional notes"
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Status Buttons - Three buttons for editing */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Status {!isEditing && <Text style={styles.optionalTag}>(Auto-set to Pending for new items)</Text>}</Text>
                {isEditing ? (
                  <View style={styles.statusButtonsContainer}>
                    {(['Pending', 'Returned', 'Unclaimed'] as StatusType[]).map((status) => {
                      const config = STATUS_CONFIG[status];
                      const isSelected = currentStatus === status;
                      return (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusButton,
                            { borderColor: config.border, backgroundColor: isSelected ? config.bg : '#FFFFFF' },
                            isSelected && styles.statusButtonSelected
                          ]}
                          onPress={() => setFormData({ ...formData, status })}
                        >
                          <Ionicons name={config.icon as any} size={16} color={isSelected ? config.color : '#9CA3AF'} />
                          <Text style={[styles.statusButtonText, { color: isSelected ? config.color : '#6B7280' }]}>
                            {status}
                          </Text>
                          {isSelected && (
                            <View style={[styles.statusCheckmark, { backgroundColor: config.color }]}>
                              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.statusReadOnly}>
                    <View style={[styles.statusBadgeLarge, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                      <Text style={[styles.statusTextLarge, { color: '#92400E' }]}>Pending</Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => {
                setShowAddModal(false);
                setSelectedImages([]);
              }}>
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton, isSaving && styles.disabledButton]} 
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Full Screen Image Modal
  const renderFullScreenImageModal = () => {
    if (!fullScreenImage) return null;

    return (
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowImageModal(false);
          setFullScreenImage(null);
        }}
      >
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity 
            style={styles.fullScreenClose}
            onPress={() => {
              setShowImageModal(false);
              setFullScreenImage(null);
            }}
          >
            <Ionicons name="close-circle" size={40} color="#FFFFFF" />
          </TouchableOpacity>
          <Image source={{ uri: fullScreenImage }} style={styles.fullScreenImage} resizeMode="contain" />
        </View>
      </Modal>
    );
  };

  const currentItems = getCurrentItems();

  return (
    <View style={styles.container}>
      <HeaderWithMenu
        title="Lost & Found"
        subtitle="Track lost and found items"
        currentPage=""
      />

      {/* Summary Strip */}
      <View style={styles.summaryWrapper}>
        <View style={styles.summaryPeriodRow}>
          <Text style={styles.summaryPeriodTitle}>Lost & Found Summary</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          {summaryItems.map((item, index) => {
            const isActive = activeTab === item.key;
            const isLast = index === summaryItems.length - 1;
            return (
              <React.Fragment key={item.key}>
                <TouchableOpacity
                  style={[styles.summaryItem, isActive && { backgroundColor: item.bg }]}
                  onPress={() => setActiveTab(item.key)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.summaryIconWrap,
                    { backgroundColor: isActive ? item.color : item.bg },
                  ]}>
                    <Ionicons name={item.icon} size={15} color={isActive ? '#fff' : item.color} />
                  </View>
                  <Text style={[styles.summaryCount, { color: isActive ? item.color : '#111827' }]}>
                    {item.count}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: isActive ? item.color : '#6B7280' }]}>
                    {item.label}
                  </Text>
                  {isActive && (
                    <View style={[styles.summaryActiveLine, { backgroundColor: item.color }]} />
                  )}
                </TouchableOpacity>
                {!isLast && <View style={styles.summaryDivider} />}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={currentItems}
        keyExtractor={(item) => `${item.id}-${item.updated_at}`}
        renderItem={renderItemCard}
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
          !loading ? (
            <Animated.View style={[styles.emptyState, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Ionicons name={activeTab === 'lost' ? "help-circle-outline" : "checkmark-circle-outline"} size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Items Found</Text>
              <Text style={styles.emptySubtitle}>
                No {activeTab} items found. Click the + button to add a new item.
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleAddNew}>
                <Text style={styles.emptyButtonText}>Add New Item</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : null
        }
        ListHeaderComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6B5B95" />
              <Text style={styles.loadingText}>Loading items...</Text>
            </View>
          ) : null
        }
      />

      {renderDetailsModal()}
      {renderAddModal()}
      {renderFullScreenImageModal()}
    </View>
  );
};

export default LostAndFound;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B5B95',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
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

  itemCard: {
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
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  statusIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  itemContent: { flex: 1 },
  itemTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  itemTime: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  itemPerson: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  separatorDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' },
  locationInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#6B5B95',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  imageCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  dateLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 2 },
  dateValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  actionButtons: { flexDirection: 'row', gap: 12 },
  iconButton: { padding: 8 },

  listContainer: { paddingTop: 8, paddingBottom: 24 },
  loadingContainer: { paddingVertical: 32, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280', fontWeight: '500' },

  emptyState: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyButton: { backgroundColor: '#6B5B95', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  emptyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, width: '90%', maxHeight: '85%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  modalEventIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  closeButtonModal: { backgroundColor: '#F3F4F6' },
  modalScroll: { maxHeight: height * 0.6 },

  detailSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  detailLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500', width: '40%' },
  detailValue: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },

  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadgeLarge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5 },
  statusTextLarge: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  statusReadOnly: { alignItems: 'center', gap: 8 },
  statusNote: { fontSize: 12, color: '#6B7280', textAlign: 'center', fontStyle: 'italic', marginTop: 8 },

  imageScrollView: { flexDirection: 'row', gap: 12 },
  detailImage: { width: 100, height: 100, borderRadius: 8, marginRight: 12, backgroundColor: '#F3F4F6' },

  modalFooter: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  actionButton: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelButton: { backgroundColor: '#F3F4F6' },
  saveButton: { backgroundColor: '#6B5B95' },
  disabledButton: { opacity: 0.6 },
  actionButtonText: { fontSize: 15, fontWeight: '600', color: '#111827' },

  formSection: { paddingHorizontal: 20, paddingTop: 16 },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  formInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: '#FFFFFF' },
  textArea: { height: 100, textAlignVertical: 'top' },
  optionalTag: { fontSize: 12, fontWeight: '400', color: '#9CA3AF' },

  // Status Buttons Container
  statusButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    position: 'relative',
  },
  statusButtonSelected: {
    borderWidth: 2,
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusCheckmark: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Image Upload Styles
  imageUploadContainer: {
    marginTop: 8,
  },
  imageUploadButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  imageUploadText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedImagePreview: {
    position: 'relative',
    alignItems: 'center',
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  existingImageLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  existingImageNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Full Screen Image Modal
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});