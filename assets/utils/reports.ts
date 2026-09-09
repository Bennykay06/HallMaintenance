// src/utils/reports.ts
// Report store, now backed by Supabase instead of AsyncStorage + the mock
// server on port 3001.
//
// The exported names are unchanged so the screens that import them keep
// working, but two behaviours are deliberately different now that the data
// is shared with the admin dashboard:
//
//   * Deleting. A student clearing their history used to remove reports
//     outright. Those are the hall's maintenance records now, so "clear"
//     hides them on this device only (see HIDDEN_KEY below) and the
//     database keeps the row. RLS enforces this too — students have no
//     delete permission on reports.
//
//   * Resolution. processDueResolutions() used to fake a technician
//     resolving a request after 24 hours. Real technicians now do that from
//     the dashboard, and the student is notified by a database trigger, so
//     the simulation is gone.
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '../../lib/supabase';
import { fetchMyReports, getCurrentUserId, type Report } from '../../lib/api';

export type { Report };

// Ids the student has cleared from their own lists. Local-only.
const HIDDEN_KEY = 'hiddenReportIds';
// Last successful fetch, so the lists still render offline.
const CACHE_KEY = 'reportsCache';

// Kept for screens that still import it. No longer used to schedule a fake
// resolution — a technician decides when a job is done.
export const RESOLVE_DELAY_MS = 24 * 60 * 60 * 1000;

// A request belongs in History once it is resolved or completed.
export const isDoneStatus = (status?: string): boolean => {
  const s = (status || '').toLowerCase();
  return s === 'completed' || s === 'resolved';
};

const getHiddenIds = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(HIDDEN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const addHiddenIds = async (ids: string[]): Promise<void> => {
  const existing = await getHiddenIds();
  const next = Array.from(new Set([...existing, ...ids]));
  await AsyncStorage.setItem(HIDDEN_KEY, JSON.stringify(next));
};

/**
 * True when the Supabase project is reachable. Replaces the old ping to
 * localhost:3001; screens use it to decide whether to show an offline hint.
 */
export const checkServerRunning = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('halls').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};

/**
 * @deprecated The REST mock server is gone. Retained so older call sites
 * still compile; anything using it should move to lib/api.ts.
 */
export const getApiUrl = (): string => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  return `${url}/rest/v1`;
};

export const getReports = async (): Promise<Report[]> => {
  try {
    const [reports, hidden] = await Promise.all([fetchMyReports(), getHiddenIds()]);
    const visible = reports.filter(r => !hidden.includes(r.id));
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(visible));
    return visible;
  } catch (error) {
    console.log('[reports] fetch failed, falling back to cache:', error);
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
};

/**
 * @deprecated Reports are written one at a time through
 * `createReport()` in lib/api.ts. Overwriting the whole collection is what
 * the mock server did and it cannot work against a shared database — it
 * would clobber every other student's reports.
 *
 * Left in place only to keep the local cache warm for callers that still
 * hand back a full list.
 */
export const saveReports = async (reports: Report[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(reports));
  } catch (error) {
    console.log('[reports] failed to update cache:', error);
  }
};

/** Hides a single request from this device's lists. */
export const deleteReport = async (id: string): Promise<Report[]> => {
  await addHiddenIds([id]);
  return getReports();
};

/** Hides every resolved/completed request, leaving active ones visible. */
export const clearHistory = async (): Promise<Report[]> => {
  const reports = await getReports();
  await addHiddenIds(reports.filter(r => isDoneStatus(r.status)).map(r => r.id));
  return getReports();
};

/** Hides every request that is not yet resolved, leaving History visible. */
export const clearActive = async (): Promise<Report[]> => {
  const reports = await getReports();
  await addHiddenIds(reports.filter(r => !isDoneStatus(r.status)).map(r => r.id));
  return getReports();
};

/**
 * Previously simulated a technician resolving overdue requests. Status now
 * changes only when real staff act on the report in the dashboard, and the
 * student's notification is written by a database trigger.
 *
 * Kept as a no-op so the screens that poll it on focus still compile; they
 * refresh from the server on their own.
 */
export const processDueResolutions = async (): Promise<boolean> => false;

/**
 * Live updates for the Requests screen. Returns an unsubscribe function.
 */
export const subscribeToReports = async (onChange: () => void): Promise<() => void> => {
  const userId = await getCurrentUserId();
  if (!userId) return () => {};

  const channel = supabase
    .channel(`reports:mine:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reports', filter: `student_id=eq.${userId}` },
      () => onChange()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
