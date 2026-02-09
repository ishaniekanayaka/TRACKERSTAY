// // components/DashboardHeader.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Animated,
//   Modal,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';

// const { width } = Dimensions.get('window');

// interface MenuItem {
//   id: string;
//   title: string;
//   icon: keyof typeof Ionicons.glyphMap;
//   route: string;
// }

// interface DashboardHeaderProps {
//   title: string;
//   subtitle: string;
//   currentPage: string;
// }

// const DashboardHeader: React.FC<DashboardHeaderProps> = ({
//   title,
//   subtitle,
//   currentPage,
// }) => {
//   const router = useRouter();
//   const [menuVisible, setMenuVisible] = useState(false);
//   const menuAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(-300)).current;

//   const menuItems: MenuItem[] = [
//     {
//       id: 'home',
//       title: 'Home',
//       icon: 'home',
//       route: '/dashboard/home',
//     },
//     {
//       id: 'utility',
//       title: 'Utility',
//       icon: 'flash',
//       route: '/dashboard/utility',
//     },
//     {
//       id: 'notification',
//       title: 'Notifications',
//       icon: 'notifications',
//       route: '/dashboard/notification',
//     },
//   ];

//   useEffect(() => {
//     if (menuVisible) {
//       Animated.parallel([
//         Animated.timing(menuAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//         Animated.spring(slideAnim, {
//           toValue: 0,
//           useNativeDriver: true,
//           tension: 50,
//           friction: 8,
//         }),
//       ]).start();
//     } else {
//       Animated.parallel([
//         Animated.timing(menuAnim, {
//           toValue: 0,
//           duration: 250,
//           useNativeDriver: true,
//         }),
//         Animated.timing(slideAnim, {
//           toValue: -300,
//           duration: 250,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }
//   }, [menuVisible]);

//   const handleMenuItemPress = (route: string, itemId: string) => {
//     if (itemId !== currentPage) {
//       setMenuVisible(false);
//       setTimeout(() => {
//         router.push(route as any);
//       }, 300);
//     } else {
//       setMenuVisible(false);
//     }
//   };

//   return (
//     <>
//       <LinearGradient colors={['#6B5B95', '#7D6BA8']} style={styles.header}>
//         <View style={styles.headerContent}>
//           <View style={styles.headerTop}>
//             <TouchableOpacity
//               onPress={() => setMenuVisible(true)}
//               style={styles.menuButton}
//               activeOpacity={0.8}
//             >
//               <Ionicons name="menu" size={28} color="#FFFFFF" />
//             </TouchableOpacity>

//             <View style={styles.titleContainer}>
//               <Text style={styles.headerTitle}>{title}</Text>
//               <Text style={styles.headerSubtitle}>{subtitle}</Text>
//             </View>
//           </View>
//         </View>
//       </LinearGradient>

//       {/* Side Menu Modal */}
//       <Modal
//         visible={menuVisible}
//         transparent={true}
//         animationType="none"
//         onRequestClose={() => setMenuVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <Animated.View
//             style={[
//               styles.modalBackground,
//               {
//                 opacity: menuAnim,
//               },
//             ]}
//           >
//             <TouchableOpacity
//               style={styles.backgroundTouchable}
//               activeOpacity={1}
//               onPress={() => setMenuVisible(false)}
//             />
//           </Animated.View>

//           <Animated.View
//             style={[
//               styles.menuContainer,
//               {
//                 transform: [{ translateX: slideAnim }],
//               },
//             ]}
//           >
//             <LinearGradient
//               colors={['#6B5B95', '#7D6BA8']}
//               style={styles.menuHeader}
//             >
//               <Text style={styles.menuHeaderTitle}>Navigation</Text>
//               <TouchableOpacity
//                 onPress={() => setMenuVisible(false)}
//                 style={styles.closeButton}
//               >
//                 <Ionicons name="close" size={28} color="#FFFFFF" />
//               </TouchableOpacity>
//             </LinearGradient>

//             <View style={styles.menuContent}>
//               {menuItems.map((item, index) => {
//                 const isActive = item.id === currentPage;
//                 return (
//                   <TouchableOpacity
//                     key={item.id}
//                     onPress={() => handleMenuItemPress(item.route, item.id)}
//                     style={[
//                       styles.menuItem,
//                       isActive && styles.menuItemActive,
//                     ]}
//                     activeOpacity={0.7}
//                   >
//                     <View
//                       style={[
//                         styles.menuIconContainer,
//                         isActive && styles.menuIconContainerActive,
//                       ]}
//                     >
//                       <Ionicons
//                         name={item.icon}
//                         size={24}
//                         color={isActive ? '#FFFFFF' : '#6B5B95'}
//                       />
//                     </View>
//                     <Text
//                       style={[
//                         styles.menuItemText,
//                         isActive && styles.menuItemTextActive,
//                       ]}
//                     >
//                       {item.title}
//                     </Text>
//                     {isActive && (
//                       <View style={styles.activeIndicator}>
//                         <Ionicons
//                           name="checkmark-circle"
//                           size={20}
//                           color="#10B981"
//                         />
//                       </View>
//                     )}
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>

