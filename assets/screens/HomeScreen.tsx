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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import {
  getAppointments,
  Appointment,
  faultLabel,
  formatAppointmentDate,
  formatAppointmentTime,
} from '../utils/appointments';
import { getMyProfile } from '../../lib/api';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  // Empty, not a placeholder. A name the student never chose ("Resident",
  // "John Doe") is worse than a blank space for the moment it takes the
  // account to load — it is wrong, and it looks deliberate.
  const [userName, setUserName] = useState('');
  const [hall, setHall] = useState('');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    loadUserData();
    loadAppointments();
    // Refresh booked appointments whenever Home regains focus (e.g. after
    // confirming/declining an appointment in the chat screen).
    const unsubscribe = navigation.addListener('focus', loadAppointments);
    return unsubscribe;
  }, [navigation]);

  const loadAppointments = async () => {
    setAppointments(await getAppointments());
  };

  const loadUserData = async () => {
    // The account is asked first and wins outright. AsyncStorage is only a
    // per-device cache — it holds whoever used this phone last — so it fills
    // gaps rather than setting anything the account already knows.
    let profile = null;
    try {
      profile = await getMyProfile();
    } catch (error: any) {
      console.log('[home] getMyProfile threw:', error?.message ?? error);
    }

    try {
      // Account first, cache only as a fallback - same rule as the name and
      // room below. getMyProfile now returns floor, so a fresh install no
      // longer drops it out of the address line.
      const cachedFloor = await AsyncStorage.getItem('userFloor');
      const floorData = profile?.floor?.trim() || cachedFloor;

      if (profile?.fullName) {
        setUserName(profile.fullName.trim());
      } else {
        const name = await AsyncStorage.getItem('userName');
        if (name) setUserName(name.trim());
      }

      if (profile?.hallName) setHall(profile.hallName);
      else {
        const hallData = await AsyncStorage.getItem('userHall');
        if (hallData) setHall(hallData);
      }

      if (profile?.room) setRoom(profile.room);
      else {
        const roomData = await AsyncStorage.getItem('userRoom');
        if (roomData) setRoom(roomData);
      }

      if (floorData) setFloor(floorData);

      const parts = [
        profile?.hallName ?? (await AsyncStorage.getItem('userHall')),
        floorData,
        profile?.room ?? (await AsyncStorage.getItem('userRoom')),
      ].filter(Boolean);

      if (parts.length) setFullAddress(parts.join(', '));
      else {
        const location = await AsyncStorage.getItem('userLocation');
        if (location) setFullAddress(location);
      }
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

  // Real appointments carry a status; the two hard-coded hall-wide items
  // below don't, so they keep the plain "i" icon instead of a badge.
  const getStatusMeta = (status?: string) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case 'completed':
        return { label: 'Completed', color: '#27AE60', bg: 'rgba(39, 174, 96, 0.1)' };
      case 'cancelled':
        return { label: 'Cancelled', color: '#8F6F6C', bg: 'rgba(143, 111, 108, 0.12)' };
      default:
        return { label: 'Scheduled', color: '#F39C12', bg: 'rgba(243, 156, 18, 0.1)' };
    }
  };

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

  const firstName = userName.trim().split(/\s+/)[0] ?? '';

  // Current residence on a single line, in order: hall, floor, room.
  // Onboarding stores the room as a bare number (e.g. "12"), so prefix
  // "Room " unless the value already starts with it. Empty parts are dropped
  // rather than rendered as ", , Room " while the account loads.
  const roomLabel = room.trim()
    ? (/^\s*room\b/i.test(room) ? room.trim() : `Room ${room.trim()}`)
    : '';
  const residenceLine = [hall.trim(), floor.trim(), roomLabel]
    .filter(Boolean)
    .join(', ')
    .replace('University Hall (Katanga)', 'Katanga Hall');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar style="dark" backgroundColor={theme.background} />
      
      {/* ===== HEADER ===== */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>ResiFix KNUST</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notification')}>
            <BellIcon color={theme.primary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.profileAvatar}>
              <PersonIcon color={theme.primaryText} size={20} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* ===== HERO SECTION ===== */}
          <View style={styles.heroWrapper}>
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              style={styles.heroCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroBackgroundIcon}>
                <WrenchIcon color={theme.primaryText} size={150} />
              </View>
              {/* First name only here; the Profile screen shows the full name.
                  While the account is still loading the name is simply absent —
                  never a placeholder that has to be corrected a moment later. */}
              <Text style={[styles.heroTitle, { color: theme.primaryText }]}>
                {firstName ? `Welcome, ${firstName}.` : 'Welcome.'}
              </Text>
              <Text style={[styles.heroSubtitle, { color: theme.primaryText }]}>
                Your comfort is our priority. Report issues, check hall news, or access emergency support instantly.
              </Text>
              
              <View style={styles.heroBadge}>
                <LocationIcon color={theme.primaryText} size={20} />
                <View style={styles.heroBadgeTextContainer}>
                  <Text style={[styles.heroBadgeLabel, { color: theme.primaryText }]}>CURRENT RESIDENCE</Text>
                  <Text
                    style={[styles.heroBadgeValue, { color: theme.primaryText }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {residenceLine}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* ===== MAINTENANCE SERVICES ===== */}
          <View style={styles.servicesSection}>
            <View style={[styles.sectionHeader, styles.titleRow, { marginBottom: 16 }]}>
              <WrenchIcon color={theme.primary} size={24} />
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>Maintenance Services</Text>
            </View>

            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[styles.serviceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => handleServicePress(service)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.serviceIcon, { backgroundColor: theme.surfaceContainer }]}>
                    <service.Icon color={theme.primary} size={22} />
                  </View>
                  <Text style={[styles.serviceTitle, { color: theme.text }]}>{service.title}</Text>
                  <Text style={[styles.serviceDescription, { color: theme.textSecondary }]}>{service.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ===== MAINTENANCE SCHEDULE ===== */}
          <View style={styles.scheduleSection}>
            <View style={styles.scheduleSectionHeader}>
              <View style={styles.titleRow}>
                <CalendarIcon color={theme.primary} size={24} />
                <Text style={[styles.sectionTitle, { color: theme.primary }]}>Maintenance Schedule</Text>
              </View>
              {appointments.length > 0 && (
                <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
                  <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.scheduleGrid}>
              {[
                // A booked visit shows the fault the hall admin recorded, plus
                // the date and time they set — nothing else.
                ...appointments.map((a) => ({
                  id: a.id,
                  title: faultLabel(a),
                  date: formatAppointmentDate(a.scheduledFor) || a.date || 'Date to be confirmed',
                  time: formatAppointmentTime(a.scheduledFor),
                  Icon: WrenchIcon,
                  status: a.status,
                })),
                ...scheduleItems,
              ].map((item: any) => {
                const meta = getStatusMeta(item.status);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.scheduleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    activeOpacity={item.status ? 0.7 : 1}
                    disabled={!item.status}
                    onPress={() => navigation.navigate('Appointments')}
                  >
                    <View style={styles.scheduleLeft}>
                      <View style={[styles.scheduleIcon, { backgroundColor: theme.surfaceContainer }]}>
                        <item.Icon color={theme.primary} size={20} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.scheduleTitle, { color: theme.text }]} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={[styles.scheduleDate, { color: theme.textSecondary }]}>
                          {item.time ? `${item.date} • ${item.time}` : item.date}
                        </Text>
                      </View>
                    </View>
                    {meta ? (
                      <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
                      </View>
                    ) : (
                      <View style={[styles.infoIcon, { borderColor: theme.primary }]}>
                        <Text style={{ color: theme.primary, fontSize: 12, fontWeight: 'bold' }}>i</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#AF101A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    top: 0,
    right: 0,
    padding: 32,
    opacity: 0.1,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    marginBottom: 0,
    maxWidth: '90%',
  },
  heroBadge: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  heroBadgeTextContainer: {
    flexDirection: 'column',
  },
  heroBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroBadgeValue: {
    fontSize: 16,
    fontWeight: '600',
  },

  // ===== SCHEDULE =====
  scheduleSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  scheduleSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
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
    fontWeight: '700',
    color: '#1A1C1C',
  },
  scheduleDate: {
    fontSize: 14,
    color: '#5B403D',
    marginTop: 2,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===== SERVICES =====
  servicesSection: {
    marginBottom: 24,
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

  bottomSpacer: {
    height: 20,
  },
});