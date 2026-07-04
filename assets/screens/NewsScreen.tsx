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
  Image,
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
      image: 'https://picsum.photos/seed/elevator/600/400',
      category: 'Facility Updates',
    },
    {
      id: '2',
      type: 'Student Life',
      title: 'Dining Hall Renovation Complete',
      description: 'The Student Union cafeteria has officially reopened with expanded seating and new sustainable waste stations.',
      time: '5 hours ago',
      icon: '🍽️',
      image: 'https://picsum.photos/seed/dininghall/600/400',
      category: 'Student Life',
    },
    {
      id: '3',
      type: 'Emergency',
      title: 'Water Main Repair - West Campus',
      description: 'Water pressure may be low in the West Residence Quad while emergency crews repair a main line break.',
      time: '8 hours ago',
      icon: '💧',
      image: 'https://picsum.photos/seed/watermain/600/400',
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
      image: 'https://picsum.photos/seed/landscaping/600/400',
      category: 'Facility Updates',
    },
    {
      id: '5',
      type: 'Events',
      title: 'Parking Structure 4 Cleaning',
      description: 'Level 3 of Parking Structure 4 will be closed for power washing this coming Saturday from 6 AM to 12 PM.',
      time: '1 day ago',
      icon: '🚗',
      image: 'https://picsum.photos/seed/parking/600/400',
      category: 'Events',
    },
    {
      id: '6',
      type: 'Student Life',
      title: 'New Common Room Furniture',
      description: 'The renovation of the South Hall common area is complete! New ergonomic workstations and lounge seating are now open for use.',
      time: 'Oct 19, 2023',
      icon: '👥',
      image: 'https://picsum.photos/seed/commonroom/600/400',
      category: 'Student Life',
    },
    {
      id: '7',
      type: 'Emergency',
      title: 'Fire Alarm Testing - All Blocks',
      description: 'Mandatory fire alarm testing will occur across all residential blocks this Friday from 9 AM to 12 PM.',
      time: 'Oct 18, 2023',
      icon: '🔥',
      image: 'https://picsum.photos/seed/firealarm/600/400',
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
      image: 'https://picsum.photos/seed/cleaning/600/400',
      category: 'Events',
    },
  ];

  // Featured news
  const featuredNews = {
    id: 'featured',
    title: 'New Centralized Science Wing HVAC System Implementation',
    description: 'Starting next Monday, the Facilities Management team will begin the final phase of the energy-efficient HVAC overhaul in the Science District. This project aims to reduce campus carbon emissions by 15% while providing better climate control for laboratories.',
    time: '1 hour ago',
    icon: '🏗️',
    image: 'https://picsum.photos/seed/hvac/800/400',
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
        image: item.image,
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
      <View style={styles.featuredCard}>
        <View style={styles.featuredImageContainer}>
          <Image
            source={{ uri: featuredNews.image }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
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
            <TouchableOpacity onPress={() => handleNewsPress(featuredNews)} activeOpacity={0.7}>
              <Text style={styles.featuredReadMore}>Read More →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderNewsCard = (item) => {
    const isUrgent = item.urgent || item.type === 'Emergency';
    
    return (
      <View
        key={item.id}
        style={[
          styles.newsCard,
          isUrgent && styles.urgentCard,
        ]}
      >
        <View style={styles.newsImageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.newsImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.newsContent}>
          <Text style={styles.newsTime}>{item.time}</Text>
          <Text style={styles.newsTitle}>{item.title}</Text>
          <Text style={styles.newsDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.newsFooter}>
            <TouchableOpacity onPress={() => handleNewsPress(item)} activeOpacity={0.7}>
              <Text style={styles.newsReadMore}>Details →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
          <Text style={styles.headerTitle}>Campus News</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.profileAvatar}>
              <PersonIcon color={theme.primaryText} size={20} />
            </View>
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

    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
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
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: theme.surfaceContainer,
  },
  activeFilterTab: {
    backgroundColor: theme.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
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
    color: theme.textSecondary,
    fontStyle: 'italic',
  },

  // ===== FEATURED CARD =====
  featuredCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
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
    backgroundColor: theme.surfaceContainer,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
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
    color: theme.text,
    marginBottom: 6,
    lineHeight: 26,
  },
  featuredDescription: {
    fontSize: 14,
    color: theme.textSecondary,
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
    color: theme.textSecondary,
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
    color: theme.text,
  },

  // ===== NEWS GRID =====
  newsGrid: {
    gap: 16,
  },
  newsCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  newsImageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
    backgroundColor: theme.surfaceContainer,
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  newsContent: {
    padding: 14,
  },
  newsTime: {
    fontSize: 11,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  newsDescription: {
    fontSize: 13,
    color: theme.textSecondary,
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
    color: theme.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },

  // ===== BOTTOM SPACER =====
  bottomSpacer: {
    height: 20,
  },
});