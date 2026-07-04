// src/screens/HelpSupportScreen.tsx
import { useTheme } from '../context/ThemeContext';
import { PersonIcon, ClipboardIcon, ArrowLeftIcon } from '../components/Icons';

import React, { useState, useEffect } from 'react';
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
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HelpSupportScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('User');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: 'Requesting Repairs: What is the turnaround time?',
      answer: 'Most standard maintenance requests are processed within 24-48 hours. Urgent repairs (leaks, electrical hazards) are prioritized and typically addressed within 4 hours. You can track the real-time status of your ticket in the \'Requests\' tab.',
    },
    {
      id: '2',
      question: 'Login Issues: Multi-Factor Authentication',
      answer: 'Crimson Campus uses the University\'s Single Sign-On (SSO) system. If you are having trouble receiving your MFA code, please ensure your contact details are updated in the University Portal or contact the IT Help Desk at extension 4357.',
    },
    {
      id: '3',
      question: 'Facility Policies: After-Hours Access',
      answer: 'After-hours access to campus facilities requires a valid Digital ID and pre-authorization from your department head. Please note that security patrols are increased between 11 PM and 5 AM for student safety.',
    },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getInitials = () => {
    return userName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleCreateTicket = () => {
    navigation.navigate('ReportIssue');
  };

  const handleLiveChat = () => {
    navigation.navigate('SupportChat');
  };

  const handleViewFAQs = () => {
    navigation.navigate('FAQ');
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:maintenance@crimson.edu').catch(() => {
      Alert.alert('Error', 'Could not open email client.');
    });
  };

  const handleEmergencyCall = () => {
    Linking.openURL('tel:5550199').catch(() => {
      Alert.alert('Error', 'Could not make the call.');
    });
  };

  const handleSearch = () => {
    navigation.navigate('FAQ', { initialQuery: searchQuery.trim() });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={theme.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          
          {/* ===== HERO SECTION ===== */}
          <LinearGradient
            colors={[theme.primary, theme.primaryContainer]}
            style={styles.heroSection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>How can we help you today?</Text>
              <Text style={styles.heroSubtitle}>
                Access resources, report issues, and connect with the Crimson Campus facilities management team.
              </Text>
            </View>
            <View style={styles.heroIconContainer}>
              <Text style={styles.heroIcon}>💬</Text>
            </View>
          </LinearGradient>

          {/* ===== SEARCH BAR ===== */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search help articles..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ===== QUICK ACTION CARDS ===== */}
          <View style={styles.quickActions}>
            {/* Report Issue */}
            <TouchableOpacity style={[styles.actionCard, styles.actionCardRed]} onPress={handleCreateTicket}>
              <View style={styles.actionCardIconContainer}>
                <ClipboardIcon color={theme.primary} size={24} />
              </View>
              <Text style={styles.actionCardTitle}>Report a Technical Issue</Text>
              <Text style={styles.actionCardDescription}>
                App glitches, login errors, or incorrect building data.
              </Text>
              <View style={styles.actionCardFooter}>
                <Text style={[styles.actionCardLink, styles.actionCardLinkRed]}>CREATE TICKET →</Text>
              </View>
            </TouchableOpacity>

            {/* Contact Support */}
            <TouchableOpacity style={[styles.actionCard, styles.actionCardOrange]} onPress={handleLiveChat}>
              <View style={styles.actionCardIconContainer}>
                <Text style={styles.actionCardIcon}>💬</Text>
              </View>
              <Text style={styles.actionCardTitle}>Contact Support Team</Text>
              <Text style={styles.actionCardDescription}>
                Direct line to our facility dispatchers for urgent inquiries.
              </Text>
              <View style={styles.actionCardFooter}>
                <Text style={[styles.actionCardLink, styles.actionCardLinkOrange]}>LIVE CHAT →</Text>
              </View>
            </TouchableOpacity>

            {/* FAQs */}
            <TouchableOpacity style={[styles.actionCard, styles.actionCardPurple]} onPress={handleViewFAQs}>
              <View style={styles.actionCardIconContainer}>
                <Text style={styles.actionCardIcon}>❓</Text>
              </View>
              <Text style={styles.actionCardTitle}>Browse FAQs</Text>
              <Text style={styles.actionCardDescription}>
                Quick answers for common maintenance and policy questions.
              </Text>
              <View style={styles.actionCardFooter}>
                <Text style={[styles.actionCardLink, styles.actionCardLinkPurple]}>VIEW ALL →</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ===== FAQ SECTION ===== */}
          <View style={styles.faqSection}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            
            {faqs.map((faq) => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqHeader}
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Text style={[
                    styles.faqArrow,
                    expandedFaq === faq.id && styles.faqArrowExpanded,
                  ]}>›</Text>
                </TouchableOpacity>
                {expandedFaq === faq.id && (
                  <View style={styles.faqContent}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* ===== GENERAL CONTACT ===== */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>General Contact</Text>
            
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailSupport}>
              <View style={styles.contactItemLeft}>
                <Text style={styles.contactItemIcon}>✉️</Text>
                <View>
                  <Text style={styles.contactItemTitle}>Email Support</Text>
                  <Text style={styles.contactItemValue}>maintenance@crimson.edu</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.contactItem}>
              <View style={styles.contactItemLeft}>
                <Text style={styles.contactItemIcon}>🕐</Text>
                <View>
                  <Text style={styles.contactItemTitle}>Office Hours</Text>
                  <Text style={styles.contactItemValue}>
                    Mon - Fri: 8:00 AM - 6:00 PM{'\n'}
                    Sat: 10:00 AM - 2:00 PM
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ===== EMERGENCY MAINTENANCE ===== */}
          <View style={styles.emergencySection}>
            <Text style={styles.emergencyTitle}>Emergency Maintenance</Text>
            <Text style={styles.emergencyDescription}>
              For gas leaks, major floods, or fire hazards, call the emergency line immediately.
            </Text>
            <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
              <LinearGradient
                colors={['#BA1A1A', theme.primaryContainer]}
                style={styles.emergencyGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <PersonIcon color={theme.primary} size={24} />
                <Text style={styles.emergencyButtonText}>(555) 0199</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ===== COMMITMENT SECTION ===== */}
          <View style={styles.commitmentSection}>
            <View style={styles.commitmentIconContainer}>
              <Text style={styles.commitmentIcon}>✅</Text>
            </View>
            <Text style={styles.commitmentTitle}>Committed to Campus Excellence</Text>
            <Text style={styles.commitmentDescription}>
              Your feedback helps us maintain a world-class environment for teaching, learning, and research.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />

        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  // ===== HEADER =====
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
  backButtonText: {
    fontSize: 24,
    color: theme.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.primary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: theme.border,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },

  // ===== SCROLL VIEW =====
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // ===== HERO SECTION =====
  heroSection: {
    borderRadius: 24,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
    minHeight: 150,
  },
  heroContent: {
    flex: 1,
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.surface,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  heroIconContainer: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    opacity: 0.1,
  },
  heroIcon: {
    fontSize: 120,
  },

  // ===== SEARCH BAR =====
  searchContainer: {
    marginBottom: 20,
    marginTop: -10,
    paddingHorizontal: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    borderWidth: 0,
    borderColor: theme.border,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  searchIcon: {
    fontSize: 20,
    color: theme.textSecondary,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  searchButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  searchButtonText: {
    color: theme.primaryText,
    fontSize: 12,
    fontWeight: '600',
  },

  // ===== QUICK ACTIONS =====
  quickActions: {
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    backgroundColor: theme.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 0,
    borderColor: theme.border,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  actionCardRed: {
    borderLeftColor: theme.primary,
  },
  actionCardOrange: {
    borderLeftColor: '#B51A1B',
  },
  actionCardPurple: {
    borderLeftColor: '#AA2025',
  },
  actionCardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionCardIcon: {
    fontSize: 22,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  actionCardDescription: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  actionCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionCardLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionCardLinkRed: {
    color: theme.primary,
  },
  actionCardLinkOrange: {
    color: '#B51A1B',
  },
  actionCardLinkPurple: {
    color: '#AA2025',
  },

  // ===== FAQ SECTION =====
  faqSection: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 0,
    borderColor: theme.border,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary,
    borderBottomWidth: 2,
    borderBottomColor: '#FFDAD6',
    paddingBottom: 8,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  faqArrow: {
    fontSize: 24,
    color: theme.textSecondary,
    transform: [{ rotate: '0deg' }],
  },
  faqArrowExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  faqContent: {
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },

  // ===== CONTACT SECTION =====
  contactSection: {
    backgroundColor: theme.primaryContainer,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  contactItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  contactItemIcon: {
    fontSize: 20,
    color: theme.surface,
    marginTop: 2,
  },
  contactItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.surface,
  },
  contactItemValue: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },

  // ===== EMERGENCY SECTION =====
  emergencySection: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 0,
    borderColor: theme.border,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  emergencyTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  emergencyDescription: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  emergencyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  emergencyButtonIcon: {
    fontSize: 20,
    color: theme.surface,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.surface,
  },

  // ===== COMMITMENT SECTION =====
  commitmentSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  commitmentIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(175, 16, 26, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  commitmentIcon: {
    fontSize: 32,
  },
  commitmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  commitmentDescription: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 18,
  },

  // ===== BOTTOM SPACER =====
  bottomSpacer: {
    height: 20,
  },
});