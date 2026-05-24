
// // app/dashboard/utility.tsx
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
//   FlatList,
//   Modal,
//   TextInput,
//   Image,
//   Platform,
//   Dimensions,
//   KeyboardAvoidingView,
//   Keyboard,
//   TouchableWithoutFeedback,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { LineChart } from 'react-native-chart-kit';
// import dayjs from 'dayjs';
// import utilityService, {
//   UtilityCategory,
//   UtilityItem,
//   CategoryChartData,
//   TotalCount,
//   TotalBillCount,
// } from '../../services/utilityService';
// import DashboardHeader from '@/components/HeaderWithMenu';

// const { width } = Dimensions.get('window');

// const Utility = () => {
//   const [utilities, setUtilities]       = useState<UtilityItem[]>([]);
//   const [categories, setCategories]     = useState<UtilityCategory[]>([]);
//   const [loading, setLoading]           = useState(true);
//   const [refreshing, setRefreshing]     = useState(false);
//   const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');
//   const [modalVisible, setModalVisible] = useState(false);
//   const [filterModalVisible, setFilterModalVisible] = useState(false);
//   const [submitting, setSubmitting]     = useState(false);
//   const [searchQuery, setSearchQuery]   = useState('');
//   const [isEditMode, setIsEditMode]     = useState(false);
//   const [editingId, setEditingId]       = useState<number | null>(null);
//   const [existingImage, setExistingImage] = useState<string | null>(null);

//   const [viewMode, setViewMode] = useState<'list' | 'summary'>('summary');

//   const [chartData, setChartData]             = useState<CategoryChartData[]>([]);
//   const [totalCounts, setTotalCounts]         = useState<TotalCount[]>([]);
//   const [totalBillCounts, setTotalBillCounts] = useState<TotalBillCount[]>([]);
//   const [selectedDate, setSelectedDate]       = useState(new Date());
//   const [showDatePicker, setShowDatePicker]   = useState(false);

//   const [dateFilterEnabled, setDateFilterEnabled]     = useState(false);
//   const [startDate, setStartDate]                     = useState<Date | null>(null);
//   const [endDate, setEndDate]                         = useState<Date | null>(null);
//   const [showStartDatePicker, setShowStartDatePicker] = useState(false);
//   const [showEndDatePicker, setShowEndDatePicker]     = useState(false);

//   // ── Custom category dropdown modal ────────────────────────────────────────
//   const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

//   const [formData, setFormData] = useState({
//     date: new Date(),
//     u_category: 0,
//     startreading: '',
//     utility_image: null as string | null,
//   });
//   const [imageUri, setImageUri] = useState<string | null>(null);

//   // ── Selected category display name ────────────────────────────────────────
//   const selectedCategoryName = useMemo(() => {
//     const cat = categories.find(c => c.id === formData.u_category);
//     return cat?.utility_category_name ?? 'Select Category';
//   }, [categories, formData.u_category]);

//   // ── Effects ───────────────────────────────────────────────────────────────
//   useEffect(() => { loadData(); requestPermissions(); }, []);
//   useEffect(() => { if (viewMode === 'summary') loadChartData(); }, [selectedDate, viewMode]);

//   // ── Filtered list — fix: Number() coerce for string u_category_id ─────────
//   const filteredUtilities = useMemo(() => {
//     let filtered = utilities;

//     if (activeFilter !== 'all') {
//       // API returns u_category_id as string e.g. "3" — Number() fixes mismatch
//       filtered = filtered.filter(item => Number(item.u_category_id) === Number(activeFilter));
//     }

//     if (dateFilterEnabled && startDate && endDate) {
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.date);
//         const s = new Date(startDate); s.setHours(0, 0, 0, 0);
//         const e = new Date(endDate);   e.setHours(23, 59, 59, 999);
//         return itemDate >= s && itemDate <= e;
//       });
//     }

//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       filtered = filtered.filter(item =>
//         `${item.user.name} ${item.user.lname}`.toLowerCase().includes(q) ||
//         item.startreading.toLowerCase().includes(q) ||
//         item.u_category.toLowerCase().includes(q)
//       );
//     }

//     return filtered;
//   }, [utilities, activeFilter, searchQuery, dateFilterEnabled, startDate, endDate]);

//   // ── Permissions ───────────────────────────────────────────────────────────
//   const requestPermissions = async () => {
//     const { status: cam }   = await ImagePicker.requestCameraPermissionsAsync();
//     const { status: media } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (cam !== 'granted' || media !== 'granted') {
//       Alert.alert('Permissions Required', 'Camera and gallery permissions are needed.');
//     }
//   };

//   // ── Load utilities + categories ───────────────────────────────────────────
//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [utilitiesData, categoriesData] = await Promise.all([
//         utilityService.getUtilities(),
//         utilityService.getCategories(),
//       ]);
//       const sorted = [...utilitiesData].sort(
//         (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//       );
//       setUtilities(sorted);
//       setCategories(categoriesData);
//       if (categoriesData.length > 0) {
//         setFormData(prev => ({ ...prev, u_category: categoriesData[0].id }));
//       }
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to load data');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // ── Load chart data ───────────────────────────────────────────────────────
//   const loadChartData = async () => {
//     try {
//       setLoading(true);
//       const data = await utilityService.getChartData(dayjs(selectedDate).format('YYYY-MM-DD'));
//       setChartData(data.chartData || []);
//       setTotalCounts(data.total_count || []);
//       setTotalBillCounts(data.total_bill_count || []);
//     } catch (error: any) {
//       Alert.alert('Error', 'Failed to load chart data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Chart helpers ─────────────────────────────────────────────────────────
//   const getCategoryData = (categoryName: string) => {
//     const tc = totalCounts.find(t => t.category === categoryName);
//     const bc = totalBillCounts.find(b => b.category === categoryName);
//     return {
//       charge:       tc?.total_bill        || '0.00',
//       monthlyUnits: tc?.total_count       || 0,
//       billCharges:  bc?.total_BillReading || '0.00',
//       billUnits:    bc?.total_bill_count  || 0,
//     };
//   };

//   const buildChart = (category: CategoryChartData) => ({
//     labels: category.readings.map(r => dayjs(r.date).format('DD MMM')),
//     datasets: [
//       { data: category.readings.map(r => (r[category.categoryDisplayName] as number) ?? 0), color: () => '#EF4444', strokeWidth: 2 },
//       { data: category.readings.map(r => r.guests ?? 0), color: () => '#9333EA', strokeWidth: 2 },
//     ],
//     legend: [category.categoryDisplayName, 'guests'],
//   });

//   // ── Refresh ───────────────────────────────────────────────────────────────
//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     viewMode === 'list' ? loadData() : loadChartData();
//   }, [viewMode, selectedDate]);

//   // ── Date helpers ──────────────────────────────────────────────────────────
//   const onDateChange = (_: any, date?: Date) => { setShowDatePicker(false); if (date) setSelectedDate(date); };

//   const resetDateFilter = useCallback(() => {
//     setDateFilterEnabled(false); setStartDate(null); setEndDate(null); setFilterModalVisible(false);
//   }, []);

//   const applyDateFilter = useCallback(() => {
//     if (!startDate || !endDate) { Alert.alert('Error', 'Please select both dates'); return; }
//     if (startDate > endDate)    { Alert.alert('Error', 'Start date must be before end date'); return; }
//     setDateFilterEnabled(true); setFilterModalVisible(false);
//   }, [startDate, endDate]);

//   // ── Image picker ──────────────────────────────────────────────────────────
//   const pickImage = async (source: 'camera' | 'gallery') => {
//     try {
//       const opts = { mediaTypes: ['images' as const], allowsEditing: true, aspect: [4, 3] as [number, number], quality: 0.7 };
//       const result = source === 'camera'
//         ? await ImagePicker.launchCameraAsync(opts)
//         : await ImagePicker.launchImageLibraryAsync(opts);
//       if (!result.canceled && result.assets[0]) {
//         const uri = result.assets[0].uri;
//         setImageUri(uri);
//         setFormData(prev => ({ ...prev, utility_image: uri }));
//       }
//     } catch { Alert.alert('Error', 'Failed to pick image'); }
//   };

//   const showImagePickerOptions = () => {
//     Alert.alert('Select Image', 'Choose an option', [
//       { text: 'Take Photo',          onPress: () => pickImage('camera') },
//       { text: 'Choose from Gallery', onPress: () => pickImage('gallery') },
//       { text: 'Cancel', style: 'cancel' },
//     ]);
//   };

//   // ── Duplicate check ───────────────────────────────────────────────────────
//   const checkDuplicate = (date: Date, catId: number, excludeId: number | null = null) => {
//     const ds = date.toISOString().split('T')[0];
//     return utilities.some(
//       item => item.date === ds && Number(item.u_category_id) === catId && item.id !== excludeId
//     );
//   };

//   // ── Edit ──────────────────────────────────────────────────────────────────
//   const handleEdit = async (id: number) => {
//     try {
//       const utility = await utilityService.getUtilityById(id);
//       const [y, m, d] = utility.date.split('-').map(Number);
//       setFormData({
//         date: new Date(y, m - 1, d),
//         u_category: Number(utility.u_category_id), // coerce string → number
//         startreading: utility.startreading,
//         utility_image: null,
//       });
//       setExistingImage(utility.image);
//       setImageUri(getImageUrl(utility.image));
//       setEditingId(id);
//       setIsEditMode(true);
//       setModalVisible(true);
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to load utility data');
//     }
//   };

//   // ── Submit ────────────────────────────────────────────────────────────────
//   const handleSubmit = async () => {
//     if (!formData.startreading.trim())          { Alert.alert('Error', 'Please enter meter reading'); return; }
//     if (!isEditMode && !formData.utility_image) { Alert.alert('Error', 'Please select an image');    return; }
//     if (formData.u_category === 0)              { Alert.alert('Error', 'Please select a category');  return; }

//     if (!isEditMode && checkDuplicate(formData.date, formData.u_category)) {
//       const catName = categories.find(c => c.id === formData.u_category)?.utility_category_name ?? 'this category';
//       const dateStr = formData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//       Alert.alert('Duplicate Entry', `A reading for ${catName} on ${dateStr} already exists.`);
//       return;
//     }

//     try {
//       setSubmitting(true);
//       const fd = new FormData();
//       if (isEditMode && editingId) fd.append('id', editingId.toString());
//       fd.append('date',         formData.date.toISOString().split('T')[0]);
//       fd.append('u_category',   formData.u_category.toString());
//       fd.append('startreading', formData.startreading);

//       if (formData.utility_image) {
//         const filename = formData.utility_image.split('/').pop() || 'utility_image.jpg';
//         const ext = /\.(\w+)$/.exec(filename);
//         fd.append('utility_image', { uri: formData.utility_image, name: filename, type: ext ? `image/${ext[1]}` : 'image/jpeg' } as any);
//       } else if (isEditMode && existingImage) {
//         fd.append('existing_image', existingImage);
//       }

//       isEditMode && editingId
//         ? await utilityService.updateUtility(editingId, fd as any)
//         : await utilityService.saveUtility(fd as any);

//       setModalVisible(false);
//       setTimeout(() => {
//         Alert.alert('Success', isEditMode ? 'Updated successfully' : 'Added successfully', [{
//           text: 'OK', onPress: () => { resetForm(); loadData(); if (viewMode === 'summary') loadChartData(); }
//         }]);
//       }, 300);
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to save');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Reset form ────────────────────────────────────────────────────────────
//   const resetForm = useCallback(() => {
//     setFormData({ date: new Date(), u_category: categories[0]?.id ?? 0, startreading: '', utility_image: null });
//     setImageUri(null); setExistingImage(null); setIsEditMode(false); setEditingId(null);
//   }, [categories]);

//   // ── Delete ────────────────────────────────────────────────────────────────
//   const handleDelete = (id: number) => {
//     Alert.alert('Delete Utility', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Delete', style: 'destructive', onPress: async () => {
//         try {
//           await utilityService.deleteUtility(id);
//           Alert.alert('Success', 'Utility record deleted');
//           loadData();
//           if (viewMode === 'summary') loadChartData();
//         } catch (error: any) { Alert.alert('Error', error.message || 'Failed to delete'); }
//       }},
//     ]);
//   };

//   // ── Formatters ────────────────────────────────────────────────────────────
//   const formatDate = (s: string) =>
//     new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

//   const formatDateTime = (s: string) =>
//     new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

//   const formatMonthYear = (d: Date) =>
//     d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

//   const getImageUrl = (p: string | null) => {
//     if (!p) return '';
//     if (p.startsWith('http') || p.startsWith('data:')) return p;
//     return `https://app.trackerstay.com/storage/${p}`;
//   };

//   // ── Utility list card ─────────────────────────────────────────────────────
//   const renderUtilityCard = useCallback(({ item }: { item: UtilityItem }) => (
//     <View style={styles.utilityCard}>
//       <View style={styles.cardHeader}>
//         <View style={styles.headerLeft}>
//           <View style={styles.categoryBadge}>
//             <Ionicons name="flash" size={16} color="#6B5B95" />
//             <Text style={styles.categoryText}>{item.u_category}</Text>
//           </View>
//           <View style={styles.userBadge}>
//             <Ionicons name="person" size={14} color="#6B7280" />
//             <Text style={styles.userName}>{item.user.name} {item.user.lname}</Text>
//           </View>
//         </View>
//         <View style={styles.actionButtons}>
//           <TouchableOpacity onPress={() => handleEdit(item.id)}   style={styles.editButton}>
//             <Ionicons name="create-outline" size={20} color="#3B82F6" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
//             <Ionicons name="trash-outline" size={20} color="#EF4444" />
//           </TouchableOpacity>
//         </View>
//       </View>
//       {item.image && <Image source={{ uri: getImageUrl(item.image) }} style={styles.utilityImage} resizeMode="cover" />}
//       <View style={styles.cardBody}>
//         <View style={styles.infoRow}><Ionicons name="calendar-outline"        size={16} color="#6B7280" /><Text style={styles.infoText}>{formatDate(item.date)}</Text></View>
//         <View style={styles.infoRow}><Ionicons name="speedometer-outline"     size={16} color="#6B7280" /><Text style={styles.infoText}>Reading: {item.startreading}</Text></View>
//         <View style={styles.infoRow}><Ionicons name="shield-checkmark-outline" size={16} color="#10B981" /><Text style={[styles.infoText, { color: '#10B981' }]}>{item.status}</Text></View>
//       </View>
//       <View style={styles.cardFooter}>
//         <Text style={styles.footerText}>
//           {item.created_at !== item.updated_at ? 'Updated: ' : 'Added: '}
//           {formatDateTime(item.created_at !== item.updated_at ? item.updated_at : item.created_at)}
//         </Text>
//       </View>
//     </View>
//   ), []);

//   const keyExtractor = useCallback((item: UtilityItem) => item.id.toString(), []);

//   // ── Loading splash ────────────────────────────────────────────────────────
//   if (loading && !refreshing) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#6B5B95" />
//         <Text style={styles.loadingText}>Loading utilities...</Text>
//       </View>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   //  RENDER
//   // ═══════════════════════════════════════════════════════════════════════════
//   return (
//     <View style={styles.container}>
//       <DashboardHeader
//         title="Utility Management"
//         subtitle={viewMode === 'list' ? 'Track and manage utility readings' : `${formatMonthYear(selectedDate)} - Dashboard`}
//         currentPage="utility"
//       />

//       {/* ── View Toggle ─────────────────────────────────────────────────── */}
//       <View style={styles.viewToggleContainer}>
//         {(['summary', 'list'] as const).map(mode => (
//           <TouchableOpacity
//             key={mode}
//             style={[styles.toggleButton, viewMode === mode && styles.toggleButtonActive]}
//             onPress={() => setViewMode(mode)}
//           >
//             <Ionicons name={mode === 'summary' ? 'bar-chart' : 'list'} size={20} color={viewMode === mode ? '#FFFFFF' : '#6B5B95'} />
//             <Text style={[styles.toggleText, viewMode === mode && styles.toggleTextActive]}>
//               {mode === 'summary' ? 'Summary' : 'List View'}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* ═══ LIST VIEW ══════════════════════════════════════════════════════ */}
//       {viewMode === 'list' ? (
//         <>
//           {/* Search + date filter icon */}
//           <View style={styles.searchContainer}>
//             <View style={styles.searchBar}>
//               <Ionicons name="search" size={20} color="#6B7280" />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search by user, reading, category..."
//                 value={searchQuery}
//                 onChangeText={setSearchQuery}
//                 placeholderTextColor="#9CA3AF"
//               />
//               {searchQuery !== '' && (
//                 <TouchableOpacity onPress={() => setSearchQuery('')}>
//                   <Ionicons name="close-circle" size={20} color="#6B7280" />
//                 </TouchableOpacity>
//               )}
//             </View>
//             <TouchableOpacity
//               style={[styles.dateFilterButton, dateFilterEnabled && styles.dateFilterButtonActive]}
//               onPress={() => setFilterModalVisible(true)}
//             >
//               <Ionicons name="calendar" size={20} color={dateFilterEnabled ? '#FFFFFF' : '#6B5B95'} />
//               {dateFilterEnabled && <View style={styles.filterBadge} />}
//             </TouchableOpacity>
//           </View>

//           {/* Active date banner */}
//           {dateFilterEnabled && startDate && endDate && (
//             <View style={styles.activeDateFilter}>
//               <View style={styles.dateFilterInfo}>
//                 <Ionicons name="calendar-outline" size={16} color="#6B5B95" />
//                 <Text style={styles.dateFilterText}>
//                   {formatDate(startDate.toISOString())} – {formatDate(endDate.toISOString())}
//                 </Text>
//               </View>
//               <TouchableOpacity onPress={resetDateFilter}>
//                 <Ionicons name="close-circle" size={20} color="#6B5B95" />
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* ── Category filter chips with per-category count ── */}
//           <View style={styles.filterContainer}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
//               <TouchableOpacity
//                 onPress={() => setActiveFilter('all')}
//                 style={[styles.filterButton, activeFilter === 'all' && styles.activeFilterButton]}
//               >
//                 <Ionicons name="apps" size={16} color={activeFilter === 'all' ? '#FFFFFF' : '#6B5B95'} />
//                 <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
//                   All ({utilities.length})
//                 </Text>
//               </TouchableOpacity>

//               {categories.map(cat => {
//                 const isActive = activeFilter === cat.id;
//                 const count    = utilities.filter(u => Number(u.u_category_id) === cat.id).length;
//                 return (
//                   <TouchableOpacity
//                     key={cat.id}
//                     onPress={() => setActiveFilter(isActive ? 'all' : cat.id)}
//                     style={[styles.filterButton, isActive && styles.activeFilterButton]}
//                   >
//                     <Ionicons name="flash" size={16} color={isActive ? '#FFFFFF' : '#6B5B95'} />
//                     <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
//                       {cat.utility_category_name} ({count})
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>
//           </View>

//           {/* Results count */}
//           <View style={styles.resultsContainer}>
//             <Text style={styles.resultsText}>
//               {filteredUtilities.length} {filteredUtilities.length === 1 ? 'result' : 'results'}
//               {activeFilter !== 'all' && ` · ${categories.find(c => c.id === activeFilter)?.utility_category_name}`}
//             </Text>
//           </View>

//           <FlatList
//             data={filteredUtilities}
//             keyExtractor={keyExtractor}
//             renderItem={renderUtilityCard}
//             contentContainerStyle={styles.listContainer}
//             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B5B95" colors={['#6B5B95']} />}
//             ListEmptyComponent={
//               <View style={styles.emptyContainer}>
//                 <Ionicons name="flash-outline" size={60} color="#6B5B95" />
//                 <Text style={styles.emptyText}>No Utilities Found</Text>
//                 <Text style={styles.emptySubtext}>
//                   {searchQuery || dateFilterEnabled ? 'Try adjusting your filters' : 'Add your first utility reading'}
//                 </Text>
//               </View>
//             }
//             showsVerticalScrollIndicator={false}
//             removeClippedSubviews
//             maxToRenderPerBatch={10}
//             windowSize={10}
//           />
//         </>
//       ) : (
//         /* ═══ SUMMARY VIEW ═════════════════════════════════════════════════ */
//         <ScrollView
//           style={styles.summaryContent}
//           contentContainerStyle={styles.summaryScrollContent}
//           showsVerticalScrollIndicator={false}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B5B95" colors={['#6B5B95']} />}
//         >
//           <View style={styles.summaryDateSection}>
//             <Text style={styles.dateLabel}>Select Month</Text>
//             <TouchableOpacity style={styles.summaryDatePicker} onPress={() => setShowDatePicker(true)}>
//               <Ionicons name="calendar-outline" size={20} color="#64748B" />
//               <Text style={styles.summaryDateText}>{dayjs(selectedDate).format('YYYY-MM-DD')}</Text>
//             </TouchableOpacity>
//           </View>

//           {showDatePicker && (
//             <DateTimePicker value={selectedDate} mode="date"
//               display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} />
//           )}

//           {loading && <View style={{ paddingVertical: 32, alignItems: 'center' }}><ActivityIndicator size="large" color="#6B5B95" /></View>}

