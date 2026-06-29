// src/screens/LoginScreen.tsx
import { PersonIcon } from '../components/Icons';

import React, { useState, useEffect } from 'react';
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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('bnkwofie@st.knust.edu.gh');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    // Check for saved credentials
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

    if (!email.trim().toLowerCase().endsWith('@st.knust.edu.gh')) {
      Alert.alert('Invalid Format', 'Please use your student email (e.g. bnkwofie@st.knust.edu.gh)');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save user data
      await AsyncStorage.setItem('userName', 'Alex Johnson');
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userHall', 'Unity Hall');
      await AsyncStorage.setItem('userFloor', 'Floor 2');
      await AsyncStorage.setItem('userRoom', 'Room 204');
      await AsyncStorage.setItem('userLocation', 'Unity Hall, Floor 2, Room 204');
      await AsyncStorage.setItem('isLoggedIn', 'true');
      
      // Save credentials if remember me is checked
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
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Login failed. Please try again.');
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
            
            {/* ===== UNIVERSITY NAME ===== */}
            <View style={styles.headerSection}>
              <Text style={styles.universityName}>🏛️ University</Text>
              <Text style={styles.universitySubtitle}>Facilities</Text>
            </View>

            {/* ===== WELCOME TEXT ===== */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>
                Log in to manage university assets and work orders.
              </Text>
            </View>

            {/* ===== LOGIN FORM ===== */}
            <View style={styles.formSection}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeButtonText}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Remember Me */}
              <TouchableOpacity 
                style={styles.rememberContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  rememberMe && styles.checkboxChecked,
                ]}>
                  {rememberMe && <PersonIcon color="#AF101A" size={24} />}
                </View>
                <Text style={styles.rememberText}>Keep me signed in for 30 days</Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity 
                style={styles.signInButton}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#AF101A', '#D32F2F']}
                  style={styles.signInGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ===== BOTTOM NAV ===== */}
            <View style={styles.bottomNav}>
              <TouchableOpacity 
                style={[styles.navItem, styles.navItemActive]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.navLabel, styles.navLabelActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => {
                  setIsLogin(false);
                  handleSignUp();
                }}
              >
                <Text style={styles.navLabel}>Register</Text>
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
    marginBottom: 32,
  },
  universityName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  universitySubtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#AF101A',
    marginTop: -4,
  },

  // ===== WELCOME =====
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1C1C',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#5B403D',
    lineHeight: 22,
  },

  // ===== FORM =====
  formSection: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1C1C',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1C1C',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
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

  // ===== FORGOT PASSWORD =====
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#AF101A',
    fontWeight: '600',
  },

  // ===== REMEMBER ME =====
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
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
    backgroundColor: '#FFFFFF',
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
  rememberText: {
    fontSize: 14,
    color: '#5B403D',
  },

  // ===== SIGN IN =====
  signInButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#AF101A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signInGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ===== SIGN UP =====
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#5B403D',
  },
  signUpLink: {
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