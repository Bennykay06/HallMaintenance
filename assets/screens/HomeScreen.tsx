// src/screens/HomeScreen.tsx
import { PersonIcon, GearIcon, CalendarIcon, WrenchIcon, BellIcon, SnowflakeIcon, LockIcon, BoltIcon, DropIcon, HammerIcon, BrickIcon, LocationIcon } from '../components/Icons';

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function HomeScreen({ navigation }: { navigation: any }) {
  const [userName, setUserName] = useState('Resident');
  const [hall, setHall] = useState('Unity Hall');
  const [floor, setFloor] = useState('Floor 2');
  const [room, setRoom] = useState('Room 204');
  const [fullAddress, setFullAddress] = useState('Unity Hall, Floor 2, Room 204');

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

  const scheduleItems = [
    {
      id: '1',
      title: 'Fire Alarm Testing',
      date: 'Oct 25 • 10:00 AM',
      Icon: BellIcon,
    },
    {
      id: '2',
      title: 'AC Filter Replacement',
      date: 'Oct 28 • All Day',
      Icon: SnowflakeIcon,
    },
  ];

  const services = [
    {
      id: 'elec',
      title: 'Electrical',
      description: 'Lighting, outlets, etc.',
      Icon: BoltIcon,
    },
    {
      id: 'plumb',
      title: 'Plumbing',
      description: 'Leaks, taps, drainage.',
      Icon: DropIcon,
    },
    {
      id: 'carp',
      title: 'Carpentry',
      description: 'Doors, windows, desks.',
      Icon: HammerIcon,
    },
    {
      id: 'mason',
      title: 'Masonry',
      description: 'Walls, floors, tiles.',
      Icon: BrickIcon,
    },
  ];

  const handleServicePress = (service: { title: string }) => {
    navigation.navigate('ServiceIssues', {
      serviceType: service.title,
    });
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
      <StatusBar style="dark" backgroundColor="#F9F9F9" />
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>HallMaintenance</Text>
          <View style={styles.headerAddress}>
            <LocationIcon color="#8F6F6C" size={14} />
            <Text style={styles.headerAddressText} numberOfLines={1}>
              {fullAddress}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>{getInitials()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* ===== HERO SECTION ===== */}
          <View style={styles.heroWrapper}>
            <LinearGradient
              colors={['#AF101A', '#D32F2F']}
              style={styles.heroCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroBackgroundIcon}>
                <GearIcon color="#FFFFFF" size={80} />
              </View>
              <Text style={styles.heroTitle}>Welcome Back, {userName.split(' ')[0]}.</Text>
              <Text style={styles.heroSubtitle}>
                Your comfort is our priority. Report issues, check hall news, or access emergency support instantly.
              </Text>
            </LinearGradient>
          </View>

          {/* ===== MAINTENANCE SCHEDULE ===== */}
          <View style={styles.scheduleSection}>
            <View style={[styles.sectionHeader, styles.titleRow]}>
              <CalendarIcon color="#AF101A" size={18} />
              <Text style={styles.sectionTitle}>Maintenance Schedule</Text>
            </View>
            
            <View style={styles.scheduleGrid}>
              {scheduleItems.map((item) => (
                <View key={item.id} style={styles.scheduleCard}>
                  <View style={styles.scheduleLeft}>
                    <View style={styles.scheduleIcon}>
                      <item.Icon color="#AF101A" size={20} />
                    </View>
                    <View>
                      <Text style={styles.scheduleTitle}>{item.title}</Text>
                      <Text style={styles.scheduleDate}>{item.date}</Text>
                    </View>
                  </View>
                  <LockIcon color="#5B403D" size={16} />
                </View>
              ))}
            </View>
          </View>

          {/* ===== MAINTENANCE SERVICES ===== */}
          <View style={styles.servicesSection}>
            <View style={[styles.sectionHeader, styles.titleRow]}>
              <WrenchIcon color="#AF101A" size={18} />
              <Text style={styles.sectionTitle}>Maintenance Services</Text>
            </View>
            
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => handleServicePress(service)}
                  activeOpacity={0.8}
                >
                  <View style={styles.serviceIcon}>
                    <service.Icon color="#AF101A" size={22} />
                  </View>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacer} />

        </View>
      </ScrollView>

      {/* ===== FAB ===== */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

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
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4BEBA',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#AF101A',
  },
  headerAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerAddressText: {
    fontSize: 11,
    color: '#8F6F6C',
    fontWeight: '500',
    flex: 1,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  
  // ===== HERO =====
  heroWrapper: {
    marginBottom: 24,
  },
  heroCard: {
    borderRadius: 12,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroBackgroundIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    marginBottom: 0,
    maxWidth: '80%',
  },

  // ===== SCHEDULE =====
  scheduleSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#AF101A',
  },
  scheduleGrid: {
    gap: 12,
  },
  scheduleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  scheduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  scheduleDate: {
    fontSize: 14,
    color: '#5B403D',
    marginTop: 2,
  },

  // ===== SERVICES =====
  servicesSection: {
    flex: 1,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1C',
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#5B403D',
  },

  // ===== FAB =====
  fab: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'ios' ? 100 : 80,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#AF101A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  bottomSpacer: {
    height: 20,
  },
});