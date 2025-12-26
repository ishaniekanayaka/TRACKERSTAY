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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { LineChart } from 'react-native-chart-kit';
import dayjs from 'dayjs';
import utilityService, { 
  UtilityCategory, 
  UtilityItem,
  CategoryChartData,
  TotalCount,
  TotalBillCount,
} from '../../services/utilityService';

const { width } = Dimensions.get('window');

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

  // View toggle state
  const [viewMode, setViewMode] = useState<'list' | 'summary'>('list');

  // Summary view state - UPDATED
  const [chartData, setChartData] = useState<CategoryChartData[]>([]);
  const [totalCounts, setTotalCounts] = useState<TotalCount[]>([]);
  const [totalBillCounts, setTotalBillCounts] = useState<TotalBillCount[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Date filter state
  const [dateFilterEnabled, setDateFilterEnabled] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date(),
    u_category: 0,
    startreading: '',
    utility_image: null as string | null,
  });
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    requestPermissions();
  }, []);

  useEffect(() => {
    if (viewMode === 'summary') {
      loadChartData();
    }
  }, [selectedDate, viewMode]);

  const filteredUtilities = useMemo(() => {
    let filtered = utilities;
    
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.u_category_id === activeFilter);
    }
    
    if (dateFilterEnabled && startDate && endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return itemDate >= start && itemDate <= end;
      });
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const userName = `${item.user.name} ${item.user.lname}`.toLowerCase();
        const reading = item.startreading.toLowerCase();
        const category = item.u_category.toLowerCase();
        
        return userName.includes(query) || 
               reading.includes(query) ||
               category.includes(query);
      });
    }
    
    return filtered;
  }, [utilities, activeFilter, searchQuery, dateFilterEnabled, startDate, endDate]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and gallery permissions are needed to add utility images.'
      );
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [utilitiesData, categoriesData] = await Promise.all([
        utilityService.getUtilities(),
        utilityService.getCategories(),
      ]);
      
      const sorted = utilitiesData.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setUtilities(sorted);
      setCategories(categoriesData);
      
      if (categoriesData.length > 0) {
        setFormData(prev => ({ ...prev, u_category: categoriesData[0].id }));
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // UPDATED: Chart data loading function
  const loadChartData = async () => {
    try {
      setLoading(true);
      const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
      const data = await utilityService.getChartData(formattedDate);
      setChartData(data.chartData || []);
      setTotalCounts(data.total_count || []);
      setTotalBillCounts(data.total_bill_count || []);
    } catch (error: any) {
      console.error('Chart load error:', error);
      Alert.alert('Error', 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Get category data helper
  const getCategoryData = (categoryName: string) => {
    const totalCount = totalCounts.find(tc => tc.category === categoryName);
    const billCount = totalBillCounts.find(bc => bc.category === categoryName);

    return {
      charge: totalCount?.total_bill || '0.00',
      monthlyUnits: totalCount?.total_count || 0,
      billCharges: billCount?.total_BillReading || '0.00',
      billUnits: billCount?.total_bill_count || 0,
    };
  };

  // UPDATED: Build chart data
  const buildChart = (category: CategoryChartData) => {
    const labels = category.readings.map(r => dayjs(r.date).format('D'));

    const utilityValues = category.readings.map(
      r => (r[category.categoryDisplayName] as number) ?? 0
    );

    const guestValues = category.readings.map(r => r.guests ?? 0);

    return {
      labels,
      datasets: [
        {
          data: utilityValues,
          color: () => '#EF4444',
          strokeWidth: 2,
        },
        {
          data: guestValues,
          color: () => '#9333EA',
          strokeWidth: 2,
        },
      ],
      legend: [category.categoryDisplayName, 'guests'],
    };
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (viewMode === 'list') {
      loadData();
    } else {
      loadChartData();
    }
  }, [viewMode, selectedDate]);

  const onDateChange = (event: any, date?: Date) => {
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
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end dates');
      return;
    }
    
    if (startDate > endDate) {
      Alert.alert('Error', 'Start date must be before end date');
      return;
    }
    
    setDateFilterEnabled(true);
    setFilterModalVisible(false);
  }, [startDate, endDate]);

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      let result;
      
      const options = {
        mediaTypes: ['images' as const],
        allowsEditing: true,
        aspect: [4, 3] as [number, number],
        quality: 0.7,
      };
      
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setFormData(prev => ({
          ...prev,
          utility_image: asset.uri,
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickImage('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const checkDuplicateEntry = (date: Date, categoryId: number, excludeId: number | null = null): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return utilities.some(
      item => item.date === dateStr && 
              item.u_category_id === categoryId && 
              item.id !== excludeId
    );
  };

  const handleEdit = async (id: number) => {
    try {
      const utility = await utilityService.getUtilityById(id);
      
      const dateParts = utility.date.split('-');
      const utilityDate = new Date(
        parseInt(dateParts[0]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[2])
      );

      setFormData({
        date: utilityDate,
        u_category: utility.u_category_id,
        startreading: utility.startreading,
        utility_image: null,
      });

      setExistingImage(utility.image);
      setImageUri(getImageUrl(utility.image));
      setEditingId(id);
      setIsEditMode(true);
      setModalVisible(true);
    } catch (error: any) {
      console.error('Error loading utility for edit:', error);
      Alert.alert('Error', error.message || 'Failed to load utility data');
    }
  };

  const handleSubmit = async () => {
    if (!formData.startreading.trim()) {
      Alert.alert('Error', 'Please enter meter reading');
      return;
    }

    if (!isEditMode && !formData.utility_image) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    if (formData.u_category === 0) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!isEditMode) {
      const isDuplicate = checkDuplicateEntry(formData.date, formData.u_category);
      if (isDuplicate) {
        const categoryName = categories.find(c => c.id === formData.u_category)?.utility_category_name || 'this category';
        const dateStr = formData.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        
        Alert.alert(
          'Duplicate Entry',
          `A utility reading for ${categoryName} on ${dateStr} already exists. Please choose a different date or category.`,
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      
      const formDataToSend = new FormData();
      
      if (isEditMode && editingId) {
        formDataToSend.append('id', editingId.toString());
      }
      
      formDataToSend.append('date', formData.date.toISOString().split('T')[0]);
      formDataToSend.append('u_category', formData.u_category.toString());
      formDataToSend.append('startreading', formData.startreading);
      
      if (formData.utility_image) {
        const filename = formData.utility_image.split('/').pop() || 'utility_image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formDataToSend.append('utility_image', {
          uri: formData.utility_image,
          name: filename,
          type: type,
        } as any);
      }

      await utilityService.saveUtility(formDataToSend as any);
      
      setModalVisible(false);
      
      setTimeout(() => {
        Alert.alert(
          'Success', 
          isEditMode ? 'Utility record updated successfully' : 'Utility record added successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                loadData();
                if (viewMode === 'summary') {
                  loadChartData();
                }
              }
            }
          ]
        );
      }, 300);
      
    } catch (error: any) {
      console.error('Error saving utility:', error);
      Alert.alert('Error', error.message || 'Failed to save utility record');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      date: new Date(),
      u_category: categories.length > 0 ? categories[0].id : 0,
      startreading: '',
      utility_image: null,
    });
    setImageUri(null);
    setExistingImage(null);
    setIsEditMode(false);
    setEditingId(null);
  }, [categories]);

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Utility',
      'Are you sure you want to delete this utility record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await utilityService.deleteUtility(id);
              Alert.alert('Success', 'Utility record deleted');
              loadData();
              if (viewMode === 'summary') {
                loadChartData();
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete utility');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    return `https://demo.trackerstay.com/storage/${imagePath}`;
  };

  const renderUtilityCard = useCallback(({ item }: { item: UtilityItem }) => {
    const fullName = `${item.user.name} ${item.user.lname}`;
    
    return (
      <View style={styles.utilityCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.categoryBadge}>
              <Ionicons name="flash" size={16} color="#6B5B95" />
              <Text style={styles.categoryText}>{item.u_category}</Text>
            </View>
            <View style={styles.userBadge}>
              <Ionicons name="person" size={14} color="#6B7280" />
              <Text style={styles.userName}>{fullName}</Text>
            </View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => handleEdit(item.id)}
              style={styles.editButton}
            >
              <Ionicons name="create-outline" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {item.image && (
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={styles.utilityImage}
            resizeMode="cover"
          />
        )}

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
    );
  }, []);

  const keyExtractor = useCallback((item: UtilityItem) => item.id.toString(), []);

  if (loading && !refreshing && viewMode === 'list') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B5B95" />
        <Text style={styles.loadingText}>Loading utilities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Utility Management</Text>
          <Text style={styles.headerSubtitle}>
            {viewMode === 'list' ? 'Track and manage utility readings' : `${formatMonthYear(selectedDate)} - Dashboard`}
          </Text>
        </View>
        
        {/* View Toggle Buttons */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={20} color={viewMode === 'list' ? '#FFFFFF' : '#6B5B95'} />
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              List View
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'summary' && styles.toggleButtonActive]}
            onPress={() => setViewMode('summary')}
          >
            <Ionicons name="bar-chart" size={20} color={viewMode === 'summary' ? '#FFFFFF' : '#6B5B95'} />
            <Text style={[styles.toggleText, viewMode === 'summary' && styles.toggleTextActive]}>
              Summary
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {viewMode === 'list' ? (
        <>
          {/* Search and Filter Bar */}
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
              <Ionicons 
                name="calendar" 
                size={20} 
                color={dateFilterEnabled ? "#FFFFFF" : "#6B5B95"} 
              />
              {dateFilterEnabled && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>●</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Active Date Filter Display */}
          {dateFilterEnabled && startDate && endDate && (
            <View style={styles.activeDateFilter}>
              <View style={styles.dateFilterInfo}>
                <Ionicons name="calendar-outline" size={16} color="#6B5B95" />
                <Text style={styles.dateFilterText}>
                  {formatDate(startDate.toISOString())} - {formatDate(endDate.toISOString())}
                </Text>
              </View>
              <TouchableOpacity onPress={resetDateFilter}>
                <Ionicons name="close-circle" size={20} color="#6B5B95" />
              </TouchableOpacity>
            </View>
          )}

          {/* Category Filter */}
          <View style={styles.filterContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
            >
              <TouchableOpacity
                onPress={() => setActiveFilter('all')}
                style={[
                  styles.filterButton,
                  activeFilter === 'all' && styles.activeFilterButton
                ]}
              >
                <Ionicons 
                  name="apps" 
                  size={16} 
                  color={activeFilter === 'all' ? '#FFFFFF' : '#6B5B95'} 
                />
                <Text style={[
                  styles.filterText,
                  activeFilter === 'all' && styles.activeFilterText
                ]}>
                  All Utilities
                </Text>
              </TouchableOpacity>

              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setActiveFilter(category.id)}
                  style={[
                    styles.filterButton,
                    activeFilter === category.id && styles.activeFilterButton
                ]}
                >
                  <Ionicons 
                    name="flash" 
                    size={16} 
                    color={activeFilter === category.id ? '#FFFFFF' : '#6B5B95'} 
                  />
                  <Text style={[
                    styles.filterText,
                    activeFilter === category.id && styles.activeFilterText
                  ]}>
                    {category.utility_category_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Results Count */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {filteredUtilities.length} {filteredUtilities.length === 1 ? 'result' : 'results'}
            </Text>
          </View>

          {/* Utilities List */}
          <FlatList
            data={filteredUtilities}
            keyExtractor={keyExtractor}
            renderItem={renderUtilityCard}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#6B5B95"
                colors={['#6B5B95']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="flash-outline" size={60} color="#6B5B95" />
                <Text style={styles.emptyText}>No Utilities Found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery || dateFilterEnabled 
                    ? 'Try adjusting your filters' 
                    : 'Add your first utility reading'}
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </>
      ) : (
        /* UPDATED SUMMARY VIEW */
        <ScrollView 
          style={styles.summaryContent}
          contentContainerStyle={styles.summaryScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6B5B95"
              colors={['#6B5B95']}
            />
          }
        >
          {/* Date Picker Section */}
          <View style={styles.summaryDateSection}>
            <Text style={styles.dateLabel}>Select Month</Text>
            <TouchableOpacity
              style={styles.summaryDatePicker}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#64748B" />
              <Text style={styles.summaryDateText}>
                {dayjs(selectedDate).format('YYYY-MM-DD')}
              </Text>
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

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6B5B95" />
            </View>
          )}

          {/* Charts */}
          {chartData.map((category) => {
            const categoryData = getCategoryData(category.categoryDisplayName);

            return (
              <View key={category.categoryName} style={styles.chartCard}>
                {/* Category Header */}
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>
                    {category.categoryDisplayName}
                  </Text>
                  <Text style={styles.billCharges}>
                    Bill charges :{' '}
                    <Text style={styles.billAmount}>
                      LKR {parseFloat(categoryData.billCharges).toFixed(2)}
                    </Text>
                  </Text>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <Text style={styles.statText}>
                    Charge : LKR {parseFloat(categoryData.charge).toFixed(2)}
                  </Text>
                  <Text style={styles.statText}>
                    Bill Total Units : {categoryData.billUnits}
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statText}>
                    Monthly Total Units : {categoryData.monthlyUnits}
                  </Text>
                </View>

                {/* Chart */}
                <View style={styles.chartContainer}>
                  <LineChart
                    data={buildChart(category)}
                    width={width - 64}
                    height={280}
                    withDots
                    withShadow={false}
                    withInnerLines
                    withOuterLines
                    withVerticalLines
                    withHorizontalLines
                    bezier
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: '5',
                        strokeWidth: '2',
                        stroke: '#ffffff',
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: '',
                        stroke: '#E2E8F0',
                        strokeWidth: 1,
                      },
                    }}
                    style={styles.chart}
                  />
                </View>

                {/* Legend */}
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.legendText}>
                      {category.categoryDisplayName}
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#9333EA' }]} />
                    <Text style={styles.legendText}>guests</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Add Button - Only show in list view */}
      {viewMode === 'list' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <LinearGradient
            colors={['#6B5B95', '#7D6BA8']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Date Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
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
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                    <Text style={styles.dateInputText}>
                      {startDate 
                        ? formatDate(startDate.toISOString())
                        : 'Select start date'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowStartDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setStartDate(selectedDate);
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}

                <View style={styles.formGroup}>
                  <Text style={styles.label}>End Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                    <Text style={styles.dateInputText}>
                      {endDate 
                        ? formatDate(endDate.toISOString())
                        : 'Select end date'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowEndDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setEndDate(selectedDate);
                      }
                    }}
                    maximumDate={new Date()}
                    minimumDate={startDate || undefined}
                  />
                )}

                <View style={styles.quickFiltersContainer}>
                  <Text style={styles.quickFiltersLabel}>Quick Filters</Text>
                  <View style={styles.quickFilters}>
                    <TouchableOpacity
                      style={styles.quickFilterButton}
                      onPress={() => {
                        const today = new Date();
                        setStartDate(today);
                        setEndDate(today);
                      }}
                    >
                      <Text style={styles.quickFilterText}>Today</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.quickFilterButton}
                      onPress={() => {
                        const today = new Date();
                        const weekAgo = new Date();
                        weekAgo.setDate(today.getDate() - 7);
                        setStartDate(weekAgo);
                        setEndDate(today);
                      }}
                    >
                      <Text style={styles.quickFilterText}>Last 7 Days</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.quickFilterButton}
                      onPress={() => {
                        const today = new Date();
                        const monthAgo = new Date();
                        monthAgo.setMonth(today.getMonth() - 1);
                        setStartDate(monthAgo);
                        setEndDate(today);
                      }}
                    >
                      <Text style={styles.quickFilterText}>Last 30 Days</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.filterActions}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetDateFilter}
                  >
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={applyDateFilter}
                  >
                    <LinearGradient
                      colors={['#6B5B95', '#7D6BA8']}
                      style={styles.applyGradient}
                    >
                      <Text style={styles.applyButtonText}>Apply Filter</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Utility Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditMode ? 'Edit Utility Reading' : 'Add Utility Reading'}
              </Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                resetForm();
              }}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                  <Text style={styles.inputText}>
                    {formData.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={formData.date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setFormData(prev => ({ ...prev, date: selectedDate }));
                    }
                  }}
                />
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.u_category}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, u_category: value }))
                    }
                    style={styles.picker}
                  >
                    {categories.map((category) => (
                      <Picker.Item
                        key={category.id}
                        label={category.utility_category_name}
                        value={category.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Meter Reading</Text>
                <View style={styles.input}>
                  <Ionicons name="speedometer-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter reading"
                    keyboardType="numeric"
                    value={formData.startreading}
                    onChangeText={(text) =>
                      setFormData(prev => ({ ...prev, startreading: text }))
                    }
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Meter Photo</Text>
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={showImagePickerOptions}
                >
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.imagePickerContent}>
                      <Ionicons name="camera" size={40} color="#6B5B95" />
                      <Text style={styles.imagePickerText}>
                        {isEditMode && existingImage ? 
                          'Click to change photo' : 
                          'Take Photo or Choose from Gallery'}
                      </Text>
                      {isEditMode && existingImage && (
                        <Text style={styles.existingImageText}>
                          Current photo will be kept if no new photo selected
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <LinearGradient
                  colors={submitting ? ['#9CA3AF', '#9CA3AF'] : ['#6B5B95', '#7D6BA8']}
                  style={styles.submitGradient}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons 
                        name={isEditMode ? "checkmark-circle" : "add-circle"} 
                        size={20} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.submitText}>
                        {isEditMode ? 'Update Utility' : 'Add Utility'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E9D5FF',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toggleTextActive: {
    color: '#6B5B95',
  },
  summaryContent: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  summaryScrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryDateSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    color: '#334155',
  },
  summaryDatePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  summaryDateText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  billCharges: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
    marginBottom: 6,
  },
  statText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  chartContainer: {
    marginTop: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  dateFilterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateFilterButtonActive: {
    backgroundColor: '#6B5B95',
    borderColor: '#6B5B95',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  filterBadgeText: {
    fontSize: 8,
    color: '#10B981',
  },
  activeDateFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateFilterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateFilterText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: '#6B5B95',
    borderColor: '#6B5B95',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B5B95',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  utilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#6B5B95',
    fontSize: 12,
    fontWeight: '600',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  utilityImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  cardBody: {
    padding: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  dateFilterForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  dateInputText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  quickFiltersContainer: {
    marginTop: 10,
  },
  quickFiltersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  quickFilterButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B5B95',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B5B95',
  },
  applyButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  imagePicker: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6B5B95',
    borderRadius: 12,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePickerContent: {
    alignItems: 'center',
    gap: 8,
    padding: 20,
  },
  imagePickerText: {
    color: '#6B5B95',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  existingImageText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  submitButton: {
    marginTop: 30,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default Utility;