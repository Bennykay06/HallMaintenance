// src/screens/PhotosUploadScreen.tsx
import { BoltIcon, CameraIcon, ImageIcon, VideoIcon, FolderIcon, CloseIcon, PlayIcon, ArrowLeftIcon, ArrowRightIcon } from '../components/Icons';

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function PhotosUploadScreen({ navigation, route }) {
  const { serviceType = 'Electrical', selectedIssue = 'Bulb flickering or not lighting up' } = route.params || {};
  
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [showWrittenDetails, setShowWrittenDetails] = useState(false);
  const [writtenDetails, setWrittenDetails] = useState('');
  const [userName, setUserName] = useState('User');
  const [userLocation, setUserLocation] = useState('North Hall, RM 402');
  const [loading, setLoading] = useState(false);

  const maxPhotos = 3;
  const maxVideos = 1;

  useEffect(() => {
    loadUserData();
    requestPermissions();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const location = await AsyncStorage.getItem('userLocation');
      if (name) setUserName(name);
      if (location) setUserLocation(location);
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      Alert.alert('Permission Needed', 'Camera permission is required to take photos');
    }

    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaStatus !== 'granted') {
      Alert.alert('Permission Needed', 'Media library permission is required to access photos');
    }
  };

  const takePhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `You can upload up to ${maxPhotos} photos.`);
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled) {
        const newPhoto = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        };
        setPhotos([...photos, newPhoto]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickPhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `You can upload up to ${maxPhotos} photos.`);
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled) {
        const newPhoto = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        };
        setPhotos([...photos, newPhoto]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const recordVideo = async () => {
    if (video) {
      Alert.alert('Limit Reached', 'You can upload only 1 video.');
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled) {
        setVideo({
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickVideo = async () => {
    if (video) {
      Alert.alert('Limit Reached', 'You can upload only 1 video.');
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled) {
        setVideo({
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = (id) => {
    setPhotos(photos.filter(photo => photo.id !== id));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const handleContinue = () => {
    if (photos.length === 0 && !video && (!showWrittenDetails || writtenDetails.trim().length === 0)) {
      Alert.alert(
        'No Evidence',
        'Please add at least one photo, video, or written details to continue.'
      );
      return;
    }

    navigation.navigate('ReviewReport', {
      serviceType,
      selectedIssue,
      photos: photos.map(p => p.uri),
      video: video ? video.uri : null,
      writtenDetails: showWrittenDetails ? writtenDetails : '',
    });
  };

  const handleSaveDraft = async () => {
    const draftData = {
      serviceType,
      selectedIssue,
      photos: photos.map(p => p.uri),
      video: video ? video.uri : null,
      writtenDetails: showWrittenDetails ? writtenDetails : null,
      timestamp: new Date().toISOString(),
      isDraft: true,
    };

    try {
      const existingDrafts = await AsyncStorage.getItem('drafts');
      const drafts = existingDrafts ? JSON.parse(existingDrafts) : [];
      drafts.push(draftData);
      await AsyncStorage.setItem('drafts', JSON.stringify(drafts));
      Alert.alert('Draft Saved', 'Your report has been saved as a draft.');
      navigation.navigate('MainTabs', { screen: 'Requests', params: { activeTab: 'Drafts' } });
    } catch (error) {
      Alert.alert('Error', 'Failed to save draft. Please try again.');
    }
  };

  const getUserInitials = () => {
    return userName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color="#AF101A" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{userLocation}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getUserInitials()}</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#AF101A" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.stepText}>Step 3 of 4</Text>
            <Text style={styles.percentText}>75% Complete</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <BoltIcon color="#AF101A" size={28} />
          </View>
          <View>
            <Text style={styles.summaryTitle}>Electrical Issue</Text>
            <Text style={styles.summaryDescription}>{selectedIssue}</Text>
          </View>
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>Evidence & Photos</Text>
          <Text style={styles.instructionText}>
            Please provide clear media of the issue. You can upload up to 3 photos and 1 video.
          </Text>
        </View>

        <View style={styles.photoGrid}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoItem}>
              <Image source={{ uri: photo.uri }} style={styles.photoImage} />
              <TouchableOpacity
                style={styles.removePhotoBtn}
                onPress={() => removePhoto(photo.id)}
              >
                <CloseIcon color="#FFFFFF" size={12} />
              </TouchableOpacity>
            </View>
          ))}
          
          {photos.length < maxPhotos && (
            <View style={styles.addPhotoContainer}>
              <TouchableOpacity style={styles.addPhotoBtn} onPress={takePhoto}>
                <CameraIcon color="#AF101A" size={24} />
                <Text style={styles.addPhotoText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addPhotoBtn} onPress={pickPhoto}>
                <ImageIcon color="#AF101A" size={24} />
                <Text style={styles.addPhotoText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.videoSection}>
          <Text style={styles.videoTitle}>Video Evidence</Text>
          {!video ? (
            <View style={styles.videoButtonContainer}>
              <TouchableOpacity style={styles.videoUploadBtn} onPress={recordVideo}>
                <VideoIcon color="#AF101A" size={32} />
                <Text style={styles.videoUploadText}>Record Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.videoUploadBtn, styles.videoGalleryBtn]} onPress={pickVideo}>
                <FolderIcon color="#AF101A" size={32} />
                <Text style={styles.videoUploadText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.videoItem}>
              <View style={styles.videoPlaceholder}>
                <PlayIcon color="#FFFFFF" size={48} />
                <Text style={styles.videoUriText}>{video.uri.split('/').pop()}</Text>
              </View>
              <TouchableOpacity style={styles.removeVideoBtn} onPress={removeVideo}>
                <CloseIcon color="#FFFFFF" size={14} />
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.videoHint}>
            Videos are helpful for flickering lights, humming sounds, or leaks.
          </Text>
        </View>

        <View style={styles.writtenDetailsSection}>
          <TouchableOpacity 
            style={styles.writtenDetailsToggle}
            onPress={() => setShowWrittenDetails(!showWrittenDetails)}
          >
            <Text style={styles.writtenDetailsToggleText}>
              {showWrittenDetails ? 'Hide' : 'Add'} written details instead
            </Text>
          </TouchableOpacity>
          
          {showWrittenDetails && (
            <View style={styles.writtenDetailsInput}>
              <TextInput
                style={styles.textInput}
                placeholder="Describe the issue in detail..."
                placeholderTextColor="#999"
                value={writtenDetails}
                onChangeText={setWrittenDetails}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}
          
          <Text style={styles.skipHint}>
            Skip photos and videos only if the issue is not visible (e.g., strange smells or sounds).
          </Text>
        </View>

        <View style={styles.bottomSpacer} />

      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={[styles.continueBtn, (photos.length === 0 && !video && (!showWrittenDetails || writtenDetails.trim().length === 0)) && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={photos.length === 0 && !video && (!showWrittenDetails || writtenDetails.trim().length === 0)}
        >
          <LinearGradient
            colors={photos.length > 0 || video || (showWrittenDetails && writtenDetails.trim().length > 0) ? ['#AF101A', '#D32F2F'] : ['#CCCCCC', '#CCCCCC']}
            style={styles.continueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.continueRow}>
              <Text style={styles.continueText}>Continue to Review</Text>
              <ArrowRightIcon color="#FFFFFF" size={18} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.draftBtn} onPress={handleSaveDraft}>
          <Text style={styles.draftText}>Save Draft & Exit</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#AF101A',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#1A1C1C',
  },
  scrollView: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AF101A',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B403D',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#AF101A',
    borderRadius: 3,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(175, 16, 26, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1C1C',
    marginBottom: 2,
  },
  summaryDescription: {
    fontSize: 14,
    color: '#5B403D',
  },
  instructionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1C1C',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 14,
    color: '#5B403D',
    lineHeight: 22,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  photoItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4BEBA',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoContainer: {
    width: '30%',
    gap: 8,
  },
  addPhotoBtn: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E4BEBA',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  addPhotoText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#5B403D',
    textAlign: 'center',
    marginTop: 4,
  },
  videoSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1C1C',
    marginBottom: 12,
  },
  videoButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  videoUploadBtn: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E4BEBA',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  videoGalleryBtn: {
    borderStyle: 'solid',
    backgroundColor: '#F9F9F9',
  },
  videoUploadText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5B403D',
    marginTop: 6,
  },
  videoItem: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4BEBA',
    position: 'relative',
    backgroundColor: '#1A1C1C',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  videoUriText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
  },
  removeVideoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoHint: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#5B403D',
    marginTop: 8,
  },
  writtenDetailsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  writtenDetailsToggle: {
    paddingVertical: 8,
  },
  writtenDetailsToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AF101A',
    textDecorationLine: 'underline',
  },
  writtenDetailsInput: {
    width: '100%',
    marginTop: 12,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    padding: 12,
    fontSize: 14,
    color: '#1A1C1C',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  skipHint: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#5B403D',
    textAlign: 'center',
    marginTop: 4,
  },
  bottomActions: {
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E4BEBA',
  },
  continueBtn: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#AF101A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  continueBtnDisabled: {
    opacity: 0.6,
  },
  continueGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  continueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  draftBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(175, 16, 26, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  draftText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF101A',
  },
  bottomSpacer: {
    height: 20,
  },
});