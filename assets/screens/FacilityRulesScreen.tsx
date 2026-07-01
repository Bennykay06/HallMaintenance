// src/screens/FacilityRulesScreen.tsx
import { useTheme } from '../context/ThemeContext';
import { ArrowLeftIcon, SchoolIcon, SearchIcon, GroupsIcon, EngineeringIcon, SecurityIcon, SanitizerIcon, MailIcon } from '../components/Icons';

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
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface AccordionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: { icon: string; title: string; description: string }[];
}

export default function FacilityRulesScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userName, setUserName] = useState('User');

  const accordionData: AccordionItem[] = [
    {
      id: '1',
      title: 'General Conduct',
      subtitle: 'Noise, guests, and community',
      icon: <GroupsIcon color={theme.primary} size={24} />,
      content: [
        {
          icon: 'timer',
          title: 'Noise Hours',
          description: 'Quiet hours are observed Sunday–Thursday from 10:00 PM to 8:00 AM, and Friday–Saturday from Midnight to 10:00 AM.',
        },
        {
          icon: 'person_add',
          title: 'Guest Policy',
          description: 'Residents may have one overnight guest for up to 3 consecutive nights with prior roommate approval and front-desk registration.',
        },
        {
          icon: 'meeting_room',
          title: 'Communal Spaces',
          description: 'Shared lounges and kitchens must be cleared of personal items immediately after use. No amplified music without headphones.',
        },
      ],
    },
    {
      id: '2',
      title: 'Maintenance & Repairs',
      subtitle: 'Service requests and access',
      icon: <EngineeringIcon color={theme.primary} size={24} />,
      content: [
        {
          icon: 'report',
          title: 'How to Report',
          description: 'All non-emergency issues must be submitted via the "Requests" tab in the app. Emergencies should be called in directly.',
        },
        {
          icon: 'key',
          title: 'Technician Access',
          description: 'By submitting a request, you grant 48-hour access for university personnel to enter your unit between 9:00 AM and 5:00 PM.',
        },
        {
          icon: 'inventory',
          title: 'Responsibilities',
          description: 'Residents are responsible for lightbulb replacements in personal lamps and maintaining a clear path for technicians.',
        },
      ],
    },
    {
      id: '3',
      title: 'Safety & Security',
      subtitle: 'Emergency protocols and entry',
      icon: <SecurityIcon color={theme.primary} size={24} />,
      content: [
        {
          icon: 'local_fire_department',
          title: 'Fire Safety',
          description: 'Tampering with smoke detectors or fire extinguishers is a federal offense. No open flames, candles, or incense allowed.',
        },
        {
          icon: 'badge',
          title: 'Key Card Usage',
          description: 'Do not loan your ID/Key Card to anyone. Report lost cards immediately to Campus Security.',
        },
        {
          icon: 'exit_to_app',
          title: 'Evacuation',
          description: 'Locate your floor\'s designated assembly point. In an alarm, use stairs only; elevators will be disabled.',
        },
      ],
    },
    {
      id: '4',
      title: 'Health & Sanitation',
      subtitle: 'Waste, laundry, and hygiene',
      icon: <SanitizerIcon color={theme.primary} size={24} />,
      content: [
        {
          icon: 'delete_outline',
          title: 'Waste Disposal',
          description: 'Trash must be double-bagged and placed inside floor chutes. Cardboard must be flattened and taken to the recycling bay.',
        },
        {
          icon: 'local_laundry_service',
          title: 'Laundry Room',
          description: 'Items left in machines for more than 20 minutes after completion may be moved to the holding shelf by other residents.',
        },
        {
          icon: 'pest_control',
          title: 'Pest Control',
          description: 'Quarterly inspections occur on the first Tuesday of every month. Please ensure floors are clear of food items.',
        },
      ],
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

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getInitials = () => {
    return userName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredData = accordionData.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAccordionItem = (item: AccordionItem) => {
    const isExpanded = expandedId === item.id;
    
    return (
      <View key={item.id} style={styles.accordionItem}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => toggleAccordion(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.accordionHeaderLeft}>
            <View style={styles.accordionIconContainer}>
              {item.icon}
            </View>
            <View>
              <Text style={styles.accordionTitle}>{item.title}</Text>
              <Text style={styles.accordionSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
          <Text style={[
            styles.accordionArrow,
            isExpanded && styles.accordionArrowExpanded,
          ]}>›</Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.accordionContent}>
            {item.content.map((content, index) => (
              <View key={index} style={styles.accordionContentItem}>
                <View style={styles.accordionContentIconContainer}>
                  <Text style={styles.accordionContentIcon}>{content.icon}</Text>
                </View>
                <View style={styles.accordionContentText}>
                  <Text style={styles.accordionContentTitle}>{content.title}</Text>
                  <Text style={styles.accordionContentDescription}>
                    {content.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={theme.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rules & Guidelines</Text>
        <View style={styles.headerRight}>
          <SchoolIcon color={theme.primary} size={24} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
        </View>
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
          
          {/* ===== SEARCH BAR ===== */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <SearchIcon color="#8F6F6C" size={16} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Guidelines (e.g. 'Guest policy')"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* ===== FEATURED BANNER ===== */}
          <TouchableOpacity style={styles.featuredBanner} activeOpacity={0.9}>
            <LinearGradient
              colors={['rgba(175, 16, 26, 0.9)', 'rgba(175, 16, 26, 0.7)']}
              style={styles.featuredOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={styles.featuredContent}>
              <Text style={styles.featuredLabel}>Community Standards</Text>
              <Text style={styles.featuredTitle}>2024 Resident Handbook</Text>
              <Text style={styles.featuredSubtitle}>
                Essential protocols for a shared living environment.
              </Text>
            </View>
          </TouchableOpacity>

          {/* ===== ACCORDION SECTIONS ===== */}
          <View style={styles.accordionContainer}>
            {filteredData.length > 0 ? (
              filteredData.map((item) => renderAccordionItem(item))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySubtitle}>Try a different search term</Text>
              </View>
            )}
          </View>

          {/* ===== SUPPORT SECTION ===== */}
          <View style={styles.supportSection}>
            <Text style={styles.supportTitle}>Need clarification?</Text>
            <Text style={styles.supportSubtitle}>
              Contact the Residential Hall Director for further questions about these guidelines.
            </Text>
            <TouchableOpacity style={styles.supportButton}>
              <MailIcon color={theme.primary} size={20} />
              <Text style={styles.supportButtonText}>Message Hall Director</Text>
            </TouchableOpacity>
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
    color: theme.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4BEBA',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1C1C',
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

  // ===== SEARCH BAR =====
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    paddingHorizontal: 14,
    height: 50,
  },
  searchIcon: {
    fontSize: 20,
    color: '#5B403D',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1C1C',
    padding: 0,
  },

  // ===== FEATURED BANNER =====
  featuredBanner: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: theme.primary,
  },
  featuredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  featuredLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },

  // ===== ACCORDION =====
  accordionContainer: {
    gap: 12,
    marginBottom: 20,
  },
  accordionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  accordionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(175, 16, 26, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  accordionSubtitle: {
    fontSize: 13,
    color: '#5B403D',
  },
  accordionArrow: {
    fontSize: 24,
    color: '#5B403D',
    transform: [{ rotate: '0deg' }],
  },
  accordionArrowExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  accordionContent: {
    borderTopWidth: 1,
    borderTopColor: '#E4BEBA',
    padding: 16,
    backgroundColor: 'rgba(175, 16, 26, 0.02)',
  },
  accordionContentItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  accordionContentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(175, 16, 26, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  accordionContentIcon: {
    fontSize: 16,
  },
  accordionContentText: {
    flex: 1,
  },
  accordionContentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1C1C',
    marginBottom: 2,
  },
  accordionContentDescription: {
    fontSize: 13,
    color: '#5B403D',
    lineHeight: 18,
  },

  // ===== SUPPORT =====
  supportSection: {
    backgroundColor: 'rgba(91, 64, 61, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1C1C',
    marginBottom: 4,
  },
  supportSubtitle: {
    fontSize: 14,
    color: '#5B403D',
    textAlign: 'center',
    marginBottom: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.primary,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },

  // ===== EMPTY STATE =====
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1C1C',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#5B403D',
  },

  // ===== BOTTOM SPACER =====
  bottomSpacer: {
    height: 20,
  },
});