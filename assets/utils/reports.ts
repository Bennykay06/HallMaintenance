// src/utils/reports.ts
// Shared store for maintenance reports/requests plus the simulated technician
// side of the workflow.
//
// In a real system a technician would use a separate app to mark a request
// resolved, which would push a notification to the student. This app is
// student-only, so `processDueResolutions` simulates that: once a request's
// scheduled resolution time passes, it is marked resolved and a notification
// is posted on the technician's behalf. The student never resolves their own
// request.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addNotification } from './notifications';
import { Platform } from 'react-native';

const STORAGE_KEY = 'reports';

export const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/api';
  }
  return 'http://localhost:3001/api';
};

export const checkServerRunning = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 800);
    const res = await fetch(`${getApiUrl()}/ping`, { signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  } catch (e) {
    return false;
  }
};

// How long after submission the simulated technician resolves the request.

// How long after submission the simulated technician resolves the request.
// Kept long (24h) so submitted requests stay in the Active tab during use
// instead of resolving into History moments after submission.
export const RESOLVE_DELAY_MS = 24 * 60 * 60 * 1000;

const TECHNICIANS = [
  { name: 'John Miller', role: 'Lead Facilities Specialist', online: true },
  { name: 'Sarah Johnson', role: 'Electrical Specialist', online: false },
  { name: 'David Chen', role: 'Plumbing Technician', online: true },
];

// A request belongs in History once it is resolved or completed.
export const isDoneStatus = (status?: string): boolean => {
  const s = (status || '').toLowerCase();
  return s === 'completed' || s === 'resolved';
};

// Pick a technician deterministically from an id so a given request keeps the
// same assignee across runs.
const pickTechnician = (seed: string) => {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return TECHNICIANS[sum % TECHNICIANS.length];
};

export const getReports = async (): Promise<any[]> => {
  try {
    const serverRunning = await checkServerRunning();
    if (serverRunning) {
      const res = await fetch(`${getApiUrl()}/reports`);
      if (res.ok) {
        const reports = await res.json();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
        return reports;
      }
    }
  } catch (error) {
    console.log('Error fetching reports from server, falling back to local:', error);
  }

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log('Error loading reports:', error);
    return [];
  }
};

export const saveReports = async (reports: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (error) {
    console.log('Error saving reports:', error);
  }

  try {
    const serverRunning = await checkServerRunning();
    if (serverRunning) {
      await fetch(`${getApiUrl()}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reports),
      });
    }
  } catch (error) {
    console.log('Error syncing reports to server:', error);
  }
};

// Removes a single request from the store by id (used by the History tab's
// per-item Clear action). Returns the remaining reports.
export const deleteReport = async (id: string): Promise<any[]> => {
  const reports = await getReports();
  const remaining = reports.filter(r => (r.id || r.timestamp) !== id);
  await saveReports(remaining);
  return remaining;
};

// Clears the History tab: removes every resolved/completed request while
// keeping active ones untouched. Returns the remaining (active) reports.
export const clearHistory = async (): Promise<any[]> => {
  const reports = await getReports();
  const remaining = reports.filter(r => !isDoneStatus(r.status));
  await saveReports(remaining);
  return remaining;
};

// Clears the Active list: removes every request that is not yet resolved or
// completed, leaving History (done requests) untouched. Returns the remaining
// reports.
export const clearActive = async (): Promise<any[]> => {
  const reports = await getReports();
  const remaining = reports.filter(r => isDoneStatus(r.status));
  await saveReports(remaining);
  return remaining;
};

// Simulates the technician resolving any requests whose scheduled resolution
// time has passed. For each newly resolved request it posts a notification.
// Returns true if anything changed so callers can refresh their UI.
export const processDueResolutions = async (): Promise<boolean> => {
  const reports = await getReports();
  const now = Date.now();
  let changed = false;

  for (const report of reports) {
    const due = report.resolveDueAt && report.resolveDueAt <= now;
    if (!isDoneStatus(report.status) && due) {
      const technician = report.technician || pickTechnician(report.id || String(now));
      report.status = 'resolved';
      report.resolvedAt = new Date().toISOString();
      report.technician = technician;
      changed = true;

      await addNotification({
        id: `resolved-${report.id || now}`,
        type: 'maintenance',
        title: `Request Resolved${report.referenceId ? ` • #${report.referenceId}` : ''}`,
        message: `${technician.name} has resolved your ${report.serviceType || 'maintenance'} request${
          report.location ? ` at ${report.location}` : ''
        }.`,
        time: 'Just now',
        createdAt: new Date().toISOString(),
        isRead: false,
        isNew: true,
        icon: '✅',
        category: report.serviceType || 'Maintenance Request',
        description:
          report.writtenDetails || report.selectedIssue || 'Your reported issue has been resolved.',
        status: 'RESOLVED',
        technician,
      });
    }
  }

  if (changed) await saveReports(reports);
  return changed;
};
