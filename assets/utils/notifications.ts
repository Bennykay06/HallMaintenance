// src/utils/notifications.ts
// Notification Center store.
//
// Notifications are no longer written by the app itself. When a technician
// picks up or resolves a report in the dashboard, a database trigger
// (notify_student_on_report_change) inserts the row, and this device either
// receives it over realtime or picks it up on the next fetch. That is why
// addNotification() is now a local-only helper rather than the main path.
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '../../lib/supabase';
import {
  fetchNotifications,
  markNotificationRead as markReadOnServer,
  markAllNotificationsRead,
  getCurrentUserId,
} from '../../lib/api';

const CACHE_KEY = 'notifications';

export interface StoredNotification {
  id: string;
  type: 'alert' | 'maintenance' | 'system';
  title: string;
  message: string;
  time: string; // display string, e.g. "Just now"
  createdAt: string; // ISO timestamp
  isRead: boolean;
  isNew?: boolean;
  icon: string;
  category?: string;
  description?: string;
  status?: string;
  technician?: { name: string; role: string; online: boolean };
  reportId?: string | null;
}

/** "Just now", "5m ago", "3h ago", "12 Jun" — matches the old display style. */
const relativeTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const diff = Date.now() - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' });
};

export const getNotifications = async (): Promise<StoredNotification[]> => {
  try {
    const rows = await fetchNotifications();
    const list: StoredNotification[] = rows.map(n => ({
      id: n.id,
      type: (n.type as StoredNotification['type']) ?? 'maintenance',
      title: n.title,
      message: n.message,
      description: n.description,
      category: n.category ?? undefined,
      icon: n.icon,
      isRead: n.isRead,
      isNew: n.isNew,
      createdAt: n.createdAt,
      time: relativeTime(n.createdAt),
      reportId: n.reportId,
    }));

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list));
    return list;
  } catch (error) {
    console.log('Error loading notifications, using cache:', error);
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
};

export const saveNotifications = async (list: StoredNotification[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list));
  } catch (error) {
    console.log('Error caching notifications:', error);
  }
};

/**
 * Adds a purely local notification (e.g. a client-side reminder). Server
 * notifications arrive on their own — do not call this to mirror one, or the
 * entry will appear twice.
 */
export const addNotification = async (notification: StoredNotification): Promise<void> => {
  const existing = await getNotifications();
  await saveNotifications([notification, ...existing]);
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await markReadOnServer(id);

  const cached = await AsyncStorage.getItem(CACHE_KEY);
  if (!cached) return;
  try {
    const list: StoredNotification[] = JSON.parse(cached);
    await saveNotifications(
      list.map(n => (n.id === id ? { ...n, isRead: true, isNew: false } : n))
    );
  } catch {
    // Malformed cache is rebuilt on the next fetch.
  }
};

/**
 * Clears the Notification Center. Marks everything read on the server rather
 * than deleting, so the history stays available for support queries.
 */
export const clearNotifications = async (): Promise<void> => {
  await markAllNotificationsRead();
  await saveNotifications([]);
};

/** Live notifications while a screen is mounted. Returns an unsubscribe fn. */
export const subscribeToNotifications = async (
  onChange: () => void
): Promise<() => void> => {
  const userId = await getCurrentUserId();
  if (!userId) return () => {};

  const channel = supabase
    .channel(`notifications:feed:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      () => onChange()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
