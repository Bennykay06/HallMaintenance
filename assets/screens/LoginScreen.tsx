// src/screens/LoginScreen.tsx
import {
  ArrowRightIcon,
  BankIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  SchoolIcon,
} from '../components/Icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
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
// ===== Crimson Campus palette (from design mockups) =====
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

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkSavedCredentials();
  }, []);

  const checkSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      const remember = await AsyncStorage.getItem('rememberMe');

      if (savedEmail && savedPassword && remember === 'true') {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.log('Error loading saved credentials:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

   
    setIsLoading(true);

    try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
    
console.log(data)
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('isLoggedIn', 'true');

    if (rememberMe) {
      await AsyncStorage.setItem('savedEmail', email);
      await AsyncStorage.setItem('savedPassword', password);
      await AsyncStorage.setItem('rememberMe', 'true');
    } else {
      await AsyncStorage.removeItem('savedEmail');
      await AsyncStorage.removeItem('savedPassword');
      await AsyncStorage.setItem('rememberMe', 'false');
    }

    setIsLoading(false);

    navigation.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });

  } catch (error:any) {
    setIsLoading(false);
    Alert.alert('Login Failed', error.message);
  }
};

  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality coming soon.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />

      {/* ===== TOP APP BAR ===== */}
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
          {/* ===== AUTH CARD ===== */}
          <View style={styles.card}>
            {/* Logo & Heading */}
            <View style={styles.logoSection}>
              <View style={styles.logoBadge}>
                <SchoolIcon color={C.onPrimaryContainer} size={32} />
              </View>
              <Text style={styles.heading}>Welcome Back</Text>
              <Text style={styles.subheading}>Access your campus maintenance dashboard</Text>
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.leadingIcon}>
                  <MailIcon color={C.outline} size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="bnkwofie@gmail.com"
                  placeholderTextColor={C.outline}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <Text style={styles.inputHint}>
                Use your KNUST student email format (e.g. bnkwofie@st.knust.edu.gh)
              </Text>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotLink}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <View style={styles.leadingIcon}>
                  <LockIcon color={C.outline} size={20} />
                </View>
                <TextInput
                  style={[styles.input, styles.inputWithTrailing]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={C.outline}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.trailingIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon color={C.outline} size={22} />
                  ) : (
                    <EyeIcon color={C.outline} size={22} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me */}
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <CheckIcon color={C.onPrimary} size={16} />}
              </View>
              <Text style={styles.rememberText}>Keep me signed in</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={C.onPrimary} size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                  <ArrowRightIcon color={C.onPrimary} size={20} />
                </>
              )}
            </TouchableOpacity>

            {/* Footer Link */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.footerLink}>Sign Up</Text>
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

  // ===== TOP APP BAR =====
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

  // ===== CARD =====
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

  // ===== LOGO / HEADING =====
  logoSection: {
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
    fontSize: 30,
    fontWeight: '700',
    color: C.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 15,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },

  // ===== FORM =====
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    marginBottom: 8,
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '600',
    color: C.primaryContainer,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  leadingIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    height: 48,
    backgroundColor: C.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.outlineVariant,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 15,
    color: C.onSurface,
  },
  inputWithTrailing: {
    paddingRight: 48,
  },
  inputHint: {
    fontSize: 12,
    color: C.outline,
    marginTop: 6,
  },
  trailingIcon: {
    position: 'absolute',
    right: 12,
    padding: 2,
  },

  // ===== REMEMBER ME =====
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: C.outline,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: C.card,
  },
  checkboxChecked: {
    backgroundColor: C.primaryContainer,
    borderColor: C.primaryContainer,
  },
  rememberText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.onSurfaceVariant,
  },

  // ===== PRIMARY BUTTON =====
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

  // ===== FOOTER =====
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: C.onSurfaceVariant,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
    color: C.primaryContainer,
  },
});
