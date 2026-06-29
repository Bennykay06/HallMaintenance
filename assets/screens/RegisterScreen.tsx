// src/screens/RegisterScreen.tsx
import { PersonIcon, SecurityIcon } from '../components/Icons';

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save user data
      await AsyncStorage.setItem('userName', fullName);
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userHall', 'Unity Hall');
      await AsyncStorage.setItem('userFloor', 'Floor 2');
      await AsyncStorage.setItem('userRoom', 'Room 204');
      await AsyncStorage.setItem('userLocation', 'Unity Hall, Floor 2, Room 204');
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
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* ===== UNIVERSITY HEADER ===== */}
            <View style={styles.headerSection}>
              <View style={styles.headerLeft}>
                <SecurityIcon color="#AF101A" size={24} />
                <Text style={styles.headerTitle}>University Facilities</Text>
              </View>
              <View style={styles.headerRight}>
                <Text style={styles.headerBadge}>Secure Portal Access</Text>
              </View>
            </View>

            {/* ===== WELCOME SECTION ===== */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Join Resident Portal</Text>
              <Text style={styles.welcomeSubtitle}>
                Enter your university credentials to register your account.
              </Text>
            </View>

            {/* ===== REGISTRATION FORM ===== */}
            <View style={styles.formSection}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="John Doe"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="j.doe@university.edu"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <Text style={styles.passwordIcon}>🔒</Text>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={togglePasswordVisibility}
                  >
                    <Text style={styles.eyeButtonText}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms and Conditions */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  agreeTerms && styles.checkboxChecked,
                ]}>
                  {agreeTerms && <PersonIcon color="#AF101A" size={24} />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Facility Usage Guidelines</Text>.
                </Text>
              </TouchableOpacity>

              {/* Create Account Button */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#AF101A', '#D32F2F']}
                  style={styles.createGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.createButtonText}>Create Account</Text>
                      <Text style={styles.createButtonArrow}>→</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ===== BOTTOM NAV ===== */}
            <View style={styles.bottomNav}>
              <TouchableOpacity
                style={styles.navItem}
                onPress={handleLogin}
              >
                <Text style={styles.navLabel}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navItem, styles.navItemActive]}
              >
                <Text style={[styles.navLabel, styles.navLabelActive]}>Register</Text>
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
    backgroundColor: '#F9F9F9',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },

  // ===== HEADER =====
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E4BEBA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 24,
    color: '#AF101A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#AF101A',
  },
  headerRight: {
    display: Platform.OS === 'ios' ? 'flex' : 'none',
  },
  headerBadge: {
    fontSize: 12,
    color: '#5B403D',
    fontStyle: 'italic',
  },

  // ===== WELCOME =====
  welcomeSection: {
    marginBottom: 28,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1C1C',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#5B403D',
    lineHeight: 20,
  },

  // ===== FORM =====
  formSection: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B403D',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1C1C',
    height: 48,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordIcon: {
    position: 'absolute',
    left: 14,
    top: 12,
    fontSize: 18,
    zIndex: 1,
  },
  passwordInput: {
    paddingLeft: 44,
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 12,
  },
  eyeButtonText: {
    fontSize: 20,
  },

  // ===== TERMS =====
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E4BEBA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#AF101A',
    borderColor: '#AF101A',
  },
  checkmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  termsText: {
    fontSize: 13,
    color: '#5B403D',
    lineHeight: 18,
    flex: 1,
  },
  termsLink: {
    color: '#AF101A',
    fontWeight: '600',
  },

  // ===== CREATE BUTTON =====
  createButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#AF101A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  createButtonArrow: {
    fontSize: 18,
    color: '#FFFFFF',
  },

  // ===== LOGIN =====
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
  },
  loginText: {
    fontSize: 14,
    color: '#5B403D',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AF101A',
  },

  // ===== BOTTOM NAV =====
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  navItem: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navItemActive: {
    backgroundColor: '#AF101A',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  navLabelActive: {
    color: '#FFFFFF',
  },
});