//           {chartData.map(category => {
//             const cd = getCategoryData(category.categoryDisplayName);
//             return (
//               <View key={category.categoryName} style={styles.chartCard}>
//                 <View style={styles.categoryHeader}>
//                   <Text style={styles.categoryTitle}>{category.categoryDisplayName}</Text>
//                   <Text style={styles.billCharges}>Bill charges: <Text style={styles.billAmount}>LKR {parseFloat(cd.billCharges).toFixed(2)}</Text></Text>
//                 </View>
//                 <View style={styles.statsRow}>
//                   <Text style={styles.statText}>Charge: LKR {parseFloat(cd.charge).toFixed(2)}</Text>
//                   <Text style={styles.statText}>Bill Total Units: {cd.billUnits}</Text>
//                 </View>
//                 <View style={styles.statsRow}>
//                   <Text style={styles.statText}>Monthly Total Units: {cd.monthlyUnits}</Text>
//                 </View>
//                 <ScrollView horizontal showsHorizontalScrollIndicator style={styles.chartScrollContainer} contentContainerStyle={{ paddingRight: 20 }}>
//                   <View style={{ padding: 8 }}>
//                     <LineChart
//                       data={buildChart(category)}
//                       width={Math.max(width - 64, category.readings.length * 60)}
//                       height={280}
//                       withDots withShadow={false} withInnerLines withOuterLines withVerticalLines withHorizontalLines bezier
//                       chartConfig={{
//                         backgroundColor: '#fff', backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff',
//                         decimalPlaces: 0,
//                         color: (o = 1) => `rgba(0,0,0,${o})`,
//                         labelColor: (o = 1) => `rgba(71,85,105,${o})`,
//                         style: { borderRadius: 16 },
//                         propsForDots: { r: '5', strokeWidth: '2', stroke: '#fff' },
//                         propsForBackgroundLines: { strokeDasharray: '', stroke: '#E2E8F0', strokeWidth: 1 },
//                         propsForLabels: { fontSize: 10 },
//                       }}
//                       style={{ marginVertical: 8, borderRadius: 16 }}
//                     />
//                   </View>
//                 </ScrollView>
//                 <View style={styles.legendContainer}>
//                   {[{ color: '#EF4444', label: category.categoryDisplayName }, { color: '#9333EA', label: 'guests' }].map(l => (
//                     <View key={l.label} style={styles.legendItem}>
//                       <View style={[styles.legendDot, { backgroundColor: l.color }]} />
//                       <Text style={styles.legendText}>{l.label}</Text>
//                     </View>
//                   ))}
//                 </View>
//               </View>
//             );
//           })}
//           <View style={{ height: 90 }} />
//         </ScrollView>
//       )}

//       {/* ── FAB (both views) ─────────────────────────────────────────────── */}
//       <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setModalVisible(true); }}>
//         <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.fabGradient}>
//           <Ionicons name="add" size={28} color="#FFFFFF" />
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* ══════════════════════════════════════════════════════════════════════
//           DATE RANGE FILTER MODAL
//       ══════════════════════════════════════════════════════════════════════ */}
//       <Modal visible={filterModalVisible} animationType="slide" transparent onRequestClose={() => setFilterModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.filterModalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Filter by Date Range</Text>
//               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
//                 <Ionicons name="close" size={24} color="#1F2937" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView showsVerticalScrollIndicator={false}>
//               <View style={styles.dateFilterForm}>
//                 <View style={styles.formGroup}>
//                   <Text style={styles.label}>Start Date</Text>
//                   <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartDatePicker(true)}>
//                     <Ionicons name="calendar-outline" size={20} color="#6B7280" />
//                     <Text style={styles.dateInputText}>{startDate ? formatDate(startDate.toISOString()) : 'Select start date'}</Text>
//                   </TouchableOpacity>
//                 </View>
//                 {showStartDatePicker && (
//                   <DateTimePicker value={startDate || new Date()} mode="date"
//                     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                     onChange={(_, d) => { setShowStartDatePicker(Platform.OS === 'ios'); if (d) setStartDate(d); }}
//                     maximumDate={new Date()} />
//                 )}
//                 <View style={styles.formGroup}>
//                   <Text style={styles.label}>End Date</Text>
//                   <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndDatePicker(true)}>
//                     <Ionicons name="calendar-outline" size={20} color="#6B7280" />
//                     <Text style={styles.dateInputText}>{endDate ? formatDate(endDate.toISOString()) : 'Select end date'}</Text>
//                   </TouchableOpacity>
//                 </View>
//                 {showEndDatePicker && (
//                   <DateTimePicker value={endDate || new Date()} mode="date"
//                     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                     onChange={(_, d) => { setShowEndDatePicker(Platform.OS === 'ios'); if (d) setEndDate(d); }}
//                     maximumDate={new Date()} minimumDate={startDate || undefined} />
//                 )}
//                 <View style={styles.quickFiltersContainer}>
//                   <Text style={styles.quickFiltersLabel}>Quick Filters</Text>
//                   <View style={styles.quickFilters}>
//                     {[{ label: 'Today', days: 0 }, { label: 'Last 7 Days', days: 7 }, { label: 'Last 30 Days', days: 30 }].map(({ label, days }) => (
//                       <TouchableOpacity key={label} style={styles.quickFilterButton} onPress={() => {
//                         const t = new Date(); const s = new Date(); s.setDate(t.getDate() - days);
//                         setStartDate(s); setEndDate(t);
//                       }}>
//                         <Text style={styles.quickFilterText}>{label}</Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 </View>
//                 <View style={styles.filterActions}>
//                   <TouchableOpacity style={styles.resetButton} onPress={resetDateFilter}>
//                     <Text style={styles.resetButtonText}>Reset</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.applyButton} onPress={applyDateFilter}>
//                     <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.applyGradient}>
//                       <Text style={styles.applyButtonText}>Apply Filter</Text>
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       {/* ══════════════════════════════════════════════════════════════════════
//           CATEGORY DROPDOWN MODAL  (custom — no native Picker issues)
//       ══════════════════════════════════════════════════════════════════════ */}
//       <Modal visible={showCategoryDropdown} animationType="fade" transparent onRequestClose={() => setShowCategoryDropdown(false)}>
//         <TouchableWithoutFeedback onPress={() => setShowCategoryDropdown(false)}>
//           <View style={styles.dropdownOverlay}>
//             <TouchableWithoutFeedback>
//               <View style={styles.dropdownBox}>
//                 <View style={styles.dropdownHeader}>
//                   <Text style={styles.dropdownTitle}>Select Category</Text>
//                   <TouchableOpacity onPress={() => setShowCategoryDropdown(false)}>
//                     <Ionicons name="close" size={22} color="#6B7280" />
//                   </TouchableOpacity>
//                 </View>
//                 {categories.map(cat => {
//                   const isSel = formData.u_category === cat.id;
//                   return (
//                     <TouchableOpacity
//                       key={cat.id}
//                       style={[styles.dropdownItem, isSel && styles.dropdownItemActive]}
//                       onPress={() => { setFormData(prev => ({ ...prev, u_category: cat.id })); setShowCategoryDropdown(false); }}
//                     >
//                       <Ionicons name="flash" size={16} color={isSel ? '#6B5B95' : '#9CA3AF'} />
//                       <Text style={[styles.dropdownItemText, isSel && styles.dropdownItemTextActive]}>
//                         {cat.utility_category_name}
//                       </Text>
//                       {isSel && <Ionicons name="checkmark" size={18} color="#6B5B95" style={{ marginLeft: 'auto' }} />}
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>

//       {/* ══════════════════════════════════════════════════════════════════════
//           ADD / EDIT MODAL
//       ══════════════════════════════════════════════════════════════════════ */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => { setModalVisible(false); resetForm(); }}
//       >
//         <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//           <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContent}>

//                 {/* Header */}
//                 <View style={styles.compactModalHeader}>
//                   <View style={styles.compactModalTitleRow}>
//                     <View style={styles.compactModalIcon}>
//                       <Ionicons name={isEditMode ? 'create' : 'flash'} size={18} color="#6B5B95" />
//                     </View>
//                     <Text style={styles.compactModalTitle}>
//                       {isEditMode ? 'Edit Utility Reading' : 'Add Utility Reading'}
//                     </Text>
//                   </View>
//                   <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }} style={styles.compactCloseBtn}>
//                     <Ionicons name="close" size={20} color="#6B7280" />
//                   </TouchableOpacity>
//                 </View>

//                 {/* Scrollable fields */}
//                 <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.compactFormScroll} keyboardShouldPersistTaps="handled">

//                   {/* Date */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Date</Text>
//                     <TouchableOpacity style={styles.compactInput} onPress={() => setShowDatePicker(true)}>
//                       <Ionicons name="calendar-outline" size={16} color="#6B7280" />
//                       <Text style={styles.compactInputText}>
//                         {formData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>

//                   {showDatePicker && (
//                     <DateTimePicker value={formData.date} mode="date"
//                       display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                       onChange={(_, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setFormData(prev => ({ ...prev, date: d })); }}
//                     />
//                   )}

//                   {/* Category — taps open dropdown modal */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Category</Text>
//                     <TouchableOpacity style={styles.compactInput} onPress={() => setShowCategoryDropdown(true)}>
//                       <Ionicons name="flash" size={16} color="#6B5B95" />
//                       <Text style={[styles.compactInputText, { flex: 1, color: formData.u_category ? '#1F2937' : '#9CA3AF' }]}>
//                         {selectedCategoryName}
//                       </Text>
//                       <Ionicons name="chevron-down" size={16} color="#6B7280" />
//                     </TouchableOpacity>
//                   </View>

//                   {/* Meter Reading */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Meter Reading</Text>
//                     <View style={styles.compactInput}>
//                       <Ionicons name="speedometer-outline" size={16} color="#6B7280" />
//                       <TextInput
//                         style={styles.compactTextInput}
//                         placeholder="Enter reading"
//                         keyboardType="numeric"
//                         value={formData.startreading}
//                         onChangeText={t => setFormData(prev => ({ ...prev, startreading: t }))}
//                         placeholderTextColor="#9CA3AF"
//                         returnKeyType="done"
//                         onSubmitEditing={Keyboard.dismiss}
//                       />
//                     </View>
//                   </View>

//                   {/* Image */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Meter Photo</Text>
//                     <TouchableOpacity style={styles.compactImagePicker} onPress={showImagePickerOptions}>
//                       {imageUri ? (
//                         <View style={styles.compactImagePreviewRow}>
//                           <Image source={{ uri: imageUri }} style={styles.compactPreviewThumb} />
//                           <View style={styles.compactImageInfo}>
//                             <Ionicons name="checkmark-circle" size={18} color="#10B981" />
//                             <Text style={styles.compactImageInfoText}>Photo selected</Text>
//                             <Text style={styles.compactImageChangeText}>Tap to change</Text>
//                           </View>
//                         </View>
//                       ) : (
//                         <View style={styles.compactImageEmptyRow}>
//                           <View style={styles.compactCameraIcon}>
//                             <Ionicons name="camera" size={22} color="#6B5B95" />
//                           </View>
//                           <View>
//                             <Text style={styles.compactImagePickerText}>
//                               {isEditMode && existingImage ? 'Tap to change photo' : 'Take Photo / Gallery'}
//                             </Text>
//                             {isEditMode && existingImage && (
//                               <Text style={styles.compactExistingText}>Current photo kept if not changed</Text>
//                             )}
//                           </View>
//                         </View>
//                       )}
//                     </TouchableOpacity>
//                   </View>

//                 </ScrollView>

//                 {/* Submit — pinned outside ScrollView, always visible */}
//                 <View style={styles.submitFooter}>
//                   <TouchableOpacity
//                     style={[styles.compactSubmitButton, submitting && styles.submitButtonDisabled]}
//                     onPress={handleSubmit}
//                     disabled={submitting}
//                   >
//                     <LinearGradient
//                       colors={submitting ? ['#9CA3AF', '#9CA3AF'] : ['#6B5B95', '#7D6BA8']}
//                       style={styles.compactSubmitGradient}
//                     >
//                       {submitting
//                         ? <ActivityIndicator color="#FFFFFF" />
//                         : <>
//                             <Ionicons name={isEditMode ? 'checkmark-circle' : 'add-circle'} size={18} color="#FFFFFF" />
//                             <Text style={styles.compactSubmitText}>{isEditMode ? 'Update Utility' : 'Add Utility'}</Text>
//                           </>
//                       }
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 </View>

//               </View>
//             </View>
//           </TouchableWithoutFeedback>
//         </KeyboardAvoidingView>
//       </Modal>

//     </View>
//   );
// };

// // ═══════════════════════════════════════════════════════════════════════════
// //  STYLES
// // ═══════════════════════════════════════════════════════════════════════════
// const styles = StyleSheet.create({
//   container:        { flex: 1, backgroundColor: '#F3F4F6' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
//   loadingText:      { marginTop: 10, fontSize: 16, color: '#6B7280' },

//   viewToggleContainer: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 4, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
//   toggleButton:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6 },
//   toggleButtonActive:  { backgroundColor: '#6B5B95' },
//   toggleText:          { fontSize: 14, fontWeight: '600', color: '#6B5B95' },
//   toggleTextActive:    { color: '#FFFFFF' },

//   summaryContent:       { flex: 1, backgroundColor: '#F1F5F9' },
//   summaryScrollContent: { padding: 16, paddingBottom: 32 },
//   summaryDateSection:   { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
//   dateLabel:            { fontSize: 15, fontWeight: '600', marginBottom: 10, color: '#334155' },
//   summaryDatePicker:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8 },
//   summaryDateText:      { marginLeft: 10, fontSize: 15, color: '#0F172A', fontWeight: '500' },
//   chartCard:            { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
//   categoryHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
//   categoryTitle:        { fontSize: 22, fontWeight: '700', color: '#1E293B' },
//   billCharges:          { fontSize: 13, color: '#64748B', fontWeight: '500' },
//   billAmount:           { fontSize: 15, fontWeight: '700', color: '#3B82F6' },
//   statsRow:             { flexDirection: 'row', gap: 20, marginBottom: 6 },
//   statText:             { fontSize: 13, color: '#64748B', fontWeight: '500' },
//   chartScrollContainer: { marginTop: 16, marginBottom: 12, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
//   legendContainer:      { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 12 },
//   legendItem:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   legendDot:            { width: 12, height: 12, borderRadius: 6 },
//   legendText:           { fontSize: 14, color: '#475569', fontWeight: '500' },

//   searchContainer:       { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 12 },
//   searchBar:             { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
//   searchInput:           { flex: 1, fontSize: 14, color: '#1F2937' },
//   dateFilterButton:      { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
//   dateFilterButtonActive:{ backgroundColor: '#6B5B95', borderColor: '#6B5B95' },
//   filterBadge:           { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
//   activeDateFilter:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   dateFilterInfo:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   dateFilterText:        { fontSize: 13, color: '#1F2937', fontWeight: '600' },

//   filterContainer:    { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   filterContent:      { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
//   filterButton:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', gap: 5 },
//   activeFilterButton: { backgroundColor: '#6B5B95', borderColor: '#6B5B95' },
//   filterText:         { fontSize: 12, fontWeight: '600', color: '#6B5B95' },
//   activeFilterText:   { color: '#FFFFFF' },
//   resultsContainer:   { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   resultsText:        { fontSize: 12, color: '#6B7280', fontWeight: '500' },

//   listContainer:  { padding: 16, paddingBottom: 100 },
//   emptyContainer: { paddingVertical: 60, alignItems: 'center' },
//   emptyText:      { color: '#1F2937', fontSize: 18, fontWeight: '600', marginTop: 16 },
//   emptySubtext:   { color: '#6B7280', fontSize: 14, marginTop: 4 },

//   utilityCard:   { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
//   cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 12 },
//   headerLeft:    { flex: 1, gap: 8 },
//   categoryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6, alignSelf: 'flex-start' },
//   categoryText:  { color: '#6B5B95', fontSize: 12, fontWeight: '600' },
//   userBadge:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   userName:      { color: '#1F2937', fontSize: 14, fontWeight: '600' },
//   actionButtons: { flexDirection: 'row', gap: 8 },
//   editButton:    { padding: 8 },
//   deleteButton:  { padding: 8 },
//   utilityImage:  { width: '100%', height: 200, backgroundColor: '#F3F4F6' },
//   cardBody:      { padding: 16, gap: 10 },
//   infoRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   infoText:      { color: '#1F2937', fontSize: 14, fontWeight: '500' },
//   cardFooter:    { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
//   footerText:    { color: '#9CA3AF', fontSize: 11, fontWeight: '500' },

//   fab:         { position: 'absolute', bottom: 20, right: 20, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
//   fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },

//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },

//   // Date filter modal
//   filterModalContent:    { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 20 },
//   modalHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   modalTitle:            { fontSize: 20, fontWeight: '700', color: '#1F2937' },
//   dateFilterForm:        { padding: 20 },
//   formGroup:             { marginBottom: 20 },
//   label:                 { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
//   dateInput:             { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, gap: 10 },
//   dateInputText:         { flex: 1, fontSize: 14, color: '#1F2937' },
//   quickFiltersContainer: { marginTop: 10 },
//   quickFiltersLabel:     { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
//   quickFilters:          { flexDirection: 'row', gap: 8 },
//   quickFilterButton:     { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
//   quickFilterText:       { fontSize: 12, fontWeight: '600', color: '#6B5B95' },
//   filterActions:         { flexDirection: 'row', gap: 12, marginTop: 24 },
//   resetButton:           { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
//   resetButtonText:       { fontSize: 14, fontWeight: '700', color: '#6B5B95' },
//   applyButton:           { flex: 1, borderRadius: 12, overflow: 'hidden' },
//   applyGradient:         { paddingVertical: 14, alignItems: 'center' },
//   applyButtonText:       { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

//   // Category dropdown modal
//   dropdownOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
//   dropdownBox:            { backgroundColor: '#FFFFFF', borderRadius: 16, width: '100%', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 },
//   dropdownHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   dropdownTitle:          { fontSize: 16, fontWeight: '700', color: '#1F2937' },
//   dropdownItem:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
//   dropdownItemActive:     { backgroundColor: '#F5F3FF' },
//   dropdownItemText:       { fontSize: 15, color: '#374151', fontWeight: '500' },
//   dropdownItemTextActive: { color: '#6B5B95', fontWeight: '700' },

//   // Add/Edit modal
//   modalContent:         { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '82%' },
//   compactModalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   compactModalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   compactModalIcon:     { width: 34, height: 34, borderRadius: 9, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
//   compactModalTitle:    { fontSize: 16, fontWeight: '700', color: '#1F2937' },
//   compactCloseBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
//   compactFormScroll:    { padding: 16 },
//   compactFormGroup:     { marginBottom: 14 },
//   compactLabel:         { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
//   compactInput:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
//   compactInputText:     { flex: 1, fontSize: 14, color: '#1F2937' },
//   compactTextInput:     { flex: 1, fontSize: 14, color: '#1F2937', paddingVertical: 0 },

//   compactImagePicker:    { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#6B5B95', borderRadius: 10, overflow: 'hidden' },
//   compactImageEmptyRow:  { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
//   compactCameraIcon:     { width: 44, height: 44, borderRadius: 10, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
//   compactImagePickerText:{ fontSize: 13, fontWeight: '600', color: '#6B5B95' },
//   compactExistingText:   { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
//   compactImagePreviewRow:{ flexDirection: 'row', alignItems: 'center', padding: 10, gap: 12 },
//   compactPreviewThumb:   { width: 60, height: 60, borderRadius: 8 },
//   compactImageInfo:      { flex: 1, gap: 3 },
//   compactImageInfoText:  { fontSize: 13, fontWeight: '600', color: '#10B981' },
//   compactImageChangeText:{ fontSize: 11, color: '#9CA3AF' },

//   submitFooter:          { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FFFFFF', marginBottom: 80 },
//   compactSubmitButton:   { borderRadius: 12, overflow: 'hidden' },
//   submitButtonDisabled:  { opacity: 0.6 },
//   compactSubmitGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
//   compactSubmitText:     { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
// });

// export default Utility;





// // app/dashboard/utility.tsx
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
//   FlatList,
//   Modal,
//   TextInput,
//   Image,
//   Platform,
//   Dimensions,
//   KeyboardAvoidingView,
//   Keyboard,
//   TouchableWithoutFeedback,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { LineChart } from 'react-native-chart-kit';
// import dayjs from 'dayjs';
// import utilityService, {
//   UtilityCategory,
//   UtilityItem,
//   CategoryChartData,
//   TotalCount,
//   TotalBillCount,
//   DailyReading,
// } from '../../services/utilityService';
// import DashboardHeader from '@/components/HeaderWithMenu';

// const { width, height } = Dimensions.get('window');

// // Category name mapping (since API uses categoryName as number)
// const CATEGORY_NAMES: Record<number, string> = {
//   3: 'Water',
//   5: 'Electricity',
//   6: 'pH level - Pool',
//   7: 'Chlorine level - Pool',
// };

// // Chart colors
// const CHART_COLORS = {
//   Water: '#3B82F6',
//   Electricity: '#F59E0B',
//   'pH level - Pool': '#10B981',
//   'Chlorine level - Pool': '#8B5CF6',
// };

// interface ChartDataPoint {
//   date: string;
//   value: number;
//   guests: number;
//   categoryName: string;
//   formattedDate: string;
//   formattedValue: string;
// }

// interface CategoryData {
//   charge: string;           // From total_bill (total_count)
//   monthlyUnits: number;     // From total_count (total_count)
//   billCharges: string;      // From total_BillReading (total_bill_count)
//   billUnits: number;        // From total_bill_count (total_bill_count)
// }

// const Utility = () => {
//   const [utilities, setUtilities]       = useState<UtilityItem[]>([]);
//   const [categories, setCategories]     = useState<UtilityCategory[]>([]);
//   const [loading, setLoading]           = useState(true);
//   const [refreshing, setRefreshing]     = useState(false);
//   const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');
//   const [modalVisible, setModalVisible] = useState(false);
//   const [filterModalVisible, setFilterModalVisible] = useState(false);
//   const [submitting, setSubmitting]     = useState(false);
//   const [searchQuery, setSearchQuery]   = useState('');
//   const [isEditMode, setIsEditMode]     = useState(false);
//   const [editingId, setEditingId]       = useState<number | null>(null);
//   const [existingImage, setExistingImage] = useState<string | null>(null);

//   const [viewMode, setViewMode] = useState<'list' | 'summary'>('summary');

//   // New chart state
//   const [chartData, setChartData]             = useState<CategoryChartData[]>([]);
//   const [totalCounts, setTotalCounts]         = useState<TotalCount[]>([]);
//   const [totalBillCounts, setTotalBillCounts] = useState<TotalBillCount[]>([]);
//   const [selectedDate, setSelectedDate]       = useState(new Date());
//   const [showDatePicker, setShowDatePicker]   = useState(false);

//   // Chart click popup state
//   const [showChartPopup, setShowChartPopup] = useState(false);
//   const [selectedChartData, setSelectedChartData] = useState<ChartDataPoint | null>(null);

