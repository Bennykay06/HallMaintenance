// src/screens/RegisterScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
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
import {
  ArrowRightIcon,
  BankIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  PersonIcon,
} from '../components/Icons';

// ===== Crimson Campus palette (from design mockups) =====
const C = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  inputBg: '#F8F9FA',
  primary: '#000666',
  primaryContainer: '#1A237E',
  onPrimary: '#FFFFFF',
  onSurface: '#191C1D',
  onSurfaceVariant: '#454652',
  outline: '#767683',
  outlineVariant: '#C6C5D4',
};

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Error', 'Please agree to the Terms of Service.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

     try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw error;
    }

    const user = data.user;

    if (!user) {
      throw new Error('User registration failed');
    }

    await AsyncStorage.setItem('userName', fullName);
    await AsyncStorage.setItem('userEmail', user.email ?? email);
    await AsyncStorage.setItem('userHall', 'Unity Hall');
    await AsyncStorage.setItem('userFloor', 'Floor 2');
    await AsyncStorage.setItem('userRoom', 'Room 204');
    await AsyncStorage.setItem(
      'userLocation',
      'Unity Hall, Floor 2, Room 204'
    );
    await AsyncStorage.setItem('isLoggedIn', 'true');

    setIsLoading(false);

    Alert.alert(
      'Success',
      'Account created successfully!',
      [
        {
          text: 'Continue',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            });
          },
        },
      ]
    );

  } catch (error: any) {
    setIsLoading(false);
    Alert.alert(
      'Registration Failed',
      error.message
    );
  }
}; 
  const handleLogin = () => {
    navigation.navigate('Login');
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
          {/* ===== REGISTRATION CARD ===== */}
          <View style={styles.card}>
            <View style={styles.headingSection}>
              <Text style={styles.heading}>Join Resident Portal</Text>
              <Text style={styles.subheading}>
                Enter your university credentials to register your account.
              </Text>
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.leadingIcon}>
                  <PersonIcon color={C.outline} size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="John Doe"
                  placeholderTextColor={C.outline}
                />
              </View>
            </View>

            {/* Email Address */}
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
                  placeholder="j.doe@university.edu"
                  placeholderTextColor={C.outline}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
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

            {/* Terms and Conditions */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                {agreeTerms && <CheckIcon color={C.onPrimary} size={16} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Facility Usage Guidelines</Text>.
              </Text>
            </TouchableOpacity>

            {/* Create Account Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={C.onPrimary} size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                  <ArrowRightIcon color={C.onPrimary} size={20} />
                </>
              )}
            </TouchableOpacity>

            {/* Footer Link */}
            <View style={styles.footerWrapper}>
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.footerLink}>Login</Text>
                </TouchableOpacity>
              </View>
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

  // ===== HEADING =====
  headingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: C.onSurface,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.onSurfaceVariant,
    marginBottom: 8,
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
  trailingIcon: {
    position: 'absolute',
    right: 12,
    padding: 2,
  },

  // ===== TERMS =====
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginTop: 2,
    backgroundColor: C.card,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: C.primaryContainer,
    borderColor: C.primaryContainer,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: C.onSurfaceVariant,
    lineHeight: 20,
  },
  termsLink: {
    color: C.primary,
    fontWeight: '700',
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
  footerWrapper: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: C.outlineVariant,
  },
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
    color: C.primary,
  },
});
