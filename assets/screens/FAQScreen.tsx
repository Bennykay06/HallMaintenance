// src/screens/FAQScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeftIcon, SearchIcon, ChevronRightIcon, HelpIcon, MailIcon } from '../components/Icons';

interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    id: '1',
    category: 'Maintenance',
    question: 'What is the turnaround time for a repair request?',
    answer:
      'Most standard maintenance requests are processed within 24–48 hours. Urgent repairs such as leaks or electrical hazards are prioritized and typically addressed within 4 hours. You can track the real-time status of your ticket in the "Requests" tab.',
  },
  {
    id: '2',
    category: 'Maintenance',
    question: 'Do I need to be present when a technician visits?',
    answer:
      'No. By submitting a request you grant 48-hour access for university personnel to enter your unit between 9:00 AM and 5:00 PM. If you prefer to be present, you can arrange a specific time slot with the technician in the request chat.',
  },
  {
    id: '3',
    category: 'Maintenance',
    question: 'Can I cancel or edit a request after submitting it?',
    answer:
      'Yes. Open the request from the "Requests" tab and choose Edit or Cancel. Requests that have already been assigned to a technician can only be cancelled by contacting support.',
  },
  {
    id: '4',
    category: 'Account',
    question: 'I am not receiving my Multi-Factor Authentication code.',
    answer:
      'The app uses the University Single Sign-On (SSO) system. If you are having trouble receiving your MFA code, make sure your contact details are updated in the University Portal, or contact the IT Help Desk at extension 4357.',
  },
  {
    id: '5',
    category: 'Account',
    question: 'How do I change my hall, room, or profile details?',
    answer:
      'Go to Profile → Edit Profile to update your name, hall, floor, and room. Changes are saved to your device and applied across the app immediately.',
  },
  {
    id: '6',
    category: 'Policies',
    question: 'What are the quiet / noise hours?',
    answer:
      'Quiet hours are observed Sunday–Thursday from 10:00 PM to 8:00 AM, and Friday–Saturday from Midnight to 10:00 AM. Full details are available under Profile → Facility Rules & Guidelines.',
  },
  {
    id: '7',
    category: 'Policies',
    question: 'How does after-hours access to facilities work?',
    answer:
      'After-hours access requires a valid Digital ID and pre-authorization from your department head. Security patrols are increased between 11:00 PM and 5:00 AM for student safety.',
  },
  {
    id: '8',
    category: 'App',
    question: 'The app is showing incorrect building data. What do I do?',
    answer:
      'Please report it using Help & Support → Report a Technical Issue. Include the screen where you saw the error and, if possible, the room or building number so our team can correct it quickly.',
  },
  {
    id: '9',
    category: 'App',
    question: 'How do I enable or disable notifications?',
    answer:
      'Open Profile → Notification Settings to control which alerts you receive, including maintenance updates, news, and emergency notices.',
  },
];

export default function FAQScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [query, setQuery] = useState<string>(route?.params?.initialQuery || '');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? FAQS.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q),
      )
    : FAQS;

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={theme.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* ===== SEARCH ===== */}
          <View style={styles.searchBar}>
            <SearchIcon color={theme.textSecondary} size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search frequently asked questions..."
              placeholderTextColor={theme.textSecondary}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          <Text style={styles.resultCount}>
            {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
          </Text>

          {/* ===== LIST ===== */}
          {filtered.length > 0 ? (
            <View style={styles.list}>
              {filtered.map((item) => {
                const open = expandedId === item.id;
                return (
                  <View key={item.id} style={styles.faqItem}>
                    <TouchableOpacity
                      style={styles.faqHeader}
                      onPress={() => toggle(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.faqHeaderLeft}>
                        <View style={styles.categoryPill}>
                          <Text style={styles.categoryText}>{item.category}</Text>
                        </View>
                        <Text style={styles.faqQuestion}>{item.question}</Text>
                      </View>
                      <View style={[styles.chevron, open && styles.chevronOpen]}>
                        <ChevronRightIcon color={theme.textSecondary} size={18} />
                      </View>
                    </TouchableOpacity>
                    {open && (
                      <View style={styles.faqAnswerWrap}>
                        <Text style={styles.faqAnswer}>{item.answer}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.empty}>
              <HelpIcon color={theme.textSecondary} size={40} />
              <Text style={styles.emptyTitle}>No matching articles</Text>
              <Text style={styles.emptySubtitle}>Try a different search term.</Text>
            </View>
          )}

          {/* ===== STILL NEED HELP ===== */}
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactSubtitle}>
              Can't find what you're looking for? Chat with our support team.
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => navigation.navigate('SupportChat')}
              activeOpacity={0.85}
            >
              <MailIcon color={theme.primaryText} size={18} />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
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
      borderBottomWidth: 0.5,
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
    scrollContent: {
      paddingBottom: 40,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      height: 50,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.text,
      padding: 0,
    },
    resultCount: {
      fontSize: 12,
      color: theme.textSecondary,
      fontStyle: 'italic',
      marginTop: 12,
      marginBottom: 12,
    },
    list: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 4,
    },
    faqItem: {
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border,
    },
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    faqHeaderLeft: {
      flex: 1,
    },
    categoryPill: {
      alignSelf: 'flex-start',
      backgroundColor: theme.surfaceContainer,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      marginBottom: 6,
    },
    categoryText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    faqQuestion: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
    },
    chevron: {
      transform: [{ rotate: '0deg' }],
    },
    chevronOpen: {
      transform: [{ rotate: '90deg' }],
    },
    faqAnswerWrap: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      marginTop: -4,
    },
    faqAnswer: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 21,
    },
    empty: {
      alignItems: 'center',
      paddingVertical: 48,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginTop: 4,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    contactCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 20,
      marginTop: 20,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    contactTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    contactSubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    contactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 14,
    },
    contactButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.primaryText,
    },
    bottomSpacer: {
      height: 20,
    },
  });
