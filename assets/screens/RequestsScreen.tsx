// src/screens/RequestsScreen.tsx
import { useTheme } from '../context/ThemeContext';
import { PersonIcon, ClipboardIcon, WrenchIcon, BellIcon, ArrowLeftIcon, ChevronRightIcon } from '../components/Icons';

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
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReports, isDoneStatus, processDueResolutions, deleteReport, clearHistory, clearActive } from '../utils/reports';
import { getHall } from '../utils/location';

export default function RequestsScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [activeTab, setActiveTab] = useState(route?.params?.activeTab || 'Active');
  const [drafts, setDrafts] = useState<any[]>([]);
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    if (route?.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route?.params?.activeTab]);

  useEffect(() => {
    loadData();
    loadUserName();
    // On focus, let the simulated technician resolve any due requests (which
    // also posts a notification), then refresh so resolved items move to
    // History.
    const onFocus = async () => {
      await processDueResolutions();
      await loadData();
    };
    const unsubscribe = navigation.addListener('focus', onFocus);
    // While the screen is open, keep checking so a resolution appears live.
    const interval = setInterval(async () => {
      const changed = await processDueResolutions();
      if (changed) await loadData();
    }, 5000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [navigation]);

  const loadUserName = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
    } catch (error) {
      console.log('Error loading user name:', error);
    }
  };

  const loadData = async () => {
    try {
      const reports = await getReports();
      const userHall = (await AsyncStorage.getItem('userHall')) || '';

      // Residents only see requests from their own hall. Prefer the explicit
      // hall tag on the report; fall back to parsing the location for older
      // reports saved before the tag existed.
      const target = userHall.trim().toLowerCase();
      const hallReports = userHall
        ? reports.filter(r => {
            const reportHall = (r.hall || getHall(r.location) || '').toLowerCase();
            return reportHall === target;
          })
        : reports;

      const active = hallReports.filter(r => !isDoneStatus(r.status));
      const completed = hallReports.filter(r => isDoneStatus(r.status));

      setActiveRequests(active);
      setHistory(completed);

      const draftsData = await AsyncStorage.getItem('drafts');
      const draftsList = draftsData ? JSON.parse(draftsData) : [];
      setDrafts(draftsList);

    } catch (error) {
      console.log('Error loading requests:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'in progress':
        return theme.primary;
      case 'scheduled':
        return '#F39C12';
      case 'completed':
        return '#27AE60';
      default:
        return '#8F6F6C';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'in progress':
        return 'rgba(175, 16, 26, 0.1)';
      case 'scheduled':
        return 'rgba(243, 156, 18, 0.1)';
      case 'completed':
        return 'rgba(39, 174, 96, 0.1)';
      default:
        return 'rgba(143, 111, 108, 0.1)';
    }
  };

  const handleNewRequest = () => {
    navigation.navigate('Home');
  };

  const handleClearReport = (request: any) => {
    Alert.alert(
      'Clear Report',
      'Remove this report from your history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const id = request.id || request.timestamp;
            const remaining = await deleteReport(id);
            setHistory(remaining.filter(r => isDoneStatus(r.status)));
          },
        },
      ]
    );
  };

  const handleClearActive = () => {
    if (activeRequests.length === 0) return;
    Alert.alert(
      'Clear Active Requests',
      'Remove all active requests? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearActive();
            setActiveRequests([]);
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
    if (history.length === 0) return;
    Alert.alert(
      'Clear History',
      'Remove all resolved reports from your history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const handleResumeDraft = (draft: any) => {
    Alert.alert(
      'Resume Draft',
      `Resume draft for "${draft.serviceType}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Resume', 
          onPress: () => {
            navigation.navigate('PhotosUpload', {
              serviceType: draft.serviceType,
              selectedIssue: draft.selectedIssue,
              photos: draft.photos || [],
              video: draft.video || null,
              writtenDetails: draft.writtenDetails || '',
            });
          }
        }
      ]
    );
  };

  const handleDeleteDraft = (index: number) => {
    Alert.alert(
      'Delete Draft',
      'Delete this draft? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = drafts.filter((_, i) => i !== index);
            setDrafts(updated);
            await AsyncStorage.setItem('drafts', JSON.stringify(updated));
          },
        },
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

  const renderDrafts = () => {
    if (drafts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ClipboardIcon color={theme.primary} size={24} />
          <Text style={styles.emptyText}>No drafts saved</Text>
          <Text style={styles.emptySubtext}>Start a new request to save drafts</Text>
        </View>
      );
    }

    return drafts.map((draft, index) => (
      <View key={index} style={styles.requestCard}>
        <View style={styles.requestList}>
          <Text style={styles.requestTitle}>{draft.serviceType || 'Draft'}</Text>
          <Text style={styles.requestLocation}>{draft.location || 'No location'}</Text>
          <Text style={styles.requestDate}>
            Drafted {draft.timestamp ? new Date(draft.timestamp).toLocaleDateString() : 'recently'}
          </Text>
        </View>
        <View style={styles.draftActions}>
          <TouchableOpacity
            style={styles.draftDeleteButton}
            onPress={() => handleDeleteDraft(index)}
          >
            <Text style={styles.draftDeleteText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={() => handleResumeDraft(draft)}
          >
            <Text style={styles.resumeButtonText}>RESUME</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  const renderActiveRequests = () => {
    if (activeRequests.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <WrenchIcon color={theme.primary} size={24} />
          <Text style={styles.emptyText}>No active requests</Text>
          <Text style={styles.emptySubtext}>Your active maintenance requests will appear here</Text>
        </View>
      );
    }

    return activeRequests.map((request) => (
      <TouchableOpacity
        key={request.id || request.timestamp}
        style={styles.requestCard}
        onPress={() => navigation.navigate('RequestDetail', { request })}
        activeOpacity={0.7}
      >
        <View style={styles.requestHeader}>
          <Text style={styles.requestTitle}>{request.serviceType || 'Request'}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusBgColor(request.status) }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(request.status) }
            ]}>
              {request.status || 'Pending'}
            </Text>
          </View>
        </View>
        <Text style={styles.requestLocation}>{request.location || 'No location'}</Text>
        <Text style={styles.requestId}>
          ID: {request.referenceId || 'Pending'} • Submitted {request.timestamp ? new Date(request.timestamp).toLocaleDateString() : 'recently'}
        </Text>
        <Text style={styles.awaitingText}>A technician will update you when this is resolved.</Text>
        <View style={styles.viewDetailsRow}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <ChevronRightIcon color={theme.primary} size={16} />
        </View>
      </TouchableOpacity>
    ));
  };

  const renderHistory = () => {
    if (history.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ClipboardIcon color={theme.primary} size={24} />
          <Text style={styles.emptyText}>No history</Text>
          <Text style={styles.emptySubtext}>Completed requests will appear here</Text>
        </View>
      );
    }

    return history.map((request) => {
      const statusLabel = (request.status || 'completed').toLowerCase();
      const displayStatus = statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1);
      const doneDate = request.resolvedAt || request.completedAt || request.timestamp;
      return (
        <View key={request.id || request.timestamp} style={[styles.requestCard, styles.completedCard]}>
          <View style={styles.requestHeader}>
            <Text style={styles.requestTitle}>{request.serviceType || 'Request'}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: 'rgba(39, 174, 96, 0.1)' }
            ]}>
              <Text style={[styles.statusText, { color: '#27AE60' }]}>
                {displayStatus}
              </Text>
            </View>
          </View>
          <Text style={styles.requestLocation}>{request.location || 'No location'}</Text>
          <Text style={styles.requestId}>
            ID: {request.referenceId || 'N/A'} • {displayStatus} {doneDate ? new Date(doneDate).toLocaleDateString() : 'recently'}
          </Text>
          <TouchableOpacity
            style={styles.cardClearButton}
            onPress={() => handleClearReport(request)}
          >
            <Text style={styles.cardClearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      );
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Active':
        return (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Active Requests</Text>
              {activeRequests.length > 0 && (
                <TouchableOpacity onPress={handleClearActive}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            {renderActiveRequests()}
          </>
        );
      case 'History':
        return (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>History</Text>
              {history.length > 0 && (
                <TouchableOpacity onPress={handleClearHistory}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            {renderHistory()}
          </>
        );
      case 'Drafts':
        return (
          <>
            <Text style={styles.sectionTitle}>Drafts</Text>
            {renderDrafts()}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={theme.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          
          <View style={styles.tabContainer}>
            {['Active', 'History', 'Drafts'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.newRequestButton} onPress={handleNewRequest}>
            <LinearGradient
              colors={[theme.primary, theme.primaryContainer]}
              style={styles.newRequestGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.newRequestText}>+ New Request</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.requestList}>
            {renderContent()}
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
    fontSize: 18,
    color: theme.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  activeTabText: {
    color: theme.primary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.primary,
  },
  newRequestButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  newRequestGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newRequestText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primaryText,
  },
  requestList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: 12,
  },
  cardClearButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardClearText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.primary,
    textTransform: 'uppercase',
  },
  requestCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
  },
  completedCard: {
    opacity: 0.75,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
  },
  requestLocation: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  requestId: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  awaitingText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontStyle: 'italic',
    marginTop: 10,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
    textTransform: 'uppercase',
  },
  draftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  draftDeleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  draftDeleteText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.primary,
    textTransform: 'uppercase',
  },
  resumeButton: {
    backgroundColor: theme.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  resumeButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.primaryText,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  bottomSpacer: {
    height: 80,
  },
});