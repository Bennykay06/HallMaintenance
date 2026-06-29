// src/screens/EmergencyScreen.tsx
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
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('User');

  const primaryContact = {
    name: 'KNUST Campus Security',
    description: 'Central dispatch for all urgent campus matters.',
    phone: '+233 24 123 4567',
  };

  const facilityEmergencies = [
    {
      id: '1',
      name: 'Fire Services',
      description: 'Immediate fire and rescue response.',
      phone: '192',
      icon: '🔥',
    },
    {
      id: '2',
      name: 'Police Emergency',
      description: 'Campus and local police dispatch.',
      phone: '191',
      icon: '👮',
    },
    {
      id: '3',
      name: 'Ambulance',
      description: 'Emergency medical transport.',
      phone: '193',
      icon: '🚑',
    },
  ];

  const medicalSupport = [
    {
      id: '4',
      name: 'KNUST Hospital',
      description: 'Main university medical facility.',
      phone: '+233 32 206 0296',
      icon: '🏥',
    },
    {
      id: '5',
      name: 'Student Health Services',
      description: 'Primary care for students.',
      phone: 'EXT 2222',
      icon: '💊',
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
        colors={['#D32F2F', '#AF101A']}
        style={styles.primaryCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.primaryContent}>
          <View style={styles.primaryLeft}>
            <View style={styles.primaryIconContainer}>
              <Text style={styles.primaryIcon}>📞</Text>
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
            <Text style={styles.primaryCallButtonText}>📞 Call Now</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  const renderSectionHeader = (icon: string, title: string) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    );
  };

  const renderContactCard = (item: any) => {
    return (
      <View key={item.id} style={styles.contactCard}>
        <View style={styles.contactLeft}>
          <View style={styles.contactIconContainer}>
            <Text style={styles.contactIcon}>{item.icon}</Text>
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
          <Text style={styles.callButtonText}>📞</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>🏫</Text>
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
            {renderSectionHeader('🔧', 'Facility Emergencies')}
            <View style={styles.contactGrid}>
              {facilityEmergencies.map((item) => renderContactCard(item))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            {renderSectionHeader('🏥', 'Medical Support')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 24,
    color: '#AF101A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#AF101A',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4BEBA',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1C',
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
    color: '#1A1C1C',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#5B403D',
    lineHeight: 22,
  },
  primaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#AF101A',
    shadowColor: '#AF101A',
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  primaryCallButton: {
    backgroundColor: '#FFFFFF',
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
    color: '#AF101A',
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
  sectionIcon: {
    fontSize: 20,
    color: '#AF101A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#AF101A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactGrid: {
    gap: 12,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
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
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 20,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1C',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: '#5B403D',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AF101A',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#AF101A',
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