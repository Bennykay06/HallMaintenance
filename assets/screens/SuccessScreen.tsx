// src/screens/SuccessScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function SuccessScreen({ navigation, route }) {
  const { referenceId = 'MT-82941', location = 'North Hall, Room 402' } = route.params || {};
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleViewRequests = () => {
    navigation.navigate('Requests');
  };

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToHome} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Success</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== SUCCESS ICON ===== */}
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.successCircle}>
            <Animated.Text 
              style={[
                styles.successCheckmark,
                {
                  transform: [{ scale: checkmarkScale }],
                }
              ]}
            >
              ✓
            </Animated.Text>
          </View>
          <View style={styles.glowEffect} />
        </Animated.View>

        {/* ===== HEADLINE ===== */}
        <Animated.Text 
          style={[
            styles.headline,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            }
          ]}
        >
          Report Submitted Successfully!
        </Animated.Text>

        {/* ===== BODY TEXT ===== */}
        <Animated.Text 
          style={[
            styles.bodyText,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            }
          ]}
        >
          Your maintenance request for <Text style={styles.boldText}>{location}</Text> has been received. Our technicians will review it shortly.
        </Animated.Text>

        {/* ===== REFERENCE ID ===== */}
        <Animated.View 
          style={[
            styles.referenceContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            }
          ]}
        >
          <View style={styles.referenceCard}>
            <Text style={styles.referenceLabel}>Reference ID</Text>
            <Text style={styles.referenceId}>#{referenceId}</Text>
          </View>
        </Animated.View>

        {/* ===== DIVIDER ===== */}
        <Animated.View 
          style={[
            styles.divider,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            }
          ]}
        />

        {/* ===== INFO CARDS ===== */}
        <Animated.View 
          style={[
            styles.infoGrid,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            }
          ]}
        >
          {/* Quick Response */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardContent}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>⏰</Text>
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Quick Response</Text>
                <Text style={styles.infoText}>
                  Expect a response within 24-48 business hours from the facility team.
                </Text>
              </View>
            </View>
          </View>

          {/* Track Status */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardContent}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>👁️</Text>
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Track Status</Text>
                <Text style={styles.infoText}>
                  You can track the status in the 'Requests' tab at any time.
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ===== ACTION BUTTONS ===== */}
        <Animated.View 
          style={[
            styles.actionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            }
          ]}
        >
          <TouchableOpacity style={styles.primaryButton} onPress={handleViewRequests}>
            <LinearGradient
              colors={['#AF101A', '#D32F2F']}
              style={styles.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>View My Requests</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToHome}>
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Extra bottom space for scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ===== BOTTOM NAV - PUSHED TO VERY BOTTOM ===== */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={handleBackToHome}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} onPress={handleViewRequests}>
          <Text style={styles.navIcon}>🔧</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📰</Text>
          <Text style={styles.navLabel}>News</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconEmergency]}>🆘</Text>
          <Text style={styles.navLabel}>Emergency</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },

  // ===== HEADER =====
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4BEBA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#AF101A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#AF101A',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4BEBA',
  },
  avatarText: {
    fontSize: 18,
  },

  // ===== SCROLL VIEW =====
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 80, // Increased bottom padding to ensure content clears nav
    alignItems: 'center',
  },

  // ===== SUCCESS ICON =====
  iconContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    borderWidth: 3,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  successCheckmark: {
    fontSize: 48,
    color: '#2E7D32',
    fontWeight: '700',
  },
  glowEffect: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    top: -15,
    left: -15,
  },

  // ===== TEXT =====
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1C1C',
    textAlign: 'center',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    color: '#5B403D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    maxWidth: 380,
  },
  boldText: {
    fontWeight: '700',
    color: '#1A1C1C',
  },

  // ===== REFERENCE =====
  referenceContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  referenceCard: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    alignItems: 'center',
    minWidth: 200,
  },
  referenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B403D',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  referenceId: {
    fontSize: 20,
    fontWeight: '600',
    color: '#AF101A',
    marginTop: 2,
  },

  // ===== DIVIDER =====
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E4BEBA',
    marginBottom: 20,
  },

  // ===== INFO CARDS =====
  infoGrid: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    width: '100%',
  },
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1C',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: '#5B403D',
    lineHeight: 18,
  },

  // ===== ACTION BUTTONS =====
  actionContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 10,
  },
  primaryButton: {
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#AF101A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryGradient: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#AF101A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#AF101A',
  },

  // ===== BOTTOM SPACER =====
  bottomSpacer: {
    height: 20,
  },

  // ===== BOTTOM NAV - PUSHED TO VERY BOTTOM =====
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Increased for safe area
    borderTopWidth: 1,
    borderTopColor: '#E4BEBA',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  navItemActive: {
    backgroundColor: '#D32F2F',
  },
  navIcon: {
    fontSize: 24,
  },
  navIconEmergency: {
    color: '#BA1A1A',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#FFFFFF',
  },
});