//             <View style={styles.menuFooter}>
//               <View style={styles.menuFooterContent}>
//                 <Ionicons name="information-circle" size={20} color="#6B7280" />
//                 <Text style={styles.menuFooterText}>
//                   Swipe right or tap outside to close
//                 </Text>
//               </View>
//             </View>
//           </Animated.View>
//         </View>
//       </Modal>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     paddingTop: 50,
//     paddingBottom: 24,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   headerContent: {
//     gap: 16,
//   },
//   headerTop: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//   },
//   menuButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   titleContainer: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#E9D5FF',
//   },
//   modalOverlay: {
//     flex: 1,
//   },
//   modalBackground: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   backgroundTouchable: {
//     flex: 1,
//   },
//   menuContainer: {
//     position: 'absolute',
//     left: 0,
//     top: 0,
//     bottom: 0,
//     width: width * 0.75,
//     maxWidth: 300,
//     backgroundColor: '#FFFFFF',
//     shadowColor: '#000',
//     shadowOffset: { width: 2, height: 0 },
//     shadowOpacity: 0.25,
//     shadowRadius: 12,
//     elevation: 10,
//   },
//   menuHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: 50,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//   },
//   menuHeaderTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#FFFFFF',
//   },
//   closeButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   menuContent: {
//     flex: 1,
//     paddingTop: 20,
//     paddingHorizontal: 16,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     marginBottom: 8,
//     backgroundColor: '#F9FAFB',
//     gap: 16,
//   },
//   menuItemActive: {
//     backgroundColor: '#6B5B95',
//   },
//   menuIconContainer: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     backgroundColor: '#F3F4F6',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   menuIconContainerActive: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   menuItemText: {
//     flex: 1,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   menuItemTextActive: {
//     color: '#FFFFFF',
//   },
//   activeIndicator: {
//     marginLeft: 'auto',
//   },
//   menuFooter: {
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//     padding: 20,
//   },
//   menuFooterContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   menuFooterText: {
//     flex: 1,
//     fontSize: 12,
//     color: '#6B7280',
//     fontStyle: 'italic',
//   },
// });

// export default DashboardHeader;


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
    {
      id: 'housekeeping',
      title: 'Housekeeping',
      icon: 'bed',
      route: '/dashboard/housekeeping',
    },
    {
      id: 'notification',
      title: 'Notifications',
      icon: 'notifications',
      route: '/dashboard/notification',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      route: '/dashboard/settings',
    },
    {
      id: 'profile',
      title: 'My Profile',
      icon: 'person',
      route: '/dashboard/profile',
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
            <LinearGradient
              colors={['#6B5B95', '#7D6BA8']}
              style={styles.menuHeader}
            >
              <Text style={styles.menuHeaderTitle}>Navigation Menu</Text>
              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            {/* User Info Section */}
            <View style={styles.userInfoSection}>
              {loadingUser ? (
                <ActivityIndicator size="large" color="#6B5B95" />
              ) : userData ? (
                <>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {getInitials(userData.name)}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {userData.name} {userData.lname}
                    </Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>
                    {userData.hotel?.hotel_name && (
                      <Text style={styles.userHotel}>
                        {userData.hotel.hotel_name}
                      </Text>
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.userPlaceholder}>
                  <Ionicons name="person-circle" size={60} color="#6B5B95" />
                  <Text style={styles.userPlaceholderText}>User Profile</Text>
                </View>
              )}
            </View>

            {/* Menu Items */}
            <View style={styles.menuContent}>
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
                          name="chevron-forward"
                          size={16}
                          color="#FFFFFF"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.logoutIconContainer}>
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.menuFooter}>
              <View style={styles.menuFooterContent}>
                <Ionicons name="information-circle" size={16} color="#6B7280" />
                <Text style={styles.menuFooterText}>
                  Swipe right or tap outside to close
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backgroundTouchable: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  menuHeaderTitle: {
    fontSize: 20,
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6B5B95',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  userHotel: {
    fontSize: 12,
    color: '#6B5B95',
    fontWeight: '600',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  userPlaceholder: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  userPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  menuContent: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    gap: 14,
  },
  menuItemActive: {
    backgroundColor: '#6B5B95',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 14,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  menuFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  menuFooterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuFooterText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default DashboardHeader;