// src/screens/EmergencyScreen.tsx
import { useTheme } from '../context/ThemeContext';
import { PersonIcon, WrenchIcon, SchoolIcon, SecurityIcon, SanitizerIcon } from '../components/Icons';

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
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EmergencyScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('User');

  const primaryContact = {
    name: 'KNUST Campus Security',
    description: 'Central dispatch for all urgent campus matters.',
    phone: '+233 24 123 4567',
  };

  const campusSecurity = [
    {
      id: '1',
      name: 'Campus Police Station',
      description: 'Main security desk (24/7).',
      phone: '+233 32 206 0418',
      icon: <SecurityIcon color={theme.primary} size={24} />,
    },
    {
      id: '2',
      name: 'Fire Department',
      description: 'Campus fire emergency response.',
      phone: '192',
      icon: <SanitizerIcon color={theme.primary} size={24} />,
    },
    {
      id: '3',
      name: 'Maintenance Emergency',
      description: 'Severe leaks, power outages.',
      phone: 'EXT 4321',
      icon: <WrenchIcon color={theme.primary} size={24} />,
    },
  ];

  const medicalSupport = [
    {
      id: '4',
      name: 'KNUST Hospital',
      description: 'Main university medical facility.',
      phone: '+233 32 206 0296',
      icon: <SchoolIcon color={theme.primary} size={24} />,
    },
    {
      id: '5',
      name: 'Student Health Services',
      description: 'Primary care for students.',
      phone: 'EXT 2222',
      icon: <SanitizerIcon color={theme.primary} size={24} />,
    },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const makePhoneCall = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/\s/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Error', 'Could not make the call. Please dial manually.');
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

  const renderPrimaryContact = () => {
    return (
      <LinearGradient
        colors={[theme.primaryContainer, theme.primary]}
        style={styles.primaryCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.primaryContent}>
          <View style={styles.primaryLeft}>
            <View style={styles.primaryIconContainer}>
              <SecurityIcon color={theme.primary} size={32} />
            </View>
            <View>
              <Text style={styles.primaryName}>{primaryContact.name}</Text>
              <Text style={styles.primaryDescription}>{primaryContact.description}</Text>
              <Text style={styles.primaryPhone}>{primaryContact.phone}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.primaryCallButton}
            onPress={() => makePhoneCall(primaryContact.phone)}
          >
            <View style={{flexDirection: "row", alignItems: "center"}}><PersonIcon color="#FFFFFF" size={20} /><Text style={styles.primaryCallButtonText}> Call Now</Text></View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  const renderSectionHeader = (icon: React.ReactNode, title: string) => {
    return (
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    );
  };

  const renderContactCard = (item: any) => {
    return (
      <View key={item.id} style={styles.contactCard}>
        <View style={styles.contactLeft}>
          <View style={styles.contactIconContainer}>
            <View style={styles.contactIconContainer}>{item.icon}</View>
          </View>
          <View>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactDescription}>{item.description}</Text>
            <Text style={styles.contactPhone}>{item.phone}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => makePhoneCall(item.phone)}
        >
          <PersonIcon color={theme.primary} size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SchoolIcon color="#FFFFFF" size={80} />
          <Text style={styles.headerTitle}>Crimson Campus</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
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
          
          <View style={styles.pageTitleContainer}>
            <Text style={styles.pageTitle}>Emergency Contacts</Text>
            <Text style={styles.pageSubtitle}>
              Rapid assistance for facility, medical, and safety concerns.
            </Text>
          </View>

          {renderPrimaryContact()}

          <View style={styles.sectionContainer}>
            {renderSectionHeader(<WrenchIcon color={theme.primary} size={24} />, 'Facility Emergencies')}
            <View style={styles.contactGrid}>
              {campusSecurity.map((item) => renderContactCard(item))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            {renderSectionHeader(<SanitizerIcon color={theme.primary} size={24} />, 'Medical Support')}
            <View style={styles.contactGrid}>
              {medicalSupport.map((item) => renderContactCard(item))}
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
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 24,
    color: theme.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.primary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
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
  pageTitleContainer: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  primaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  primaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  primaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryIcon: {
    fontSize: 28,
  },
  primaryName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.primaryText,
    marginBottom: 2,
  },
  primaryDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  primaryPhone: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.primaryText,
    letterSpacing: 1,
  },
  primaryCallButton: {
    backgroundColor: theme.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryCallButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactGrid: {
    gap: 12,
  },
  contactCard: {
    backgroundColor: theme.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 20,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.primary,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 18,
  },
  bottomSpacer: {
    height: 20,
  },
});