// src/screens/VerifyCodeScreen.tsx
//
// Confirms a new student account with a typed 6-digit code instead of the
// emailed link. The link approach opened the confirmation in the phone's
// browser (there's no app URL scheme registered), which then redirected to
// whatever Supabase's Site URL is set to — the staff web dashboard, not
// this app. Verifying in-app avoids leaving the app entirely.
//
// Needs the Supabase "Confirm signup" email template updated to show
// {{ .Token }} — see the setup note in AGENTS.md / project docs.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotifications } from '../utils/registerNotification';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import supabase from '../../config';
import { registerPushToken } from '../../lib/api';
import { ArrowRightIcon, BankIcon, MailIcon, SecurityIcon } from '../components/Icons';

// ===== Crimson Campus palette (matches Login/Register) =====
const C = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  inputBg: '#F8F9FA',
  primary: '#000666',
  primaryContainer: '#1A237E',
  onPrimaryContainer: '#8690EE',
  onPrimary: '#FFFFFF',
  onSurface: '#191C1D',
  onSurfaceVariant: '#454652',
  outline: '#767683',
  outlineVariant: '#C6C5D4',
};

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyCodeScreen({ navigation, route }: any) {
  const email: string = route?.params?.email ?? '';
  const fullName: string = route?.params?.fullName ?? '';

  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const finishSignIn = async (user: { email?: string | null } | null) => {
    await AsyncStorage.setItem('userName', fullName || 'Resident');
    await AsyncStorage.setItem('userEmail', user?.email ?? email);
    await AsyncStorage.setItem('isLoggedIn', 'true');

    try {
      const token = await registerForPushNotifications();
      if (token) await registerPushToken(token);
    } catch (e) {
      console.log('Error registering token after verification:', e);
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });
  };

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (trimmed.length < 6) {
      Alert.alert('Enter the full code', 'The code we emailed you is 6 digits.');
      return;
    }
    if (!email) {
      Alert.alert('Missing email', 'Go back and enter your email again.');
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: trimmed,
        type: 'signup',
      });

      if (error) throw error;
      if (!data.session) throw new Error('Verification succeeded but no session was returned.');

      setIsVerifying(false);
      await finishSignIn(data.user);
    } catch (error: any) {
      setIsVerifying(false);
      Alert.alert('Verification Failed', error?.message ?? 'That code did not work. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      setIsResending(false);
      if (error) throw error;

      setCooldown(RESEND_COOLDOWN_SECONDS);
      Alert.alert('Code Sent', `A new code was sent to ${email}.`);
    } catch (error: any) {
      setIsResending(false);
      Alert.alert('Could Not Resend', error?.message ?? 'Please try again in a moment.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />

      <View style={styles.appBar}>
        <BankIcon color={C.primary} size={28} />
        <Text style={styles.appBarTitle}>Knust Campus</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.headingSection}>
              <View style={styles.logoBadge}>
                <SecurityIcon color={C.onPrimaryContainer} size={32} />
              </View>
              <Text style={styles.heading}>Check Your Email</Text>
              <View style={styles.emailRow}>
                <MailIcon color={C.outline} size={14} />
                <Text style={styles.subheading}>
                  {email ? `We sent a 6-digit code to ${email}` : 'We sent you a 6-digit code'}
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                placeholderTextColor={C.outlineVariant}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleVerify}
              disabled={isVerifying}
              activeOpacity={0.85}
            >
              {isVerifying ? (
                <ActivityIndicator color={C.onPrimary} size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Verify & Continue</Text>
                  <ArrowRightIcon color={C.onPrimary} size={20} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footerWrapper}>
              <TouchableOpacity onPress={handleResend} disabled={isResending || cooldown > 0}>
                <Text style={[styles.footerLink, (isResending || cooldown > 0) && styles.footerLinkDisabled]}>
                  {cooldown > 0
                    ? `Resend code in ${cooldown}s`
                    : isResending
                    ? 'Sending…'
                    : "Didn't get a code? Resend"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.wrongEmailLink}>
                <Text style={styles.footerText}>Wrong email? Go back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 56,
    paddingHorizontal: 20,
    backgroundColor: C.background,
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.primary,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.outlineVariant,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  headingSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: C.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  subheading: {
    flexShrink: 1,
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },

  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    marginBottom: 8,
    textAlign: 'center',
  },
  codeInput: {
    height: 56,
    backgroundColor: C.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.outlineVariant,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 12,
    textAlign: 'center',
    color: C.onSurface,
  },

  primaryButton: {
    height: 48,
    backgroundColor: C.primaryContainer,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.onPrimary,
  },

  footerWrapper: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: C.outlineVariant,
    alignItems: 'center',
    gap: 12,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primaryContainer,
  },
  footerLinkDisabled: {
    color: C.outline,
  },
  wrongEmailLink: {
    marginTop: 2,
  },
  footerText: {
    fontSize: 13,
    color: C.onSurfaceVariant,
  },
});
