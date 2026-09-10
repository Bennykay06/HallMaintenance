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
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getKnustNews, refreshKnustNews, KnustArticle } from '../../lib/api';

const { width } = Dimensions.get('window');

export default function NewsScreen({ navigation }: any) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [articles, setArticles] = useState<KnustArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // This screen used to render a hardcoded array of invented American campus
  // notices - "Parking Structure 4", "West Residence Quad", picsum placeholder
  // photos, dates from 2023. It is now the real KNUST news feed, mirrored from
  // https://www.knust.edu.gh/news into public.knust_news and opened on KNUST's
  // own site when tapped.

  useEffect(() => {
    loadUserData();
    loadNews();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name.trim());
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const loadNews = async () => {
    try {
      const items = await getKnustNews();
      setArticles(items);
      setLoadError(items.length === 0);
    } catch (error) {
      console.log('[news] load failed:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Ask the server to re-read knust.edu.gh, then show whatever is cached.
    // The sync rate-limits itself, so this is cheap when it has run recently.
    await refreshKnustNews();
    await loadNews();
    setRefreshing(false);
  };

  // KNUST tags its own articles, so the chips come from the data rather than a
  // hardcoded list of categories the source has never used.
  const filters = ['All', ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))];

  const filteredNews = activeFilter === 'All'
    ? articles
    : articles.filter((item) => item.category === activeFilter);

  // Newest article is promoted to the featured slot.
  const featuredNews = activeFilter === 'All' ? filteredNews[0] ?? null : null;
  const listNews = featuredNews ? filteredNews.slice(1) : filteredNews;

  const getInitials = () => {
    if (!userName) return '';
    return userName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /** "3 days ago" for recent items, a plain date once that stops being useful. */
  const formatWhen = (iso: string | null) => {
    if (!iso) return '';
    const then = new Date(iso);
    if (Number.isNaN(then.getTime())) return '';
    const days = Math.floor((Date.now() - then.getTime()) / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return then.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // The article belongs to KNUST, so the app sends the reader to KNUST rather
  // than reproducing the body inside a detail screen.
  const handleNewsPress = async (item: KnustArticle) => {
    try {
      const canOpen = await Linking.canOpenURL(item.url);
      if (!canOpen) throw new Error('no handler for URL');
      await Linking.openURL(item.url);
    } catch (error) {
      console.log('[news] could not open article:', error);
      Alert.alert(
        'Could not open the article',
        'Your browser could not be opened for this story. You can read it at knust.edu.gh.'
      );
    }
  };

  const renderFilterTabs = () => {
    if (filters.length <= 2) return null; // "All" plus one category is not a choice
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
    if (!featuredNews) return null;
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        activeOpacity={0.85}
        onPress={() => handleNewsPress(featuredNews)}
      >
        {featuredNews.imageUrl ? (
          <View style={styles.featuredImageContainer}>
            <Image
              source={{ uri: featuredNews.imageUrl }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          </View>
        ) : null}
        <View style={styles.featuredContent}>
          <View style={styles.featuredCategory}>
            <WrenchIcon color={theme.primary} size={24} />
            <Text style={styles.featuredCategoryText}>{featuredNews.category}</Text>
          </View>
          <Text style={styles.featuredTitle}>{featuredNews.title}</Text>
          <Text style={styles.featuredDescription} numberOfLines={3}>
            {featuredNews.excerpt}
          </Text>
          <View style={styles.featuredFooter}>
            <Text style={styles.featuredTime}>{formatWhen(featuredNews.publishedAt)}</Text>
            <Text style={styles.featuredReadMore}>Read on knust.edu.gh →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNewsCard = (item: KnustArticle) => (
    <TouchableOpacity
      key={item.id}
      style={styles.newsCard}
      activeOpacity={0.85}
      onPress={() => handleNewsPress(item)}
    >
      {item.imageUrl ? (
        <View style={styles.newsImageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.newsImage}
            resizeMode="cover"
          />
        </View>
      ) : null}
      <View style={styles.newsContent}>
        <Text style={styles.newsTime}>{formatWhen(item.publishedAt)}</Text>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsDescription} numberOfLines={3}>
          {item.excerpt}
        </Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsReadMore}>Read on knust.edu.gh →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>KNUST News</Text>
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

          {/* ===== RESULT COUNT ===== */}
          {!loading && filteredNews.length > 0 && (
            <View style={styles.resultCountContainer}>
              <Text style={styles.resultCountText}>
                {filteredNews.length} {filteredNews.length === 1 ? 'story' : 'stories'} from knust.edu.gh
              </Text>
            </View>
          )}

          {/* ===== FEATURED CARD (newest, 'All' tab only) ===== */}
          {renderFeaturedCard()}

          {/* ===== NEWS LIST ===== */}
          <View style={styles.recentSection}>
            {!loading && listNews.length > 0 && (
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>
                  {activeFilter === 'All' ? 'More from KNUST' : activeFilter}
                </Text>
              </View>
            )}

            {loading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            ) : filteredNews.length > 0 ? (
              <View style={styles.newsGrid}>
                {listNews.map((item) => renderNewsCard(item))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyTitle}>
                  {loadError ? 'No news available' : 'Nothing in this category'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {loadError
                    ? 'Pull down to fetch the latest stories from knust.edu.gh.'
                    : 'Try a different category.'}
                </Text>
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