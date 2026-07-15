// src/screens/OnboardingScreen.tsx
import { PersonIcon } from '../components/Icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import supabase from '../../config';
import { useTheme } from '../context/ThemeContext';
type Hall = {
  id: string;
  name: string;
  campus: string;
  colors: string[];
  textColor: string;
  icon: string;
};

// Neutral default palette shown until the user selects a hall.
const DEFAULT_THEME = {
  primary: '#1A237E',
  primaryContainer: '#3949AB',
  secondary: '#455A64',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceContainer: '#F3F3F3',
  text: '#191C1D',
  textSecondary: '#454652',
  border: '#C6C5D4',
  gradientStart: '#1A237E',
  gradientEnd: '#3949AB',
  accent: '#E0E0FF',
  primaryText: '#FFFFFF',
  name: 'Default',
  icon: '🏛️',
};

export default function OnboardingScreen({ navigation }: any) {
  const { theme: hallTheme, setHall } = useTheme();
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Use the neutral default palette until a hall is chosen, then that hall's theme.
  const theme = selectedHall ? hallTheme : DEFAULT_THEME;
  const styles = getStyles(theme);

  const halls: Hall[] = [
    { 
      id: '1', 
      name: 'Unity Hall', 
      campus: 'Main Campus', 
      colors: ['#AF101A', '#D32F2F'],
      textColor: '#FFFFFF',
      icon: '🏛️'
    },
    {
      id: '2',
      name: 'University Hall (Katanga)',
      campus: 'Main Campus',
      colors: ['#F5C518', '#FFD700'],
      textColor: '#1A1C1C',
      icon: '🦁'
    },
    { 
      id: '3', 
      name: 'Independence Hall', 
      campus: 'Main Campus', 
      colors: ['#AF101A', '#D32F2F'],
      textColor: '#FFFFFF',
      icon: '🦅'
    },
    { 
      id: '4', 
      name: 'Republic Hall', 
      campus: 'Main Campus', 
      colors: ['#1B5E20', '#2E7D32'],
      textColor: '#FFFFFF',
      icon: '🏛️'
    },
    { 
      id: '5', 
      name: 'Queens Hall', 
      campus: 'Main Campus', 
      colors: ['#006994', '#1A5276'],
      textColor: '#FFFFFF',
      icon: '👑'
    },
    { 
      id: '6', 
      name: 'Africa Hall', 
      campus: 'Main Campus', 
      colors: ['#F5C518', '#FFD700'],
      textColor: '#1A1C1C',
      icon: '🌍'
    },
  ];

  const floors = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'];

  // Onboarding status check removed so it always shows on login

  const handleHallSelect = (hallId: string) => {
    setSelectedHall(hallId);
    const selectedHallData = halls.find(h => h.id === hallId);
    if (selectedHallData) {
      setHall(selectedHallData.name);
    }
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
    const selectedHallData = halls.find(h => h.id === selectedHall);
     const trimmedRoom = roomNumber.trim();
      const roomLabel = /^room\b/i.test(trimmedRoom) ? trimmedRoom : `Room ${trimmedRoom}`;
const location =`${selectedHallData?.name}, ${selectedFloor}, ${roomLabel}`;


// Insert into Supabase
const { data, error } = await supabase
.from('profiles')
.insert([
  {
    hall: selectedHallData?.name,
    floor: selectedFloor,
    room: roomLabel,
    location: location
  }
]);


if (error) {
  console.log(error);
  throw error;
}
    try {
      const selectedHallData = halls.find(h => h.id === selectedHall);

      // Store the room as "Room <n>" so it reads consistently everywhere
      // (the input only captures the bare number, e.g. "204B").
      const trimmedRoom = roomNumber.trim();
      const roomLabel = /^room\b/i.test(trimmedRoom) ? trimmedRoom : `Room ${trimmedRoom}`;

      // Save all data to AsyncStorage
      await AsyncStorage.setItem('userHall', selectedHallData?.name || '');
      await AsyncStorage.setItem('userFloor', selectedFloor || '');
      await AsyncStorage.setItem('userRoom', roomLabel);
      await AsyncStorage.setItem('userLocation', `${selectedHallData?.name}, ${selectedFloor}, ${roomLabel}`);
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
              selectedHall === hall.id && { backgroundColor: theme.accent, borderLeftWidth: 4, borderLeftColor: theme.primary },
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
              selectedHall === hall.id && { borderColor: theme.primary, backgroundColor: theme.primary },
            ]}>
              {selectedHall === hall.id && (
                <PersonIcon color={theme.text} size={24} />
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
                selectedFloor === floor && { backgroundColor: theme.primary, borderColor: theme.primary },
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
          style={[styles.roomInput, { borderColor: theme.border }]}
          value={roomNumber}
          onChangeText={setRoomNumber}
          placeholder="Enter room number"
          placeholderTextColor="#999"
          autoCapitalize="characters"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          
          {/* ===== HERO SECTION ===== */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Where will you be <Text style={[styles.heroTitleHighlight, { color: theme.primary }]}>stationed?</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              To personalize your maintenance dashboard and provide relevant campus alerts, please select your primary residence hall.
            </Text>
          </View>

          {/* ===== STEP CONTENT ===== */}
          <View style={styles.cardContainer}>
            {step === 1 && renderHallSelection()}
            {step === 2 && renderFloorSelection()}
            {step === 3 && renderRoomSelection()}
          </View>

          {/* ===== BUTTONS ===== */}
          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity style={[styles.backButtonNav, { borderColor: theme.primary }]} onPress={handleBack}>
                <Text style={[styles.backButtonNavText, { color: theme.primary }]}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.continueButton, step === 1 && styles.continueButtonFull, { shadowColor: theme.primary }]}
              onPress={handleNext}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.gradientStart, theme.gradientEnd]}
                style={styles.continueGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={[styles.continueButtonText, { color: theme.primaryText }]}>
                    {step === 3 ? 'Complete' : 'Continue'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ===== FOOTER ===== */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 knust Facilities Management</Text>
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

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
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
    color: theme.primaryText,
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