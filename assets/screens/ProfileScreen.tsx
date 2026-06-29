// src/screens/ProfileScreen.tsx
import { PersonIcon, CalendarIcon, BellIcon, ArrowLeftIcon } from '../components/Icons';

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
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Alex Johnson');
  const [hall, setHall] = useState('Unity Hall');
  const [floor, setFloor] = useState('Floor 2');
  const [room, setRoom] = useState('Room 204');
  const [fullAddress, setFullAddress] = useState('Unity Hall, Floor 2, Room 204');
  const [studentId, setStudentId] = useState('88204192');
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
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color="#AF101A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>⋯</Text>
        </TouchableOpacity>
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
                <Text style={styles.editAvatarText}>✎</Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.profileName}>{userName}</Text>
              <View style={styles.locationBadge}>
                <PersonIcon color="#AF101A" size={24} />
                <Text style={styles.locationText}>{fullAddress}</Text>
              </View>
              <Text style={styles.studentId}>Student ID: <Text style={styles.studentIdBold}>{studentId}</Text></Text>
            </View>
          </View>

          {/* ===== STATS SECTION ===== */}
          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <View style={styles.statsIconContainer}>
                <Text style={styles.statsIcon}>✅</Text>
              </View>
              <View>
                <Text style={styles.statsLabel}>Status</Text>
                <Text style={styles.statsValue}>{status}</Text>
              </View>
            </View>
            <View style={styles.statsCard}>
              <View style={[styles.statsIconContainer, styles.statsIconContainerSecondary]}>
                <CalendarIcon color="#AF101A" size={24} />
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
                  <PersonIcon color="#AF101A" size={24} />
                </View>
                <Text style={styles.actionText}>Edit Profile</Text>
              </View>
              <Text style={styles.actionChevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleNotificationSettings}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <BellIcon color="#AF101A" size={24} />
                </View>
                <Text style={styles.actionText}>Notification Settings</Text>
              </View>
              <Text style={styles.actionChevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleFacilityRules}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <Text style={styles.actionIconText}>📄</Text>
                </View>
                <Text style={styles.actionText}>Facility Rules & Guidelines</Text>
              </View>
              <Text style={styles.actionChevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionItem, styles.actionItemLast]} onPress={handleHelpSupport}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <Text style={styles.actionIconText}>❓</Text>
                </View>
                <Text style={styles.actionText}>Help & Support</Text>
              </View>
              <Text style={styles.actionChevron}>›</Text>
            </TouchableOpacity>
          </View>

          {/* ===== LOGOUT BUTTON ===== */}
          <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutIcon}>🚪</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },

  // ===== HEADER =====
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4BEBA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#AF101A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#AF101A',
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: 24,
    color: '#5B403D',
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
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#AF101A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editAvatarText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1C1C',
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
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    fontSize: 14,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5B403D',
  },
  studentId: {
    fontSize: 13,
    color: '#5B403D',
    textAlign: 'center',
  },
  studentIdBold: {
    fontWeight: '700',
    color: '#1A1C1C',
  },

  // ===== STATS =====
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(175, 16, 26, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsIconContainerSecondary: {
    backgroundColor: 'rgba(181, 26, 27, 0.08)',
  },
  statsIcon: {
    fontSize: 20,
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5B403D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1C',
  },

  // ===== ACTION LIST =====
  actionList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E4BEBA',
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
    borderRadius: 8,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconText: {
    fontSize: 18,
  },
  actionText: {
    fontSize: 15,
    color: '#1A1C1C',
  },
  actionChevron: {
    fontSize: 20,
    color: '#8F6F6C',
  },

  // ===== LOGOUT =====
  logoutSection: {
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#AF101A',
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#AF101A',
  },
  versionText: {
    fontSize: 11,
    color: '#5B403D',
    opacity: 0.6,
    marginTop: 16,
  },

  // ===== BOTTOM SPACER =====
  bottomSpacer: {
    height: 20,
  },
});