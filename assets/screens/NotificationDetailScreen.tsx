// src/screens/NotificationDetailScreen.tsx
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
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

interface NotificationDetail {
  id: string;
  title: string;
  status: string;
  category: string;
  time: string;
  description: string;
  technician?: {
    name: string;
    role: string;
    online: boolean;
  };
}

export default function NotificationDetailScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const [userName, setUserName] = useState('User');

  // Get notification data from route params or use default with proper fallback
  const notificationData: NotificationDetail = route.params?.notification || {
    id: '4928',
    title: 'Work Order #4928 Updated',
    status: 'IN PROGRESS',
    category: 'Radiator leak',
    time: '08:45 AM',
    description: '"Water is pooling near the window sill. It seems to be coming from the main valve connection."',
    technician: {
      name: 'John Miller',
      role: 'Lead Facilities Specialist',
      online: true,
    },
  };

  // Ensure technician object exists
  const technician = notificationData.technician || {
    name: 'Unassigned',
    role: 'Technician',
    online: false,
  };

  // A completed/resolved work order is read-only: show the work details, time,
  // and the specialist who resolved it — no messaging.
  const status = (notificationData.status || '').toLowerCase();
  const isResolved = status === 'completed' || status === 'resolved';

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleMessageTechnician = () => {
    // Chat is registered as a sibling in the root stack (see App.js)
    navigation.navigate('Chat', {
      technician: technician,
      requestId: notificationData.id,
      requestTitle: notificationData.title,
    });
  };

  const handleShare = async () => {
    const specialistLabel = isResolved ? 'Resolved by' : 'Technician';
    const lines = [
      notificationData.title,
      `Status: ${notificationData.status}`,
      `Issue: ${notificationData.category}`,
      `Time: ${notificationData.time}`,
      `${specialistLabel}: ${technician.name}${technician.role ? ` (${technician.role})` : ''}`,
      '',
      notificationData.description,
    ];
    try {
      await Share.share({
        title: notificationData.title,
        message: lines.join('\n'),
      });
    } catch (error) {
      console.log('Error sharing notification:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return '#AF101A';
      case 'completed':
      case 'resolved':
        return '#22C55E';
      case 'scheduled':
        return '#F59E0B';
      default:
        return '#5B403D';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      {/* ===== HEADER ===== */}
      <View style={[styles.header, { 
        backgroundColor: theme.surface,
        borderBottomColor: theme.border,
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notification Details</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={[styles.shareButtonText, { color: theme.primary }]}>↗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isResolved ? styles.scrollContentResolved : styles.scrollContent}
      >
        <View style={styles.content}>
          
          {/* ===== MAIN STATUS CARD ===== */}
          <View style={[styles.statusCard, { 
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }]}>
            <View style={[styles.statusIconContainer, { backgroundColor: theme.accent }]}>
              <Text style={styles.statusIcon}>🔧</Text>
            </View>
            <Text style={[styles.statusTitle, { color: theme.text }]}>
              {notificationData.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: theme.accent }]}>
              <Text style={[styles.statusBadgeText, { color: getStatusColor(notificationData.status) }]}>
                {notificationData.status}
              </Text>
            </View>
          </View>

          {/* ===== TICKET SUMMARY ===== */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📄</Text>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>Ticket Summary</Text>
            </View>
            <View style={[styles.summaryCard, { 
              backgroundColor: theme.background,
              borderColor: theme.border,
            }]}>
              <View style={styles.summaryHeader}>
                <Text style={[styles.summaryTitle, { color: theme.text }]}>
                  {notificationData.category}
                </Text>
                <Text style={[styles.summaryTime, { color: theme.textSecondary }]}>
                  {notificationData.time}
                </Text>
              </View>
              <Text style={[styles.summaryDescription, { color: theme.textSecondary }]}>
                {notificationData.description}
              </Text>
            </View>
          </View>

          {/* ===== ASSIGNED / RESOLVING TECHNICIAN ===== */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{isResolved ? '✅' : '🔧'}</Text>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                {isResolved ? 'Resolved By' : 'Assigned Technician'}
              </Text>
            </View>
            <View style={[styles.technicianCard, {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }]}>
              <View style={styles.technicianInfo}>
                <View style={styles.technicianAvatarContainer}>
                  <View style={[styles.technicianAvatar, { backgroundColor: theme.primary }]}>
                    <Text style={styles.technicianAvatarText}>
                      {getInitials(technician.name)}
                    </Text>
                  </View>
                  {!isResolved && technician.online && (
                    <View style={[styles.onlineDot, { backgroundColor: '#22C55E' }]} />
                  )}
                </View>
                <View style={styles.technicianText}>
                  <Text style={[styles.technicianName, { color: theme.text }]}>
                    {technician.name}
                  </Text>
                  <Text style={[styles.technicianRole, { color: theme.textSecondary }]}>
                    {technician.role}
                  </Text>
                  {isResolved && (
                    <Text style={[styles.resolvedMeta, { color: theme.textSecondary }]}>
                      Resolved • {notificationData.time}
                    </Text>
                  )}
                </View>
              </View>
              {!isResolved && (
                <TouchableOpacity
                  style={[styles.messageButton, { backgroundColor: theme.primary }]}
                  onPress={handleMessageTechnician}
                >
                  <Text style={styles.messageButtonText}>💬</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.bottomSpacer} />

        </View>
      </ScrollView>

      {/* ===== BOTTOM ACTION (hidden once resolved — read-only) ===== */}
      {!isResolved && (
        <View style={[styles.bottomContainer, {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        }]}>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.messageActionButton, {
                borderColor: theme.primary,
              }]}
              onPress={handleMessageTechnician}
            >
              <Text style={[styles.messageActionText, { color: theme.primary }]}>
                Message Technician
              </Text>
              <Text style={[styles.messageActionIcon, { color: theme.primary }]}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ===== HEADER =====
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 24,
  },

  // ===== SCROLL VIEW =====
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  scrollContentResolved: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // ===== STATUS CARD =====
  statusCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    fontSize: 32,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ===== SECTION =====
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ===== SUMMARY CARD =====
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  summaryDescription: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // ===== TECHNICIAN CARD =====
  technicianCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  technicianText: {
    flex: 1,
  },
  resolvedMeta: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  technicianAvatarContainer: {
    position: 'relative',
  },
  technicianAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  technicianAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  technicianName: {
    fontSize: 16,
    fontWeight: '600',
  },
  technicianRole: {
    fontSize: 13,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: 20,
  },

  // ===== BOTTOM ACTION =====
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    paddingVertical: 14,
    borderRadius: 10,
  },
  messageActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageActionIcon: {
    fontSize: 20,
  },

  // ===== BOTTOM SPACER =====
  bottomSpacer: {
    height: 20,
  },
});