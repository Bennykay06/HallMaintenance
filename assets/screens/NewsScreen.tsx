// src/screens/NewsScreen.tsx
import { useTheme } from '../context/ThemeContext';
import { PersonIcon, ClipboardIcon, WrenchIcon, BellIcon } from '../components/Icons';

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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function NewsScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('User');

  const filters = ['All', 'Facility Updates', 'Emergency', 'Student Life', 'Events'];

  // Full news data with categories
  const allNewsItems = [
    {
      id: '1',
      type: 'Facility Updates',
      title: 'Elevator Maintenance in Hall A',
      description: 'Routine safety inspections for the north wing elevators are scheduled for today between 2 PM and 4 PM.',
      time: '2 hours ago',
      icon: '🔧',
      tagColor: theme.primary,
      tagBg: '#FFE5E5',
      category: 'Facility Updates',
    },
    {
      id: '2',
      type: 'Student Life',
      title: 'Dining Hall Renovation Complete',
      description: 'The Student Union cafeteria has officially reopened with expanded seating and new sustainable waste stations.',
      time: '5 hours ago',
      icon: '🍽️',
      tagColor: '#10B981',
      tagBg: '#D1FAE5',
      category: 'Student Life',
    },
    {
      id: '3',
      type: 'Emergency',
      title: 'Water Main Repair - West Campus',
      description: 'Water pressure may be low in the West Residence Quad while emergency crews repair a main line break.',
      time: '8 hours ago',
      icon: '💧',
      tagColor: '#EF4444',
      tagBg: '#FEE2E2',
      category: 'Emergency',
      urgent: true,
    },
    {
      id: '4',
      type: 'Facility Updates',
      title: 'Spring Landscaping Schedule',
      description: 'Annual tree trimming and botanical planting will take place across the Main Quad over the next two weeks.',
      time: 'Yesterday',
      icon: '🌿',
      tagColor: '#F59E0B',
      tagBg: '#FEF3C7',
      category: 'Facility Updates',
    },
    {
      id: '5',
      type: 'Events',
      title: 'Parking Structure 4 Cleaning',
      description: 'Level 3 of Parking Structure 4 will be closed for power washing this coming Saturday from 6 AM to 12 PM.',
      time: '1 day ago',
      icon: '🚗',
      tagColor: '#6366F1',
      tagBg: '#E0E7FF',
      category: 'Events',
    },
    {
      id: '6',
      type: 'Student Life',
      title: 'New Common Room Furniture',
      description: 'The renovation of the South Hall common area is complete! New ergonomic workstations and lounge seating are now open for use.',
      time: 'Oct 19, 2023',
      icon: '👥',
      tagColor: '#10B981',
      tagBg: '#D1FAE5',
      category: 'Student Life',
    },
    {
      id: '7',
      type: 'Emergency',
      title: 'Fire Alarm Testing - All Blocks',
      description: 'Mandatory fire alarm testing will occur across all residential blocks this Friday from 9 AM to 12 PM.',
      time: 'Oct 18, 2023',
      icon: '🔥',
      tagColor: '#EF4444',
      tagBg: '#FEE2E2',
      category: 'Emergency',
      urgent: true,
    },
    {
      id: '8',
      type: 'Events',
      title: 'Hall Cleanliness Competition',
      description: 'Join the hall cleanliness competition this Friday. Prizes to be won for the cleanest floor!',
      time: 'Oct 16, 2023',
      icon: '🏆',
      tagColor: '#6366F1',
      tagBg: '#E0E7FF',
      category: 'Events',
    },
  ];

  // Featured news
  const featuredNews = {
    id: 'featured',
    title: 'New Centralized Science Wing HVAC System Implementation',
    description: 'Starting next Monday, the Facilities Management team will begin the final phase of the energy-efficient HVAC overhaul in the Science District. This project aims to reduce campus carbon emissions by 15% while providing better climate control for laboratories.',
    time: '1 hour ago',
    category: 'Facility Updates',
    type: 'featured',
  };

  // Filter news items based on active filter
  const getFilteredNews = () => {
    if (activeFilter === 'All') {
      return allNewsItems;
    }
    return allNewsItems.filter(item => item.category === activeFilter);
  };

  const filteredNews = getFilteredNews();

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

  const handleNewsPress = (item) => {
    navigation.navigate('ArticleDetail', { 
      article: {
        id: item.id,
        title: item.title,
        description: item.description,
        date: item.time,
        author: 'Facilities Management',
        readTime: '3 min read',
        content: item.description + ' More details about this update will be shared soon.',
        image: 'https://images.unsplash.com/photo-1581092335873-2c2d9b8c8c7b?w=800&h=400&fit=crop',
      }
    });
  };

  const renderFilterTabs = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.activeFilterTab,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter && styles.activeFilterText,
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderFeaturedCard = () => {
    return (
      <TouchableOpacity 
        style={styles.featuredCard}
        onPress={() => handleNewsPress(featuredNews)}
        activeOpacity={0.9}
      >
        <View style={styles.featuredImageContainer}>
          <View style={styles.featuredImagePlaceholder}>
            <Text style={styles.featuredImageText}>🏗️</Text>
          </View>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>
        </View>
        <View style={styles.featuredContent}>
          <View style={styles.featuredCategory}>
            <WrenchIcon color={theme.primary} size={24} />
            <Text style={styles.featuredCategoryText}>Infrastructure Update</Text>
          </View>
          <Text style={styles.featuredTitle}>{featuredNews.title}</Text>
          <Text style={styles.featuredDescription} numberOfLines={3}>
            {featuredNews.description}
          </Text>
          <View style={styles.featuredFooter}>
            <Text style={styles.featuredTime}>{featuredNews.time}</Text>
            <Text style={styles.featuredReadMore}>Read More →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNewsCard = (item) => {
    const isUrgent = item.urgent || item.type === 'Emergency';
    
    return (
      <TouchableOpacity 
        key={item.id} 
        style={[
          styles.newsCard,
          isUrgent && styles.urgentCard,
        ]}
        onPress={() => handleNewsPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.newsImageContainer}>
          <View style={[
            styles.newsImagePlaceholder,
            isUrgent && styles.urgentImagePlaceholder,
          ]}>
            <Text style={styles.newsImageText}>{item.icon}</Text>
          </View>
          <View style={[
            styles.newsTag,
            isUrgent && styles.urgentTag,
          ]}>
            <Text style={[
              styles.newsTagText,
              isUrgent && styles.urgentTagText,
            ]}>
              {item.type}
            </Text>
          </View>
        </View>
        <View style={styles.newsContent}>
          <Text style={styles.newsTime}>{item.time}</Text>
          <Text style={styles.newsTitle}>{item.title}</Text>
          <Text style={styles.newsDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.newsFooter}>
            <Text style={styles.newsReadMore}>Details →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Get count of filtered items
  const getFilteredCount = () => {
    if (activeFilter === 'All') {
      return allNewsItems.length;
    }
    return allNewsItems.filter(item => item.category === activeFilter).length;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BellIcon color={theme.primary} size={24} />
          <Text style={styles.headerTitle}>Campus News</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <PersonIcon color={theme.primary} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          
          {/* ===== FILTER TABS ===== */}
          {renderFilterTabs()}

          {/* ===== FILTER RESULT COUNT ===== */}
          <View style={styles.resultCountContainer}>
            <Text style={styles.resultCountText}>
              Showing {getFilteredCount()} {activeFilter === 'All' ? 'all news' : activeFilter.toLowerCase()}
            </Text>
          </View>

          {/* ===== FEATURED CARD (only show on 'All' tab) ===== */}
          {activeFilter === 'All' && renderFeaturedCard()}

          {/* ===== NEWS GRID ===== */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>
                {activeFilter === 'All' ? 'Recent Updates' : activeFilter}
              </Text>
            </View>

            {filteredNews.length > 0 ? (
              <View style={styles.newsGrid}>
                {filteredNews.map((item) => renderNewsCard(item))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyTitle}>No {activeFilter.toLowerCase()} found</Text>
                <Text style={styles.emptySubtitle}>Try selecting a different category</Text>
              </View>
            )}
          </View>

          <View style={styles.bottomSpacer} />

        </View>
      </ScrollView>

      {/* ===== BOTTOM NAV ===== */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <PersonIcon color={theme.primary} size={24} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Requests')}
        >
          <WrenchIcon color={theme.primary} size={24} />
          <Text style={styles.navLabel}>Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <ClipboardIcon color={theme.primary} size={24} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>News</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <BellIcon color={theme.primary} size={24} />
          <Text style={styles.navLabel}>Emergency</Text>
        </TouchableOpacity>
      </View>

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
    borderBottomColor: '#E8E8E8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 24,
    color: theme.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  headerButtonIcon: {
    fontSize: 22,
    color: '#5B403D',
  },

  // ===== SCROLL VIEW =====
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // ===== FILTER TABS =====
  filterScroll: {
    marginBottom: 8,
  },
  filterContainer: {
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
  },
  activeFilterTab: {
    backgroundColor: theme.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B403D',
  },
  activeFilterText: {
    color: theme.primaryText,
  },

  // ===== RESULT COUNT =====
  resultCountContainer: {
    marginBottom: 12,
  },
  resultCountText: {
    fontSize: 12,
    color: '#5B403D',
    fontStyle: 'italic',
  },

  // ===== FEATURED CARD =====
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredImageText: {
    fontSize: 64,
    opacity: 0.3,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredContent: {
    padding: 16,
  },
  featuredCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  featuredCategoryIcon: {
    fontSize: 14,
    color: theme.primary,
  },
  featuredCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1C1C',
    marginBottom: 6,
    lineHeight: 26,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#5B403D',
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredTime: {
    fontSize: 12,
    color: '#5B403D',
  },
  featuredReadMore: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.primary,
  },

  // ===== RECENT UPDATES =====
  recentSection: {
    marginTop: 4,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1C',
  },

  // ===== NEWS GRID =====
  newsGrid: {
    gap: 16,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  newsImageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  newsImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentImagePlaceholder: {
    backgroundColor: '#EF4444',
  },
  newsImageText: {
    fontSize: 40,
    opacity: 0.3,
  },
  newsTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(175, 16, 26, 0.2)',
  },
  urgentTag: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  newsTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  urgentTagText: {
    color: theme.primaryText,
  },
  newsContent: {
    padding: 14,
  },
  newsTime: {
    fontSize: 11,
    color: '#5B403D',
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1C',
    marginBottom: 4,
  },
  newsDescription: {
    fontSize: 13,
    color: '#5B403D',
    lineHeight: 18,
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  newsReadMore: {
    fontSize: 12,
    fontWeight: '700',
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

  // ===== BOTTOM NAV =====
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.background,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
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
    backgroundColor: theme.primaryContainer,
  },
  navIcon: {
    fontSize: 24,
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