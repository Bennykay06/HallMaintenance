// src/screens/AppointmentsScreen.tsx
// Full list of the signed-in student's maintenance appointments, booked by a
// hall admin from the dashboard. Each card is a plain reminder: the fault
// the admin recorded, plus the date and time they set. Nothing is tappable —
// there is no in-app booking or rescheduling.
// Reachable from the Home screen's "Maintenance Schedule" section.
import { ArrowLeftIcon, WrenchIcon, CalendarIcon, CheckCircleIcon, CloseIcon, ClockIcon } from '../components/Icons';

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import {
  getAppointments,
  Appointment,
  faultLabel,
  formatAppointmentDate,
  formatAppointmentTime,
} from '../utils/appointments';

export default function AppointmentsScreen({ navigation }: any) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAppointments = useCallback(async () => {
    const list = await getAppointments();
    // Soonest first; items without a parseable date sink to the bottom.
    const sorted = [...list].sort((a, b) => {
      const ta = a.scheduledFor ? new Date(a.scheduledFor).getTime() : NaN;
      const tb = b.scheduledFor ? new Date(b.scheduledFor).getTime() : NaN;
      if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
      if (Number.isNaN(ta)) return 1;
      if (Number.isNaN(tb)) return -1;
      return ta - tb;
    });
    setAppointments(sorted);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadAppointments();
      setLoading(false);
    })();
    const unsubscribe = navigation.addListener('focus', loadAppointments);
    return unsubscribe;
  }, [navigation, loadAppointments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const getStatusMeta = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'completed':
        return { label: 'Completed', color: '#27AE60', bg: 'rgba(39, 174, 96, 0.1)', Icon: CheckCircleIcon };
      case 'cancelled':
        return { label: 'Cancelled', color: '#8F6F6C', bg: 'rgba(143, 111, 108, 0.12)', Icon: CloseIcon };
      default:
        return { label: 'Scheduled', color: '#F39C12', bg: 'rgba(243, 156, 18, 0.1)', Icon: ClockIcon };
    }
  };

  const renderAppointments = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={theme.primary} />
        </View>
      );
    }

    if (appointments.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <CalendarIcon color={theme.primary} size={28} />
          <Text style={styles.emptyText}>No appointments yet</Text>
          <Text style={styles.emptySubtext}>
            Once your hall admin books a repair visit for one of your requests, it'll show up here.
          </Text>
        </View>
      );
    }

    return appointments.map((appt) => {
      const meta = getStatusMeta(appt.status);
      // Fall back to the admin's slot label if the timestamp is missing.
      const date = formatAppointmentDate(appt.scheduledFor) || appt.date || 'Date to be confirmed';
      const time = formatAppointmentTime(appt.scheduledFor);
      return (
        <View key={appt.id} style={styles.card}>
          <View style={[styles.cardIcon, { backgroundColor: theme.surfaceContainer }]}>
            <WrenchIcon color={theme.primary} size={20} />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle} numberOfLines={2}>{faultLabel(appt)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                <meta.Icon color={meta.color} size={12} />
                <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <CalendarIcon color={theme.textSecondary} size={14} />
              <Text style={styles.metaText}>{date}</Text>
            </View>
            {!!time && (
              <View style={styles.metaRow}>
                <ClockIcon color={theme.textSecondary} size={14} />
                <Text style={styles.metaText}>{time}</Text>
              </View>
            )}
          </View>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={theme.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maintenance Schedule</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {renderAppointments()}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 6,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginTop: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
    maxWidth: '80%',
  },
  bottomSpacer: {
    height: 20,
  },
});
