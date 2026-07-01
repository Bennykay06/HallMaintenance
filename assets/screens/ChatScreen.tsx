// src/screens/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { addAppointment } from '../utils/appointments';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

interface Message {
  id: string;
  text: string;
  time: string;
  isTechnician: boolean;
  isSystem?: boolean;
}

interface ScheduleSlot {
  date: string;
  day: string;
  time: string;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Build an appointment slot `daysAhead` days from now with the given time window.
const buildSlot = (daysAhead: number, time: string): ScheduleSlot => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return {
    date: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
    day: daysAhead === 1 ? `Tomorrow, ${WEEKDAYS[d.getDay()]}` : WEEKDAYS[d.getDay()],
    time,
  };
};

// Default suggested appointment slot: the next day. Overridable via route params.
const buildSuggestedSlot = (): ScheduleSlot => buildSlot(1, '2:00 PM – 3:00 PM');

// Format a slot to match the Home "Maintenance Schedule" date style,
// e.g. "Jul 3 • 2:00 PM – 3:00 PM".
const formatSlotForSchedule = (slot: ScheduleSlot): string => {
  const [mon, day] = slot.date.split(' ');
  const monTitle = mon.charAt(0) + mon.slice(1).toLowerCase();
  return `${monTitle} ${day} • ${slot.time}`;
};

