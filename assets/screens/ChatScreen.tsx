// src/screens/ChatScreen.tsx
//
// DEPRECATED — this screen used to let a student negotiate/confirm a repair
// appointment in a live chat with a simulated "technician" persona. That
// flow is gone: the hall admin now books appointments directly from the
// admin dashboard and coordinates with the technician by phone, so there is
// no in-app technician chat or negotiation anymore. The student's Home tab
// and the new Appointments screen (assets/screens/AppointmentsScreen.tsx)
// just remind them once they've been booked.
//
// No screen in the app navigates here anymore (see App.js — the "Chat"
// route was removed). Safe to delete: assets/screens/ChatScreen.tsx
export default function ChatScreen() {
  return null;
}
