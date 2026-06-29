// src/screens/OnboardingScreen.tsx
import { PersonIcon } from '../components/Icons';

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
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen({ navigation }) {
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const halls = [
    { id: '1', name: 'Unity Hall', campus: 'Main Campus', colors: ['#AF101A', '#FFFFFF'] },
    { id: '2', name: 'Katanga Hall', campus: 'Main Campus', colors: ['#FFD700', '#000000'] },
    { id: '3', name: 'Africa Hall', campus: 'Main Campus', colors: ['#FFD700', '#FFD700'] },
    { id: '4', name: 'Republic Hall', campus: 'Main Campus', colors: ['#008000', '#008000'] },
    { id: '5', name: 'Independent Hall', campus: 'Main Campus', colors: ['#8B0000', '#8B0000'] },
    { id: '6', name: 'Queen Elizabeth II Hall', campus: 'Main Campus', colors: ['#006994', '#006994'] },
  ];

  const floors = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'];

  // Onboarding status check removed so it always shows on login

  const handleHallSelect = (hallId: string) => {
    setSelectedHall(hallId);
  };

  const handleFloorSelect = (floor: string) => {
    setSelectedFloor(floor);
  };

  const handleNext = () => {
    if (step === 1 && !selectedHall) {
      Alert.alert('Selection Required', 'Please select a hall to continue.');
      return;
    }
    if (step === 2 && !selectedFloor) {
      Alert.alert('Selection Required', 'Please select a floor to continue.');
      return;
    }
    if (step === 3) {
      handleComplete();
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = async () => {
    if (!roomNumber.trim()) {
      Alert.alert('Room Required', 'Please enter your room number.');
      return;
    }

    setIsLoading(true);

    try {
      const selectedHallData = halls.find(h => h.id === selectedHall);
      
      // Save all data to AsyncStorage
      await AsyncStorage.setItem('userHall', selectedHallData?.name || '');
      await AsyncStorage.setItem('userFloor', selectedFloor || '');
      await AsyncStorage.setItem('userRoom', roomNumber);
      await AsyncStorage.setItem('userLocation', `${selectedHallData?.name}, ${selectedFloor}, ${roomNumber}`);
      await AsyncStorage.setItem('onboardingComplete', 'true');

      setIsLoading(false);
      
      // Navigate to MainTabs
      navigation.replace('MainTabs');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    }
  };

  const renderHallSelection = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Hall</Text>
        
        {halls.map((hall) => (
          <TouchableOpacity
            key={hall.id}
            style={[
              styles.hallItem,
              selectedHall === hall.id && styles.hallItemSelected,
            ]}
            onPress={() => handleHallSelect(hall.id)}
            activeOpacity={0.7}
          >
            <View style={styles.hallItemLeft}>
              <View style={styles.hallImagePlaceholder}>
                <View style={{ flex: 1, flexDirection: 'row', width: '100%', height: '100%' }}>
                  <View style={{ flex: 1, backgroundColor: hall.colors[0] }} />
                  <View style={{ flex: 1, backgroundColor: hall.colors[1] }} />
                </View>
              </View>
              <View>
                <Text style={styles.hallName}>{hall.name}</Text>
                <Text style={styles.hallDetails}>{hall.campus}</Text>
              </View>
            </View>
            <View style={[
              styles.radioButton,
              selectedHall === hall.id && styles.radioButtonSelected,
            ]}>
              {selectedHall === hall.id && (
                <PersonIcon color="#AF101A" size={24} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderFloorSelection = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Floor</Text>
        
        <View style={styles.floorGrid}>
          {floors.map((floor) => (
            <TouchableOpacity
              key={floor}
              style={[
                styles.floorItem,
                selectedFloor === floor && styles.floorItemSelected,
              ]}
              onPress={() => handleFloorSelect(floor)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.floorText,
                selectedFloor === floor && styles.floorTextSelected,
              ]}>
                {floor}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderRoomSelection = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Room Number</Text>
        <Text style={styles.stepSubtitle}>
          Enter room number (e.g. 204B)
        </Text>
        
        <TextInput
          style={styles.roomInput}
          value={roomNumber}
          onChangeText={setRoomNumber}
          placeholder="Enter room number"
          placeholderTextColor="#999"
          autoCapitalize="characters"
        />
      </View>
    );
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
        <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
        <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
        <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Onboarding</Text>
        <Text style={styles.stepBadge}>Step {step} of 3</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          
          {/* ===== HERO SECTION ===== */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Where will you be <Text style={styles.heroTitleHighlight}>stationed?</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              To personalize your maintenance dashboard and provide relevant campus alerts, please select your primary residence hall.
            </Text>
          </View>

          {/* ===== STEP INDICATOR ===== */}
          {renderStepIndicator()}

          {/* ===== STEP CONTENT ===== */}
          <View style={styles.cardContainer}>
            {step === 1 && renderHallSelection()}
            {step === 2 && renderFloorSelection()}
            {step === 3 && renderRoomSelection()}
          </View>

          {/* ===== BUTTONS ===== */}
          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity style={styles.backButtonNav} onPress={handleBack}>
                <Text style={styles.backButtonNavText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.continueButton, step === 1 && styles.continueButtonFull]}
              onPress={handleNext}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#AF101A', '#D32F2F']}
                style={styles.continueGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.continueButtonText}>
                    {step === 3 ? 'Complete' : 'Continue'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ===== FOOTER ===== */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 Crimson University Facilities Management</Text>
            <View style={styles.footerLinks}>
              <Text style={styles.footerLink}>Privacy Policy</Text>
              <Text style={styles.footerLink}>Support</Text>
            </View>
          </View>

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
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#AF101A',
  },
  stepBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B403D',
  },

  // ===== SCROLL VIEW =====
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // ===== HERO =====
  heroSection: {
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1C1C',
    marginBottom: 4,
  },
  heroTitleHighlight: {
    color: '#AF101A',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#5B403D',
    lineHeight: 20,
  },

  // ===== STEP INDICATOR =====
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E4BEBA',
  },
  stepDotActive: {
    backgroundColor: '#AF101A',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E4BEBA',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#AF101A',
  },

  // ===== CARD CONTAINER =====
  cardContainer: {
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
  stepContainer: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1C1C',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#5B403D',
    marginBottom: 12,
  },

  // ===== HALL SELECTION =====
  hallItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  hallItemSelected: {
    backgroundColor: '#FFDAD6',
    borderLeftWidth: 4,
    borderLeftColor: '#AF101A',
  },
  hallItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hallImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F3F3',
    overflow: 'hidden',
  },
  hallImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  hallName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  hallDetails: {
    fontSize: 13,
    color: '#5B403D',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E4BEBA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#AF101A',
    backgroundColor: '#AF101A',
  },
  radioCheckmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ===== FLOOR SELECTION =====
  floorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  floorItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    backgroundColor: '#FFFFFF',
  },
  floorItemSelected: {
    backgroundColor: '#AF101A',
    borderColor: '#AF101A',
  },
  floorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1C1C',
  },
  floorTextSelected: {
    color: '#FFFFFF',
  },

  // ===== ROOM INPUT =====
  roomInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4BEBA',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1C1C',
    marginTop: 4,
  },

  // ===== BUTTONS =====
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  backButtonNav: {
    flex: 0.3,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#AF101A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backButtonNavText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#AF101A',
  },
  continueButton: {
    flex: 0.7,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#AF101A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonFull: {
    flex: 1,
  },
  continueGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ===== FOOTER =====
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 11,
    color: '#5B403D',
    opacity: 0.7,
    marginBottom: 4,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  footerLink: {
    fontSize: 11,
    color: '#5B403D',
    opacity: 0.7,
    textDecorationLine: 'underline',
  },
});