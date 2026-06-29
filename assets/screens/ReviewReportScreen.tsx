// src/screens/ReviewReportScreen.js
import { ArrowLeftIcon } from '../components/Icons';

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReviewReportScreen({ navigation, route }) {
  const { 
    serviceType = 'Electrical',
    selectedIssue = 'Bulb / Fluorescent tube not lighting up',
    photos = [],
    video = null,
    writtenDetails = '',
  } = route.params || {};

  const [location, setLocation] = useState('North Hall, Room 402');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem('userLocation');
      const name = await AsyncStorage.getItem('userName');
      if (savedLocation) {
        setLocation(savedLocation);
      }
      if (name) {
        setUserName(name);
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const handleEdit = (field) => {
    if (field === 'location') {
      Alert.alert(
        'Edit Location',
        'Enter your location:',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Save',
            onPress: () => {
              Alert.alert('Location updated', 'Location would be updated here');
            },
          },
        ]
      );
    } else if (field === 'category') {
      Alert.alert('Edit Category', 'Change the issue category?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Change', onPress: () => navigation.navigate('ServiceIssues') },
      ]);
    } else if (field === 'issue') {
      Alert.alert('Edit Issue', 'Change the specific issue?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Change', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleManageMedia = () => {
    Alert.alert(
      'Manage Media',
      `Photos: ${photos.length}\nVideo: ${video ? '1' : '0'}`,
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: 'Add More', 
          onPress: () => navigation.navigate('PhotosUpload', {
            serviceType,
            selectedIssue,
            photos,
            video,
            writtenDetails,
          })
        },
        { 
          text: 'Remove All', 
          style: 'destructive',
          onPress: () => Alert.alert('Remove All', 'Remove all media?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive' },
          ])
        },
      ]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const generateReferenceId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `MT-${result}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (!location) {
      Alert.alert('Missing Location', 'Please add your location');
      setIsSubmitting(false);
      return;
    }

    try {
      const referenceId = generateReferenceId();
      
      const reportData = {
        id: Date.now().toString(),
        referenceId,
        location,
        serviceType,
        selectedIssue,
        photos: photos.map(p => p.uri || p),
        video: video ? (video.uri || video) : null,
        writtenDetails: writtenDetails || '',
        additionalNotes,
        timestamp: new Date().toISOString(),
        status: 'pending',
        submittedBy: userName,
      };

      // Save to AsyncStorage
      const existingReports = await AsyncStorage.getItem('reports');
      const reports = existingReports ? JSON.parse(existingReports) : [];
      reports.unshift(reportData);
      await AsyncStorage.setItem('reports', JSON.stringify(reports));

      // Navigate to Success Screen
      navigation.replace('Success', {
        referenceId: referenceId,
        location: location,
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Get photo count display
  const getPhotoDisplay = () => {
    if (photos.length === 0) return 'No photos';
    return `📷 ${photos.length} photo${photos.length > 1 ? 's' : ''}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeftIcon color="#AF101A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Report</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* ===== PROGRESS INDICATOR ===== */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.stepText}>Step 4 of 4</Text>
            <Text style={styles.percentText}>100% Complete</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        {/* ===== ALMOST DONE ===== */}
        <View style={styles.almostDoneContainer}>
          <Text style={styles.almostDoneTitle}>Almost done!</Text>
          <Text style={styles.almostDoneText}>
            Please confirm the details of your maintenance request below.
          </Text>
        </View>

        {/* ===== REVIEW ITEMS ===== */}
        <View style={styles.reviewItems}>
          
          {/* Location */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewItemHeader}>
              <Text style={styles.reviewItemLabel}>Location</Text>
              <TouchableOpacity onPress={() => handleEdit('location')}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewItemValue}>{location}</Text>
          </View>

          {/* Issue Category */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewItemHeader}>
              <Text style={styles.reviewItemLabel}>Issue Category</Text>
              <TouchableOpacity onPress={() => handleEdit('category')}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewItemValue}>{serviceType}</Text>
          </View>

          {/* Specific Problem */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewItemHeader}>
              <Text style={styles.reviewItemLabel}>Specific Problem</Text>
              <TouchableOpacity onPress={() => handleEdit('issue')}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewItemValue}>{selectedIssue}</Text>
          </View>

          {/* Uploaded Media */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewItemHeader}>
              <Text style={styles.reviewItemLabel}>Uploaded Media</Text>
              <TouchableOpacity onPress={handleManageMedia}>
                <Text style={styles.editButton}>Manage</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mediaPreview}>
              <Text style={styles.mediaCount}>{getPhotoDisplay()}</Text>
              {video && (
                <Text style={styles.mediaCount}>🎥 1 video</Text>
              )}
              {photos.length === 0 && !video && (
                <Text style={styles.mediaEmpty}>No media uploaded</Text>
              )}
            </View>
          </View>

          {/* Written Details (if provided) */}
          {writtenDetails && (
            <View style={styles.reviewItem}>
              <Text style={styles.reviewItemLabel}>Written Details</Text>
              <Text style={styles.reviewItemValue}>{writtenDetails}</Text>
            </View>
          )}

          {/* Additional Notes */}
          <View style={[styles.reviewItem, styles.lastReviewItem]}>
            <Text style={styles.reviewItemLabel}>Additional Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Tell us more about when this happened or how to access the room..."
              placeholderTextColor="#999"
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* ===== INFO NOTE ===== */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            ⚠️ Reported issues are typically addressed within 24-48 business hours. For electrical emergencies, call the hotline immediately.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />

      </ScrollView>

      {/* ===== BOTTOM ACTIONS ===== */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={['#AF101A', '#D32F2F']}
            style={styles.submitGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitText}>Submit Report</Text>
            )}
          </LinearGradient>
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
    fontWeight: '700',
    color: '#1A1C1C',
  },

  // ===== SCROLL VIEW =====
  scrollView: {
    flex: 1,
  },

  // ===== PROGRESS =====
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

  // ===== ALMOST DONE =====
  almostDoneContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  almostDoneTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1C1C',
    marginBottom: 4,
  },
  almostDoneText: {
    fontSize: 14,
    color: '#5B403D',
    lineHeight: 20,
  },

  // ===== REVIEW ITEMS =====
  reviewItems: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    overflow: 'hidden',
  },
  reviewItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastReviewItem: {
    borderBottomWidth: 0,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewItemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F6F6C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editButton: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AF101A',
  },
  reviewItemValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1C1C',
  },

  // ===== MEDIA PREVIEW =====
  mediaPreview: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  mediaCount: {
    fontSize: 14,
    color: '#1A1C1C',
  },
  mediaEmpty: {
    fontSize: 14,
    color: '#8F6F6C',
    fontStyle: 'italic',
  },

  // ===== NOTES INPUT =====
  notesInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    padding: 12,
    fontSize: 14,
    color: '#1A1C1C',
    minHeight: 80,
    marginTop: 8,
    textAlignVertical: 'top',
  },

  // ===== INFO =====
  infoContainer: {
    backgroundColor: '#FFF5F5',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#AF101A',
  },
  infoText: {
    fontSize: 12,
    color: '#5B403D',
    lineHeight: 18,
  },

  // ===== BOTTOM ACTIONS =====
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E4BEBA',
  },
  backBtn: {
    flex: 0.3,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  submitBtn: {
    flex: 0.7,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#AF101A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  bottomSpacer: {
    height: 20,
  },
});