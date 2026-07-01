// src/screens/NotificationScreen.tsx
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

interface Notification {
  id: string;
  type: 'alert' | 'maintenance' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: string;
  isNew?: boolean;
  action?: string;
  actionLabel?: string;
  technician?: {
    name: string;
    role: string;
    online: boolean;
  };
  category?: string;
  description?: string;
  status?: string;
}

export default function NotificationScreen({ navigation }) {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [userName, setUserName] = useState('User');

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'alert',
      title: 'Water Shut-off Warning',
      message: 'Scheduled maintenance will affect water supply in North Hall between 2 PM and 4 PM today.',
      time: '1 hour ago',
      isRead: false,
      isNew: true,
      icon: '⚠️',
    },
    {
      id: '2',
      type: 'maintenance',
      title: 'Work Order #4928 Updated',
      message: 'Technician assigned: John Miller. ETA: Today, 3:30 PM.',
      time: '2 mins ago',
      isRead: false,
      icon: '🔧',
      action: 'View Details',
      actionLabel: 'Mark as Read',
      technician: {
        name: 'John Miller',
        role: 'Lead Facilities Specialist',
        online: true,
      },
      category: 'Radiator leak',
      description: '"Water is pooling near the window sill. It seems to be coming from the main valve connection."',
      status: 'IN PROGRESS',
    },
    {
      id: '3',
      type: 'maintenance',
      title: 'Work Order #4811 Completed',
      message: 'The lighting issue in Lab 402 has been resolved. Thank you for your patience.',
      time: 'Yesterday',
      isRead: true,
      icon: '✅',
      technician: {
        name: 'Sarah Johnson',
        role: 'Electrical Specialist',
        online: false,
      },
      category: 'Lighting Issue',
      description: '"The fluorescent lights in Lab 402 were flickering and occasionally turning off."',
      status: 'COMPLETED',
    },
    {
      id: '4',
      type: 'system',
      title: 'New Login Detected',
      message: 'Your account was logged into from a new device: Chrome on MacOS (192.168.1.45).',
      time: 'Yesterday',
      isRead: true,
      icon: '🛡️',
    },
  ]);

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

  const getInitials = () => {
    return userName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleUnreadOnly = () => {
    setShowUnreadOnly(!showUnreadOnly);
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
          },
        },
      ]
    );
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleViewDetails = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      navigation.navigate('NotificationDetail', { 
        notification: {
          id: notification.id,
          title: notification.title,
          status: notification.status || 'IN PROGRESS',
          category: notification.category || notification.title,
          time: notification.time,
          description: notification.description || notification.message,
          technician: notification.technician || {
            name: 'John Miller',
            role: 'Lead Facilities Specialist',
            online: true,
          },
        }
      });
    }
  };

  const getFilteredNotifications = () => {
    if (showUnreadOnly) {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  const renderNotificationCard = (item: Notification) => {
    const isUnread = !item.isRead;
    const isAlert = item.type === 'alert';

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.notificationCard,
          isUnread && styles.notificationCardUnread,
          isAlert && styles.notificationCardAlert,
          { 
            backgroundColor: isUnread ? theme.surface : theme.background,
            borderColor: theme.border,
            borderLeftColor: isUnread ? theme.primary : theme.border,
          },
        ]}
        onPress={() => {
          if (item.type === 'maintenance') {
            handleViewDetails(item.id);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={[styles.notificationIconContainer, { backgroundColor: theme.accent }]}>
            <Text style={styles.notificationIcon}>{item.icon}</Text>
          </View>
          <View style={styles.notificationBody}>
            <View style={styles.notificationHeader}>
              <Text style={[styles.notificationTitle, { color: theme.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.notificationTime, { color: theme.textSecondary }]}>
                {item.time}
              </Text>
            </View>
            <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
              {item.message}
            </Text>
            
            {item.action && (
              <View style={styles.notificationActions}>
                <TouchableOpacity
                  style={[styles.primaryAction, { backgroundColor: theme.primary }]}
                  onPress={() => handleViewDetails(item.id)}
                >
                  <Text style={styles.primaryActionText}>{item.action}</Text>
                </TouchableOpacity>
                {item.actionLabel && (
                  <TouchableOpacity
                    style={[styles.secondaryAction, { borderColor: theme.primary }]}
                    onPress={() => handleMarkAsRead(item.id)}
                  >
                    <Text style={[styles.secondaryActionText, { color: theme.primary }]}>
                      {item.actionLabel}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          {isUnread && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
        </View>
        {item.isNew && (
          <View style={[styles.newBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCategoryHeader = (title: string, count?: number) => {
    return (
      <View style={styles.categoryHeader}>
        <Text style={[styles.categoryTitle, { color: theme.text }]}>{title}</Text>
        {count !== undefined && count > 0 && (
          <View style={[styles.categoryCount, { backgroundColor: theme.primary }]}>
            <Text style={styles.categoryCountText}>{count}</Text>
          </View>
        )}
      </View>
    );
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = getUnreadCount();

  // Group notifications by type
  const alertNotifications = filteredNotifications.filter(n => n.type === 'alert');
  const maintenanceNotifications = filteredNotifications.filter(n => n.type === 'maintenance');
  const systemNotifications = filteredNotifications.filter(n => n.type === 'system');

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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notification Center</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={[styles.shareButtonText, { color: theme.primary }]}>↗</Text>
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
          
          {/* ===== FILTER BAR ===== */}
          <View style={[styles.filterBar, { 
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }]}>
            <View style={styles.filterLeft}>
              <Switch
                value={showUnreadOnly}
                onValueChange={toggleUnreadOnly}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={showUnreadOnly ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor={theme.border}
              />
              <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>
                Unread only {unreadCount > 0 && `(${unreadCount})`}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClearAll} disabled={notifications.length === 0}>
              <Text style={[
                styles.clearAllText,
                { color: theme.primary },
                notifications.length === 0 && { opacity: 0.5 },
              ]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>

          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>All caught up!</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                You have no new notifications.
              </Text>
            </View>
          ) : (
            <>
              {/* Hall Alerts */}
              {alertNotifications.length > 0 && (
                <>
                  {renderCategoryHeader('Hall Alerts', alertNotifications.filter(n => n.isNew).length)}
                  {alertNotifications.map(item => renderNotificationCard(item))}
                </>
              )}

              {/* Maintenance */}
              {maintenanceNotifications.length > 0 && (
                <>
                  {renderCategoryHeader('Maintenance')}
                  {maintenanceNotifications.map(item => renderNotificationCard(item))}
                </>
              )}

              {/* System */}
              {systemNotifications.length > 0 && (
                <>
                  {renderCategoryHeader('System')}
                  {systemNotifications.map(item => renderNotificationCard(item))}
                </>
              )}
            </>
          )}

          <View style={styles.bottomSpacer} />

        </View>
      </ScrollView>

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
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // ===== FILTER BAR =====
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  filterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ===== CATEGORY HEADER =====
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  categoryCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ===== NOTIFICATION CARD =====
  notificationCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
  },
  notificationCardAlert: {
    borderLeftWidth: 4,
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  notificationIcon: {
    fontSize: 22,
  },
  notificationBody: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  notificationTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    flexShrink: 0,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ===== NOTIFICATION ACTIONS =====
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  primaryAction: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  primaryActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryAction: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
  },
  secondaryActionText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ===== EMPTY STATE =====
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
  },

  // ===== BOTTOM SPACER =====
  bottomSpacer: {
    height: 20,
  },
});