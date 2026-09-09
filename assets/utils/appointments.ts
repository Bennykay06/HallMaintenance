// src/utils/appointments.ts
// Shared store for maintenance appointments — booked by the hall admin from
// the dashboard, and shown here purely as a reminder in the Home screen's
// "Maintenance Schedule" section and the Appointments screen. There is no
// in-app booking or technician negotiation; the admin schedules the visit
// and coordinates with the technician by phone.
//
// Backed by the `appointments` table so this updates the moment the admin
// books a visit. AsyncStorage is kept as an offline cache, not as the
// source of truth.
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '../../lib/supabase';
import { getCurrentUserId } from '../../lib/api';

const CACHE_KEY = 'maintenanceAppointments';

export interface Appointment {
  id: string;
  title: string;
  date: string; // display string, e.g. "Jul 3 • 2:00 PM – 3:00 PM"
  scheduledFor?: string | null; // raw ISO timestamp, for sorting/formatting
  reportId?: string | null;
  status?: string;
  category?: string | null; // e.g. "Electrical" — copied from the report
  fault?: string | null; // the reported fault, e.g. "Socket not working"
}

const rowToAppointment = (row: any): Appointment => ({
  id: row.id,
  title: row.title,
  date: row.slot_label || '',
  scheduledFor: row.scheduled_for ?? null,
  reportId: row.report_id ?? null,
  status: row.status,
  category: row.report_category ?? null,
  fault: row.report_issue ?? null,
});

// ---------------------------------------------------------------------
// Display helpers — shared by the Home screen's "Maintenance Schedule"
// section and the Appointments screen so both cards read identically.
// ---------------------------------------------------------------------
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parse = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** "Mon, 12 Sep 2026" — formatted by hand so it reads the same on every device. */
export const formatAppointmentDate = (iso?: string | null): string | null => {
  const d = parse(iso);
  if (!d) return null;
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** "2:00 PM" */
export const formatAppointmentTime = (iso?: string | null): string | null => {
  const d = parse(iso);
  if (!d) return null;
  const hours = d.getHours();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(d.getMinutes()).padStart(2, '0')} ${suffix}`;
};

/**
 * What's being repaired, as the hall admin recorded it when booking. They
 * type a title in the dashboard; when they leave it blank it defaults to
 * "<category> visit — <issue>", so the title is the fault either way.
 *
 * Whitespace is collapsed because the issue text is copied from the
 * student's own report, which often carries stray line breaks from the
 * "Other: ..." free-text box — those would otherwise blow a card open.
 */
export const faultLabel = (appt: Appointment): string => {
  const tidy = (value?: string | null) => (value || '').replace(/\s+/g, ' ').trim();
  return tidy(appt.title) || tidy(appt.fault) || tidy(appt.category) || 'Maintenance visit';
};

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('appointments')
      .select('id, title, slot_label, scheduled_for, status, report_id, report_category, report_issue, created_at')
      .eq('student_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const appointments = (data ?? []).map(rowToAppointment);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(appointments));
    return appointments;
  } catch (error) {
    console.log('Error loading appointments, using cache:', error);
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
 * Books an appointment. The caller supplies its own id for optimistic
 * rendering; the database assigns the real one, so the returned list is
 * what should be trusted afterwards.
 */
export const addAppointment = async (appt: Appointment): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.log('Cannot book an appointment while signed out');
    return;
  }

  const { error } = await supabase.from('appointments').insert({
    student_id: userId,
    // The chat passes the request id through; '—' means general support.
    report_id: appt.reportId && appt.reportId !== '—' ? appt.reportId : null,
    title: appt.title,
    slot_label: appt.date,
    status: appt.status ?? 'scheduled',
  });

  if (error) {
    console.log('Error saving appointment:', error.message);
    return;
  }

  // Refresh the cache so the Home screen reflects the booking immediately.
  await getAppointments();
};
