// src/screens/ServiceIssuesScreen.tsx
import { useTheme } from '../context/ThemeContext';
import { ArrowLeftIcon } from '../components/Icons';

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const SERVICE_DATA = {
  Electrical: {
    title: 'Electrical',
    description: 'Lighting, sockets, switches, ceiling fans, or water heaters.',
    warning: 'Report hazardous electrical conditions immediately via the Emergency tab.',
    issues: [
      'Bulb / Fluorescent tube not lighting up',
      'Ceiling fan rotating dangerously slow or humming',
      'Wall socket sparking or dead (no power)',
      'Water heater not working',
      'Exposed wiring or loose connection',
    ],
  },
  Plumbing: {
    title: 'Plumbing',
    description: 'Leaking taps, blocked drains, or toilet cistern malfunctions.',
    warning: 'Report water damage or flooding immediately via the Emergency tab.',
    issues: [
      'Tap dripping constantly or broken',
      'Toilet bowl overflowing or won\'t flush',
      'Washbasin / Floor drain choked',
      'Water leaking down from ceiling or walls',
      'Broken pipe or water burst',
    ],
  },
  Carpentry: {
    title: 'Carpentry',
    description: 'Doors, window louvres, locks, study desks, or beds.',
    warning: 'Report broken or damaged furniture immediately for safety.',
    issues: [
      'Room door lock jammed or key won\'t turn',
      'Loose or broken door hinges',
      'Missing or broken window louvre blades',
      'Broken bed frame or study desk',
      'Damaged wardrobe or cabinet',
    ],
  },
  Masonry: {
    title: 'Masonry',
    description: 'Cracked concrete, peeling wall plaster, or broken tiling.',
    warning: 'Report structural issues immediately via the Emergency tab.',
    issues: [
      'Deep cracks spreading across concrete walls',
      'Broken or missing floor tiles',
      'Peeling wall plaster or paint',
      'Damaged ceiling or roof',
      'Cracked window or door frames',
    ],
  },
};

export default function ServiceIssuesScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { serviceType = 'Electrical' } = route.params || {};
  const serviceData = SERVICE_DATA[serviceType] || SERVICE_DATA.Electrical;

  const allIssues = [...serviceData.issues, 'Other issue...'];

  const initialIssues = allIssues.map((issue, index) => ({
    id: String(index + 1),
    title: issue,
    selected: false,
    isOther: index === allIssues.length - 1,
  }));

  const [issueList, setIssueList] = useState(initialIssues);
  const [manualDescription, setManualDescription] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const toggleIssue = (id) => {
    const updatedList = issueList.map(item => {
      if (item.id === id) {
        if (item.isOther && !item.selected) {
          setShowManualInput(true);
        }
        if (item.isOther && item.selected) {
          setShowManualInput(false);
          setManualDescription('');
        }
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    setIssueList(updatedList);
  };

  const selectedCount = issueList.filter(item => item.selected).length;

  const getSelectedIssues = () => {
    const selected = issueList.filter(item => item.selected);
    const selectedTitles = selected.map(item => item.title);
    
    const otherSelected = selected.find(item => item.isOther);
    if (otherSelected && manualDescription.trim()) {
      return [...selectedTitles.filter(t => t !== 'Other issue...'), `Other: ${manualDescription}`];
    }
    return selectedTitles;
  };

  const handleContinue = () => {
    if (selectedCount === 0) {
      alert('Please select at least one issue');
      return;
    }

    const selectedIssues = getSelectedIssues();
    
    const otherSelected = issueList.find(item => item.isOther && item.selected);
    if (otherSelected && !manualDescription.trim()) {
      alert('Please describe the other issue');
      return;
    }

    navigation.navigate('PhotosUpload', {
      serviceType: serviceType,
      selectedIssue: selectedIssues.join(', '),
    });
  };

  const CheckMark = ({ selected }) => (
    <View style={[styles.checkmarkCircle, selected && styles.checkmarkCircleSelected]}>
      <Text style={[styles.checkmarkText, selected && styles.checkmarkTextSelected]}>
        {selected ? '✓' : ''}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={theme.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{serviceType} Issues</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        <View style={styles.serviceTypeContainer}>
          <Text style={styles.serviceTypeTitle}>{serviceData.title}</Text>
          <Text style={styles.serviceTypeDescription}>
            {serviceData.description}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SPECIFIC PROBLEM</Text>
          <Text style={styles.selectionHint}>(Select all that apply)</Text>
        </View>

        <View style={styles.issuesList}>
          {issueList.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.issueItem,
                item.selected && styles.issueItemSelected,
                item.isOther && styles.issueItemOther,
              ]}
              onPress={() => toggleIssue(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.issueLeft}>
                <CheckMark selected={item.selected} />
                <Text 
                  style={[
                    styles.issueText,
                    item.selected && styles.issueTextSelected,
                    item.isOther && styles.issueTextOther,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {showManualInput && (
          <View style={styles.manualInputContainer}>
            <Text style={styles.manualInputLabel}>Please describe the issue:</Text>
            <TextInput
              style={styles.manualInput}
              placeholder="Enter your issue description..."
              placeholderTextColor="#999"
              value={manualDescription}
              onChangeText={setManualDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        )}

        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            {serviceData.warning}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.stepText}>Step 2 of 4</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {selectedCount > 0 ? `${selectedCount} issue${selectedCount > 1 ? 's' : ''} selected` : 'No selection'}
            </Text>
            <View style={[styles.statusDot, selectedCount > 0 && styles.statusDotActive]} />
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.continueButton, selectedCount === 0 && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={selectedCount === 0}
        >
          <LinearGradient
            colors={selectedCount > 0 ? [theme.primary, theme.primaryContainer] : ['#CCCCCC', '#CCCCCC']}
            style={styles.continueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueText}>Continue to Photos →</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
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
    fontWeight: '700',
    color: theme.text,
  },
  scrollView: {
    flex: 1,
  },
  serviceTypeContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  serviceTypeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: 4,
  },
  serviceTypeDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textSecondary,
    letterSpacing: 1,
  },
  selectionHint: {
    fontSize: 11,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  issuesList: {
    paddingHorizontal: 16,
    gap: 6,
  },
  issueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  issueItemSelected: {
    borderColor: theme.primary,
    borderWidth: 2,
    backgroundColor: theme.surfaceContainer,
  },
  issueItemOther: {
    borderColor: theme.textSecondary,
    borderStyle: 'dashed',
  },
  issueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  issueText: {
    fontSize: 14,
    color: theme.text,
    flex: 1,
  },
  issueTextSelected: {
    color: theme.primary,
    fontWeight: '600',
  },
  issueTextOther: {
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  checkmarkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkCircleSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primary,
  },
  checkmarkText: {
    fontSize: 14,
    color: 'transparent',
    fontWeight: 'bold',
  },
  checkmarkTextSelected: {
    color: theme.primaryText,
  },
  manualInputContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    backgroundColor: theme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.primary,
    borderStyle: 'dashed',
  },
  manualInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  manualInput: {
    fontSize: 14,
    color: theme.text,
    minHeight: 80,
    padding: 10,
    backgroundColor: theme.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.border,
    textAlignVertical: 'top',
  },
  warningContainer: {
    backgroundColor: theme.surfaceContainer,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  warningText: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomBarLeft: {
    flex: 1,
  },
  stepText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCCCCC',
  },
  statusDotActive: {
    backgroundColor: '#28A745',
  },
  continueButton: {
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  continueText: {
    color: theme.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 20,
  },
});