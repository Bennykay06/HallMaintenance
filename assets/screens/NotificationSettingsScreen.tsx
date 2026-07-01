// src/screens/NotificationSettingsScreen.tsx
import { useTheme } from '../context/ThemeContext';
import { ArrowLeftIcon } from '../components/Icons';

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationSettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('User');
  
  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [maintenanceUpdates, setMaintenanceUpdates] = useState(true);
  const [campusNews, setCampusNews] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const [scheduledSummary, setScheduledSummary] = useState(false);

  useEffect(() => {
    loadUserData();
    loadSettings();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setPushNotifications(parsed.pushNotifications ?? true);
        setMaintenanceUpdates(parsed.maintenanceUpdates ?? true);
        setCampusNews(parsed.campusNews ?? true);
        setEmergencyAlerts(parsed.emergencyAlerts ?? true);
        setQuietHours(parsed.quietHours ?? false);
        setScheduledSummary(parsed.scheduledSummary ?? false);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        pushNotifications,
        maintenanceUpdates,
        campusNews,
        emergencyAlerts,
        quietHours,
        scheduledSummary,
      };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      Alert.alert('Success', 'Notification preferences saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getInitials = () => {
    return userName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = () => {
    saveSettings();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={theme.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={{ width: 40 }} />
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
          
          {/* ===== PUSH NOTIFICATIONS ===== */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Push Notifications</Text>
                <Text style={styles.sectionSubtitle}>
                  Enable or disable all campus alerts
                </Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={pushNotifications ? theme.surface : theme.surface}
              />
            </View>
          </View>

          {/* ===== PREFERENCE CATEGORIES ===== */}
          <View style={styles.categoriesSection}>
            <Text style={styles.categoriesTitle}>PREFERENCE CATEGORIES</Text>
            
            {/* Maintenance Updates */}
            <View style={styles.categoryItem}>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>Maintenance Updates</Text>
                <Text style={styles.categoryDescription}>
                  Real-time status changes, technician arrivals, and work order completion alerts.
                </Text>
              </View>
              <Switch
                value={maintenanceUpdates}
                onValueChange={setMaintenanceUpdates}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={maintenanceUpdates ? theme.surface : theme.surface}
              />
            </View>

            {/* Campus News */}
            <View style={styles.categoryItem}>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>Campus News</Text>
                <Text style={styles.categoryDescription}>
                  Stay updated with residential hall announcements, dining hall changes, and student life events.
                </Text>
              </View>
              <Switch
                value={campusNews}
                onValueChange={setCampusNews}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={campusNews ? theme.surface : theme.surface}
              />
            </View>

            {/* Emergency Alerts */}
            <View style={[styles.categoryItem, styles.emergencyItem]}>
              <View style={styles.categoryContent}>
                <Text style={[styles.categoryTitle, styles.emergencyTitle]}>Emergency Alerts</Text>
                <Text style={styles.categoryDescription}>
                  Critical safety notifications, weather warnings, and campus-wide urgent security updates.
                </Text>
                <View style={styles.alwaysOnBadge}>
                  <Text style={styles.alwaysOnText}>ALWAYS ON</Text>
                </View>
              </View>
              <Switch
                value={emergencyAlerts}
                onValueChange={setEmergencyAlerts}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={emergencyAlerts ? theme.surface : theme.surface}
                disabled={true}
              />
            </View>
          </View>

          {/* ===== DELIVERY SCHEDULE ===== */}
          <View style={styles.deliverySection}>
            <Text style={styles.deliveryTitle}>DELIVERY SCHEDULE</Text>
            
            {/* Quiet Hours */}
            <View style={styles.deliveryItem}>
              <View style={styles.deliveryContent}>
                <Text style={styles.deliveryItemTitle}>Quiet Hours</Text>
                <Text style={styles.deliveryItemDescription}>
                  Mute non-urgent alerts at night
                </Text>
              </View>
              <Switch
                value={quietHours}
                onValueChange={setQuietHours}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={quietHours ? theme.surface : theme.surface}
              />
            </View>

            {/* Scheduled Summary */}
            <View style={styles.deliveryItem}>
              <View style={styles.deliveryContent}>
                <Text style={styles.deliveryItemTitle}>Scheduled Summary</Text>
                <Text style={styles.deliveryItemDescription}>
                  Receive a daily digest of all campus news
                </Text>
              </View>
              <Switch
                value={scheduledSummary}
                onValueChange={setScheduledSummary}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={scheduledSummary ? theme.surface : theme.surface}
              />
            </View>
          </View>

          {/* ===== SAVE BUTTON ===== */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={[theme.primary, theme.primaryContainer]}
              style={styles.saveGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            </LinearGradient>
          </TouchableOpacity>

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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: theme.border,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
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
    paddingTop: 16,
    paddingBottom: 20,
  },

  // ===== PUSH NOTIFICATIONS =====
  sectionCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 0,
    borderColor: theme.border,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },

  // ===== PREFERENCE CATEGORIES =====
  categoriesSection: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 0,
    borderColor: theme.border,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  categoriesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F6F6C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  categoryContent: {
    flex: 1,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 16,
  },
  emergencyItem: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  emergencyTitle: {
    color: theme.primary,
  },
  alwaysOnBadge: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  alwaysOnText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.primary,
    letterSpacing: 0.5,
  },

  // ===== DELIVERY SCHEDULE =====
  deliverySection: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 0,
    borderColor: theme.border,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  deliveryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F6F6C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  deliveryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  deliveryContent: {
    flex: 1,
    marginRight: 12,
  },
  deliveryItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  deliveryItemDescription: {
    fontSize: 12,
    color: theme.textSecondary,
  },

  // ===== SAVE BUTTON =====
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  saveGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.surface,
  },

  // ===== BOTTOM SPACER =====
  bottomSpacer: {
    height: 20,
  },
});