// Format a picked Date as "MM/DD • hh:mm AM/PM" — month/day/time including
// hours and minutes. Used for appointments negotiated via the time picker.
const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
const formatDateTime = (d: Date): string => {
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  let hours = d.getHours();
  const minutes = pad(d.getMinutes());
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${month}/${day} • ${pad(hours)}:${minutes} ${meridiem}`;
};

const nowTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Canned lines used by the mock responder below.
const TECHNICIAN_REPLIES = [
  'Got it — thanks for letting me know.',
  'Understood. I\'ll take a look and get back to you shortly.',
  'Thanks! I\'ve noted that on the work order.',
  'Okay, that works for me.',
  'Appreciate the update — I\'ll follow up soon.',
];

/**
 * The single seam between the app and the "technician" side of the chat.
 * Today it returns a canned line after a short delay to simulate a reply.
 *
 * To go live later, replace ONLY the body of this function with a real
 * network/socket call that resolves to the reply text (or null for no reply).
 * Nothing else in the screen needs to change.
 */
const fetchTechnicianReply = async (userText: string): Promise<string | null> => {
  // Simulated network / response latency
  await new Promise(resolve => setTimeout(resolve, 1200));
  const index = Math.floor(Math.random() * TECHNICIAN_REPLIES.length);
  return TECHNICIAN_REPLIES[index];
};

export default function ChatScreen({ navigation, route }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('User');
  const [profileVisible, setProfileVisible] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // After declining the suggested slot, the chat unlocks so the student can
  // negotiate a new time before setting (and booking) the new appointment.
  const [declined, setDeclined] = useState(false);
  const [iosPickerVisible, setIosPickerVisible] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date>(new Date());
  const scrollViewRef = useRef<ScrollView>(null);
  const isMountedRef = useRef(true);

  // Technician + request context passed in from the previous screen
  const technician = route?.params?.technician || {
    name: 'Technician',
    role: 'Service Technician',
    online: false,
  };
  const requestId = route?.params?.requestId ?? '—';
  const requestTitle = route?.params?.requestTitle || 'Conversation';
  const storageKey = `chat:${requestId}`;

  // Suggested appointment slot: from route params, otherwise the next day
  const [suggestedSlot] = useState<ScheduleSlot>(
    () => route?.params?.proposedSlot || buildSuggestedSlot()
  );

  useEffect(() => {
    isMountedRef.current = true;
    loadConversation();
    return () => {
      isMountedRef.current = false;
      // Clear the conversation when leaving the chat (back navigation, hardware
      // back, or swipe-back), so reopening the chat starts fresh.
      AsyncStorage.removeItem(storageKey).catch(() => {});
    };
  }, []);

  // Persist the conversation whenever it changes (after the initial load)
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      storageKey,
      JSON.stringify({ messages })
    ).catch(error => console.log('Error saving chat:', error));
  }, [messages, hydrated]);

  const loadConversation = async () => {
    try {
      const [name, raw] = await Promise.all([
        AsyncStorage.getItem('userName'),
        AsyncStorage.getItem(storageKey),
      ]);
      if (name) setUserName(name);
      if (raw) {
        const saved = JSON.parse(raw);
        setMessages(Array.isArray(saved.messages) ? saved.messages : []);
      }
    } catch (error) {
      console.log('Error loading chat:', error);
    } finally {
      setHydrated(true);
      scrollToBottom();
    }
  };

  // Keep the latest message visible when the keyboard opens
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => scrollToBottom());
    return () => sub.remove();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      time: nowTime(),
      isTechnician: false,
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    scrollToBottom();

    // Ask the technician side for a reply. This is a local mock today;
    // swap fetchTechnicianReply's body for a real backend later.
    setIsTyping(true);
    scrollToBottom();
    try {
      const replyText = await fetchTechnicianReply(trimmed);
      if (!isMountedRef.current) return;
      if (replyText) {
        const reply: Message = {
          id: `${Date.now()}-tech`,
          text: replyText,
          time: nowTime(),
          isTechnician: true,
        };
        setMessages(prev => [...prev, reply]);
      }
    } catch (error) {
      console.log('Error fetching technician reply:', error);
    } finally {
      if (isMountedRef.current) setIsTyping(false);
      scrollToBottom();
    }
  };

  // Books the appointment (with the given display label) into the Home
  // "Maintenance Schedule" and takes the student there.
  const bookAndGoToSchedule = async (dateLabel: string) => {
    await addAppointment({
      id: `appt-${requestId}`,
      title: `Appointment with ${technician.name}`,
      date: dateLabel,
    });
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const handleConfirmSchedule = () => {
    Alert.alert(
      'Confirm Appointment',
      `Confirm the appointment for ${suggestedSlot.day} at ${suggestedSlot.time}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => bookAndGoToSchedule(formatSlotForSchedule(suggestedSlot)) },
      ]
    );
  };

  // Declining does NOT book anything — it unlocks the chat so the student can
  // negotiate a new time with the technician first.
  const handleDeclineSchedule = () => {
    setDeclined(true);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: `You declined the suggested time. Chat with ${technician.name} to agree on a new time, then tap "Set New Appointment".`,
        time: nowTime(),
        isTechnician: false,
        isSystem: true,
      },
    ]);
    scrollToBottom();
  };

  // Finalize the negotiated appointment: confirm and book the picked date/time.
  const finalizeAppointment = (picked: Date) => {
    const label = formatDateTime(picked);
    Alert.alert(
      'Set New Appointment',
      `Set your appointment with ${technician.name} for ${label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Set Appointment', onPress: () => bookAndGoToSchedule(label) },
      ]
    );
  };

  // Only after negotiating does the student pick the agreed date + time
  // (hours and minutes), which then books it into the Home schedule.
  const handleSetNewAppointment = () => {
    const initial = new Date();
    initial.setDate(initial.getDate() + 1);
    initial.setMinutes(0, 0, 0);
    setPickerDate(initial);

    if (Platform.OS === 'android') {
      // Android: pick date first, then time (hours + minutes).
      DateTimePickerAndroid.open({
        value: initial,
        mode: 'date',
        minimumDate: new Date(),
        onChange: (_e, pickedDate) => {
          if (_e.type !== 'set' || !pickedDate) return;
          DateTimePickerAndroid.open({
            value: pickedDate,
            mode: 'time',
            is24Hour: false,
            onChange: (_e2, pickedDateTime) => {
              if (_e2.type !== 'set' || !pickedDateTime) return;
              finalizeAppointment(pickedDateTime);
            },
          });
        },
      });
    } else {
      // iOS: single inline datetime picker (date + hours + minutes).
      setIosPickerVisible(true);
    }
  };

  const handleIosPickerChange = (_e: any, selected?: Date) => {
    if (selected) setPickerDate(selected);
  };

  const renderMessage = (item: Message) => {
    if (item.isSystem) {
      return (
        <View key={item.id} style={styles.systemMessageContainer}>
          <View style={[styles.systemMessage, { backgroundColor: theme.surfaceContainer }]}>
            <Text style={[styles.systemMessageText, { color: theme.textSecondary }]}>
              {item.text}
            </Text>
          </View>
        </View>
      );
    }

    const isTechnician = item.isTechnician;

    return (
      <View
        key={item.id}
        style={[
          styles.messageContainer,
          isTechnician ? styles.messageLeft : styles.messageRight,
        ]}
      >
        {isTechnician && (
          <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{getInitials(technician.name)}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isTechnician
              ? [styles.messageBubbleLeft, { backgroundColor: theme.surfaceContainer }]
              : [styles.messageBubbleRight, { backgroundColor: theme.primary }],
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isTechnician
                ? { color: theme.text }
                : { color: '#FFFFFF' },
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isTechnician
                ? { color: theme.textSecondary }
                : { color: 'rgba(255,255,255,0.7)' },
            ]}
          >
            {item.time}
          </Text>
        </View>
        {!isTechnician && (
          <View style={[styles.avatarContainer, styles.avatarRight, { backgroundColor: theme.primaryContainer }]}>
            <Text style={[styles.avatarText, { color: '#FFFFFF' }]}>
              {getInitials(userName)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderScheduleCard = () => {
    // After declining: negotiation mode — student agrees a time in chat, then sets it.
    if (declined) {
      return (
        <View style={[styles.scheduleCard, {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        }]}>
          <View style={[styles.scheduleHeader, {
            backgroundColor: theme.surfaceContainer,
            borderBottomColor: theme.border,
          }]}>
            <View style={styles.scheduleHeaderLeft}>
              <Text style={styles.scheduleIcon}>💬</Text>
              <Text style={[styles.scheduleTitle, { color: theme.text }]}>New Appointment</Text>
            </View>
            <View style={[styles.scheduleBadge, { backgroundColor: theme.primaryContainer }]}>
              <Text style={[styles.scheduleBadgeText, { color: theme.primary }]}>NEGOTIATING</Text>
            </View>
          </View>

          <View style={styles.scheduleBody}>
            <Text style={[styles.negotiateText, { color: theme.textSecondary }]}>
              Agree on a time with {technician.name} in the chat below, then set the appointment.
            </Text>
            <TouchableOpacity
              style={[styles.negotiateButton, { backgroundColor: theme.primary }]}
              onPress={handleSetNewAppointment}
            >
              <Text style={styles.negotiateButtonText}>Set New Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.scheduleCard, {
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }]}>
        <View style={[styles.scheduleHeader, {
          backgroundColor: theme.surfaceContainer,
          borderBottomColor: theme.border,
        }]}>
          <View style={styles.scheduleHeaderLeft}>
            <Text style={styles.scheduleIcon}>📅</Text>
            <Text style={[styles.scheduleTitle, { color: theme.text }]}>Schedule Appointment</Text>
          </View>
          <View style={[styles.scheduleBadge, { backgroundColor: theme.primaryContainer }]}>
            <Text style={[styles.scheduleBadgeText, { color: theme.primary }]}>DRAFT</Text>
          </View>
        </View>

        <View style={styles.scheduleBody}>
          <Text style={[styles.scheduleLabel, { color: theme.textSecondary }]}>Suggested Slot</Text>
          
          <View style={[styles.slotCard, {
            backgroundColor: theme.background,
            borderColor: theme.border,
          }]}>
            <View style={styles.slotDate}>
              <Text style={[styles.slotMonth, { color: theme.primary }]}>{suggestedSlot.date.split(' ')[0]}</Text>
              <Text style={[styles.slotDay, { color: theme.text }]}>{suggestedSlot.date.split(' ')[1]}</Text>
            </View>
            <View>
              <Text style={[styles.slotDayName, { color: theme.text }]}>{suggestedSlot.day}</Text>
              <Text style={[styles.slotTime, { color: theme.textSecondary }]}>{suggestedSlot.time}</Text>
            </View>
          </View>

          <View style={styles.slotActions}>
            <TouchableOpacity style={[styles.declineButton, { borderColor: theme.primary }]} onPress={handleDeclineSchedule}>
              <Text style={[styles.declineButtonText, { color: theme.primary }]}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.primary }]} onPress={handleConfirmSchedule}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderProfileRow = (label: string, value?: string) => {
    if (!value) return null;
    return (
      <View style={[styles.profileRow, { borderBottomColor: theme.border }]}>
        <Text style={[styles.profileRowLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.profileRowValue, { color: theme.text }]}>{value}</Text>
      </View>
    );
  };

  const renderTechnicianProfile = () => (
    <Modal
      visible={profileVisible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => setProfileVisible(false)}
    >
      <TouchableOpacity
        style={styles.profileOverlay}
        activeOpacity={1}
        onPress={() => setProfileVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={[styles.profileSheet, {
            backgroundColor: theme.surface,
            paddingBottom: Math.max(insets.bottom, 16),
          }]}
        >
          <View style={[styles.profileHandle, { backgroundColor: theme.border }]} />

          <View style={[styles.profileAvatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.profileAvatarText}>{getInitials(technician.name)}</Text>
          </View>
          <Text style={[styles.profileName, { color: theme.text }]}>{technician.name}</Text>
          <Text style={[styles.profileRole, { color: theme.textSecondary }]}>{technician.role}</Text>

          <View style={[styles.profileStatusPill, { backgroundColor: theme.surfaceContainer }]}>
            <View style={[styles.statusDot, { backgroundColor: technician.online ? '#22C55E' : '#888' }]} />
            <Text style={[styles.profileStatusText, { color: theme.text }]}>
              {technician.online ? 'Online now' : 'Offline'}
            </Text>
          </View>

          <View style={styles.profileRows}>
            {renderProfileRow('Role', technician.role)}
            {renderProfileRow('Phone', technician.phone)}
            {renderProfileRow('Email', technician.email)}
            {renderProfileRow('Assigned to', requestTitle)}
            {renderProfileRow('Request', requestId ? `#${requestId}` : undefined)}
          </View>

          <TouchableOpacity
            style={[styles.profileCloseButton, { backgroundColor: theme.primary }]}
            onPress={() => setProfileVisible(false)}
          >
            <Text style={styles.profileCloseText}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      {/* ===== HEADER ===== */}
      <View
        onLayout={e => setHeaderHeight(e.nativeEvent.layout.height)}
        style={[styles.header, {
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
        }]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.primary }]}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.technicianInfo}
            activeOpacity={0.7}
            onPress={() => setProfileVisible(true)}
          >
            <View style={[styles.technicianAvatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.technicianAvatarText}>
                {getInitials(technician.name)}
              </Text>
            </View>
            <View>
              <Text style={[styles.technicianName, { color: theme.text }]}>{technician.name}</Text>
              <View style={styles.technicianStatus}>
                <View style={[styles.statusDot, { backgroundColor: technician.online ? '#22C55E' : '#888' }]} />
                <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                  {technician.online ? 'Online' : 'Offline'} • {technician.role}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + headerHeight : 0}
      >
        <View style={styles.chatContainer}>
            {/* ===== MESSAGES ===== */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {/* System Divider */}
              <View style={styles.systemDivider}>
                <View style={[styles.systemDividerLine, { backgroundColor: theme.border }]} />
                <View style={[styles.systemDividerText, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.systemDividerLabel, { color: theme.textSecondary }]}>
                    {requestTitle} • Request {requestId}
                  </Text>
                </View>
                <View style={[styles.systemDividerLine, { backgroundColor: theme.border }]} />
              </View>

              {hydrated && declined && messages.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                    No messages yet. Send a message to start the conversation with {technician.name}.
                  </Text>
                </View>
              )}

              {messages.map((item) => renderMessage(item))}

              {/* Typing indicator while the technician "replies" */}
              {isTyping && (
                <View style={[styles.messageContainer, styles.messageLeft]}>
                  <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
                    <Text style={styles.avatarText}>{getInitials(technician.name)}</Text>
                  </View>
                  <View style={[styles.messageBubble, styles.messageBubbleLeft, styles.typingBubble, { backgroundColor: theme.surfaceContainer }]}>
                    <Text style={[styles.typingText, { color: theme.textSecondary }]}>typing…</Text>
                  </View>
                </View>
              )}

              {/* Schedule Card */}
              {renderScheduleCard()}
            </ScrollView>

            {/* ===== CHAT INPUT ===== */}
            <View style={[styles.inputContainer, {
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
              paddingBottom: Math.max(insets.bottom, 10),
            }]}>
              {declined ? (
                <View style={[styles.inputWrapper, {
                  backgroundColor: theme.surfaceContainer,
                  borderColor: theme.border,
                }]}>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Type your message..."
                    placeholderTextColor={theme.textSecondary}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    returnKeyType="send"
                    onSubmitEditing={handleSendMessage}
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: theme.primary }]}
                    onPress={handleSendMessage}
                  >
                    <Text style={styles.sendIcon}>📤</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.lockedInput, {
                  backgroundColor: theme.surfaceContainer,
                  borderColor: theme.border,
                }]}>
                  <Text style={styles.lockedIcon}>🔒</Text>
                  <Text style={[styles.lockedText, { color: theme.textSecondary }]}>
                    Decline the suggested time to chat with {technician.name} and arrange a new appointment.
                  </Text>
                </View>
              )}
            </View>
        </View>
      </KeyboardAvoidingView>

      {/* ===== TECHNICIAN PROFILE ===== */}
      {renderTechnicianProfile()}

      {/* ===== iOS DATE/TIME PICKER ===== */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={iosPickerVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIosPickerVisible(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={[styles.pickerSheet, {
              backgroundColor: theme.surface,
              paddingBottom: Math.max(insets.bottom, 16),
            }]}>
              <View style={[styles.pickerBar, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => setIosPickerVisible(false)}>
                  <Text style={[styles.pickerCancel, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.pickerTitle, { color: theme.text }]}>New Appointment</Text>
                <TouchableOpacity onPress={() => { setIosPickerVisible(false); finalizeAppointment(pickerDate); }}>
                  <Text style={[styles.pickerDone, { color: theme.primary }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={pickerDate}
                mode="datetime"
                display="spinner"
                minimumDate={new Date()}
                onChange={handleIosPickerChange}
                themeVariant={theme.text === '#FFFFFF' ? 'dark' : 'light'}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  technicianAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  technicianAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  technicianName: {
    fontSize: 16,
    fontWeight: '600',
  },
  technicianStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
  },
  infoButton: {
    padding: 4,
  },
  infoButtonText: {
    fontSize: 20,
  },

  // ===== CHAT CONTAINER =====
  keyboardView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },

  // ===== MESSAGES =====
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },

  // ===== EMPTY STATE =====
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ===== TYPING INDICATOR =====
  typingBubble: {
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },

  // ===== TECHNICIAN PROFILE =====
  profileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  profileSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: 'center',
  },
  profileHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
  },
  profileRole: {
    fontSize: 14,
    marginTop: 2,
  },
  profileStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  profileStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  profileRows: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 16,
  },
  profileRowLabel: {
    fontSize: 14,
  },
  profileRowValue: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  profileCloseButton: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  profileCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ===== SYSTEM DIVIDER =====
  systemDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  systemDividerLine: {
    flex: 1,
    height: 1,
  },
  systemDividerText: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  systemDividerLabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  // ===== MESSAGE =====
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
    maxWidth: '85%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRight: {
    marginLeft: 0,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: '100%',
  },
  messageBubbleLeft: {
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  // ===== SYSTEM MESSAGE =====
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessage: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  systemMessageText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ===== SCHEDULE CARD =====
  scheduleCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  scheduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleIcon: {
    fontSize: 20,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scheduleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scheduleBody: {
    padding: 16,
  },
  scheduleLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  slotDate: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4BEBA',
    minWidth: 60,
  },
  slotMonth: {
    fontSize: 10,
    fontWeight: '600',
  },
  slotDay: {
    fontSize: 20,
    fontWeight: '700',
  },
  slotDayName: {
    fontSize: 15,
    fontWeight: '600',
  },
  slotTime: {
    fontSize: 13,
  },
  slotActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  negotiateText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  negotiateButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  negotiateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ===== iOS PICKER =====
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  pickerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  pickerCancel: {
    fontSize: 16,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerDone: {
    fontSize: 16,
    fontWeight: '700',
  },
  picker: {
    alignSelf: 'stretch',
  },
  alternativeButton: {
    alignItems: 'center',
  },
  alternativeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ===== CONFIRMED CARD =====
  confirmedCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 12,
  },
  confirmedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  confirmedIcon: {
    fontSize: 20,
  },
  confirmedTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmedDate: {
    fontSize: 18,
    fontWeight: '700',
  },
  confirmedTime: {
    fontSize: 14,
    marginBottom: 12,
  },
  confirmedActions: {
    gap: 8,
  },
  reminderButton: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  reminderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  calendarButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  calendarButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ===== INPUT =====
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
    borderRadius: 12,
    marginLeft: 4,
  },
  sendIcon: {
    fontSize: 20,
  },
  lockedInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  lockedIcon: {
    fontSize: 16,
  },
  lockedText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});