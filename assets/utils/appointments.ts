// src/utils/appointments.ts
// Shared store for maintenance appointments booked from the chat screen and
// shown in the Home screen's "Maintenance Schedule" section.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'maintenanceAppointments';

export interface Appointment {
  id: string;
  title: string;
  date: string; // display string, e.g. "Jul 3 • 2:00 PM – 3:00 PM"
}

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log('Error loading appointments:', error);
    return [];
  }
};

// Adds (or replaces by id) an appointment, keeping the newest first.
export const addAppointment = async (appt: Appointment): Promise<void> => {
  try {
    const existing = await getAppointments();
    const next = [appt, ...existing.filter(a => a.id !== appt.id)];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.log('Error saving appointment:', error);
  }
};
