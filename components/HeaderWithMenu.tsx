// components/DashboardHeader.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { logout, getCurrentUser } from '../services/authService';

const { width } = Dimensions.get('window');

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  currentPage: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  currentPage,
}) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  
  const menuAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      title: 'Home',
      icon: 'home',
      route: '/dashboard/home',
    },
    {
      id: 'bookings',
      title: 'Bookings',
      icon: 'calendar',
      route: '/dashboard/bookings',
    },
    {
      id: 'utility',
      title: 'Utility',
      icon: 'flash',
      route: '/dashboard/utility',
    },
  ];

  useEffect(() => {
    if (menuVisible) {
      loadUserData();
      Animated.parallel([
        Animated.timing(menuAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(menuAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [menuVisible]);

  const loadUserData = async () => {
    try {
      setLoadingUser(true);
      const response = await getCurrentUser();
      if (response && response.user) {
        setUserData(response.user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleMenuItemPress = (route: string, itemId: string) => {
    if (itemId !== currentPage) {
      setMenuVisible(false);
      setTimeout(() => {
        router.push(route as any);
      }, 300);
    } else {
      setMenuVisible(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              setMenuVisible(false);
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string = 'User') => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.menuButton}
              activeOpacity={0.8}
            >
              <Ionicons name="menu" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Side Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalBackground,
              {
                opacity: menuAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backgroundTouchable}
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.menuContainer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Header with Gradient Background - Sticky */}
            <LinearGradient
              colors={['rgba(107, 91, 149, 0.95)', 'rgba(125, 107, 168, 0.95)']}
              style={styles.menuHeader}
            >
              <View style={styles.menuHeaderContent}>
                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingText}>{getGreeting()}</Text>
                  <Text style={styles.welcomeText}>Welcome Back!</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setMenuVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={26} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* User Info Section - Sticky */}
            <View style={styles.userInfoSection}>
              {loadingUser ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#6B5B95" />
                </View>
              ) : userData ? (
                <>
                  <View style={styles.userAvatar}>
                    <LinearGradient
                      colors={['#6B5B95', '#8B7BAF']}
                      style={styles.avatarGradient}
                    >
                      <Text style={styles.userAvatarText}>
                        {getInitials(userData.name)}
                      </Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {userData.name} {userData.lname}
                    </Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>
                    {userData.hotel?.hotel_name && (
                      <View style={styles.hotelBadge}>
                        <Ionicons name="business" size={12} color="#6B5B95" />
                        <Text style={styles.userHotel}>
                          {userData.hotel.hotel_name}
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.userPlaceholder}>
                  <Ionicons name="person-circle" size={50} color="#9CA3AF" />
                  <Text style={styles.userPlaceholderText}>Loading Profile...</Text>
                </View>
              )}
            </View>

            {/* Scrollable Menu Content */}
            <ScrollView 
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.menuContent}>
                <Text style={styles.menuSectionTitle}>NAVIGATION</Text>
                {menuItems.map((item) => {
                  const isActive = item.id === currentPage;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleMenuItemPress(item.route, item.id)}
                      style={[
                        styles.menuItem,
                        isActive && styles.menuItemActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.menuIconContainer,
                          isActive && styles.menuIconContainerActive,
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={22}
                          color={isActive ? '#FFFFFF' : '#6B5B95'}
                        />
                      </View>
                      <Text
                        style={[
                          styles.menuItemText,
                          isActive && styles.menuItemTextActive,
                        ]}
                      >
                        {item.title}
                      </Text>
                      {isActive && (
                        <View style={styles.activeIndicator}>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#FFFFFF"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Logout Button - Sticky at Bottom */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <View style={styles.logoutIconContainer}>
                  <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                </View>
                <Text style={styles.logoutText}>Logout</Text>
                <Ionicons name="arrow-forward" size={18} color="#EF4444" />
              </TouchableOpacity>

              <View style={styles.menuFooter}>
                <Ionicons name="information-circle-outline" size={14} color="#9CA3AF" />
                <Text style={styles.menuFooterText}>
                  Tap outside to close menu
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 24,
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
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
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
  modalOverlay: {
    flex: 1,
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backgroundTouchable: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.82,
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  menuHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 2,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  hotelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  userHotel: {
    fontSize: 11,
    color: '#6B5B95',
    fontWeight: '600',
  },
  userPlaceholder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  menuContent: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: '#6B5B95',
    shadowColor: '#6B5B95',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  menuItemTextActive: {
    color: '#FFFFFF',
  },
  activeIndicator: {
    marginLeft: 'auto',
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    gap: 12,
    marginBottom: 12,
  },
  logoutIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  menuFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  menuFooterText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default DashboardHeader;
