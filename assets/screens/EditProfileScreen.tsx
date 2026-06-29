// src/screens/EditProfileScreen.tsx
import { CameraIcon, ArrowLeftIcon } from '../components/Icons';

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
  Switch,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen({ navigation }) {
  const [userName, setUserName] = useState('Alex Johnson');
  const [email, setEmail] = useState('a.johnson@university.edu');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [hall, setHall] = useState('Unity Hall');
  const [floor, setFloor] = useState('Floor 2');
  const [room, setRoom] = useState('Room 204');
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [maintenanceUpdates, setMaintenanceUpdates] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const hallData = await AsyncStorage.getItem('userHall');
      const floorData = await AsyncStorage.getItem('userFloor');
      const roomData = await AsyncStorage.getItem('userRoom');
      
      if (name) setUserName(name);
      if (hallData) setHall(hallData);
      if (floorData) setFloor(floorData);
      if (roomData) setRoom(roomData);
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSave = () => {
    Alert.alert(
      'Save Changes',
      'Are you sure you want to save your profile changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: async () => {
            try {
              await AsyncStorage.setItem('userName', userName);
              await AsyncStorage.setItem('userHall', hall);
              await AsyncStorage.setItem('userFloor', floor);
              await AsyncStorage.setItem('userRoom', room);
              
              // Update full location for other screens
              const fullLocation = `${hall}, ${floor}, ${room}`;
              await AsyncStorage.setItem('userLocation', fullLocation);
              
              Alert.alert('Success', 'Profile updated successfully!');
              setIsEditing(false);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to save profile changes.');
            }
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    if (isEditing) {
      Alert.alert(
        'Cancel Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => {
            setIsEditing(false);
            loadUserData();
          }}
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleUpdatePhoto = () => {
    Alert.alert('Update Photo', 'Choose an option:', [
      { text: 'Take Photo', onPress: () => Alert.alert('Camera', 'Camera would open here') },
      { text: 'Choose from Gallery', onPress: () => Alert.alert('Gallery', 'Gallery would open here') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const getInitials = () => {
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
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <ArrowLeftIcon color="#AF101A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
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
          
          {/* ===== PROFILE PHOTO ===== */}
          <View style={styles.photoSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
              <TouchableOpacity style={styles.editPhotoButton} onPress={handleUpdatePhoto}>
                <CameraIcon color="#FFFFFF" size={16} />
              </TouchableOpacity>
            </View>
            <Text style={styles.photoLabel}>Update your campus identification photo</Text>
          </View>

          {/* ===== FORM FIELDS ===== */}
          <View style={styles.formSection}>
            {/* Full Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.formInput}
                value={userName}
                onChangeText={(text) => {
                  setUserName(text);
                  setIsEditing(true);
                }}
                placeholderTextColor="#999"
              />
            </View>

            {/* Reset Password */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Password Security</Text>
              <TouchableOpacity 
                style={{
                  marginTop: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: '#E4BEBA',
                  alignItems: 'center'
                }}
                onPress={() => Alert.alert('Reset Password', 'Instructions to reset your password have been sent to your email.')}
              >
                <Text style={{ color: '#AF101A', fontWeight: '600' }}>Reset Password</Text>
              </TouchableOpacity>
            </View>

            {/* Email Address */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email Address</Text>
              <TextInput
                style={styles.formInput}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setIsEditing(true);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            {/* Phone Number */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.formInput}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setIsEditing(true);
                }}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>

            {/* Hall of Residence */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hall of Residence</Text>
              <TextInput
                style={styles.formInput}
                value={hall}
                onChangeText={(text) => {
                  setHall(text);
                  setIsEditing(true);
                }}
                placeholder="Enter hall name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Floor Number */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Floor Number</Text>
              <TextInput
                style={styles.formInput}
                value={floor}
                onChangeText={(text) => {
                  setFloor(text);
                  setIsEditing(true);
                }}
                placeholder="Enter floor number"
                placeholderTextColor="#999"
              />
            </View>

            {/* Room Number */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Room Number</Text>
              <View style={styles.roomContainer}>
                <TextInput
                  style={[styles.formInput, styles.roomInput]}
                  value={room}
                  onChangeText={(text) => {
                    setRoom(text);
                    setIsEditing(true);
                  }}
                  placeholder="Enter room number"
                  placeholderTextColor="#999"
                />
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              </View>
              <Text style={styles.roomHelper}>
                Contact residence life to update your room assignment.
              </Text>
            </View>
          </View>

          {/* ===== ACTION BUTTONS ===== */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={['#AF101A', '#D32F2F']}
                style={styles.saveGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel Changes</Text>
            </TouchableOpacity>
          </View>

          {/* ===== NOTIFICATION PREFERENCES ===== */}
          <View style={styles.notificationSection}>
            <Text style={styles.notificationTitle}>Notification Preferences</Text>
            
            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationLabel}>Emergency Alerts</Text>
                <Text style={styles.notificationDescription}>
                  Immediate campus safety notifications
                </Text>
              </View>
              <Switch
                value={emergencyAlerts}
                onValueChange={(value) => {
                  setEmergencyAlerts(value);
                  setIsEditing(true);
                }}
                trackColor={{ false: '#E4BEBA', true: '#AF101A' }}
                thumbColor={emergencyAlerts ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationLabel}>Maintenance Updates</Text>
                <Text style={styles.notificationDescription}>
                  Status changes on your work orders
                </Text>
              </View>
              <Switch
                value={maintenanceUpdates}
                onValueChange={(value) => {
                  setMaintenanceUpdates(value);
                  setIsEditing(true);
                }}
                trackColor={{ false: '#E4BEBA', true: '#AF101A' }}
                thumbColor={maintenanceUpdates ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          <View style={styles.bottomSpacer} />

        </View>
      </ScrollView>

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

  // ===== SCROLL VIEW =====
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },

  // ===== PROFILE PHOTO =====
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#AF101A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editPhotoText: {
    fontSize: 16,
  },
  photoLabel: {
    fontSize: 13,
    color: '#5B403D',
  },

  // ===== FORM =====
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B403D',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formInput: {
    fontSize: 16,
    color: '#1A1C1C',
    borderBottomWidth: 1,
    borderBottomColor: '#E4BEBA',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  formInputDisabled: {
    color: '#8F6F6C',
    opacity: 0.7,
  },
  roomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roomInput: {
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },
  roomHelper: {
    fontSize: 12,
    color: '#5B403D',
    marginTop: 4,
    fontStyle: 'italic',
  },

  // ===== ACTION BUTTONS =====
  actionSection: {
    gap: 12,
    marginBottom: 24,
  },
  saveButton: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#AF101A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#AF101A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#AF101A',
  },

  // ===== NOTIFICATIONS =====
  notificationSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1C',
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  notificationDescription: {
    fontSize: 12,
    color: '#5B403D',
    marginTop: 1,
  },

  // ===== BOTTOM SPACER =====
  bottomSpacer: {
    height: 20,
  },
});