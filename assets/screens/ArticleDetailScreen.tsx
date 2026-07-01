// src/screens/ArticleDetailScreen.tsx
import { useTheme } from '../context/ThemeContext';
import { PersonIcon, ClipboardIcon, CalendarIcon, WrenchIcon, BellIcon, CloseIcon, ArrowLeftIcon, ArrowRightIcon } from '../components/Icons';

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Image,
  Alert,
  Animated,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Sample images for articles
const ARTICLE_IMAGES = {
  '1': {
    hero: 'https://images.unsplash.com/photo-1581092335873-2c2d9b8c8c7b?w=800&h=400&fit=crop',
  },
  '2': {
    hero: 'https://images.unsplash.com/photo-1581092335873-2c2d9b8c8c7b?w=800&h=400&fit=crop',
  },
  '3': {
    hero: 'https://images.unsplash.com/photo-1581092335873-2c2d9b8c8c7b?w=800&h=400&fit=crop',
  },
};

export default function ArticleDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { article } = route.params || {
    id: '1',
    title: 'Elevator B Modernization Complete',
    date: 'Oct 17, 2023',
    author: 'Facilities Management',
    readTime: '3 min read',
    content: `
We are pleased to announce that the modernization of Elevator B in the Central Administration Building is now complete. This project was part of our ongoing commitment to ensuring the Crimson Campus remains a state-of-the-art facility for all students, faculty, and staff.

Safety Enhancements

The primary focus of this upgrade was the implementation of a brand-new control system. These improvements include advanced load-sensing technology and an emergency communication system that connects directly to Campus Security 24/7. The new controllers offer a smoother ride and more precise leveling at every floor, significantly reducing trip hazards.

Modernized Interior

Beyond the technical upgrades, Elevator B now features a completely redesigned cabin. We have installed durable stainless steel panels, energy-efficient LED lighting, and high-visibility digital indicators. All touchpoints, including the control panel buttons, have been treated with antimicrobial coatings to support campus health initiatives.

Elevator B has been returned to regular service as of this morning. We thank you for your patience during this critical infrastructure project.
    `,
  };

  const [userName, setUserName] = useState('User');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Get article images
  const articleImages = ARTICLE_IMAGES[article.id] || ARTICLE_IMAGES['1'];
  const heroImage = articleImages?.hero || 'https://via.placeholder.com/800x400/af101a/ffffff?text=Article+Image';

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

  const handleShare = () => {
    Alert.alert('Share', 'Share this article with others');
  };

  const handleImagePress = (imageUri) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const getInitials = () => {
    return userName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Parse content with paragraphs
  const renderContent = () => {
    const paragraphs = article.content.split('\n\n');
    return paragraphs.map((paragraph, index) => {
      const isHeading = paragraph.length < 50 && !paragraph.endsWith('.') && !paragraph.endsWith('?') && !paragraph.endsWith('!');
      
      if (isHeading) {
        return (
          <Text key={index} style={styles.headingText}>
            {paragraph}
          </Text>
        );
      }
      
      return (
        <Text key={index} style={styles.bodyText}>
          {paragraph}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={theme.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Article Detail</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <ArrowRightIcon color={theme.primary} size={20} />
        </TouchableOpacity>
      </View>

      {/* ===== PROGRESS BAR ===== */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: scrollY.interpolate({
                  inputRange: [0, 1000],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              }
            ]} 
          />
        </View>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ===== HERO IMAGE ===== */}
        <TouchableOpacity 
          style={styles.heroImageContainer}
          onPress={() => handleImagePress(heroImage)}
          activeOpacity={0.9}
        >
          {imageLoading && (
            <View style={styles.imageLoader}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          )}
          <Image 
            source={{ uri: heroImage }}
            style={styles.heroImage}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* ===== ARTICLE HEADER ===== */}
        <View style={styles.articleHeader}>
          <Text style={styles.articleTitle}>{article.title}</Text>
          <View style={styles.articleMeta}>
            <View style={{flexDirection: "row", alignItems: "center"}}><CalendarIcon color="#8F6F6C" size={14} /><Text style={styles.articleMetaText}> {article.date}</Text></View>
            <Text style={styles.articleMetaDot}>•</Text>
            <Text style={styles.articleMetaText}>By {article.author}</Text>
            <Text style={styles.articleMetaDot}>•</Text>
            <Text style={styles.articleMetaText}>{article.readTime}</Text>
          </View>
        </View>

        {/* ===== ARTICLE BODY ===== */}
        <View style={styles.articleBody}>
          {renderContent()}
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* ===== IMAGE FULL SCREEN MODAL ===== */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <CloseIcon color="#666" size={24} />
          </TouchableOpacity>
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
          <View style={styles.modalFooter}>
            <Text style={styles.modalFooterText}>Tap outside image to close</Text>
          </View>
        </View>
      </Modal>

      {/* ===== BOTTOM NAV - PUSHED TO VERY BOTTOM ===== */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <PersonIcon color={styles.navIcon.color || "#666"} size={24} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Requests' })}
        >
          <WrenchIcon color={styles.navIcon.color || "#666"} size={24} />
          <Text style={styles.navLabel}>Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, styles.navItemActive]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'News' })}
        >
          <ClipboardIcon color={styles.navIcon.color || "#666"} size={24} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>News</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Emergency' })}
        >
          <BellIcon color={styles.navIcon.color || "#666"} size={24} />
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
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 24,
    color: theme.primary,
  },

  // ===== PROGRESS BAR =====
  progressContainer: {
    height: 2,
    backgroundColor: '#E8E8E8',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E8E8E8',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
  },

  // ===== SCROLL VIEW =====
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Extra space for bottom nav
  },

  // ===== HERO IMAGE =====
  heroImageContainer: {
    width: '100%',
    height: height * 0.35,
    position: 'relative',
    backgroundColor: '#1A1C1C',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1C1C',
    zIndex: 1,
  },

  // ===== ARTICLE HEADER =====
  articleHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  articleMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B403D',
  },
  articleMetaDot: {
    fontSize: 12,
    color: '#5B403D',
    marginHorizontal: 4,
  },

  // ===== ARTICLE BODY =====
  articleBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    color: '#1A1C1C',
    lineHeight: 26,
    marginBottom: 16,
  },
  headingText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.primary,
    marginTop: 8,
    marginBottom: 8,
  },

  // ===== BOTTOM SPACER =====
  bottomSpacer: {
    height: 20,
  },

  // ===== MODAL =====
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalImage: {
    width: width * 0.95,
    height: height * 0.8,
  },
  modalFooter: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  modalFooterText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },

  // ===== BOTTOM NAV - PUSHED TO VERY BOTTOM =====
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 4,
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