// src/screens/SupportChatScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeftIcon, ArrowRightIcon } from '../components/Icons';

interface Message {
  id: string;
  text: string;
  isSupport: boolean;
  time: string;
}

const SUPPORT_REPLIES = [
  'Thanks for reaching out! Can you share a bit more detail so I can help?',
  'Got it — let me look into that for you.',
  'Understood. I\'ve noted this and our facilities team will follow up shortly.',
  'You can also track maintenance requests in the "Requests" tab if that helps.',
  'Happy to help with that. Is there anything else you need?',
];

const nowTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const QUICK_PROMPTS = [
  'I have a maintenance question',
  'I can\'t log in',
  'Report a problem',
];

export default function SupportChatScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hi! You're connected to Campus Support. How can we help you today?",
      isSupport: true,
      time: nowTime(),
    },
  ]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', scrollToEnd);
    return () => sub.remove();
  }, []);

  const scrollToEnd = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const sendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: trimmed, isSupport: false, time: nowTime() },
    ]);
    setMessage('');
    scrollToEnd();

    setIsTyping(true);
    scrollToEnd();
    await new Promise((r) => setTimeout(r, 1200));
    if (!mounted.current) return;

    const reply = SUPPORT_REPLIES[Math.floor(Math.random() * SUPPORT_REPLIES.length)];
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-s`, text: reply, isSupport: true, time: nowTime() },
    ]);
    setIsTyping(false);
    scrollToEnd();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* ===== HEADER ===== */}
      <View
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={theme.primary} size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.supportAvatar}>
            <Text style={styles.supportAvatarText}>CS</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Campus Support</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + headerHeight : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onContentSizeChange={scrollToEnd}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[
                styles.messageRow,
                m.isSupport ? styles.rowLeft : styles.rowRight,
              ]}
            >
              {m.isSupport && (
                <View style={styles.msgAvatar}>
                  <Text style={styles.msgAvatarText}>CS</Text>
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  m.isSupport ? styles.bubbleLeft : styles.bubbleRight,
                ]}
              >
                <Text style={[styles.bubbleText, m.isSupport ? styles.bubbleTextLeft : styles.bubbleTextRight]}>
                  {m.text}
                </Text>
                <Text style={[styles.bubbleTime, m.isSupport ? styles.bubbleTimeLeft : styles.bubbleTimeRight]}>
                  {m.time}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageRow, styles.rowLeft]}>
              <View style={styles.msgAvatar}>
                <Text style={styles.msgAvatarText}>CS</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleLeft]}>
                <Text style={styles.typingText}>typing…</Text>
              </View>
            </View>
          )}

          {/* Quick prompts only before the user has said anything */}
          {messages.length === 1 && !isTyping && (
            <View style={styles.quickPrompts}>
              {QUICK_PROMPTS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.quickPrompt}
                  onPress={() => sendText(p)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickPromptText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* ===== INPUT ===== */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor={theme.textSecondary}
              value={message}
              onChangeText={setMessage}
              multiline
              returnKeyType="send"
              onSubmitEditing={() => sendText(message)}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => sendText(message)}
              activeOpacity={0.85}
            >
              <ArrowRightIcon color={theme.primaryText} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    flex: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    supportAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    supportAvatarText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.primaryText,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#22C55E',
    },
    statusText: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    messages: {
      flex: 1,
    },
    messagesContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 16,
      flexGrow: 1,
    },
    messageRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 12,
      maxWidth: '85%',
    },
    rowLeft: {
      alignSelf: 'flex-start',
    },
    rowRight: {
      alignSelf: 'flex-end',
      flexDirection: 'row-reverse',
    },
    msgAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    msgAvatarText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.primaryText,
    },
    bubble: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
    },
    bubbleLeft: {
      backgroundColor: theme.surfaceContainer,
      borderBottomLeftRadius: 4,
    },
    bubbleRight: {
      backgroundColor: theme.primary,
      borderBottomRightRadius: 4,
    },
    bubbleText: {
      fontSize: 15,
      lineHeight: 22,
    },
    bubbleTextLeft: {
      color: theme.text,
    },
    bubbleTextRight: {
      color: theme.primaryText,
    },
    bubbleTime: {
      fontSize: 10,
      marginTop: 4,
      alignSelf: 'flex-end',
    },
    bubbleTimeLeft: {
      color: theme.textSecondary,
    },
    bubbleTimeRight: {
      color: theme.primaryText,
      opacity: 0.7,
    },
    typingText: {
      fontSize: 14,
      fontStyle: 'italic',
      color: theme.textSecondary,
    },
    quickPrompts: {
      marginTop: 8,
      gap: 8,
      alignItems: 'flex-start',
    },
    quickPrompt: {
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    quickPromptText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.primary,
    },
    inputBar: {
      paddingHorizontal: 16,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.surface,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      backgroundColor: theme.surfaceContainer,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: theme.text,
      paddingVertical: 8,
      paddingHorizontal: 8,
      maxHeight: 100,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 2,
    },
  });