//   const [dateFilterEnabled, setDateFilterEnabled]     = useState(false);
//   const [startDate, setStartDate]                     = useState<Date | null>(null);
//   const [endDate, setEndDate]                         = useState<Date | null>(null);
//   const [showStartDatePicker, setShowStartDatePicker] = useState(false);
//   const [showEndDatePicker, setShowEndDatePicker]     = useState(false);

//   // ── Custom category dropdown modal ────────────────────────────────────────
//   const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

//   const [formData, setFormData] = useState({
//     date: new Date(),
//     u_category: 0,
//     startreading: '',
//     utility_image: null as string | null,
//   });
//   const [imageUri, setImageUri] = useState<string | null>(null);

//   // ── Selected category display name ────────────────────────────────────────
//   const selectedCategoryName = useMemo(() => {
//     const cat = categories.find(c => c.id === formData.u_category);
//     return cat?.utility_category_name ?? 'Select Category';
//   }, [categories, formData.u_category]);

//   // ── Effects ───────────────────────────────────────────────────────────────
//   useEffect(() => { loadData(); requestPermissions(); }, []);
//   useEffect(() => { if (viewMode === 'summary') loadChartData(); }, [selectedDate, viewMode]);

//   // ── Filtered list ─────────────────────────────────────────────────────────
//   const filteredUtilities = useMemo(() => {
//     let filtered = utilities;

//     if (activeFilter !== 'all') {
//       filtered = filtered.filter(item => Number(item.u_category_id) === Number(activeFilter));
//     }

//     if (dateFilterEnabled && startDate && endDate) {
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.date);
//         const s = new Date(startDate); s.setHours(0, 0, 0, 0);
//         const e = new Date(endDate);   e.setHours(23, 59, 59, 999);
//         return itemDate >= s && itemDate <= e;
//       });
//     }

//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       filtered = filtered.filter(item =>
//         `${item.user.name} ${item.user.lname}`.toLowerCase().includes(q) ||
//         item.startreading.toLowerCase().includes(q) ||
//         item.u_category.toLowerCase().includes(q)
//       );
//     }

//     return filtered;
//   }, [utilities, activeFilter, searchQuery, dateFilterEnabled, startDate, endDate]);

//   // ── Permissions ───────────────────────────────────────────────────────────
//   const requestPermissions = async () => {
//     const { status: cam }   = await ImagePicker.requestCameraPermissionsAsync();
//     const { status: media } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (cam !== 'granted' || media !== 'granted') {
//       Alert.alert('Permissions Required', 'Camera and gallery permissions are needed.');
//     }
//   };

//   // ── Load utilities + categories ───────────────────────────────────────────
//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [utilitiesData, categoriesData] = await Promise.all([
//         utilityService.getUtilities(),
//         utilityService.getCategories(),
//       ]);
//       const sorted = [...utilitiesData].sort(
//         (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//       );
//       setUtilities(sorted);
//       setCategories(categoriesData);
//       if (categoriesData.length > 0) {
//         setFormData(prev => ({ ...prev, u_category: categoriesData[0].id }));
//       }
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to load data');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // ── Load chart data from NEW API (GET method) ──────────────────────────────
//   const loadChartData = async () => {
//     try {
//       setLoading(true);
//       const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
//       const data = await utilityService.getChartData(formattedDate);
      
//       setChartData(data.chartData || []);
//       setTotalCounts(data.total_count || []);
//       setTotalBillCounts(data.total_bill_count || []);
//     } catch (error: any) {
//       console.error('Error loading chart data:', error);
//       Alert.alert('Error', error?.message || 'Failed to load chart data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Get category readable name ────────────────────────────────────────────
//   const getCategoryDisplayName = (categoryId: number): string => {
//     return CATEGORY_NAMES[categoryId] || `Category ${categoryId}`;
//   };

//   // ── Get category data helper (returns Charge and Bill charges) ────────────
//   const getCategoryData = (categoryName: string): CategoryData => {
//     // total_count contains "Charge" (total_bill)
//     const tc = totalCounts.find(t => t.category === categoryName);
//     // total_bill_count contains "Bill charges" (total_BillReading)
//     const bc = totalBillCounts.find(b => b.category === categoryName);
    
//     return {
//       charge:       tc?.total_bill || '0.00',           // This is "Charge"
//       monthlyUnits: tc?.total_count || 0,                // This is "Monthly total units"
//       billCharges:  bc?.total_BillReading || '0.00',    // This is "Bill charges"
//       billUnits:    bc?.total_bill_count || 0,          // This is "Bill total units"
//     };
//   };

//   // ── Get reading value from category data ──────────────────────────────────
//   const getReadingValue = (reading: DailyReading, categoryName: string): number => {
//     if (reading[categoryName] !== undefined && reading[categoryName] !== null) {
//       return Number(reading[categoryName]);
//     }
//     return 0;
//   };

//   // ── Handle chart point click ──────────────────────────────────────────────
//   const handleChartDataPointClick = (category: CategoryChartData, index: number, isReadingData: boolean) => {
//     const categoryName = getCategoryDisplayName(category.categoryName);
//     const reading = category.readings[index];
//     const value = isReadingData ? getReadingValue(reading, categoryName) : Number(reading.guests) || 0;
//     const formattedDate = dayjs(reading.date).format('DD MMM YYYY');
    
//     setSelectedChartData({
//       date: reading.date,
//       value: value,
//       guests: Number(reading.guests) || 0,
//       categoryName: categoryName,
//       formattedDate: formattedDate,
//       formattedValue: isReadingData 
//         ? `${value.toFixed(2)} ${categoryName === 'Electricity' ? 'kWh' : categoryName === 'Water' ? 'm³' : 'units'}`
//         : `${value} guests`,
//     });
//     setShowChartPopup(true);
//   };

//   // ── Build chart data for a category with onDataPointClick ─────────────────
//   const buildChart = (category: CategoryChartData) => {
//     const categoryName = getCategoryDisplayName(category.categoryName);
//     const readingData = category.readings.map(r => getReadingValue(r, categoryName));
//     const guestData = category.readings.map(r => Number(r.guests) || 0);
//     const hasData = readingData.some(v => v > 0);
    
//     return {
//       labels: category.readings.map(r => dayjs(r.date).format('DD MMM')),
//       datasets: [
//         { 
//           data: readingData, 
//           color: () => '#EF4444', 
//           strokeWidth: 2,
//           withDots: true,
//         },
//         { 
//           data: guestData, 
//           color: () => '#9333EA', 
//           strokeWidth: 2,
//           withDots: true,
//         },
//       ],
//       legend: [categoryName, 'Guests'],
//     };
//   };

//   // ── Refresh ───────────────────────────────────────────────────────────────
//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     if (viewMode === 'list') {
//       loadData();
//     } else {
//       loadChartData();
//     }
//   }, [viewMode, selectedDate]);

//   // ── Date helpers ──────────────────────────────────────────────────────────
//   const onDateChange = (_: any, date?: Date) => { 
//     setShowDatePicker(false); 
//     if (date) setSelectedDate(date); 
//   };

//   const resetDateFilter = useCallback(() => {
//     setDateFilterEnabled(false); 
//     setStartDate(null); 
//     setEndDate(null); 
//     setFilterModalVisible(false);
//   }, []);

//   const applyDateFilter = useCallback(() => {
//     if (!startDate || !endDate) { 
//       Alert.alert('Error', 'Please select both dates'); 
//       return; 
//     }
//     if (startDate > endDate) { 
//       Alert.alert('Error', 'Start date must be before end date'); 
//       return; 
//     }
//     setDateFilterEnabled(true); 
//     setFilterModalVisible(false);
//   }, [startDate, endDate]);

//   // ── Image picker ──────────────────────────────────────────────────────────
//   const pickImage = async (source: 'camera' | 'gallery') => {
//     try {
//       const opts = { 
//         mediaTypes: ['images' as const], 
//         allowsEditing: true, 
//         aspect: [4, 3] as [number, number], 
//         quality: 0.7 
//       };
//       const result = source === 'camera'
//         ? await ImagePicker.launchCameraAsync(opts)
//         : await ImagePicker.launchImageLibraryAsync(opts);
//       if (!result.canceled && result.assets[0]) {
//         const uri = result.assets[0].uri;
//         setImageUri(uri);
//         setFormData(prev => ({ ...prev, utility_image: uri }));
//       }
//     } catch { 
//       Alert.alert('Error', 'Failed to pick image'); 
//     }
//   };

//   const showImagePickerOptions = () => {
//     Alert.alert('Select Image', 'Choose an option', [
//       { text: 'Take Photo', onPress: () => pickImage('camera') },
//       { text: 'Choose from Gallery', onPress: () => pickImage('gallery') },
//       { text: 'Cancel', style: 'cancel' },
//     ]);
//   };

//   // ── Duplicate check ───────────────────────────────────────────────────────
//   const checkDuplicate = (date: Date, catId: number, excludeId: number | null = null) => {
//     const ds = date.toISOString().split('T')[0];
//     return utilities.some(
//       item => item.date === ds && Number(item.u_category_id) === catId && item.id !== excludeId
//     );
//   };

//   // ── Edit ──────────────────────────────────────────────────────────────────
//   const handleEdit = async (id: number) => {
//     try {
//       const utility = await utilityService.getUtilityById(id);
//       const [y, m, d] = utility.date.split('-').map(Number);
//       setFormData({
//         date: new Date(y, m - 1, d),
//         u_category: Number(utility.u_category_id),
//         startreading: utility.startreading,
//         utility_image: null,
//       });
//       setExistingImage(utility.image);
//       setImageUri(getImageUrl(utility.image));
//       setEditingId(id);
//       setIsEditMode(true);
//       setModalVisible(true);
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to load utility data');
//     }
//   };

//   // ── Submit ────────────────────────────────────────────────────────────────
//   const handleSubmit = async () => {
//     if (!formData.startreading.trim()) { 
//       Alert.alert('Error', 'Please enter meter reading'); 
//       return; 
//     }
//     if (!isEditMode && !formData.utility_image) { 
//       Alert.alert('Error', 'Please select an image');    
//       return; 
//     }
//     if (formData.u_category === 0) { 
//       Alert.alert('Error', 'Please select a category');  
//       return; 
//     }

//     if (!isEditMode && checkDuplicate(formData.date, formData.u_category)) {
//       const catName = categories.find(c => c.id === formData.u_category)?.utility_category_name ?? 'this category';
//       const dateStr = formData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//       Alert.alert('Duplicate Entry', `A reading for ${catName} on ${dateStr} already exists.`);
//       return;
//     }

//     try {
//       setSubmitting(true);
//       const fd = new FormData();
//       if (isEditMode && editingId) fd.append('id', editingId.toString());
//       fd.append('date',         formData.date.toISOString().split('T')[0]);
//       fd.append('u_category',   formData.u_category.toString());
//       fd.append('startreading', formData.startreading);

//       if (formData.utility_image) {
//         const filename = formData.utility_image.split('/').pop() || 'utility_image.jpg';
//         const ext = /\.(\w+)$/.exec(filename);
//         fd.append('utility_image', { 
//           uri: formData.utility_image, 
//           name: filename, 
//           type: ext ? `image/${ext[1]}` : 'image/jpeg' 
//         } as any);
//       } else if (isEditMode && existingImage) {
//         fd.append('existing_image', existingImage);
//       }

//       if (isEditMode && editingId) {
//         await utilityService.updateUtility(editingId, fd as any);
//       } else {
//         await utilityService.saveUtility(fd as any);
//       }

//       setModalVisible(false);
//       setTimeout(() => {
//         Alert.alert('Success', isEditMode ? 'Updated successfully' : 'Added successfully', [{
//           text: 'OK', onPress: () => { resetForm(); loadData(); if (viewMode === 'summary') loadChartData(); }
//         }]);
//       }, 300);
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to save');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Reset form ────────────────────────────────────────────────────────────
//   const resetForm = useCallback(() => {
//     setFormData({ 
//       date: new Date(), 
//       u_category: categories[0]?.id ?? 0, 
//       startreading: '', 
//       utility_image: null 
//     });
//     setImageUri(null); 
//     setExistingImage(null); 
//     setIsEditMode(false); 
//     setEditingId(null);
//   }, [categories]);

//   // ── Delete ────────────────────────────────────────────────────────────────
//   const handleDelete = (id: number) => {
//     Alert.alert('Delete Utility', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Delete', style: 'destructive', onPress: async () => {
//         try {
//           await utilityService.deleteUtility(id);
//           Alert.alert('Success', 'Utility record deleted');
//           loadData();
//           if (viewMode === 'summary') loadChartData();
//         } catch (error: any) { 
//           Alert.alert('Error', error.message || 'Failed to delete'); 
//         }
//       }},
//     ]);
//   };

//   // ── Formatters ────────────────────────────────────────────────────────────
//   const formatDate = (s: string) =>
//     new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

//   const formatDateTime = (s: string) =>
//     new Date(s).toLocaleString('en-US', { 
//       month: 'short', day: 'numeric', year: 'numeric', 
//       hour: 'numeric', minute: '2-digit', hour12: true 
//     });

//   const formatMonthYear = (d: Date) =>
//     d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

//   const getImageUrl = (p: string | null) => {
//     if (!p) return '';
//     if (p.startsWith('http') || p.startsWith('data:')) return p;
//     return `https://app.trackerstay.com/storage/${p}`;
//   };

//   // ── Render chart data point popup ─────────────────────────────────────────
//   const renderChartPopup = () => {
//     if (!selectedChartData) return null;

//     const isReadingData = selectedChartData.value > 0;
//     const categoryColor = CHART_COLORS[selectedChartData.categoryName as keyof typeof CHART_COLORS] || '#6B5B95';
    
//     return (
//       <Modal
//         visible={showChartPopup}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowChartPopup(false)}
//       >
//         <TouchableOpacity 
//           style={styles.popupOverlay} 
//           activeOpacity={1} 
//           onPress={() => setShowChartPopup(false)}
//         >
//           <View style={styles.popupContainer}>
//             <View style={[styles.popupHeader, { backgroundColor: categoryColor }]}>
//               <View style={styles.popupHeaderContent}>
//                 <Ionicons name="bar-chart" size={24} color="#FFFFFF" />
//                 <Text style={styles.popupTitle}>Reading Details</Text>
//               </View>
//               <TouchableOpacity onPress={() => setShowChartPopup(false)}>
//                 <Ionicons name="close" size={24} color="#FFFFFF" />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.popupBody}>
//               <View style={styles.popupInfoRow}>
//                 <View style={styles.popupIconLabel}>
//                   <Ionicons name="calendar-outline" size={20} color="#6B5B95" />
//                   <Text style={styles.popupLabel}>Date</Text>
//                 </View>
//                 <Text style={styles.popupValue}>{selectedChartData.formattedDate}</Text>
//               </View>

//               <View style={styles.popupInfoRow}>
//                 <View style={styles.popupIconLabel}>
//                   <Ionicons name="flash-outline" size={20} color="#6B5B95" />
//                   <Text style={styles.popupLabel}>Category</Text>
//                 </View>
//                 <Text style={styles.popupValue}>{selectedChartData.categoryName}</Text>
//               </View>

//               <View style={[styles.popupInfoRow, styles.popupHighlightRow]}>
//                 <View style={styles.popupIconLabel}>
//                   <View style={[styles.popupValueDot, { backgroundColor: '#EF4444' }]} />
//                   <Text style={styles.popupLabel}>Reading Value</Text>
//                 </View>
//                 <Text style={[styles.popupValue, styles.popupValueHighlight, { color: '#EF4444' }]}>
//                   {selectedChartData.formattedValue}
//                 </Text>
//               </View>

//               <View style={[styles.popupInfoRow, styles.popupHighlightRow]}>
//                 <View style={styles.popupIconLabel}>
//                   <View style={[styles.popupValueDot, { backgroundColor: '#9333EA' }]} />
//                   <Text style={styles.popupLabel}>Guest Count</Text>
//                 </View>
//                 <Text style={[styles.popupValue, styles.popupValueHighlight, { color: '#9333EA' }]}>
//                   {selectedChartData.guests} {selectedChartData.guests === 1 ? 'guest' : 'guests'}
//                 </Text>
//               </View>

//               <View style={styles.popupDivider} />

//               <View style={styles.popupInfoRow}>
//                 <View style={styles.popupIconLabel}>
//                   <Ionicons name="information-circle-outline" size={20} color="#6B5B95" />
//                   <Text style={styles.popupLabel}>Status</Text>
//                 </View>
//                 <View style={[styles.popupStatusBadge, { backgroundColor: selectedChartData.value > 0 ? '#D1FAE5' : '#FEF3C7' }]}>
//                   <Text style={[styles.popupStatusText, { color: selectedChartData.value > 0 ? '#065F46' : '#92400E' }]}>
//                     {selectedChartData.value > 0 ? 'Recorded' : 'No Data'}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             <TouchableOpacity 
//               style={styles.popupCloseButton}
//               onPress={() => setShowChartPopup(false)}
//             >
//               <LinearGradient colors={[categoryColor, categoryColor + 'CC']} style={styles.popupCloseGradient}>
//                 <Text style={styles.popupCloseText}>Close</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     );
//   };

//   // ── Utility list card ─────────────────────────────────────────────────────
//   const renderUtilityCard = useCallback(({ item }: { item: UtilityItem }) => (
//     <View style={styles.utilityCard}>
//       <View style={styles.cardHeader}>
//         <View style={styles.headerLeft}>
//           <View style={styles.categoryBadge}>
//             <Ionicons name="flash" size={16} color="#6B5B95" />
//             <Text style={styles.categoryText}>{item.u_category}</Text>
//           </View>
//           <View style={styles.userBadge}>
//             <Ionicons name="person" size={14} color="#6B7280" />
//             <Text style={styles.userName}>{item.user.name} {item.user.lname}</Text>
//           </View>
//         </View>
//         <View style={styles.actionButtons}>
//           <TouchableOpacity onPress={() => handleEdit(item.id)}   style={styles.editButton}>
//             <Ionicons name="create-outline" size={20} color="#3B82F6" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
//             <Ionicons name="trash-outline" size={20} color="#EF4444" />
//           </TouchableOpacity>
//         </View>
//       </View>
//       {item.image && <Image source={{ uri: getImageUrl(item.image) }} style={styles.utilityImage} resizeMode="cover" />}
//       <View style={styles.cardBody}>
//         <View style={styles.infoRow}>
//           <Ionicons name="calendar-outline" size={16} color="#6B7280" />
//           <Text style={styles.infoText}>{formatDate(item.date)}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <Ionicons name="speedometer-outline" size={16} color="#6B7280" />
//           <Text style={styles.infoText}>Reading: {item.startreading}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <Ionicons name="shield-checkmark-outline" size={16} color="#10B981" />
//           <Text style={[styles.infoText, { color: '#10B981' }]}>{item.status}</Text>
//         </View>
//       </View>
//       <View style={styles.cardFooter}>
//         <Text style={styles.footerText}>
//           {item.created_at !== item.updated_at ? 'Updated: ' : 'Added: '}
//           {formatDateTime(item.created_at !== item.updated_at ? item.updated_at : item.created_at)}
//         </Text>
//       </View>
//     </View>
//   ), []);

//   const keyExtractor = useCallback((item: UtilityItem) => item.id.toString(), []);

//   // ═══════════════════════════════════════════════════════════════════════════
//   //  RENDER
//   // ═══════════════════════════════════════════════════════════════════════════
//   return (
//     <View style={styles.container}>
//       <DashboardHeader
//         title="Utility Management"
//         subtitle={viewMode === 'list' ? 'Track and manage utility readings' : `${formatMonthYear(selectedDate)} - Dashboard`}
//         currentPage="utility"
//       />

//       {/* ── View Toggle ─────────────────────────────────────────────────── */}
//       <View style={styles.viewToggleContainer}>
//         {(['summary', 'list'] as const).map(mode => (
//           <TouchableOpacity
//             key={mode}
//             style={[styles.toggleButton, viewMode === mode && styles.toggleButtonActive]}
//             onPress={() => setViewMode(mode)}
//           >
//             <Ionicons name={mode === 'summary' ? 'bar-chart' : 'list'} size={20} color={viewMode === mode ? '#FFFFFF' : '#6B5B95'} />
//             <Text style={[styles.toggleText, viewMode === mode && styles.toggleTextActive]}>
//               {mode === 'summary' ? 'Summary' : 'List View'}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* ═══ LIST VIEW ══════════════════════════════════════════════════════ */}
//       {viewMode === 'list' ? (
//         <>
//           {/* Search + date filter icon */}
//           <View style={styles.searchContainer}>
//             <View style={styles.searchBar}>
//               <Ionicons name="search" size={20} color="#6B7280" />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search by user, reading, category..."
//                 value={searchQuery}
//                 onChangeText={setSearchQuery}
//                 placeholderTextColor="#9CA3AF"
//               />
//               {searchQuery !== '' && (
//                 <TouchableOpacity onPress={() => setSearchQuery('')}>
//                   <Ionicons name="close-circle" size={20} color="#6B7280" />
//                 </TouchableOpacity>
//               )}
//             </View>
//             <TouchableOpacity
//               style={[styles.dateFilterButton, dateFilterEnabled && styles.dateFilterButtonActive]}
//               onPress={() => setFilterModalVisible(true)}
//             >
//               <Ionicons name="calendar" size={20} color={dateFilterEnabled ? '#FFFFFF' : '#6B5B95'} />
//               {dateFilterEnabled && <View style={styles.filterBadge} />}
//             </TouchableOpacity>
//           </View>

//           {/* Active date banner */}
//           {dateFilterEnabled && startDate && endDate && (
//             <View style={styles.activeDateFilter}>
//               <View style={styles.dateFilterInfo}>
//                 <Ionicons name="calendar-outline" size={16} color="#6B5B95" />
//                 <Text style={styles.dateFilterText}>
//                   {formatDate(startDate.toISOString())} – {formatDate(endDate.toISOString())}
//                 </Text>
//               </View>
//               <TouchableOpacity onPress={resetDateFilter}>
//                 <Ionicons name="close-circle" size={20} color="#6B5B95" />
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* ── Category filter chips with per-category count ── */}
//           <View style={styles.filterContainer}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
//               <TouchableOpacity
//                 onPress={() => setActiveFilter('all')}
//                 style={[styles.filterButton, activeFilter === 'all' && styles.activeFilterButton]}
//               >
//                 <Ionicons name="apps" size={16} color={activeFilter === 'all' ? '#FFFFFF' : '#6B5B95'} />
//                 <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
//                   All ({utilities.length})
//                 </Text>
//               </TouchableOpacity>

