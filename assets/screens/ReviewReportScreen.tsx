// src/screens/ReviewReportScreen.js
import { useTheme } from '../context/ThemeContext';

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createReport, findOpenReportForMyRoom, getMyProfile, OpenRoomReport } from '../../lib/api';
import { formatLocation, formatRoom, getHall } from '../utils/location';

export default function ReviewReportScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { 
    serviceType = 'Electrical',
    selectedIssue = 'Bulb / Fluorescent tube not lighting up',
    photos = [],
    video = null,
    writtenDetails = '',
  } = route.params || {};

  // The registered address is whatever the profile says — never a literal.
  // This used to start as 'North Hall, Room 402' and was only replaced if
  // AsyncStorage happened to hold a 'userLocation'. That key is written only
  // by Onboarding and Edit Profile, and AsyncStorage is per-install, so any
  // resident who signed in on a second device — or reinstalled, or was routed
  // straight to MainTabs by App.js because their profile was already complete
  // — filed every report against a room that was not theirs.
  const [location, setLocation] = useState('');
  const [hallName, setHallName] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profile = await getMyProfile();

      if (profile) {
        // profiles.location is assembled from these three columns on the
        // dashboard side too, so build it the same way here.
        const address = [profile.hallName, profile.floor, formatRoom(profile.room || '')]
          .filter(Boolean)
          .join(', ');

        setLocation(address);
        setHallName(profile.hallName || '');
        setUserName(profile.fullName || '');

        // Keep the per-device cache in step for the screens that still read
        // it, so this fix propagates without touching all of them at once.
        if (address) await AsyncStorage.setItem('userLocation', address);
        if (profile.hallName) await AsyncStorage.setItem('userHall', profile.hallName);
        return;
      }

      // No profile means the network call failed, not that the resident has
      // no address — fall back to the cached copy rather than showing nothing.
      const savedLocation = await AsyncStorage.getItem('userLocation');
      const savedHall = await AsyncStorage.getItem('userHall');
      const name = await AsyncStorage.getItem('userName');
      if (savedLocation) setLocation(savedLocation);
      if (savedHall) setHallName(savedHall);
      if (name) setUserName(name);
    } catch (error) {
      console.log('Error loading user data:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Alert.alert has no promise form, so wrap it in one: resolve(true) to send
  // the report anyway, resolve(false) to cancel.
  //
  // `settled` matters on Android: the dismiss listener fires alongside the
  // button press, and if it won the race it resolved false even though the
  // resident had tapped "Report anyway" — the submission vanished with no
  // error, which read as the app refusing to accept the report at all.
  const confirmDuplicate = (existing: OpenRoomReport[]): Promise<boolean> =>
    new Promise((resolve) => {
      let settled = false;
      const settle = (value: boolean) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      const top = existing[0];
      const when = new Date(top.createdAt).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
      });

      const status =
        top.status === 'scheduled'
          ? 'A repair is already scheduled.'
          : top.status === 'in-progress'
          ? 'A technician is already working on it.'
          : 'It is waiting to be scheduled.';

      Alert.alert(
        'Someone in your room reported this',
        `${top.reportedBy || 'Another resident'} reported the same fault on ${when} — ` +
          `reference ${top.referenceId}.\n\n${status}\n\n` +
          'You can still send yours if this is a separate problem.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => settle(false) },
          { text: 'Report anyway', onPress: () => settle(true) },
        ],
        { cancelable: true, onDismiss: () => settle(false) }
      );
    });

  const handleSubmit = async () => {
    if (isLoadingProfile) return;

    setIsSubmitting(true);

    // An empty address means the profile has no registered room, so there is
    // nothing truthful to file the report against. Send the resident to fix
    // it rather than stamping the report with a guess.
    if (!location) {
      Alert.alert(
        'No room on your profile',
        'Add your hall, floor and room number to your profile before reporting a fault, ' +
          'so the technician knows where to go.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Edit profile', onPress: () => navigation.navigate('EditProfile') },
        ]
      );
      setIsSubmitting(false);
      return;
    }

    // A room is shared, so a roommate may already have this fault on its way
    // to a technician — worth flagging, since they cannot see each other's
    // reports. Your own earlier report is not a reason to interrupt you:
    // re-reporting it is a legitimate nudge, so those pass straight through.
    const existing = await findOpenReportForMyRoom(serviceType, selectedIssue);
    const fromOthers = existing.filter((r) => !r.isMine);
    if (fromOthers.length > 0) {
      const proceed = await confirmDuplicate(fromOthers);
      if (!proceed) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Tag the report with the resident's hall so My Requests can reliably
      // show it (and hide other halls') regardless of location formatting.
      const userHall = hallName || (await AsyncStorage.getItem('userHall')) || getHall(location);

      // createReport uploads the photos and video to storage first, so this
      // can take a moment on a slow connection — the button stays disabled
      // until it returns.
      const { report, error } = await createReport({
        serviceType,
        selectedIssue,
        writtenDetails: writtenDetails || '',
        location: formatLocation(location),
        hallName: userHall,
        photos: photos.map((p: any) => p.uri || p),
        video: video ? video.uri || video : null,
      });

      if (error || !report) {
        throw new Error(error || 'Failed to submit report');
      }

      // The reference id is generated by the database, so it is the same
      // one the dashboard shows.
      navigation.replace('Success', {
        referenceId: report.referenceId,
        location: location,
      });
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Get photo count display
  const getPhotoDisplay = () => {
    if (photos.length === 0) return 'No photos';
    return `📷 ${photos.length} photo${photos.length > 1 ? 's' : ''}`;
  };

  // Show the evidence note only when the user actually attached media.
  // If they chose to write details instead of uploading evidence, skip it.
  const hasEvidence = photos.length > 0 || !!video;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

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
            <Text style={styles.reviewItemLabel}>Location</Text>
            <Text style={styles.reviewItemValue}>
              {isLoadingProfile
                ? 'Loading your room…'
                : formatLocation(location) || 'No room on your profile'}
            </Text>
          </View>

          {/* Issue Category */}
          <View style={styles.reviewItem}>
            <Text style={styles.reviewItemLabel}>Issue Category</Text>
            <Text style={styles.reviewItemValue}>{serviceType}</Text>
          </View>

          {/* Specific Problem */}
          <View style={styles.reviewItem}>
            <Text style={styles.reviewItemLabel}>Specific Problem</Text>
            <Text style={styles.reviewItemValue}>{selectedIssue}</Text>
          </View>

          {/* Uploaded Media */}
          <View style={[styles.reviewItem, !writtenDetails && styles.lastReviewItem]}>
            <Text style={styles.reviewItemLabel}>Uploaded Media</Text>
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
            <View style={[styles.reviewItem, styles.lastReviewItem]}>
              <Text style={styles.reviewItemLabel}>Written Details</Text>
              <Text style={styles.reviewItemValue}>{writtenDetails}</Text>
            </View>
          )}
        </View>

        {/* ===== EVIDENCE NOTE (only when media was attached) ===== */}
        {hasEvidence && (
          <View style={styles.evidenceNote}>
            <Text style={styles.evidenceNoteText}>
              📎 Thanks for adding evidence. Clear photos and video help our technician diagnose and resolve the issue faster.
            </Text>
          </View>
        )}

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
          style={[styles.submitBtn, (isSubmitting || isLoadingProfile) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || isLoadingProfile}
        >
          <LinearGradient
            colors={[theme.primary, theme.primaryContainer]}
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

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
    color: theme.primary,
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
    backgroundColor: theme.primary,
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
  reviewItemLabel: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#8F6F6C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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

  // ===== EVIDENCE NOTE =====
  evidenceNote: {
    backgroundColor: theme.surfaceContainer,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  evidenceNoteText: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 18,
  },

  // ===== INFO =====
  infoContainer: {
    backgroundColor: '#FFF5F5',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
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
    shadowColor: theme.primary,
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