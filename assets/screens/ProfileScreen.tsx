// src/screens/ProfileScreen.tsx
import { useTheme } from '../context/ThemeContext';
import {
  PersonIcon,
  CalendarIcon,
  BellIcon,
  ArrowLeftIcon,
  EditIcon,
  CheckCircleIcon,
  HelpIcon,
  LogoutIcon,
  DescriptionIcon,
  ChevronRightIcon,
} from '../components/Icons';

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Alex Johnson');
  const [hall, setHall] = useState('Unity Hall');
  const [floor, setFloor] = useState('Floor 2');
  const [room, setRoom] = useState('Room 204');
  const [fullAddress, setFullAddress] = useState('Unity Hall, Floor 2, Room 204');
  const [joinDate, setJoinDate] = useState("Fall '23");
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const hallData = await AsyncStorage.getItem('userHall');
      const floorData = await AsyncStorage.getItem('userFloor');
      const roomData = await AsyncStorage.getItem('userRoom');
      const location = await AsyncStorage.getItem('userLocation');
      
      if (name) setUserName(name);
      if (hallData) setHall(hallData);
      if (floorData) setFloor(floorData);
      if (roomData) setRoom(roomData);
      if (location) setFullAddress(location);
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };

  const handleFacilityRules = () => {
    navigation.navigate('FacilityRules');
  };

  const handleHelpSupport = () => {
    navigation.navigate('HelpSupport');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const getInitials = () => {
    return userName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={theme.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.moreButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          
          {/* ===== PROFILE HEADER ===== */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
              <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
                <EditIcon color={theme.surface} size={20} />
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.profileName}>{userName}</Text>
              <View style={styles.locationBadge}>
                <PersonIcon color={theme.primary} size={24} />
                <Text style={styles.locationText}>{fullAddress}</Text>
              </View>
            </View>
          </View>

          {/* ===== STATS SECTION ===== */}
          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <View style={styles.statsIconContainer}>
                <CheckCircleIcon color={theme.primary} size={24} />
              </View>
              <View>
                <Text style={styles.statsLabel}>Status</Text>
                <Text style={styles.statsValue}>{status}</Text>
              </View>
            </View>
            <View style={styles.statsCard}>
              <View style={[styles.statsIconContainer, styles.statsIconContainerSecondary]}>
                <CalendarIcon color={theme.primary} size={24} />
              </View>
              <View>
                <Text style={styles.statsLabel}>Joined</Text>
                <Text style={styles.statsValue}>{joinDate}</Text>
              </View>
            </View>
          </View>

          {/* ===== ACTION LIST ===== */}
          <View style={styles.actionList}>
            <TouchableOpacity style={styles.actionItem} onPress={handleEditProfile}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <PersonIcon color={theme.primary} size={24} />
                </View>
                <Text style={styles.actionText}>Edit Profile</Text>
              </View>
              <ChevronRightIcon color="#8F6F6C" size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleNotificationSettings}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <BellIcon color={theme.primary} size={24} />
                </View>
                <Text style={styles.actionText}>Notification Settings</Text>
              </View>
              <ChevronRightIcon color="#8F6F6C" size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleFacilityRules}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <DescriptionIcon color={theme.primary} size={24} />
                </View>
                <Text style={styles.actionText}>Facility Rules & Guidelines</Text>
              </View>
              <ChevronRightIcon color="#8F6F6C" size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionItem, styles.actionItemLast]} onPress={handleHelpSupport}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <HelpIcon color={theme.primary} size={24} />
                </View>
                <Text style={styles.actionText}>Help & Support</Text>
              </View>
              <ChevronRightIcon color="#8F6F6C" size={20} />
            </TouchableOpacity>
          </View>

          {/* ===== LOGOUT BUTTON ===== */}
          <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogoutIcon color={theme.primary} size={20} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>App Version 2.4.1 (Build 109)</Text>
          </View>

          <View style={styles.bottomSpacer} />

        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  // ===== HEADER =====
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: theme.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.primary,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===== SCROLL VIEW =====
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },

  // ===== PROFILE HEADER =====
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  avatarText: {
    fontSize: 48,
    color: theme.surface,
    fontWeight: '700',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 24,
    alignSelf: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    fontSize: 14,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  // ===== STATS =====
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statsCard: {
    flex: 1,
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 0,
    borderColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: 'rgba(175, 16, 26, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsIconContainerSecondary: {
    backgroundColor: 'rgba(181, 26, 27, 0.08)',
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },

  // ===== ACTION LIST =====
  actionList: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    borderWidth: 0,
    borderColor: theme.border,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.border,
  },
  actionItemLast: {
    borderBottomWidth: 0,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 16,
    backgroundColor: theme.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 15,
    color: theme.text,
  },

  // ===== LOGOUT =====
  logoutSection: {
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.surface,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.primary,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary,
  },
  versionText: {
    fontSize: 11,
    color: theme.textSecondary,
    opacity: 0.6,
    marginTop: 16,
  },

  // ===== BOTTOM SPACER =====
  bottomSpacer: {
    height: 20,
  },
});