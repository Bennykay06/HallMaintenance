// src/screens/ReportIssueScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeftIcon, DescriptionIcon } from '../components/Icons';

const CATEGORIES = ['App Glitch', 'Login Error', 'Incorrect Data', 'Other'];

export default function ReportIssueScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Missing details', 'Please add a subject and a description before submitting.');
      return;
    }

    setSubmitting(true);
    // Simulate submitting the ticket to the backend.
    setTimeout(() => {
      setSubmitting(false);
      const ref = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
      Alert.alert(
        'Ticket Submitted',
        `Your technical issue has been reported.\n\nReference: ${ref}\n\nOur team will follow up by email.`,
        [{ text: 'Done', onPress: () => navigation.goBack() }],
      );
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={theme.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report an Issue</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* ===== INTRO ===== */}
            <View style={styles.introCard}>
              <View style={styles.introIcon}>
                <DescriptionIcon color={theme.primary} size={24} />
              </View>
              <Text style={styles.introTitle}>Report a Technical Issue</Text>
              <Text style={styles.introSubtitle}>
                Tell us about app glitches, login errors, or incorrect building data and we'll look into it.
              </Text>
            </View>

            {/* ===== CATEGORY ===== */}
            <Text style={styles.label}>Issue Type</Text>
            <View style={styles.chips}>
              {CATEGORIES.map((c) => {
                const active = category === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setCategory(c)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ===== SUBJECT ===== */}
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief summary of the issue"
              placeholderTextColor={theme.textSecondary}
              value={subject}
              onChangeText={setSubject}
              maxLength={80}
            />

            {/* ===== DESCRIPTION ===== */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What happened? Include the screen and any steps to reproduce it."
              placeholderTextColor={theme.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            {/* ===== SUBMIT ===== */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.helperText}>
              You'll receive a confirmation and a reference number after submitting.
            </Text>

            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>
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
    introCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 24,
    },
    introIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.surfaceContainer,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    introTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    introSubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 19,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.surfaceContainer,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    chipTextActive: {
      color: theme.primaryText,
    },
    input: {
      backgroundColor: theme.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.text,
      marginBottom: 20,
    },
    textArea: {
      minHeight: 130,
    },
    submitButton: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 4,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.primaryText,
    },
    helperText: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 12,
    },
    bottomSpacer: {
      height: 20,
    },
  });