//               {categories.map(cat => {
//                 const isActive = activeFilter === cat.id;
//                 const count    = utilities.filter(u => Number(u.u_category_id) === cat.id).length;
//                 return (
//                   <TouchableOpacity
//                     key={cat.id}
//                     onPress={() => setActiveFilter(isActive ? 'all' : cat.id)}
//                     style={[styles.filterButton, isActive && styles.activeFilterButton]}
//                   >
//                     <Ionicons name="flash" size={16} color={isActive ? '#FFFFFF' : '#6B5B95'} />
//                     <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
//                       {cat.utility_category_name} ({count})
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>
//           </View>

//           {/* Results count */}
//           <View style={styles.resultsContainer}>
//             <Text style={styles.resultsText}>
//               {filteredUtilities.length} {filteredUtilities.length === 1 ? 'result' : 'results'}
//               {activeFilter !== 'all' && ` · ${categories.find(c => c.id === activeFilter)?.utility_category_name}`}
//             </Text>
//           </View>

//           <FlatList
//             data={filteredUtilities}
//             keyExtractor={keyExtractor}
//             renderItem={renderUtilityCard}
//             contentContainerStyle={styles.listContainer}
//             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B5B95" colors={['#6B5B95']} />}
//             ListEmptyComponent={
//               <View style={styles.emptyContainer}>
//                 <Ionicons name="flash-outline" size={60} color="#6B5B95" />
//                 <Text style={styles.emptyText}>No Utilities Found</Text>
//                 <Text style={styles.emptySubtext}>
//                   {searchQuery || dateFilterEnabled ? 'Try adjusting your filters' : 'Add your first utility reading'}
//                 </Text>
//               </View>
//             }
//             showsVerticalScrollIndicator={false}
//             removeClippedSubviews
//             maxToRenderPerBatch={10}
//             windowSize={10}
//           />
//         </>
//       ) : (
//         /* ═══ SUMMARY VIEW - WITH CHART CLICK POPUP ════════════════════════════ */
//         <ScrollView
//           style={styles.summaryContent}
//           contentContainerStyle={styles.summaryScrollContent}
//           showsVerticalScrollIndicator={false}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B5B95" colors={['#6B5B95']} />}
//         >
//           {/* Date Selector */}
//           <View style={styles.summaryDateSection}>
//             <Text style={styles.dateLabel}>Select Date</Text>
//             <TouchableOpacity style={styles.summaryDatePicker} onPress={() => setShowDatePicker(true)}>
//               <Ionicons name="calendar-outline" size={20} color="#64748B" />
//               <Text style={styles.summaryDateText}>{dayjs(selectedDate).format('YYYY-MM-DD')}</Text>
//               <Ionicons name="chevron-down" size={16} color="#64748B" />
//             </TouchableOpacity>
//           </View>

//           {showDatePicker && (
//             <DateTimePicker 
//               value={selectedDate} 
//               mode="date"
//               display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
//               onChange={onDateChange} 
//             />
//           )}

//           {/* Loading Indicator for Summary */}
//           {loading && viewMode === 'summary' && (
//             <View style={{ paddingVertical: 32, alignItems: 'center' }}>
//               <ActivityIndicator size="large" color="#6B5B95" />
//               <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading chart data...</Text>
//             </View>
//           )}

//           {/* Display Charts for Each Category */}
//           {!loading && chartData.length === 0 && (
//             <View style={styles.emptyChartContainer}>
//               <Ionicons name="bar-chart-outline" size={60} color="#D1D5DB" />
//               <Text style={styles.emptyChartTitle}>No Data Available</Text>
//               <Text style={styles.emptyChartSubtitle}>
//                 No utility data found for {dayjs(selectedDate).format('MMMM YYYY')}
//               </Text>
//             </View>
//           )}

//           {!loading && chartData.map(category => {
//             const categoryName = getCategoryDisplayName(category.categoryName);
//             const cd = getCategoryData(categoryName);
//             const chartConfig = buildChart(category);
//             const categoryColor = CHART_COLORS[categoryName as keyof typeof CHART_COLORS] || '#6B5B95';
            
//             return (
//               <View key={category.categoryName} style={styles.chartCard}>
//                 <View style={styles.categoryHeader}>
//                   <Text style={styles.categoryTitle}>{categoryName}</Text>
//                   <View style={styles.billChargesContainer}>
//                     <Text style={styles.billChargesLabel}>Bill charges: </Text>
//                     <Text style={styles.billAmount}>LKR {parseFloat(cd.billCharges).toFixed(2)}</Text>
//                   </View>
//                 </View>
                
//                 <View style={styles.statsRow}>y
//                   <View style={styles.statItem}>
//                     <Text style={styles.statLabel}>Charge:</Text>
//                     <Text style={styles.statValue}>LKR {parseFloat(cd.charge).toFixed(2)}</Text>
//                   </View>
//                   <View style={styles.statItem}>
//                     <Text style={styles.statLabel}>Bill Total Units:</Text>
//                     <Text style={styles.statValue}>{cd.billUnits}</Text>
//                   </View>
//                 </View>
//                 <View style={styles.statsRow}>
//                   <View style={styles.statItem}>
//                     <Text style={styles.statLabel}>Monthly Total Units:</Text>
//                     <Text style={styles.statValue}>{cd.monthlyUnits}</Text>
//                   </View>
//                 </View>

//                 {/* Chart Instruction */}
//                 <View style={styles.chartInstruction}>
//                   <Ionicons name="finger-print-outline" size={14} color="#6B5B95" />
//                   <Text style={styles.chartInstructionText}>Tap on any data point to see details</Text>
//                 </View>
                
//                 <ScrollView 
//                   horizontal 
//                   showsHorizontalScrollIndicator 
//                   style={styles.chartScrollContainer} 
//                   contentContainerStyle={{ paddingRight: 20 }}
//                 >
//                   <View style={{ padding: 8 }}>
//                     <LineChart
//                       data={chartConfig}
//                       width={Math.max(width - 64, category.readings.length * 55)}
//                       height={280}
//                       withDots={true}
//                       withShadow={false}
//                       withInnerLines
//                       withOuterLines
//                       withVerticalLines
//                       withHorizontalLines
//                       bezier={chartConfig.datasets[0].data.some(v => v > 0)}
//                       onDataPointClick={({ index, dataset }) => {
//                         // Determine which dataset was clicked (reading or guests)
//                         const isReadingDataset = dataset.data === chartConfig.datasets[0].data;
//                         handleChartDataPointClick(category, index, isReadingDataset);
//                       }}
//                       chartConfig={{
//                         backgroundColor: '#fff',
//                         backgroundGradientFrom: '#fff',
//                         backgroundGradientTo: '#fff',
//                         decimalPlaces: 0,
//                         color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
//                         labelColor: (opacity = 1) => `rgba(71,85,105,${opacity})`,
//                         style: { borderRadius: 16 },
//                         propsForDots: { r: '6', strokeWidth: '2', stroke: '#fff' },
//                         propsForBackgroundLines: { strokeDasharray: '', stroke: '#E2E8F0', strokeWidth: 1 },
//                         propsForLabels: { fontSize: 10 },
//                       }}
//                       style={{ marginVertical: 8, borderRadius: 16 }}
//                     />
//                   </View>
//                 </ScrollView>
                
//                 <View style={styles.legendContainer}>
//                   <TouchableOpacity 
//                     style={styles.legendItem}
//                     onPress={() => {
//                       // Find the first data point that has a reading value
//                       const indexWithData = category.readings.findIndex(r => getReadingValue(r, categoryName) > 0);
//                       if (indexWithData !== -1) {
//                         handleChartDataPointClick(category, indexWithData, true);
//                       } else if (category.readings.length > 0) {
//                         handleChartDataPointClick(category, 0, true);
//                       }
//                     }}
//                   >
//                     <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
//                     <Text style={styles.legendText}>{categoryName}</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity 
//                     style={styles.legendItem}
//                     onPress={() => {
//                       // Find the first data point that has guests
//                       const indexWithGuests = category.readings.findIndex(r => Number(r.guests) > 0);
//                       if (indexWithGuests !== -1) {
//                         handleChartDataPointClick(category, indexWithGuests, false);
//                       } else if (category.readings.length > 0) {
//                         handleChartDataPointClick(category, 0, false);
//                       }
//                     }}
//                   >
//                     <View style={[styles.legendDot, { backgroundColor: '#9333EA' }]} />
//                     <Text style={styles.legendText}>Guests</Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Tap hint */}
//                 <View style={styles.tapHintContainer}>
//                   <Ionicons name="tap-outline" size={12} color="#9CA3AF" />
//                   <Text style={styles.tapHintText}>Tap dots or legend items to view details</Text>
//                 </View>
//               </View>
//             );
//           })}
          
//           <View style={{ height: 90 }} />
//         </ScrollView>
//       )}

//       {/* Chart Data Point Popup Modal */}
//       {renderChartPopup()}

//       {/* ── FAB (both views) ─────────────────────────────────────────────── */}
//       <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setModalVisible(true); }}>
//         <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.fabGradient}>
//           <Ionicons name="add" size={28} color="#FFFFFF" />
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* ══════════════════════════════════════════════════════════════════════
//           DATE RANGE FILTER MODAL
//       ══════════════════════════════════════════════════════════════════════ */}
//       <Modal visible={filterModalVisible} animationType="slide" transparent onRequestClose={() => setFilterModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.filterModalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Filter by Date Range</Text>
//               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
//                 <Ionicons name="close" size={24} color="#1F2937" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView showsVerticalScrollIndicator={false}>
//               <View style={styles.dateFilterForm}>
//                 <View style={styles.formGroup}>
//                   <Text style={styles.label}>Start Date</Text>
//                   <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartDatePicker(true)}>
//                     <Ionicons name="calendar-outline" size={20} color="#6B7280" />
//                     <Text style={styles.dateInputText}>{startDate ? formatDate(startDate.toISOString()) : 'Select start date'}</Text>
//                   </TouchableOpacity>
//                 </View>
//                 {showStartDatePicker && (
//                   <DateTimePicker 
//                     value={startDate || new Date()} 
//                     mode="date"
//                     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                     onChange={(_, d) => { setShowStartDatePicker(Platform.OS === 'ios'); if (d) setStartDate(d); }}
//                     maximumDate={new Date()} 
//                   />
//                 )}
//                 <View style={styles.formGroup}>
//                   <Text style={styles.label}>End Date</Text>
//                   <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndDatePicker(true)}>
//                     <Ionicons name="calendar-outline" size={20} color="#6B7280" />
//                     <Text style={styles.dateInputText}>{endDate ? formatDate(endDate.toISOString()) : 'Select end date'}</Text>
//                   </TouchableOpacity>
//                 </View>
//                 {showEndDatePicker && (
//                   <DateTimePicker 
//                     value={endDate || new Date()} 
//                     mode="date"
//                     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                     onChange={(_, d) => { setShowEndDatePicker(Platform.OS === 'ios'); if (d) setEndDate(d); }}
//                     maximumDate={new Date()} 
//                     minimumDate={startDate || undefined} 
//                   />
//                 )}
//                 <View style={styles.quickFiltersContainer}>
//                   <Text style={styles.quickFiltersLabel}>Quick Filters</Text>
//                   <View style={styles.quickFilters}>
//                     {[
//                       { label: 'Today', days: 0 }, 
//                       { label: 'Last 7 Days', days: 7 }, 
//                       { label: 'Last 30 Days', days: 30 }
//                     ].map(({ label, days }) => (
//                       <TouchableOpacity key={label} style={styles.quickFilterButton} onPress={() => {
//                         const t = new Date(); 
//                         const s = new Date(); 
//                         s.setDate(t.getDate() - days);
//                         setStartDate(s); 
//                         setEndDate(t);
//                       }}>
//                         <Text style={styles.quickFilterText}>{label}</Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 </View>
//                 <View style={styles.filterActions}>
//                   <TouchableOpacity style={styles.resetButton} onPress={resetDateFilter}>
//                     <Text style={styles.resetButtonText}>Reset</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.applyButton} onPress={applyDateFilter}>
//                     <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.applyGradient}>
//                       <Text style={styles.applyButtonText}>Apply Filter</Text>
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       {/* ══════════════════════════════════════════════════════════════════════
//           CATEGORY DROPDOWN MODAL
//       ══════════════════════════════════════════════════════════════════════ */}
//       <Modal visible={showCategoryDropdown} animationType="fade" transparent onRequestClose={() => setShowCategoryDropdown(false)}>
//         <TouchableWithoutFeedback onPress={() => setShowCategoryDropdown(false)}>
//           <View style={styles.dropdownOverlay}>
//             <TouchableWithoutFeedback>
//               <View style={styles.dropdownBox}>
//                 <View style={styles.dropdownHeader}>
//                   <Text style={styles.dropdownTitle}>Select Category</Text>
//                   <TouchableOpacity onPress={() => setShowCategoryDropdown(false)}>
//                     <Ionicons name="close" size={22} color="#6B7280" />
//                   </TouchableOpacity>
//                 </View>
//                 {categories.map(cat => {
//                   const isSel = formData.u_category === cat.id;
//                   return (
//                     <TouchableOpacity
//                       key={cat.id}
//                       style={[styles.dropdownItem, isSel && styles.dropdownItemActive]}
//                       onPress={() => { setFormData(prev => ({ ...prev, u_category: cat.id })); setShowCategoryDropdown(false); }}
//                     >
//                       <Ionicons name="flash" size={16} color={isSel ? '#6B5B95' : '#9CA3AF'} />
//                       <Text style={[styles.dropdownItemText, isSel && styles.dropdownItemTextActive]}>
//                         {cat.utility_category_name}
//                       </Text>
//                       {isSel && <Ionicons name="checkmark" size={18} color="#6B5B95" style={{ marginLeft: 'auto' }} />}
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>

//       {/* ══════════════════════════════════════════════════════════════════════
//           ADD / EDIT MODAL
//       ══════════════════════════════════════════════════════════════════════ */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => { setModalVisible(false); resetForm(); }}
//       >
//         <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//           <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContent}>

//                 {/* Header */}
//                 <View style={styles.compactModalHeader}>
//                   <View style={styles.compactModalTitleRow}>
//                     <View style={styles.compactModalIcon}>
//                       <Ionicons name={isEditMode ? 'create' : 'flash'} size={18} color="#6B5B95" />
//                     </View>
//                     <Text style={styles.compactModalTitle}>
//                       {isEditMode ? 'Edit Utility Reading' : 'Add Utility Reading'}
//                     </Text>
//                   </View>
//                   <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }} style={styles.compactCloseBtn}>
//                     <Ionicons name="close" size={20} color="#6B7280" />
//                   </TouchableOpacity>
//                 </View>

//                 {/* Scrollable fields */}
//                 <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.compactFormScroll} keyboardShouldPersistTaps="handled">

//                   {/* Date */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Date</Text>
//                     <TouchableOpacity style={styles.compactInput} onPress={() => setShowDatePicker(true)}>
//                       <Ionicons name="calendar-outline" size={16} color="#6B7280" />
//                       <Text style={styles.compactInputText}>
//                         {formData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>

//                   {showDatePicker && (
//                     <DateTimePicker 
//                       value={formData.date} 
//                       mode="date"
//                       display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                       onChange={(_, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setFormData(prev => ({ ...prev, date: d })); }}
//                     />
//                   )}

//                   {/* Category — taps open dropdown modal */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Category</Text>
//                     <TouchableOpacity style={styles.compactInput} onPress={() => setShowCategoryDropdown(true)}>
//                       <Ionicons name="flash" size={16} color="#6B5B95" />
//                       <Text style={[styles.compactInputText, { flex: 1, color: formData.u_category ? '#1F2937' : '#9CA3AF' }]}>
//                         {selectedCategoryName}
//                       </Text>
//                       <Ionicons name="chevron-down" size={16} color="#6B7280" />
//                     </TouchableOpacity>
//                   </View>

//                   {/* Meter Reading */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Meter Reading</Text>
//                     <View style={styles.compactInput}>
//                       <Ionicons name="speedometer-outline" size={16} color="#6B7280" />
//                       <TextInput
//                         style={styles.compactTextInput}
//                         placeholder="Enter reading"
//                         keyboardType="numeric"
//                         value={formData.startreading}
//                         onChangeText={t => setFormData(prev => ({ ...prev, startreading: t }))}
//                         placeholderTextColor="#9CA3AF"
//                         returnKeyType="done"
//                         onSubmitEditing={Keyboard.dismiss}
//                       />
//                     </View>
//                   </View>

//                   {/* Image */}
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Meter Photo</Text>
//                     <TouchableOpacity style={styles.compactImagePicker} onPress={showImagePickerOptions}>
//                       {imageUri ? (
//                         <View style={styles.compactImagePreviewRow}>
//                           <Image source={{ uri: imageUri }} style={styles.compactPreviewThumb} />
//                           <View style={styles.compactImageInfo}>
//                             <Ionicons name="checkmark-circle" size={18} color="#10B981" />
//                             <Text style={styles.compactImageInfoText}>Photo selected</Text>
//                             <Text style={styles.compactImageChangeText}>Tap to change</Text>
//                           </View>
//                         </View>
//                       ) : (
//                         <View style={styles.compactImageEmptyRow}>
//                           <View style={styles.compactCameraIcon}>
//                             <Ionicons name="camera" size={22} color="#6B5B95" />
//                           </View>
//                           <View>
//                             <Text style={styles.compactImagePickerText}>
//                               {isEditMode && existingImage ? 'Tap to change photo' : 'Take Photo / Gallery'}
//                             </Text>
//                             {isEditMode && existingImage && (
//                               <Text style={styles.compactExistingText}>Current photo kept if not changed</Text>
//                             )}
//                           </View>
//                         </View>
//                       )}
//                     </TouchableOpacity>
//                   </View>

//                 </ScrollView>

//                 {/* Submit — pinned outside ScrollView, always visible */}
//                 <View style={styles.submitFooter}>
//                   <TouchableOpacity
//                     style={[styles.compactSubmitButton, submitting && styles.submitButtonDisabled]}
//                     onPress={handleSubmit}
//                     disabled={submitting}
//                   >
//                     <LinearGradient
//                       colors={submitting ? ['#9CA3AF', '#9CA3AF'] : ['#6B5B95', '#7D6BA8']}
//                       style={styles.compactSubmitGradient}
//                     >
//                       {submitting
//                         ? <ActivityIndicator color="#FFFFFF" />
//                         : <>
//                             <Ionicons name={isEditMode ? 'checkmark-circle' : 'add-circle'} size={18} color="#FFFFFF" />
//                             <Text style={styles.compactSubmitText}>{isEditMode ? 'Update Utility' : 'Add Utility'}</Text>
//                           </>
//                       }
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 </View>

//               </View>
//             </View>
//           </TouchableWithoutFeedback>
//         </KeyboardAvoidingView>
//       </Modal>

//     </View>
//   );
// };

// // ═══════════════════════════════════════════════════════════════════════════
// //  STYLES
// // ═══════════════════════════════════════════════════════════════════════════
// const styles = StyleSheet.create({
//   container:        { flex: 1, backgroundColor: '#F3F4F6' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
//   loadingText:      { marginTop: 10, fontSize: 16, color: '#6B7280' },

//   viewToggleContainer: { 
//     backgroundColor: '#FFFFFF', 
//     marginHorizontal: 16, 
//     marginTop: 16, 
//     borderRadius: 12, 
//     padding: 4, 
//     flexDirection: 'row', 
//     shadowColor: '#000', 
//     shadowOffset: { width: 0, height: 2 }, 
//     shadowOpacity: 0.05, 
//     shadowRadius: 4, 
//     elevation: 2 
//   },
//   toggleButton:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6 },
//   toggleButtonActive:  { backgroundColor: '#6B5B95' },
//   toggleText:          { fontSize: 14, fontWeight: '600', color: '#6B5B95' },
//   toggleTextActive:    { color: '#FFFFFF' },

//   summaryContent:       { flex: 1, backgroundColor: '#F1F5F9' },
//   summaryScrollContent: { padding: 16, paddingBottom: 32 },
//   summaryDateSection:   { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
//   dateLabel:            { fontSize: 15, fontWeight: '600', marginBottom: 10, color: '#334155' },
//   summaryDatePicker:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8 },
//   summaryDateText:      { fontSize: 15, color: '#0F172A', fontWeight: '500' },
//   chartCard:            { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
//   categoryHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
//   categoryTitle:        { fontSize: 22, fontWeight: '700', color: '#1E293B' },
//   billChargesContainer: { flexDirection: 'row', alignItems: 'center' },
//   billChargesLabel:     { fontSize: 13, color: '#64748B', fontWeight: '500' },
//   billAmount:           { fontSize: 15, fontWeight: '700', color: '#3B82F6' },
//   statsRow:             { flexDirection: 'row', gap: 20, marginBottom: 8, flexWrap: 'wrap' },
//   statItem:             { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   statLabel:            { fontSize: 13, color: '#64748B', fontWeight: '500' },
//   statValue:            { fontSize: 14, color: '#1E293B', fontWeight: '600' },
//   chartScrollContainer: { marginTop: 16, marginBottom: 12, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
//   legendContainer:      { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 12, flexWrap: 'wrap' },
//   legendItem:           { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F9FAFB' },
//   legendDot:            { width: 12, height: 12, borderRadius: 6 },
//   legendText:           { fontSize: 14, color: '#475569', fontWeight: '500' },

//   // Chart instruction styles
//   chartInstruction: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     marginTop: 8,
//     marginBottom: 4,
//   },
//   chartInstructionText: {
//     fontSize: 12,
//     color: '#6B5B95',
//     fontWeight: '500',
//   },
//   tapHintContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 4,
//     marginTop: 8,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#F3F4F6',
//   },
//   tapHintText: {
//     fontSize: 10,
//     color: '#9CA3AF',
//   },

//   // Popup styles
//   popupOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   popupContainer: {
//     width: width - 48,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 10,
//   },
//   popupHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 18,
//   },
//   popupHeaderContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   popupTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#FFFFFF',
//   },
//   popupBody: {
//     padding: 20,
//   },
//   popupInfoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   popupHighlightRow: {
//     backgroundColor: '#F9FAFB',
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   popupIconLabel: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   popupLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#6B7280',
//   },
//   popupValue: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#1F2937',
//   },
//   popupValueHighlight: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   popupValueDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginRight: 4,
//   },
//   popupDivider: {
//     height: 1,
//     backgroundColor: '#E5E7EB',
//     marginVertical: 12,
//   },
//   popupStatusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },
//   popupStatusText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   popupCloseButton: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   popupCloseGradient: {
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   popupCloseText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#FFFFFF',
//   },

//   emptyChartContainer:  { backgroundColor: '#FFFFFF', padding: 40, borderRadius: 12, alignItems: 'center', marginTop: 20 },
//   emptyChartTitle:      { fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 16 },
//   emptyChartSubtitle:   { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },

//   searchContainer:       { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 12 },
//   searchBar:             { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
//   searchInput:           { flex: 1, fontSize: 14, color: '#1F2937' },
//   dateFilterButton:      { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
//   dateFilterButtonActive:{ backgroundColor: '#6B5B95', borderColor: '#6B5B95' },
//   filterBadge:           { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
//   activeDateFilter:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   dateFilterInfo:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   dateFilterText:        { fontSize: 13, color: '#1F2937', fontWeight: '600' },

//   filterContainer:    { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   filterContent:      { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
//   filterButton:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', gap: 5 },
//   activeFilterButton: { backgroundColor: '#6B5B95', borderColor: '#6B5B95' },
//   filterText:         { fontSize: 12, fontWeight: '600', color: '#6B5B95' },
//   activeFilterText:   { color: '#FFFFFF' },
//   resultsContainer:   { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   resultsText:        { fontSize: 12, color: '#6B7280', fontWeight: '500' },

//   listContainer:  { padding: 16, paddingBottom: 100 },
//   emptyContainer: { paddingVertical: 60, alignItems: 'center' },
//   emptyText:      { color: '#1F2937', fontSize: 18, fontWeight: '600', marginTop: 16 },
//   emptySubtext:   { color: '#6B7280', fontSize: 14, marginTop: 4 },

//   utilityCard:   { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
//   cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 12 },
//   headerLeft:    { flex: 1, gap: 8 },
//   categoryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6, alignSelf: 'flex-start' },
//   categoryText:  { color: '#6B5B95', fontSize: 12, fontWeight: '600' },
//   userBadge:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   userName:      { color: '#1F2937', fontSize: 14, fontWeight: '600' },
//   actionButtons: { flexDirection: 'row', gap: 8 },
//   editButton:    { padding: 8 },
//   deleteButton:  { padding: 8 },
//   utilityImage:  { width: '100%', height: 200, backgroundColor: '#F3F4F6' },
//   cardBody:      { padding: 16, gap: 10 },
//   infoRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   infoText:      { color: '#1F2937', fontSize: 14, fontWeight: '500' },
//   cardFooter:    { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
//   footerText:    { color: '#9CA3AF', fontSize: 11, fontWeight: '500' },

//   fab:         { position: 'absolute', bottom: 20, right: 20, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
//   fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },

//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },

//   filterModalContent:    { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 20 },
//   modalHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   modalTitle:            { fontSize: 20, fontWeight: '700', color: '#1F2937' },
//   dateFilterForm:        { padding: 20 },
//   formGroup:             { marginBottom: 20 },
//   label:                 { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
//   dateInput:             { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, gap: 10 },
//   dateInputText:         { flex: 1, fontSize: 14, color: '#1F2937' },
//   quickFiltersContainer: { marginTop: 10 },
//   quickFiltersLabel:     { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
//   quickFilters:          { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
//   quickFilterButton:     { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
//   quickFilterText:       { fontSize: 12, fontWeight: '600', color: '#6B5B95' },
//   filterActions:         { flexDirection: 'row', gap: 12, marginTop: 24 },
//   resetButton:           { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
//   resetButtonText:       { fontSize: 14, fontWeight: '700', color: '#6B5B95' },
//   applyButton:           { flex: 1, borderRadius: 12, overflow: 'hidden' },
//   applyGradient:         { paddingVertical: 14, alignItems: 'center' },
//   applyButtonText:       { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

//   dropdownOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
//   dropdownBox:            { backgroundColor: '#FFFFFF', borderRadius: 16, width: '100%', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 },
//   dropdownHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   dropdownTitle:          { fontSize: 16, fontWeight: '700', color: '#1F2937' },
//   dropdownItem:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
//   dropdownItemActive:     { backgroundColor: '#F5F3FF' },
//   dropdownItemText:       { fontSize: 15, color: '#374151', fontWeight: '500' },
//   dropdownItemTextActive: { color: '#6B5B95', fontWeight: '700' },

//   modalContent:         { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '82%' },
//   compactModalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   compactModalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   compactModalIcon:     { width: 34, height: 34, borderRadius: 9, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
//   compactModalTitle:    { fontSize: 16, fontWeight: '700', color: '#1F2937' },
//   compactCloseBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
//   compactFormScroll:    { padding: 16 },
//   compactFormGroup:     { marginBottom: 14 },
//   compactLabel:         { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
//   compactInput:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
//   compactInputText:     { flex: 1, fontSize: 14, color: '#1F2937' },
//   compactTextInput:     { flex: 1, fontSize: 14, color: '#1F2937', paddingVertical: 0 },

//   compactImagePicker:    { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#6B5B95', borderRadius: 10, overflow: 'hidden' },
//   compactImageEmptyRow:  { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
//   compactCameraIcon:     { width: 44, height: 44, borderRadius: 10, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
//   compactImagePickerText:{ fontSize: 13, fontWeight: '600', color: '#6B5B95' },
//   compactExistingText:   { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
//   compactImagePreviewRow:{ flexDirection: 'row', alignItems: 'center', padding: 10, gap: 12 },
//   compactPreviewThumb:   { width: 60, height: 60, borderRadius: 8 },
//   compactImageInfo:      { flex: 1, gap: 3 },
//   compactImageInfoText:  { fontSize: 13, fontWeight: '600', color: '#10B981' },
//   compactImageChangeText:{ fontSize: 11, color: '#9CA3AF' },

//   submitFooter:          { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FFFFFF', marginBottom: 80 },
//   compactSubmitButton:   { borderRadius: 12, overflow: 'hidden' },
//   submitButtonDisabled:  { opacity: 0.6 },
//   compactSubmitGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
//   compactSubmitText:     { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
// });

// export default Utility;





// // app/dashboard/utility.tsx
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
//   FlatList,
//   Modal,
//   TextInput,
//   Image,
//   Platform,
//   Dimensions,
//   KeyboardAvoidingView,
//   Keyboard,
//   TouchableWithoutFeedback,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { LineChart } from 'react-native-chart-kit';
// import dayjs from 'dayjs';
// import utilityService, {
//   UtilityCategory,
//   UtilityItem,
//   CategoryChartData,
//   TotalCount,
//   TotalBillCount,
//   DailyReading,
// } from '../../services/utilityService';
// import DashboardHeader from '@/components/HeaderWithMenu';

// const { width, height } = Dimensions.get('window');

// const CATEGORY_NAMES: Record<number, string> = {
//   3: 'Water',
//   5: 'Electricity',
//   6: 'pH level - Pool',
//   7: 'Chlorine level - Pool',
// };

// const CHART_COLORS = {
//   Water: '#3B82F6',
//   Electricity: '#F59E0B',
//   'pH level - Pool': '#10B981',
//   'Chlorine level - Pool': '#8B5CF6',
// };

// interface ChartDataPoint {
//   date: string;
//   value: number;
//   guests: number;
//   categoryName: string;
//   formattedDate: string;
//   formattedValue: string;
// }

// interface CategoryData {
//   charge: string;
//   monthlyUnits: number;
//   billCharges: string;
//   billUnits: number;
// }

// const Utility = () => {
//   const [utilities, setUtilities] = useState<UtilityItem[]>([]);
//   const [categories, setCategories] = useState<UtilityCategory[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');
//   const [modalVisible, setModalVisible] = useState(false);
//   const [filterModalVisible, setFilterModalVisible] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const [existingImage, setExistingImage] = useState<string | null>(null);
//   const [viewMode, setViewMode] = useState<'list' | 'summary'>('summary');
//   const [chartData, setChartData] = useState<CategoryChartData[]>([]);
//   const [totalCounts, setTotalCounts] = useState<TotalCount[]>([]);
//   const [totalBillCounts, setTotalBillCounts] = useState<TotalBillCount[]>([]);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showChartPopup, setShowChartPopup] = useState(false);
//   const [selectedChartData, setSelectedChartData] = useState<ChartDataPoint | null>(null);
//   const [dateFilterEnabled, setDateFilterEnabled] = useState(false);
//   const [startDate, setStartDate] = useState<Date | null>(null);
//   const [endDate, setEndDate] = useState<Date | null>(null);
//   const [showStartDatePicker, setShowStartDatePicker] = useState(false);
//   const [showEndDatePicker, setShowEndDatePicker] = useState(false);
//   const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

//   const [formData, setFormData] = useState({
//     date: new Date(),
//     u_category: 0,
//     startreading: '',
//     utility_image: null as string | null,
//   });
//   const [imageUri, setImageUri] = useState<string | null>(null);

//   const selectedCategoryName = useMemo(() => {
//     const cat = categories.find(c => c.id === formData.u_category);
//     return cat?.utility_category_name ?? 'Select Category';
//   }, [categories, formData.u_category]);

//   useEffect(() => {
//     loadData();
//     requestPermissions();
//   }, []);

//   useEffect(() => {
//     if (viewMode === 'summary') {
//       loadChartData();
//     }
//   }, [selectedDate, viewMode]);

//   const filteredUtilities = useMemo(() => {
//     let filtered = utilities;

//     if (activeFilter !== 'all') {
//       filtered = filtered.filter(item => Number(item.u_category_id) === Number(activeFilter));
//     }

//     if (dateFilterEnabled && startDate && endDate) {
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.date);
//         const s = new Date(startDate);
//         s.setHours(0, 0, 0, 0);
//         const e = new Date(endDate);
//         e.setHours(23, 59, 59, 999);
//         return itemDate >= s && itemDate <= e;
//       });
//     }

//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       filtered = filtered.filter(item =>
//         `${item.user.name} ${item.user.lname}`.toLowerCase().includes(q) ||
//         item.startreading.toLowerCase().includes(q) ||
//         item.u_category.toLowerCase().includes(q)
//       );
//     }

//     return filtered;
//   }, [utilities, activeFilter, searchQuery, dateFilterEnabled, startDate, endDate]);

//   const requestPermissions = async () => {
//     const { status: cam } = await ImagePicker.requestCameraPermissionsAsync();
//     const { status: media } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (cam !== 'granted' || media !== 'granted') {
//       Alert.alert('Permissions Required', 'Camera and gallery permissions are needed.');
//     }
//   };

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [utilitiesData, categoriesData] = await Promise.all([
//         utilityService.getUtilities(),
//         utilityService.getCategories(),
//       ]);
//       const sorted = [...utilitiesData].sort(
//         (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//       );
//       setUtilities(sorted);
//       setCategories(categoriesData);
//       if (categoriesData.length > 0) {
//         setFormData(prev => ({ ...prev, u_category: categoriesData[0].id }));
//       }
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to load data');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const loadChartData = async () => {
//     try {
//       setLoading(true);
//       const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
//       const data = await utilityService.getChartData(formattedDate);
//       setChartData(data.chartData || []);
//       setTotalCounts(data.total_count || []);
//       setTotalBillCounts(data.total_bill_count || []);
//     } catch (error: any) {
//       console.error('Error loading chart data:', error);
//       Alert.alert('Error', error?.message || 'Failed to load chart data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getCategoryDisplayName = (categoryId: number): string => {
//     return CATEGORY_NAMES[categoryId] || `Category ${categoryId}`;
//   };

//   const getCategoryData = (categoryName: string): CategoryData => {
//     const tc = totalCounts.find(t => t.category === categoryName);
//     const bc = totalBillCounts.find(b => b.category === categoryName);

//     return {
//       charge: tc?.total_bill || '0.00',
//       monthlyUnits: tc?.total_count || 0,
//       billCharges: bc?.total_BillReading || '0.00',
//       billUnits: bc?.total_bill_count || 0,
//     };
//   };

//   const getReadingValue = (reading: DailyReading, categoryName: string): number => {
//     if (reading[categoryName] !== undefined && reading[categoryName] !== null) {
//       return Number(reading[categoryName]);
//     }
//     return 0;
//   };

//   const handleChartDataPointClick = (category: CategoryChartData, index: number, isReadingData: boolean) => {
//     const categoryName = getCategoryDisplayName(category.categoryName);
//     const reading = category.readings[index];
//     const value = isReadingData ? getReadingValue(reading, categoryName) : Number(reading.guests) || 0;
//     const formattedDate = dayjs(reading.date).format('DD MMM YYYY');

//     setSelectedChartData({
//       date: reading.date,
//       value: value,
//       guests: Number(reading.guests) || 0,
//       categoryName: categoryName,
//       formattedDate: formattedDate,
//       formattedValue: isReadingData
//         ? `${value.toFixed(2)} ${categoryName === 'Electricity' ? 'kWh' : categoryName === 'Water' ? 'm³' : 'units'}`
//         : `${value} guests`,
//     });
//     setShowChartPopup(true);
//   };

//   const buildChart = (category: CategoryChartData) => {
//     const categoryName = getCategoryDisplayName(category.categoryName);
//     const readingData = category.readings.map(r => getReadingValue(r, categoryName));
//     const guestData = category.readings.map(r => Number(r.guests) || 0);

//     return {
//       labels: category.readings.map(r => dayjs(r.date).format('DD MMM')),
//       datasets: [
//         {
//           data: readingData,
//           color: () => '#EF4444',
//           strokeWidth: 2,
//           withDots: true,
//         },
//         {
//           data: guestData,
//           color: () => '#9333EA',
//           strokeWidth: 2,
//           withDots: true,
//         },
//       ],
//       legend: [categoryName, 'Guests'],
//     };
//   };

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     if (viewMode === 'list') {
//       loadData();
//     } else {
//       loadChartData();
//     }
//   }, [viewMode, selectedDate]);

//   const onDateChange = (_: any, date?: Date) => {
//     setShowDatePicker(false);
//     if (date) setSelectedDate(date);
//   };

//   const resetDateFilter = useCallback(() => {
//     setDateFilterEnabled(false);
//     setStartDate(null);
//     setEndDate(null);
//     setFilterModalVisible(false);
//   }, []);

//   const applyDateFilter = useCallback(() => {
//     if (!startDate || !endDate) {
//       Alert.alert('Error', 'Please select both dates');
//       return;
//     }
//     if (startDate > endDate) {
//       Alert.alert('Error', 'Start date must be before end date');
//       return;
//     }
//     setDateFilterEnabled(true);
//     setFilterModalVisible(false);
//   }, [startDate, endDate]);

//   const pickImage = async (source: 'camera' | 'gallery') => {
//     try {
//       const opts = {
//         mediaTypes: ['images' as const],
//         allowsEditing: true,
//         aspect: [4, 3] as [number, number],
//         quality: 0.7
//       };
//       const result = source === 'camera'
//         ? await ImagePicker.launchCameraAsync(opts)
//         : await ImagePicker.launchImageLibraryAsync(opts);
//       if (!result.canceled && result.assets[0]) {
//         const uri = result.assets[0].uri;
//         setImageUri(uri);
//         setFormData(prev => ({ ...prev, utility_image: uri }));
//       }
//     } catch {
//       Alert.alert('Error', 'Failed to pick image');
//     }
//   };

//   const showImagePickerOptions = () => {
//     Alert.alert('Select Image', 'Choose an option', [
//       { text: 'Take Photo', onPress: () => pickImage('camera') },
//       { text: 'Choose from Gallery', onPress: () => pickImage('gallery') },
//       { text: 'Cancel', style: 'cancel' },
//     ]);
//   };

//   const checkDuplicate = (date: Date, catId: number, excludeId: number | null = null) => {
//     const ds = date.toISOString().split('T')[0];
//     return utilities.some(
//       item => item.date === ds && Number(item.u_category_id) === catId && item.id !== excludeId
//     );
//   };

//   const handleEdit = async (id: number) => {
//     try {
//       const utility = await utilityService.getUtilityById(id);
//       const [y, m, d] = utility.date.split('-').map(Number);
//       setFormData({
//         date: new Date(y, m - 1, d),
//         u_category: Number(utility.u_category_id),
//         startreading: utility.startreading,
//         utility_image: null,
//       });
//       setExistingImage(utility.image);
//       setImageUri(getImageUrl(utility.image));
//       setEditingId(id);
//       setIsEditMode(true);
//       setModalVisible(true);
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to load utility data');
//     }
//   };

//   const handleSubmit = async () => {
//     if (!formData.startreading.trim()) {
//       Alert.alert('Error', 'Please enter meter reading');
//       return;
//     }
//     if (!isEditMode && !formData.utility_image) {
//       Alert.alert('Error', 'Please select an image');
//       return;
//     }
//     if (formData.u_category === 0) {
//       Alert.alert('Error', 'Please select a category');
//       return;
//     }

//     if (!isEditMode && checkDuplicate(formData.date, formData.u_category)) {
//       const catName = categories.find(c => c.id === formData.u_category)?.utility_category_name ?? 'this category';
//       const dateStr = formData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//       Alert.alert('Duplicate Entry', `A reading for ${catName} on ${dateStr} already exists.`);
//       return;
//     }

//     try {
//       setSubmitting(true);
//       const fd = new FormData();
//       if (isEditMode && editingId) fd.append('id', editingId.toString());
//       fd.append('date', formData.date.toISOString().split('T')[0]);
//       fd.append('u_category', formData.u_category.toString());
//       fd.append('startreading', formData.startreading);

//       if (formData.utility_image) {
//         const filename = formData.utility_image.split('/').pop() || 'utility_image.jpg';
//         const ext = /\.(\w+)$/.exec(filename);
//         fd.append('utility_image', {
//           uri: formData.utility_image,
//           name: filename,
//           type: ext ? `image/${ext[1]}` : 'image/jpeg'
//         } as any);
//       } else if (isEditMode && existingImage) {
//         fd.append('existing_image', existingImage);
//       }

//       if (isEditMode && editingId) {
//         await utilityService.updateUtility(editingId, fd as any);
//       } else {
//         await utilityService.saveUtility(fd as any);
//       }

//       setModalVisible(false);
//       setTimeout(() => {
//         Alert.alert('Success', isEditMode ? 'Updated successfully' : 'Added successfully', [{
//           text: 'OK', onPress: () => {
//             resetForm();
//             loadData();
//             if (viewMode === 'summary') loadChartData();
//           }
//         }]);
//       }, 300);
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to save');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const resetForm = useCallback(() => {
//     setFormData({
//       date: new Date(),
//       u_category: categories[0]?.id ?? 0,
//       startreading: '',
//       utility_image: null
//     });
//     setImageUri(null);
//     setExistingImage(null);
//     setIsEditMode(false);
//     setEditingId(null);
//   }, [categories]);

//   const handleDelete = (id: number) => {
//     Alert.alert('Delete Utility', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete', style: 'destructive', onPress: async () => {
//           try {
//             await utilityService.deleteUtility(id);
//             Alert.alert('Success', 'Utility record deleted');
//             loadData();
//             if (viewMode === 'summary') loadChartData();
//           } catch (error: any) {
//             Alert.alert('Error', error.message || 'Failed to delete');
//           }
//         }
//       },
//     ]);
//   };

//   const formatDate = (s: string) =>
//     new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

//   const formatDateTime = (s: string) =>
//     new Date(s).toLocaleString('en-US', {
//       month: 'short', day: 'numeric', year: 'numeric',
//       hour: 'numeric', minute: '2-digit', hour12: true
//     });

//   const formatMonthYear = (d: Date) =>
//     d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

//   const getImageUrl = (p: string | null) => {
//     if (!p) return '';
//     if (p.startsWith('http') || p.startsWith('data:')) return p;
//     return `https://app.trackerstay.com/storage/${p}`;
//   };

//   const renderChartPopup = () => {
//     if (!selectedChartData) return null;

//     const categoryColor = CHART_COLORS[selectedChartData.categoryName as keyof typeof CHART_COLORS] || '#6B5B95';

//     return (
//       <Modal
//         visible={showChartPopup}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowChartPopup(false)}
//       >
//         <TouchableOpacity
//           style={styles.popupOverlay}
//           activeOpacity={1}
//           onPress={() => setShowChartPopup(false)}
//         >
//           <View style={styles.popupContainer}>
//             <View style={[styles.popupHeader, { backgroundColor: categoryColor }]}>
//               <View style={styles.popupHeaderContent}>
//                 <Ionicons name="bar-chart" size={24} color="#FFFFFF" />
//                 <Text style={styles.popupTitle}>Reading Details</Text>
//               </View>
//               <TouchableOpacity onPress={() => setShowChartPopup(false)}>
//                 <Ionicons name="close" size={24} color="#FFFFFF" />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.popupBody}>
//               <View style={styles.popupInfoRow}>
//                 <View style={styles.popupIconLabel}>
//                   <Ionicons name="calendar-outline" size={20} color="#6B5B95" />
//                   <Text style={styles.popupLabel}>Date</Text>
//                 </View>
//                 <Text style={styles.popupValue}>{selectedChartData.formattedDate}</Text>
//               </View>

//               <View style={styles.popupInfoRow}>
//                 <View style={styles.popupIconLabel}>
//                   <Ionicons name="flash-outline" size={20} color="#6B5B95" />
//                   <Text style={styles.popupLabel}>Category</Text>
//                 </View>
//                 <Text style={styles.popupValue}>{selectedChartData.categoryName}</Text>
//               </View>

//               <View style={[styles.popupInfoRow, styles.popupHighlightRow]}>
//                 <View style={styles.popupIconLabel}>
//                   <View style={[styles.popupValueDot, { backgroundColor: '#EF4444' }]} />
//                   <Text style={styles.popupLabel}>Reading Value</Text>
//                 </View>
//                 <Text style={[styles.popupValue, styles.popupValueHighlight, { color: '#EF4444' }]}>
//                   {selectedChartData.formattedValue}
//                 </Text>
//               </View>

//               <View style={[styles.popupInfoRow, styles.popupHighlightRow]}>
//                 <View style={styles.popupIconLabel}>
//                   <View style={[styles.popupValueDot, { backgroundColor: '#9333EA' }]} />
//                   <Text style={styles.popupLabel}>Guest Count</Text>
//                 </View>
//                 <Text style={[styles.popupValue, styles.popupValueHighlight, { color: '#9333EA' }]}>
//                   {selectedChartData.guests} {selectedChartData.guests === 1 ? 'guest' : 'guests'}
//                 </Text>
//               </View>

//               <View style={styles.popupDivider} />

//               <View style={styles.popupInfoRow}>
//                 <View style={styles.popupIconLabel}>
//                   <Ionicons name="information-circle-outline" size={20} color="#6B5B95" />
//                   <Text style={styles.popupLabel}>Status</Text>
//                 </View>
//                 <View style={[styles.popupStatusBadge, { backgroundColor: selectedChartData.value > 0 ? '#D1FAE5' : '#FEF3C7' }]}>
//                   <Text style={[styles.popupStatusText, { color: selectedChartData.value > 0 ? '#065F46' : '#92400E' }]}>
//                     {selectedChartData.value > 0 ? 'Recorded' : 'No Data'}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             <TouchableOpacity
//               style={styles.popupCloseButton}
//               onPress={() => setShowChartPopup(false)}
//             >
//               <LinearGradient colors={[categoryColor, categoryColor + 'CC']} style={styles.popupCloseGradient}>
//                 <Text style={styles.popupCloseText}>Close</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     );
//   };

//   const renderUtilityCard = useCallback(({ item }: { item: UtilityItem }) => (
//     <View style={styles.utilityCard}>
//       <View style={styles.cardHeader}>
//         <View style={styles.headerLeft}>
//           <View style={styles.categoryBadge}>
//             <Ionicons name="flash" size={16} color="#6B5B95" />
//             <Text style={styles.categoryText}>{item.u_category}</Text>
//           </View>
//           <View style={styles.userBadge}>
//             <Ionicons name="person" size={14} color="#6B7280" />
//             <Text style={styles.userName}>{item.user.name} {item.user.lname}</Text>
//           </View>
//         </View>
//         <View style={styles.actionButtons}>
//           <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.editButton}>
//             <Ionicons name="create-outline" size={20} color="#3B82F6" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
//             <Ionicons name="trash-outline" size={20} color="#EF4444" />
//           </TouchableOpacity>
//         </View>
//       </View>
//       {item.image && <Image source={{ uri: getImageUrl(item.image) }} style={styles.utilityImage} resizeMode="cover" />}
//       <View style={styles.cardBody}>
//         <View style={styles.infoRow}>
//           <Ionicons name="calendar-outline" size={16} color="#6B7280" />
//           <Text style={styles.infoText}>{formatDate(item.date)}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <Ionicons name="speedometer-outline" size={16} color="#6B7280" />
//           <Text style={styles.infoText}>Reading: {item.startreading}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <Ionicons name="shield-checkmark-outline" size={16} color="#10B981" />
//           <Text style={[styles.infoText, { color: '#10B981' }]}>{item.status}</Text>
//         </View>
//       </View>
//       <View style={styles.cardFooter}>
//         <Text style={styles.footerText}>
//           {item.created_at !== item.updated_at ? 'Updated: ' : 'Added: '}
//           {formatDateTime(item.created_at !== item.updated_at ? item.updated_at : item.created_at)}
//         </Text>
//       </View>
//     </View>
//   ), []);

//   const keyExtractor = useCallback((item: UtilityItem) => item.id.toString(), []);

//   return (
//     <View style={styles.container}>
//       <DashboardHeader
//         title="Utility Management"
//         subtitle={viewMode === 'list' ? 'Track and manage utility readings' : `${formatMonthYear(selectedDate)} - Dashboard`}
//         currentPage="utility"
//       />

//       <View style={styles.viewToggleContainer}>
//         {(['summary', 'list'] as const).map(mode => (
//           <TouchableOpacity
//             key={mode}
//             style={[styles.toggleButton, viewMode === mode && styles.toggleButtonActive]}
//             onPress={() => setViewMode(mode)}
//           >
//             <Ionicons name={mode === 'summary' ? 'bar-chart' : 'list'} size={20} color={viewMode === mode ? '#FFFFFF' : '#6B5B95'} />
//             <Text style={[styles.toggleText, viewMode === mode && styles.toggleTextActive]}>
//               {mode === 'summary' ? 'Summary' : 'List View'}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {viewMode === 'list' ? (
//         <>
//           <View style={styles.searchContainer}>
//             <View style={styles.searchBar}>
//               <Ionicons name="search" size={20} color="#6B7280" />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search by user, reading, category..."
//                 value={searchQuery}
//                 onChangeText={setSearchQuery}
//                 placeholderTextColor="#9CA3AF"
//               />
//               {searchQuery !== '' && (
//                 <TouchableOpacity onPress={() => setSearchQuery('')}>
//                   <Ionicons name="close-circle" size={20} color="#6B7280" />
//                 </TouchableOpacity>
//               )}
//             </View>
//             <TouchableOpacity
//               style={[styles.dateFilterButton, dateFilterEnabled && styles.dateFilterButtonActive]}
//               onPress={() => setFilterModalVisible(true)}
//             >
//               <Ionicons name="calendar" size={20} color={dateFilterEnabled ? '#FFFFFF' : '#6B5B95'} />
//               {dateFilterEnabled && <View style={styles.filterBadge} />}
//             </TouchableOpacity>
//           </View>

//           {dateFilterEnabled && startDate && endDate && (
//             <View style={styles.activeDateFilter}>
//               <View style={styles.dateFilterInfo}>
//                 <Ionicons name="calendar-outline" size={16} color="#6B5B95" />
//                 <Text style={styles.dateFilterText}>
//                   {formatDate(startDate.toISOString())} – {formatDate(endDate.toISOString())}
//                 </Text>
//               </View>
//               <TouchableOpacity onPress={resetDateFilter}>
//                 <Ionicons name="close-circle" size={20} color="#6B5B95" />
//               </TouchableOpacity>
//             </View>
//           )}

//           <View style={styles.filterContainer}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
//               <TouchableOpacity
//                 onPress={() => setActiveFilter('all')}
//                 style={[styles.filterButton, activeFilter === 'all' && styles.activeFilterButton]}
//               >
//                 <Ionicons name="apps" size={16} color={activeFilter === 'all' ? '#FFFFFF' : '#6B5B95'} />
//                 <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
//                   All ({utilities.length})
//                 </Text>
//               </TouchableOpacity>

//               {categories.map(cat => {
//                 const isActive = activeFilter === cat.id;
//                 const count = utilities.filter(u => Number(u.u_category_id) === cat.id).length;
//                 return (
//                   <TouchableOpacity
//                     key={cat.id}
//                     onPress={() => setActiveFilter(isActive ? 'all' : cat.id)}
//                     style={[styles.filterButton, isActive && styles.activeFilterButton]}
//                   >
//                     <Ionicons name="flash" size={16} color={isActive ? '#FFFFFF' : '#6B5B95'} />
//                     <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
//                       {cat.utility_category_name} ({count})
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>
//           </View>

//           <View style={styles.resultsContainer}>
//             <Text style={styles.resultsText}>
//               {filteredUtilities.length} {filteredUtilities.length === 1 ? 'result' : 'results'}
//               {activeFilter !== 'all' && ` · ${categories.find(c => c.id === activeFilter)?.utility_category_name}`}
//             </Text>
//           </View>

//           <FlatList
//             data={filteredUtilities}
//             keyExtractor={keyExtractor}
//             renderItem={renderUtilityCard}
//             contentContainerStyle={styles.listContainer}
//             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B5B95" colors={['#6B5B95']} />}
//             ListEmptyComponent={
//               <View style={styles.emptyContainer}>
//                 <Ionicons name="flash-outline" size={60} color="#6B5B95" />
//                 <Text style={styles.emptyText}>No Utilities Found</Text>
//                 <Text style={styles.emptySubtext}>
//                   {searchQuery || dateFilterEnabled ? 'Try adjusting your filters' : 'Add your first utility reading'}
//                 </Text>
//               </View>
//             }
//             showsVerticalScrollIndicator={false}
//             removeClippedSubviews
//             maxToRenderPerBatch={10}
//             windowSize={10}
//           />
//         </>
//       ) : (
//         <ScrollView
//           style={styles.summaryContent}
//           contentContainerStyle={styles.summaryScrollContent}
//           showsVerticalScrollIndicator={false}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B5B95" colors={['#6B5B95']} />}
//         >
//           <View style={styles.summaryDateSection}>
//             <Text style={styles.dateLabel}>Select Date</Text>
//             <TouchableOpacity style={styles.summaryDatePicker} onPress={() => setShowDatePicker(true)}>
//               <Ionicons name="calendar-outline" size={20} color="#64748B" />
//               <Text style={styles.summaryDateText}>{dayjs(selectedDate).format('YYYY-MM-DD')}</Text>
//               <Ionicons name="chevron-down" size={16} color="#64748B" />
//             </TouchableOpacity>
//           </View>

//           {showDatePicker && (
//             <DateTimePicker
//               value={selectedDate}
//               mode="date"
//               display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//               onChange={onDateChange}
//             />
//           )}

//           {loading && viewMode === 'summary' && (
//             <View style={{ paddingVertical: 32, alignItems: 'center' }}>
//               <ActivityIndicator size="large" color="#6B5B95" />
//               <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading chart data...</Text>
//             </View>
//           )}

//           {!loading && chartData.length === 0 && (
//             <View style={styles.emptyChartContainer}>
//               <Ionicons name="bar-chart-outline" size={60} color="#D1D5DB" />
//               <Text style={styles.emptyChartTitle}>No Data Available</Text>
//               <Text style={styles.emptyChartSubtitle}>
//                 No utility data found for {dayjs(selectedDate).format('MMMM YYYY')}
//               </Text>
//             </View>
//           )}

//           {!loading && chartData.map(category => {
//             const categoryName = getCategoryDisplayName(category.categoryName);
//             const cd = getCategoryData(categoryName);
//             const chartConfig = buildChart(category);

//             return (
//               <View key={category.categoryName} style={styles.chartCard}>
//                 <View style={styles.categoryHeader}>
//                   <Text style={styles.categoryTitle}>{categoryName}</Text>
//                   <View style={styles.billChargesContainer}>
//                     <Text style={styles.billChargesLabel}>Bill charges: </Text>
//                     <Text style={styles.billAmount}>LKR {parseFloat(cd.billCharges).toFixed(2)}</Text>
//                   </View>
//                 </View>

//                 <View style={styles.statsRow}>
//                   <View style={styles.statItem}>
//                     <Text style={styles.statLabel}>Charge:</Text>
//                     <Text style={styles.statValue}>LKR {parseFloat(cd.charge).toFixed(2)}</Text>
//                   </View>
//                   <View style={styles.statItem}>
//                     <Text style={styles.statLabel}>Bill Total Units:</Text>
//                     <Text style={styles.statValue}>{cd.billUnits}</Text>
//                   </View>
//                 </View>

//                 <View style={styles.statsRow}>
//                   <View style={styles.statItem}>
//                     <Text style={styles.statLabel}>Monthly Total Units:</Text>
//                     <Text style={styles.statValue}>{cd.monthlyUnits}</Text>
//                   </View>
//                 </View>

//                 <View style={styles.chartInstruction}>
//                   <Ionicons name="finger-print" size={14} color="#6B5B95" />
//                   <Text style={styles.chartInstructionText}>Tap on any data point to see details</Text>
//                 </View>

//                 <ScrollView
//                   horizontal
//                   showsHorizontalScrollIndicator
//                   style={styles.chartScrollContainer}
//                   contentContainerStyle={{ paddingRight: 20 }}
//                 >
//                   <View style={{ padding: 8 }}>
//                     <LineChart
//                       data={chartConfig}
//                       width={Math.max(width - 64, category.readings.length * 55)}
//                       height={280}
//                       withDots={true}
//                       withShadow={false}
//                       withInnerLines
//                       withOuterLines
//                       withVerticalLines
//                       withHorizontalLines
//                       bezier={chartConfig.datasets[0].data.some(v => v > 0)}
//                       onDataPointClick={({ index, dataset }) => {
//                         const isReadingDataset = dataset.data === chartConfig.datasets[0].data;
//                         handleChartDataPointClick(category, index, isReadingDataset);
//                       }}
//                       chartConfig={{
//                         backgroundColor: '#fff',
//                         backgroundGradientFrom: '#fff',
//                         backgroundGradientTo: '#fff',
//                         decimalPlaces: 0,
//                         color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
//                         labelColor: (opacity = 1) => `rgba(71,85,105,${opacity})`,
//                         style: { borderRadius: 16 },
//                         propsForDots: { r: '6', strokeWidth: '2', stroke: '#fff' },
//                         propsForBackgroundLines: { strokeDasharray: '', stroke: '#E2E8F0', strokeWidth: 1 },
//                         propsForLabels: { fontSize: 10 },
//                       }}
//                       style={{ marginVertical: 8, borderRadius: 16 }}
//                     />
//                   </View>
//                 </ScrollView>

//                 <View style={styles.legendContainer}>
//                   <TouchableOpacity
//                     style={styles.legendItem}
//                     onPress={() => {
//                       const indexWithData = category.readings.findIndex(r => getReadingValue(r, categoryName) > 0);
//                       if (indexWithData !== -1) {
//                         handleChartDataPointClick(category, indexWithData, true);
//                       } else if (category.readings.length > 0) {
//                         handleChartDataPointClick(category, 0, true);
//                       }
//                     }}
//                   >
//                     <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
//                     <Text style={styles.legendText}>{categoryName}</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={styles.legendItem}
//                     onPress={() => {
//                       const indexWithGuests = category.readings.findIndex(r => Number(r.guests) > 0);
//                       if (indexWithGuests !== -1) {
//                         handleChartDataPointClick(category, indexWithGuests, false);
//                       } else if (category.readings.length > 0) {
//                         handleChartDataPointClick(category, 0, false);
//                       }
//                     }}
//                   >
//                     <View style={[styles.legendDot, { backgroundColor: '#9333EA' }]} />
//                     <Text style={styles.legendText}>Guests</Text>
//                   </TouchableOpacity>
//                 </View>

//                 <View style={styles.tapHintContainer}>
//                   <Ionicons name="hand-left" size={12} color="#9CA3AF" />
//                   <Text style={styles.tapHintText}>Tap dots or legend items to view details</Text>
//                 </View>
//               </View>
//             );
//           })}

//           <View style={{ height: 90 }} />
//         </ScrollView>
//       )}

//       {renderChartPopup()}

//       <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setModalVisible(true); }}>
//         <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.fabGradient}>
//           <Ionicons name="add" size={28} color="#FFFFFF" />
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* Date Range Filter Modal */}
//       <Modal visible={filterModalVisible} animationType="slide" transparent onRequestClose={() => setFilterModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.filterModalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Filter by Date Range</Text>
//               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
//                 <Ionicons name="close" size={24} color="#1F2937" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView showsVerticalScrollIndicator={false}>
//               <View style={styles.dateFilterForm}>
//                 <View style={styles.formGroup}>
//                   <Text style={styles.label}>Start Date</Text>
//                   <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartDatePicker(true)}>
//                     <Ionicons name="calendar-outline" size={20} color="#6B7280" />
//                     <Text style={styles.dateInputText}>{startDate ? formatDate(startDate.toISOString()) : 'Select start date'}</Text>
//                   </TouchableOpacity>
//                 </View>
//                 {showStartDatePicker && (
//                   <DateTimePicker
//                     value={startDate || new Date()}
//                     mode="date"
//                     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                     onChange={(_, d) => { setShowStartDatePicker(Platform.OS === 'ios'); if (d) setStartDate(d); }}
//                     maximumDate={new Date()}
//                   />
//                 )}
//                 <View style={styles.formGroup}>
//                   <Text style={styles.label}>End Date</Text>
//                   <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndDatePicker(true)}>
//                     <Ionicons name="calendar-outline" size={20} color="#6B7280" />
//                     <Text style={styles.dateInputText}>{endDate ? formatDate(endDate.toISOString()) : 'Select end date'}</Text>
//                   </TouchableOpacity>
//                 </View>
//                 {showEndDatePicker && (
//                   <DateTimePicker
//                     value={endDate || new Date()}
//                     mode="date"
//                     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                     onChange={(_, d) => { setShowEndDatePicker(Platform.OS === 'ios'); if (d) setEndDate(d); }}
//                     maximumDate={new Date()}
//                     minimumDate={startDate || undefined}
//                   />
//                 )}
//                 <View style={styles.quickFiltersContainer}>
//                   <Text style={styles.quickFiltersLabel}>Quick Filters</Text>
//                   <View style={styles.quickFilters}>
//                     {[
//                       { label: 'Today', days: 0 },
//                       { label: 'Last 7 Days', days: 7 },
//                       { label: 'Last 30 Days', days: 30 }
//                     ].map(({ label, days }) => (
//                       <TouchableOpacity key={label} style={styles.quickFilterButton} onPress={() => {
//                         const t = new Date();
//                         const s = new Date();
//                         s.setDate(t.getDate() - days);
//                         setStartDate(s);
//                         setEndDate(t);
//                       }}>
//                         <Text style={styles.quickFilterText}>{label}</Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 </View>
//                 <View style={styles.filterActions}>
//                   <TouchableOpacity style={styles.resetButton} onPress={resetDateFilter}>
//                     <Text style={styles.resetButtonText}>Reset</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.applyButton} onPress={applyDateFilter}>
//                     <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.applyGradient}>
//                       <Text style={styles.applyButtonText}>Apply Filter</Text>
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       {/* Category Dropdown Modal */}
//       <Modal visible={showCategoryDropdown} animationType="fade" transparent onRequestClose={() => setShowCategoryDropdown(false)}>
//         <TouchableWithoutFeedback onPress={() => setShowCategoryDropdown(false)}>
//           <View style={styles.dropdownOverlay}>
//             <TouchableWithoutFeedback>
//               <View style={styles.dropdownBox}>
//                 <View style={styles.dropdownHeader}>
//                   <Text style={styles.dropdownTitle}>Select Category</Text>
//                   <TouchableOpacity onPress={() => setShowCategoryDropdown(false)}>
//                     <Ionicons name="close" size={22} color="#6B7280" />
//                   </TouchableOpacity>
//                 </View>
//                 {categories.map(cat => {
//                   const isSel = formData.u_category === cat.id;
//                   return (
//                     <TouchableOpacity
//                       key={cat.id}
//                       style={[styles.dropdownItem, isSel && styles.dropdownItemActive]}
//                       onPress={() => { setFormData(prev => ({ ...prev, u_category: cat.id })); setShowCategoryDropdown(false); }}
//                     >
//                       <Ionicons name="flash" size={16} color={isSel ? '#6B5B95' : '#9CA3AF'} />
//                       <Text style={[styles.dropdownItemText, isSel && styles.dropdownItemTextActive]}>
//                         {cat.utility_category_name}
//                       </Text>
//                       {isSel && <Ionicons name="checkmark" size={18} color="#6B5B95" style={{ marginLeft: 'auto' }} />}
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>

//       {/* Add/Edit Modal */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => { setModalVisible(false); resetForm(); }}
//       >
//         <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//           <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContent}>
//                 <View style={styles.compactModalHeader}>
//                   <View style={styles.compactModalTitleRow}>
//                     <View style={styles.compactModalIcon}>
//                       <Ionicons name={isEditMode ? 'create' : 'flash'} size={18} color="#6B5B95" />
//                     </View>
//                     <Text style={styles.compactModalTitle}>
//                       {isEditMode ? 'Edit Utility Reading' : 'Add Utility Reading'}
//                     </Text>
//                   </View>
//                   <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }} style={styles.compactCloseBtn}>
//                     <Ionicons name="close" size={20} color="#6B7280" />
//                   </TouchableOpacity>
//                 </View>

//                 <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.compactFormScroll} keyboardShouldPersistTaps="handled">
//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Date</Text>
//                     <TouchableOpacity style={styles.compactInput} onPress={() => setShowDatePicker(true)}>
//                       <Ionicons name="calendar-outline" size={16} color="#6B7280" />
//                       <Text style={styles.compactInputText}>
//                         {formData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>

//                   {showDatePicker && (
//                     <DateTimePicker
//                       value={formData.date}
//                       mode="date"
//                       display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                       onChange={(_, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setFormData(prev => ({ ...prev, date: d })); }}
//                     />
//                   )}

//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Category</Text>
//                     <TouchableOpacity style={styles.compactInput} onPress={() => setShowCategoryDropdown(true)}>
//                       <Ionicons name="flash" size={16} color="#6B5B95" />
//                       <Text style={[styles.compactInputText, { flex: 1, color: formData.u_category ? '#1F2937' : '#9CA3AF' }]}>
//                         {selectedCategoryName}
//                       </Text>
//                       <Ionicons name="chevron-down" size={16} color="#6B7280" />
//                     </TouchableOpacity>
//                   </View>

//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Meter Reading</Text>
//                     <View style={styles.compactInput}>
//                       <Ionicons name="speedometer-outline" size={16} color="#6B7280" />
//                       <TextInput
//                         style={styles.compactTextInput}
//                         placeholder="Enter reading"
//                         keyboardType="numeric"
//                         value={formData.startreading}
//                         onChangeText={t => setFormData(prev => ({ ...prev, startreading: t }))}
//                         placeholderTextColor="#9CA3AF"
//                         returnKeyType="done"
//                         onSubmitEditing={Keyboard.dismiss}
//                       />
//                     </View>
//                   </View>

//                   <View style={styles.compactFormGroup}>
//                     <Text style={styles.compactLabel}>Meter Photo</Text>
//                     <TouchableOpacity style={styles.compactImagePicker} onPress={showImagePickerOptions}>
//                       {imageUri ? (
//                         <View style={styles.compactImagePreviewRow}>
//                           <Image source={{ uri: imageUri }} style={styles.compactPreviewThumb} />
//                           <View style={styles.compactImageInfo}>
//                             <Ionicons name="checkmark-circle" size={18} color="#10B981" />
//                             <Text style={styles.compactImageInfoText}>Photo selected</Text>
//                             <Text style={styles.compactImageChangeText}>Tap to change</Text>
//                           </View>
//                         </View>
//                       ) : (
//                         <View style={styles.compactImageEmptyRow}>
//                           <View style={styles.compactCameraIcon}>
//                             <Ionicons name="camera" size={22} color="#6B5B95" />
//                           </View>
//                           <View>
//                             <Text style={styles.compactImagePickerText}>
//                               {isEditMode && existingImage ? 'Tap to change photo' : 'Take Photo / Gallery'}
//                             </Text>
//                             {isEditMode && existingImage && (
//                               <Text style={styles.compactExistingText}>Current photo kept if not changed</Text>
//                             )}
//                           </View>
//                         </View>
//                       )}
//                     </TouchableOpacity>
//                   </View>
//                 </ScrollView>

//                 <View style={styles.submitFooter}>
//                   <TouchableOpacity
//                     style={[styles.compactSubmitButton, submitting && styles.submitButtonDisabled]}
//                     onPress={handleSubmit}
//                     disabled={submitting}
//                   >
//                     <LinearGradient
//                       colors={submitting ? ['#9CA3AF', '#9CA3AF'] : ['#6B5B95', '#7D6BA8']}
//                       style={styles.compactSubmitGradient}
//                     >
//                       {submitting
//                         ? <ActivityIndicator color="#FFFFFF" />
//                         : <>
//                           <Ionicons name={isEditMode ? 'checkmark-circle' : 'add-circle'} size={18} color="#FFFFFF" />
//                           <Text style={styles.compactSubmitText}>{isEditMode ? 'Update Utility' : 'Add Utility'}</Text>
//                         </>
//                       }
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           </TouchableWithoutFeedback>
//         </KeyboardAvoidingView>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F3F4F6' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
//   loadingText: { marginTop: 10, fontSize: 16, color: '#6B7280' },
//   viewToggleContainer: {
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 16,
//     marginTop: 16,
//     borderRadius: 12,
//     padding: 4,
//     flexDirection: 'row',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2
//   },
//   toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6 },
//   toggleButtonActive: { backgroundColor: '#6B5B95' },
//   toggleText: { fontSize: 14, fontWeight: '600', color: '#6B5B95' },
//   toggleTextActive: { color: '#FFFFFF' },
//   summaryContent: { flex: 1, backgroundColor: '#F1F5F9' },
//   summaryScrollContent: { padding: 16, paddingBottom: 32 },
//   summaryDateSection: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
//   dateLabel: { fontSize: 15, fontWeight: '600', marginBottom: 10, color: '#334155' },
//   summaryDatePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8 },
//   summaryDateText: { fontSize: 15, color: '#0F172A', fontWeight: '500' },
//   chartCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
//   categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
//   categoryTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
//   billChargesContainer: { flexDirection: 'row', alignItems: 'center' },
//   billChargesLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
//   billAmount: { fontSize: 15, fontWeight: '700', color: '#3B82F6' },
//   statsRow: { flexDirection: 'row', gap: 20, marginBottom: 8, flexWrap: 'wrap' },
//   statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   statLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
//   statValue: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
//   chartScrollContainer: { marginTop: 16, marginBottom: 12, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
//   legendContainer: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 12, flexWrap: 'wrap' },
//   legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F9FAFB' },
//   legendDot: { width: 12, height: 12, borderRadius: 6 },
//   legendText: { fontSize: 14, color: '#475569', fontWeight: '500' },
//   chartInstruction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, marginBottom: 4 },
//   chartInstructionText: { fontSize: 12, color: '#6B5B95', fontWeight: '500' },
//   tapHintContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
//   tapHintText: { fontSize: 10, color: '#9CA3AF' },
//   popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
//   popupContainer: { width: width - 48, backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
//   popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
//   popupHeaderContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   popupTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
//   popupBody: { padding: 20 },
//   popupInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
//   popupHighlightRow: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, marginBottom: 12 },
//   popupIconLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   popupLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
//   popupValue: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
//   popupValueHighlight: { fontSize: 16, fontWeight: '700' },
//   popupValueDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
//   popupDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
//   popupStatusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
//   popupStatusText: { fontSize: 12, fontWeight: '600' },
//   popupCloseButton: { marginHorizontal: 20, marginBottom: 20, borderRadius: 12, overflow: 'hidden' },
//   popupCloseGradient: { paddingVertical: 14, alignItems: 'center' },
//   popupCloseText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
//   emptyChartContainer: { backgroundColor: '#FFFFFF', padding: 40, borderRadius: 12, alignItems: 'center', marginTop: 20 },
//   emptyChartTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 16 },
//   emptyChartSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },
//   searchContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 12 },
//   searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
//   searchInput: { flex: 1, fontSize: 14, color: '#1F2937' },
//   dateFilterButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
//   dateFilterButtonActive: { backgroundColor: '#6B5B95', borderColor: '#6B5B95' },
//   filterBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
//   activeDateFilter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   dateFilterInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   dateFilterText: { fontSize: 13, color: '#1F2937', fontWeight: '600' },
//   filterContainer: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   filterContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
//   filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', gap: 5 },
//   activeFilterButton: { backgroundColor: '#6B5B95', borderColor: '#6B5B95' },
//   filterText: { fontSize: 12, fontWeight: '600', color: '#6B5B95' },
//   activeFilterText: { color: '#FFFFFF' },
//   resultsContainer: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   resultsText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
//   listContainer: { padding: 16, paddingBottom: 100 },
//   emptyContainer: { paddingVertical: 60, alignItems: 'center' },
//   emptyText: { color: '#1F2937', fontSize: 18, fontWeight: '600', marginTop: 16 },
//   emptySubtext: { color: '#6B7280', fontSize: 14, marginTop: 4 },
//   utilityCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
//   cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 12 },
//   headerLeft: { flex: 1, gap: 8 },
//   categoryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6, alignSelf: 'flex-start' },
//   categoryText: { color: '#6B5B95', fontSize: 12, fontWeight: '600' },
//   userBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   userName: { color: '#1F2937', fontSize: 14, fontWeight: '600' },
//   actionButtons: { flexDirection: 'row', gap: 8 },
//   editButton: { padding: 8 },
//   deleteButton: { padding: 8 },
//   utilityImage: { width: '100%', height: 200, backgroundColor: '#F3F4F6' },
//   cardBody: { padding: 16, gap: 10 },
//   infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   infoText: { color: '#1F2937', fontSize: 14, fontWeight: '500' },
//   cardFooter: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
//   footerText: { color: '#9CA3AF', fontSize: 11, fontWeight: '500' },
//   fab: { position: 'absolute', bottom: 20, right: 20, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
//   fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
//   filterModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 20 },
//   modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   modalTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
//   dateFilterForm: { padding: 20 },
//   formGroup: { marginBottom: 20 },
//   label: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
//   dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, gap: 10 },
//   dateInputText: { flex: 1, fontSize: 14, color: '#1F2937' },
//   quickFiltersContainer: { marginTop: 10 },
//   quickFiltersLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
//   quickFilters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
//   quickFilterButton: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
//   quickFilterText: { fontSize: 12, fontWeight: '600', color: '#6B5B95' },
//   filterActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
//   resetButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
//   resetButtonText: { fontSize: 14, fontWeight: '700', color: '#6B5B95' },
//   applyButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
//   applyGradient: { paddingVertical: 14, alignItems: 'center' },
//   applyButtonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
//   dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
//   dropdownBox: { backgroundColor: '#FFFFFF', borderRadius: 16, width: '100%', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 },
//   dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   dropdownTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
//   dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
//   dropdownItemActive: { backgroundColor: '#F5F3FF' },
//   dropdownItemText: { fontSize: 15, color: '#374151', fontWeight: '500' },
//   dropdownItemTextActive: { color: '#6B5B95', fontWeight: '700' },
//   modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '82%' },
//   compactModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
//   compactModalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   compactModalIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
//   compactModalTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
//   compactCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
//   compactFormScroll: { padding: 16 },
//   compactFormGroup: { marginBottom: 14 },
//   compactLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
//   compactInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
//   compactInputText: { flex: 1, fontSize: 14, color: '#1F2937' },
//   compactTextInput: { flex: 1, fontSize: 14, color: '#1F2937', paddingVertical: 0 },
//   compactImagePicker: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#6B5B95', borderRadius: 10, overflow: 'hidden' },
//   compactImageEmptyRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
//   compactCameraIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
//   compactImagePickerText: { fontSize: 13, fontWeight: '600', color: '#6B5B95' },
//   compactExistingText: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
//   compactImagePreviewRow: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 12 },
//   compactPreviewThumb: { width: 60, height: 60, borderRadius: 8 },
//   compactImageInfo: { flex: 1, gap: 3 },
//   compactImageInfoText: { fontSize: 13, fontWeight: '600', color: '#10B981' },
//   compactImageChangeText: { fontSize: 11, color: '#9CA3AF' },
//   submitFooter: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FFFFFF', marginBottom: 80 },
//   compactSubmitButton: { borderRadius: 12, overflow: 'hidden' },
//   submitButtonDisabled: { opacity: 0.6 },
//   compactSubmitGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
//   compactSubmitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
// });

// export default Utility;


// app/dashboard/utility.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
  Modal,
  TextInput,
  Image,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import dayjs from 'dayjs';
import utilityService, {
  UtilityCategory,
  UtilityItem,
  CategoryChartData,
  TotalCount,
  TotalBillCount,
  DailyReading,
} from '../../services/utilityService';
import DashboardHeader from '@/components/HeaderWithMenu';

const { width } = Dimensions.get('window');

const CATEGORY_NAMES: Record<number, string> = {
  3: 'Water',
  5: 'Electricity',
  6: 'pH level - Pool',
  7: 'Chlorine level - Pool',
};

const CHART_COLORS = {
  Water: '#3B82F6',
  Electricity: '#F59E0B',
  'pH level - Pool': '#10B981',
  'Chlorine level - Pool': '#8B5CF6',
};

interface ChartDataPoint {
  date: string;
  value: number;
  guests: number;
  categoryName: string;
  formattedDate: string;
  formattedValue: string;
}

interface CategoryData {
  charge: string;
  monthlyUnits: number;
  billCharges: string;
  billUnits: number;
}

// ── Helper: safely parse a number that may have commas ──────────────────────
const safeParseFloat = (val: string | number | undefined | null): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  // Remove commas before parsing e.g. "3,383.64" → 3383.64
  const cleaned = String(val).replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// ── Format number with commas ────────────────────────────────────────────────
const formatNumber = (val: number, decimals = 2): string => {
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const Utility = () => {
  const [utilities, setUtilities] = useState<UtilityItem[]>([]);
  const [categories, setCategories] = useState<UtilityCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'summary'>('summary');
  const [chartData, setChartData] = useState<CategoryChartData[]>([]);
  const [totalCounts, setTotalCounts] = useState<TotalCount[]>([]);
  const [totalBillCounts, setTotalBillCounts] = useState<TotalBillCount[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showChartPopup, setShowChartPopup] = useState(false);
  const [selectedChartData, setSelectedChartData] = useState<ChartDataPoint | null>(null);
  const [dateFilterEnabled, setDateFilterEnabled] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date(),
    u_category: 0,
    startreading: '',
    utility_image: null as string | null,
  });
  const [imageUri, setImageUri] = useState<string | null>(null);

  const selectedCategoryName = useMemo(() => {
    const cat = categories.find(c => c.id === formData.u_category);
    return cat?.utility_category_name ?? 'Select Category';
  }, [categories, formData.u_category]);

  useEffect(() => {
    loadData();
    requestPermissions();
  }, []);

  useEffect(() => {
    if (viewMode === 'summary') loadChartData();
  }, [selectedDate, viewMode]);

  const filteredUtilities = useMemo(() => {
    let filtered = utilities;
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => Number(item.u_category_id) === Number(activeFilter));
    }
    if (dateFilterEnabled && startDate && endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        const s = new Date(startDate); s.setHours(0, 0, 0, 0);
        const e = new Date(endDate);   e.setHours(23, 59, 59, 999);
        return itemDate >= s && itemDate <= e;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        `${item.user.name} ${item.user.lname}`.toLowerCase().includes(q) ||
        item.startreading.toLowerCase().includes(q) ||
        item.u_category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [utilities, activeFilter, searchQuery, dateFilterEnabled, startDate, endDate]);

  const requestPermissions = async () => {
    const { status: cam }   = await ImagePicker.requestCameraPermissionsAsync();
    const { status: media } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cam !== 'granted' || media !== 'granted') {
      Alert.alert('Permissions Required', 'Camera and gallery permissions are needed.');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [utilitiesData, categoriesData] = await Promise.all([
        utilityService.getUtilities(),
        utilityService.getCategories(),
      ]);
      const sorted = [...utilitiesData].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setUtilities(sorted);
      setCategories(categoriesData);
      if (categoriesData.length > 0) {
        setFormData(prev => ({ ...prev, u_category: categoriesData[0].id }));
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadChartData = async () => {
    try {
      setLoading(true);
      const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
      const data = await utilityService.getChartData(formattedDate);
      setChartData(data.chartData || []);
      setTotalCounts(data.total_count || []);
      setTotalBillCounts(data.total_bill_count || []);
    } catch (error: any) {
      console.error('Error loading chart data:', error);
      Alert.alert('Error', error?.message || 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplayName = (categoryId: number): string =>
    CATEGORY_NAMES[categoryId] || `Category ${categoryId}`;

  // ── FIXED: use safeParseFloat to handle comma-formatted strings ─────────
  const getCategoryData = (categoryName: string): CategoryData => {
    const tc = totalCounts.find(t => t.category === categoryName);
    const bc = totalBillCounts.find(b => b.category === categoryName);
    return {
      charge:       tc?.total_bill       || '0.00',
      monthlyUnits: tc?.total_count      || 0,
      billCharges:  bc?.total_BillReading || '0.00',
      billUnits:    bc?.total_bill_count  || 0,
    };
  };

  const getReadingValue = (reading: DailyReading, categoryName: string): number => {
    if (reading[categoryName] !== undefined && reading[categoryName] !== null) {
      return Number(reading[categoryName]);
    }
    return 0;
  };

  const getCategoryUnit = (categoryName: string): string => {
    if (categoryName === 'Electricity') return 'kWh';
    if (categoryName === 'Water')       return 'm³';
    return 'units';
  };

  const handleChartDataPointClick = (
    category: CategoryChartData,
    index: number,
    isReadingData: boolean
  ) => {
    const categoryName  = getCategoryDisplayName(category.categoryName);
    const reading       = category.readings[index];
    const value         = isReadingData ? getReadingValue(reading, categoryName) : Number(reading.guests) || 0;
    const formattedDate = dayjs(reading.date).format('DD MMM YYYY');

    setSelectedChartData({
      date:           reading.date,
      value,
      guests:         Number(reading.guests) || 0,
      categoryName,
      formattedDate,
      formattedValue: isReadingData
        ? `${value.toFixed(2)} ${getCategoryUnit(categoryName)}`
        : `${value} guests`,
    });
    setShowChartPopup(true);
  };

  const buildChart = (category: CategoryChartData) => {
    const categoryName = getCategoryDisplayName(category.categoryName);
    const readingData  = category.readings.map(r => getReadingValue(r, categoryName));
    const guestData    = category.readings.map(r => Number(r.guests) || 0);
    return {
      labels: category.readings.map(r => dayjs(r.date).format('DD MMM')),
      datasets: [
        { data: readingData, color: () => '#EF4444', strokeWidth: 2, withDots: true },
        { data: guestData,   color: () => '#9333EA', strokeWidth: 2, withDots: true },
      ],
      legend: [categoryName, 'Guests'],
    };
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (viewMode === 'list') loadData();
    else loadChartData();
  }, [viewMode, selectedDate]);

  const onDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const resetDateFilter = useCallback(() => {
    setDateFilterEnabled(false);
    setStartDate(null);
    setEndDate(null);
    setFilterModalVisible(false);
  }, []);

  const applyDateFilter = useCallback(() => {
    if (!startDate || !endDate) { Alert.alert('Error', 'Please select both dates'); return; }
    if (startDate > endDate)    { Alert.alert('Error', 'Start date must be before end date'); return; }
    setDateFilterEnabled(true);
    setFilterModalVisible(false);
  }, [startDate, endDate]);

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      const opts = { mediaTypes: ['images' as const], allowsEditing: true, aspect: [4, 3] as [number, number], quality: 0.7 };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        setFormData(prev => ({ ...prev, utility_image: uri }));
      }
    } catch { Alert.alert('Error', 'Failed to pick image'); }
  };

  const showImagePickerOptions = () => {
    Alert.alert('Select Image', 'Choose an option', [
      { text: 'Take Photo',          onPress: () => pickImage('camera') },
      { text: 'Choose from Gallery', onPress: () => pickImage('gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const checkDuplicate = (date: Date, catId: number, excludeId: number | null = null) => {
    const ds = date.toISOString().split('T')[0];
    return utilities.some(item => item.date === ds && Number(item.u_category_id) === catId && item.id !== excludeId);
  };

  const handleEdit = async (id: number) => {
    try {
      const utility = await utilityService.getUtilityById(id);
      const [y, m, d] = utility.date.split('-').map(Number);
      setFormData({ date: new Date(y, m - 1, d), u_category: Number(utility.u_category_id), startreading: utility.startreading, utility_image: null });
      setExistingImage(utility.image);
      setImageUri(getImageUrl(utility.image));
      setEditingId(id);
      setIsEditMode(true);
      setModalVisible(true);
    } catch (error: any) { Alert.alert('Error', error.message || 'Failed to load utility data'); }
  };

  const handleSubmit = async () => {
    if (!formData.startreading.trim())           { Alert.alert('Error', 'Please enter meter reading'); return; }
    if (!isEditMode && !formData.utility_image)  { Alert.alert('Error', 'Please select an image'); return; }
    if (formData.u_category === 0)               { Alert.alert('Error', 'Please select a category'); return; }
    if (!isEditMode && checkDuplicate(formData.date, formData.u_category)) {
      const catName = categories.find(c => c.id === formData.u_category)?.utility_category_name ?? 'this category';
      const dateStr = formData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      Alert.alert('Duplicate Entry', `A reading for ${catName} on ${dateStr} already exists.`);
      return;
    }
    try {
      setSubmitting(true);
      const fd = new FormData();
      if (isEditMode && editingId) fd.append('id', editingId.toString());
      fd.append('date', formData.date.toISOString().split('T')[0]);
      fd.append('u_category', formData.u_category.toString());
      fd.append('startreading', formData.startreading);
      if (formData.utility_image) {
        const filename = formData.utility_image.split('/').pop() || 'utility_image.jpg';
        const ext = /\.(\w+)$/.exec(filename);
        fd.append('utility_image', { uri: formData.utility_image, name: filename, type: ext ? `image/${ext[1]}` : 'image/jpeg' } as any);
      } else if (isEditMode && existingImage) {
        fd.append('existing_image', existingImage);
      }
      if (isEditMode && editingId) await utilityService.updateUtility(editingId, fd as any);
      else                         await utilityService.saveUtility(fd as any);
      setModalVisible(false);
      setTimeout(() => {
        Alert.alert('Success', isEditMode ? 'Updated successfully' : 'Added successfully', [{
          text: 'OK', onPress: () => { resetForm(); loadData(); if (viewMode === 'summary') loadChartData(); }
        }]);
      }, 300);
    } catch (error: any) { Alert.alert('Error', error.message || 'Failed to save');
    } finally { setSubmitting(false); }
  };

  const resetForm = useCallback(() => {
    setFormData({ date: new Date(), u_category: categories[0]?.id ?? 0, startreading: '', utility_image: null });
    setImageUri(null); setExistingImage(null); setIsEditMode(false); setEditingId(null);
  }, [categories]);

  const handleDelete = (id: number) => {
    Alert.alert('Delete Utility', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await utilityService.deleteUtility(id);
          Alert.alert('Success', 'Utility record deleted');
          loadData();
          if (viewMode === 'summary') loadChartData();
        } catch (error: any) { Alert.alert('Error', error.message || 'Failed to delete'); }
      }},
    ]);
  };

  const formatDate     = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatDateTime = (s: string) => new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  const formatMonthYear = (d: Date)  => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  const getImageUrl = (p: string | null) => {
    if (!p) return '';
    if (p.startsWith('http') || p.startsWith('data:')) return p;
    return `https://app.trackerstay.com/storage/${p}`;
  };

  // ── Chart Popup ──────────────────────────────────────────────────────────
  // Simplified: only show Reading Value + Guests (like web version)
  const renderChartPopup = () => {
    if (!selectedChartData) return null;
    const categoryColor = CHART_COLORS[selectedChartData.categoryName as keyof typeof CHART_COLORS] || '#6B5B95';
    const unit = getCategoryUnit(selectedChartData.categoryName);

    return (
      <Modal visible={showChartPopup} transparent animationType="fade" onRequestClose={() => setShowChartPopup(false)}>
        <TouchableOpacity style={styles.popupOverlay} activeOpacity={1} onPress={() => setShowChartPopup(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.popupCard}>

              {/* Date header */}
              <View style={[styles.popupDateBadge, { backgroundColor: categoryColor }]}>
                <Ionicons name="calendar-outline" size={14} color="#fff" />
                <Text style={styles.popupDateText}>{selectedChartData.formattedDate}</Text>
              </View>

              {/* Reading value row - red dot like web */}
              <View style={styles.popupRow}>
                <View style={styles.popupRowLeft}>
                  <View style={[styles.popupDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.popupRowLabel}>{selectedChartData.categoryName}</Text>
                </View>
                <View style={[styles.popupValueBadge, { backgroundColor: '#FEF2F2' }]}>
                  <Text style={[styles.popupValueText, { color: '#EF4444' }]}>
                    {selectedChartData.value.toFixed(2)} {unit}
                  </Text>
                </View>
              </View>

              {/* Guest count row - purple dot like web */}
              <View style={styles.popupRow}>
                <View style={styles.popupRowLeft}>
                  <View style={[styles.popupDot, { backgroundColor: '#9333EA' }]} />
                  <Text style={styles.popupRowLabel}>Guests</Text>
                </View>
                <View style={[styles.popupValueBadge, { backgroundColor: '#F5F3FF' }]}>
                  <Text style={[styles.popupValueText, { color: '#9333EA' }]}>
                    {selectedChartData.guests} {selectedChartData.guests === 1 ? 'guest' : 'guests'}
                  </Text>
                </View>
              </View>

            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderUtilityCard = useCallback(({ item }: { item: UtilityItem }) => (
    <View style={styles.utilityCard}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.categoryBadge}>
            <Ionicons name="flash" size={16} color="#6B5B95" />
            <Text style={styles.categoryText}>{item.u_category}</Text>
          </View>
          <View style={styles.userBadge}>
            <Ionicons name="person" size={14} color="#6B7280" />
            <Text style={styles.userName}>{item.user.name} {item.user.lname}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      {item.image && <Image source={{ uri: getImageUrl(item.image) }} style={styles.utilityImage} resizeMode="cover" />}
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="speedometer-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>Reading: {item.startreading}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#10B981" />
          <Text style={[styles.infoText, { color: '#10B981' }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>
          {item.created_at !== item.updated_at ? 'Updated: ' : 'Added: '}
          {formatDateTime(item.created_at !== item.updated_at ? item.updated_at : item.created_at)}
        </Text>
      </View>
    </View>
  ), []);

  const keyExtractor = useCallback((item: UtilityItem) => item.id.toString(), []);

  return (
    <View style={styles.container}>
      <DashboardHeader
        title="Utility Management"
        subtitle={viewMode === 'list' ? 'Track and manage utility readings' : `${formatMonthYear(selectedDate)} - Dashboard`}
        currentPage="utility"
      />

      <View style={styles.viewToggleContainer}>
        {(['summary', 'list'] as const).map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.toggleButton, viewMode === mode && styles.toggleButtonActive]}
            onPress={() => setViewMode(mode)}
          >
            <Ionicons name={mode === 'summary' ? 'bar-chart' : 'list'} size={20} color={viewMode === mode ? '#FFFFFF' : '#6B5B95'} />
            <Text style={[styles.toggleText, viewMode === mode && styles.toggleTextActive]}>
              {mode === 'summary' ? 'Summary' : 'List View'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {viewMode === 'list' ? (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by user, reading, category..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.dateFilterButton, dateFilterEnabled && styles.dateFilterButtonActive]}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons name="calendar" size={20} color={dateFilterEnabled ? '#FFFFFF' : '#6B5B95'} />
              {dateFilterEnabled && <View style={styles.filterBadge} />}
            </TouchableOpacity>
          </View>

          {dateFilterEnabled && startDate && endDate && (
            <View style={styles.activeDateFilter}>
              <View style={styles.dateFilterInfo}>
                <Ionicons name="calendar-outline" size={16} color="#6B5B95" />
                <Text style={styles.dateFilterText}>
                  {formatDate(startDate.toISOString())} – {formatDate(endDate.toISOString())}
                </Text>
              </View>
              <TouchableOpacity onPress={resetDateFilter}>
                <Ionicons name="close-circle" size={20} color="#6B5B95" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
              <TouchableOpacity
                onPress={() => setActiveFilter('all')}
                style={[styles.filterButton, activeFilter === 'all' && styles.activeFilterButton]}
              >
                <Ionicons name="apps" size={16} color={activeFilter === 'all' ? '#FFFFFF' : '#6B5B95'} />
                <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
                  All ({utilities.length})
                </Text>
              </TouchableOpacity>
              {categories.map(cat => {
                const isActive = activeFilter === cat.id;
                const count = utilities.filter(u => Number(u.u_category_id) === cat.id).length;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setActiveFilter(isActive ? 'all' : cat.id)}
                    style={[styles.filterButton, isActive && styles.activeFilterButton]}
                  >
                    <Ionicons name="flash" size={16} color={isActive ? '#FFFFFF' : '#6B5B95'} />
                    <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                      {cat.utility_category_name} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {filteredUtilities.length} {filteredUtilities.length === 1 ? 'result' : 'results'}
              {activeFilter !== 'all' && ` · ${categories.find(c => c.id === activeFilter)?.utility_category_name}`}
            </Text>
          </View>

          <FlatList
            data={filteredUtilities}
            keyExtractor={keyExtractor}
            renderItem={renderUtilityCard}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B5B95" colors={['#6B5B95']} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="flash-outline" size={60} color="#6B5B95" />
                <Text style={styles.emptyText}>No Utilities Found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery || dateFilterEnabled ? 'Try adjusting your filters' : 'Add your first utility reading'}
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </>
      ) : (
        <ScrollView
          style={styles.summaryContent}
          contentContainerStyle={styles.summaryScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B5B95" colors={['#6B5B95']} />}
        >
          <View style={styles.summaryDateSection}>
            <Text style={styles.dateLabel}>Select Date</Text>
            <TouchableOpacity style={styles.summaryDatePicker} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#64748B" />
              <Text style={styles.summaryDateText}>{dayjs(selectedDate).format('YYYY-MM-DD')}</Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}

          {loading && viewMode === 'summary' && (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#6B5B95" />
              <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading chart data...</Text>
            </View>
          )}

          {!loading && chartData.length === 0 && (
            <View style={styles.emptyChartContainer}>
              <Ionicons name="bar-chart-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyChartTitle}>No Data Available</Text>
              <Text style={styles.emptyChartSubtitle}>
                No utility data found for {dayjs(selectedDate).format('MMMM YYYY')}
              </Text>
            </View>
          )}

          {!loading && chartData.map(category => {
            const categoryName = getCategoryDisplayName(category.categoryName);
            const cd           = getCategoryData(categoryName);
            const chartConfig  = buildChart(category);

            // ── FIXED: use safeParseFloat for comma-formatted LKR strings ──
            const chargeNum      = safeParseFloat(cd.charge);
            const billChargeNum  = safeParseFloat(cd.billCharges);
            const monthlyUnits   = typeof cd.monthlyUnits === 'number'
              ? cd.monthlyUnits
              : safeParseFloat(cd.monthlyUnits);

            return (
              <View key={category.categoryName} style={styles.chartCard}>
                {/* Header */}
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{categoryName}</Text>
                  <View style={styles.billChargesContainer}>
                    <Text style={styles.billChargesLabel}>Bill charges: </Text>
                    <Text style={styles.billAmount}>LKR {formatNumber(billChargeNum)}</Text>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Charge:</Text>
                    <Text style={styles.statValue}>LKR {formatNumber(chargeNum)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Bill Total Units:</Text>
                    <Text style={styles.statValue}>{cd.billUnits}</Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Monthly Total Units:</Text>
                    {/* FIXED: show clean number, not floating point garbage */}
                    <Text style={styles.statValue}>{formatNumber(monthlyUnits, 3)}</Text>
                  </View>
                </View>

                <View style={styles.chartInstruction}>
                  <Ionicons name="finger-print" size={14} color="#6B5B95" />
                  <Text style={styles.chartInstructionText}>Tap on any data point to see details</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator
                  style={styles.chartScrollContainer}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  <View style={{ padding: 8 }}>
                    <LineChart
                      data={chartConfig}
                      width={Math.max(width - 64, category.readings.length * 55)}
                      height={280}
                      withDots={true}
                      withShadow={false}
                      withInnerLines
                      withOuterLines
                      withVerticalLines
                      withHorizontalLines
                      bezier={chartConfig.datasets[0].data.some(v => v > 0)}
                      onDataPointClick={({ index, dataset }) => {
                        const isReadingDataset = dataset.data === chartConfig.datasets[0].data;
                        handleChartDataPointClick(category, index, isReadingDataset);
                      }}
                      chartConfig={{
                        backgroundColor: '#fff',
                        backgroundGradientFrom: '#fff',
                        backgroundGradientTo: '#fff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                        labelColor: (opacity = 1) => `rgba(71,85,105,${opacity})`,
                        style: { borderRadius: 16 },
                        propsForDots: { r: '6', strokeWidth: '2', stroke: '#fff' },
                        propsForBackgroundLines: { strokeDasharray: '', stroke: '#E2E8F0', strokeWidth: 1 },
                        propsForLabels: { fontSize: 10 },
                      }}
                      style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                  </View>
                </ScrollView>

                <View style={styles.legendContainer}>
                  <TouchableOpacity
                    style={styles.legendItem}
                    onPress={() => {
                      const idx = category.readings.findIndex(r => getReadingValue(r, categoryName) > 0);
                      handleChartDataPointClick(category, idx !== -1 ? idx : 0, true);
                    }}
                  >
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.legendText}>{categoryName}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.legendItem}
                    onPress={() => {
                      const idx = category.readings.findIndex(r => Number(r.guests) > 0);
                      handleChartDataPointClick(category, idx !== -1 ? idx : 0, false);
                    }}
                  >
                    <View style={[styles.legendDot, { backgroundColor: '#9333EA' }]} />
                    <Text style={styles.legendText}>Guests</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tapHintContainer}>
                  <Ionicons name="hand-left" size={12} color="#9CA3AF" />
                  <Text style={styles.tapHintText}>Tap dots or legend items to view details</Text>
                </View>
              </View>
            );
          })}

          <View style={{ height: 90 }} />
        </ScrollView>
      )}

      {renderChartPopup()}

      <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setModalVisible(true); }}>
        <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Date Range Filter Modal */}
      <Modal visible={filterModalVisible} animationType="slide" transparent onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Date Range</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.dateFilterForm}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Start Date</Text>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                    <Text style={styles.dateInputText}>{startDate ? formatDate(startDate.toISOString()) : 'Select start date'}</Text>
                  </TouchableOpacity>
                </View>
                {showStartDatePicker && (
                  <DateTimePicker value={startDate || new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, d) => { setShowStartDatePicker(Platform.OS === 'ios'); if (d) setStartDate(d); }} maximumDate={new Date()} />
                )}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>End Date</Text>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                    <Text style={styles.dateInputText}>{endDate ? formatDate(endDate.toISOString()) : 'Select end date'}</Text>
                  </TouchableOpacity>
                </View>
                {showEndDatePicker && (
                  <DateTimePicker value={endDate || new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, d) => { setShowEndDatePicker(Platform.OS === 'ios'); if (d) setEndDate(d); }}
                    maximumDate={new Date()} minimumDate={startDate || undefined} />
                )}
                <View style={styles.quickFiltersContainer}>
                  <Text style={styles.quickFiltersLabel}>Quick Filters</Text>
                  <View style={styles.quickFilters}>
                    {[{ label: 'Today', days: 0 }, { label: 'Last 7 Days', days: 7 }, { label: 'Last 30 Days', days: 30 }].map(({ label, days }) => (
                      <TouchableOpacity key={label} style={styles.quickFilterButton} onPress={() => {
                        const t = new Date(); const s = new Date(); s.setDate(t.getDate() - days);
                        setStartDate(s); setEndDate(t);
                      }}>
                        <Text style={styles.quickFilterText}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.filterActions}>
                  <TouchableOpacity style={styles.resetButton} onPress={resetDateFilter}>
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.applyButton} onPress={applyDateFilter}>
                    <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.applyGradient}>
                      <Text style={styles.applyButtonText}>Apply Filter</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Dropdown Modal */}
      <Modal visible={showCategoryDropdown} animationType="fade" transparent onRequestClose={() => setShowCategoryDropdown(false)}>
        <TouchableWithoutFeedback onPress={() => setShowCategoryDropdown(false)}>
          <View style={styles.dropdownOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownBox}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownTitle}>Select Category</Text>
                  <TouchableOpacity onPress={() => setShowCategoryDropdown(false)}>
                    <Ionicons name="close" size={22} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                {categories.map(cat => {
                  const isSel = formData.u_category === cat.id;
                  return (
                    <TouchableOpacity key={cat.id}
                      style={[styles.dropdownItem, isSel && styles.dropdownItemActive]}
                      onPress={() => { setFormData(prev => ({ ...prev, u_category: cat.id })); setShowCategoryDropdown(false); }}
                    >
                      <Ionicons name="flash" size={16} color={isSel ? '#6B5B95' : '#9CA3AF'} />
                      <Text style={[styles.dropdownItemText, isSel && styles.dropdownItemTextActive]}>{cat.utility_category_name}</Text>
                      {isSel && <Ionicons name="checkmark" size={18} color="#6B5B95" style={{ marginLeft: 'auto' }} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => { setModalVisible(false); resetForm(); }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.compactModalHeader}>
                  <View style={styles.compactModalTitleRow}>
                    <View style={styles.compactModalIcon}>
                      <Ionicons name={isEditMode ? 'create' : 'flash'} size={18} color="#6B5B95" />
                    </View>
                    <Text style={styles.compactModalTitle}>{isEditMode ? 'Edit Utility Reading' : 'Add Utility Reading'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }} style={styles.compactCloseBtn}>
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.compactFormScroll} keyboardShouldPersistTaps="handled">
                  <View style={styles.compactFormGroup}>
                    <Text style={styles.compactLabel}>Date</Text>
                    <TouchableOpacity style={styles.compactInput} onPress={() => setShowDatePicker(true)}>
                      <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                      <Text style={styles.compactInputText}>
                        {formData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {showDatePicker && (
                    <DateTimePicker value={formData.date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(_, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setFormData(prev => ({ ...prev, date: d })); }} />
                  )}
                  <View style={styles.compactFormGroup}>
                    <Text style={styles.compactLabel}>Category</Text>
                    <TouchableOpacity style={styles.compactInput} onPress={() => setShowCategoryDropdown(true)}>
                      <Ionicons name="flash" size={16} color="#6B5B95" />
                      <Text style={[styles.compactInputText, { flex: 1, color: formData.u_category ? '#1F2937' : '#9CA3AF' }]}>{selectedCategoryName}</Text>
                      <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.compactFormGroup}>
                    <Text style={styles.compactLabel}>Meter Reading</Text>
                    <View style={styles.compactInput}>
                      <Ionicons name="speedometer-outline" size={16} color="#6B7280" />
                      <TextInput
                        style={styles.compactTextInput}
                        placeholder="Enter reading"
                        keyboardType="numeric"
                        value={formData.startreading}
                        onChangeText={t => setFormData(prev => ({ ...prev, startreading: t }))}
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>
                  </View>
                  <View style={styles.compactFormGroup}>
                    <Text style={styles.compactLabel}>Meter Photo</Text>
                    <TouchableOpacity style={styles.compactImagePicker} onPress={showImagePickerOptions}>
                      {imageUri ? (
                        <View style={styles.compactImagePreviewRow}>
                          <Image source={{ uri: imageUri }} style={styles.compactPreviewThumb} />
                          <View style={styles.compactImageInfo}>
                            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                            <Text style={styles.compactImageInfoText}>Photo selected</Text>
                            <Text style={styles.compactImageChangeText}>Tap to change</Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.compactImageEmptyRow}>
                          <View style={styles.compactCameraIcon}>
                            <Ionicons name="camera" size={22} color="#6B5B95" />
                          </View>
                          <View>
                            <Text style={styles.compactImagePickerText}>
                              {isEditMode && existingImage ? 'Tap to change photo' : 'Take Photo / Gallery'}
                            </Text>
                            {isEditMode && existingImage && (
                              <Text style={styles.compactExistingText}>Current photo kept if not changed</Text>
                            )}
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                <View style={styles.submitFooter}>
                  <TouchableOpacity
                    style={[styles.compactSubmitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                  >
                    <LinearGradient
                      colors={submitting ? ['#9CA3AF', '#9CA3AF'] : ['#6B5B95', '#7D6BA8']}
                      style={styles.compactSubmitGradient}
                    >
                      {submitting
                        ? <ActivityIndicator color="#FFFFFF" />
                        : <>
                          <Ionicons name={isEditMode ? 'checkmark-circle' : 'add-circle'} size={18} color="#FFFFFF" />
                          <Text style={styles.compactSubmitText}>{isEditMode ? 'Update Utility' : 'Add Utility'}</Text>
                        </>
                      }
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  viewToggleContainer: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16,
    borderRadius: 12, padding: 4, flexDirection: 'row',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6 },
  toggleButtonActive: { backgroundColor: '#6B5B95' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#6B5B95' },
  toggleTextActive: { color: '#FFFFFF' },
  summaryContent: { flex: 1, backgroundColor: '#F1F5F9' },
  summaryScrollContent: { padding: 16, paddingBottom: 32 },
  summaryDateSection: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  dateLabel: { fontSize: 15, fontWeight: '600', marginBottom: 10, color: '#334155' },
  summaryDatePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8 },
  summaryDateText: { fontSize: 15, color: '#0F172A', fontWeight: '500' },
  chartCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
  categoryTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  billChargesContainer: { flexDirection: 'row', alignItems: 'center' },
  billChargesLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  billAmount: { fontSize: 15, fontWeight: '700', color: '#3B82F6' },
  statsRow: { flexDirection: 'row', gap: 20, marginBottom: 8, flexWrap: 'wrap' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  statValue: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
  chartScrollContainer: { marginTop: 16, marginBottom: 12, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  legendContainer: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F9FAFB' },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  chartInstruction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, marginBottom: 4 },
  chartInstructionText: { fontSize: 12, color: '#6B5B95', fontWeight: '500' },
  tapHintContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  tapHintText: { fontSize: 10, color: '#9CA3AF' },

  // ── Simplified popup ──────────────────────────────────────────────────────
  popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  popupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: width * 0.72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
    gap: 14,
  },
  popupDateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8,
  },
  popupDateText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  popupRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 12,
  },
  popupRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  popupDot: { width: 10, height: 10, borderRadius: 5 },
  popupRowLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  popupValueBadge: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  popupValueText: { fontSize: 13, fontWeight: '700' },

  emptyChartContainer: { backgroundColor: '#FFFFFF', padding: 40, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  emptyChartTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 16 },
  emptyChartSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1F2937' },
  dateFilterButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  dateFilterButtonActive: { backgroundColor: '#6B5B95', borderColor: '#6B5B95' },
  filterBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  activeDateFilter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  dateFilterInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateFilterText: { fontSize: 13, color: '#1F2937', fontWeight: '600' },
  filterContainer: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  filterContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', gap: 5 },
  activeFilterButton: { backgroundColor: '#6B5B95', borderColor: '#6B5B95' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#6B5B95' },
  activeFilterText: { color: '#FFFFFF' },
  resultsContainer: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  resultsText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  listContainer: { padding: 16, paddingBottom: 100 },
  emptyContainer: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { color: '#1F2937', fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: '#6B7280', fontSize: 14, marginTop: 4 },
  utilityCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 12 },
  headerLeft: { flex: 1, gap: 8 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6, alignSelf: 'flex-start' },
  categoryText: { color: '#6B5B95', fontSize: 12, fontWeight: '600' },
  userBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { color: '#1F2937', fontSize: 14, fontWeight: '600' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  editButton: { padding: 8 },
  deleteButton: { padding: 8 },
  utilityImage: { width: '100%', height: 200, backgroundColor: '#F3F4F6' },
  cardBody: { padding: 16, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { color: '#1F2937', fontSize: 14, fontWeight: '500' },
  cardFooter: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerText: { color: '#9CA3AF', fontSize: 11, fontWeight: '500' },
  fab: { position: 'absolute', bottom: 20, right: 20, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  filterModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  dateFilterForm: { padding: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, gap: 10 },
  dateInputText: { flex: 1, fontSize: 14, color: '#1F2937' },
  quickFiltersContainer: { marginTop: 10 },
  quickFiltersLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  quickFilters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quickFilterButton: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  quickFilterText: { fontSize: 12, fontWeight: '600', color: '#6B5B95' },
  filterActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  resetButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  resetButtonText: { fontSize: 14, fontWeight: '700', color: '#6B5B95' },
  applyButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  applyGradient: { paddingVertical: 14, alignItems: 'center' },
  applyButtonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  dropdownBox: { backgroundColor: '#FFFFFF', borderRadius: 16, width: '100%', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  dropdownItemActive: { backgroundColor: '#F5F3FF' },
  dropdownItemText: { fontSize: 15, color: '#374151', fontWeight: '500' },
  dropdownItemTextActive: { color: '#6B5B95', fontWeight: '700' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '82%' },
  compactModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  compactModalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  compactModalIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
  compactModalTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  compactCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  compactFormScroll: { padding: 16 },
  compactFormGroup: { marginBottom: 14 },
  compactLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  compactInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  compactInputText: { flex: 1, fontSize: 14, color: '#1F2937' },
  compactTextInput: { flex: 1, fontSize: 14, color: '#1F2937', paddingVertical: 0 },
  compactImagePicker: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#6B5B95', borderRadius: 10, overflow: 'hidden' },
  compactImageEmptyRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  compactCameraIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
  compactImagePickerText: { fontSize: 13, fontWeight: '600', color: '#6B5B95' },
  compactExistingText: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  compactImagePreviewRow: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 12 },
  compactPreviewThumb: { width: 60, height: 60, borderRadius: 8 },
  compactImageInfo: { flex: 1, gap: 3 },
  compactImageInfoText: { fontSize: 13, fontWeight: '600', color: '#10B981' },
  compactImageChangeText: { fontSize: 11, color: '#9CA3AF' },
  submitFooter: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FFFFFF', marginBottom: 80 },
  compactSubmitButton: { borderRadius: 12, overflow: 'hidden' },
  submitButtonDisabled: { opacity: 0.6 },
  compactSubmitGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
  compactSubmitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default Utility;