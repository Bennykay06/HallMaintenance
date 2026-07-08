// src/screens/RequestDetailScreen.tsx
import { useTheme } from '../context/ThemeContext';
import {
  ArrowLeftIcon,
  LocationIcon,
  PersonIcon,
  ClockIcon,
  WrenchIcon,
  DescriptionIcon,
  ImageIcon,
  CloseIcon,
  ClipboardIcon,
} from '../components/Icons';

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';

export default function RequestDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { request = {} } = route.params || {};

  const photos: string[] = Array.isArray(request.photos) ? request.photos : [];
  const video: string | null = request.video || null;

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const player = useVideoPlayer(video);

  const getStatusColor = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'in progress':
        return theme.primary;
      case 'scheduled':
        return '#F39C12';
      case 'completed':
      case 'resolved':
        return '#27AE60';
      default:
        return '#8F6F6C';
    }
  };

  const getStatusBg = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'in progress':
        return 'rgba(175, 16, 26, 0.1)';
      case 'scheduled':
        return 'rgba(243, 156, 18, 0.1)';
      case 'completed':
      case 'resolved':
        return 'rgba(39, 174, 96, 0.1)';
      default:
        return 'rgba(143, 111, 108, 0.1)';
    }
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return 'Unknown';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Unknown';
    return d.toLocaleString();
  };

  const status = request.status || 'Pending';

  const Row = ({ Icon, label, value }: { Icon: any; label: string; value: string }) => (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Icon color={theme.primary} size={18} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={theme.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* ===== SUMMARY CARD ===== */}
          <View style={styles.card}>
            <View style={styles.summaryHeader}>
              <Text style={styles.serviceType}>{request.serviceType || 'Request'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusBg(status) }]}>
                <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                  {status}
                </Text>
              </View>
            </View>
            <Text style={styles.referenceId}>
              Reference: {request.referenceId || 'Pending'}
            </Text>
          </View>

          {/* ===== DETAILS CARD ===== */}
          <Text style={styles.sectionTitle}>Submitted Details</Text>
          <View style={styles.card}>
            <Row Icon={WrenchIcon} label="Issue Category" value={request.serviceType || '—'} />
            <View style={styles.divider} />
            <Row
              Icon={ClipboardIcon}
              label="Specific Problem"
              value={request.selectedIssue || '—'}
            />
            <View style={styles.divider} />
            <Row Icon={LocationIcon} label="Location" value={request.location || '—'} />
            <View style={styles.divider} />
            <Row Icon={PersonIcon} label="Submitted By" value={request.submittedBy || '—'} />
            <View style={styles.divider} />
            <Row Icon={ClockIcon} label="Submitted" value={formatDateTime(request.timestamp)} />
          </View>

          {/* ===== WRITTEN DETAILS ===== */}
          {!!request.writtenDetails && (
            <>
              <Text style={styles.sectionTitle}>Written Details</Text>
              <View style={styles.card}>
                <View style={styles.notesRow}>
                  <DescriptionIcon color={theme.primary} size={18} />
                  <Text style={styles.notesText}>{request.writtenDetails}</Text>
                </View>
              </View>
            </>
          )}

          {/* ===== MEDIA ===== */}
          <Text style={styles.sectionTitle}>Uploaded Media</Text>
          <View style={styles.card}>
            {photos.length === 0 && !video ? (
              <View style={styles.emptyMedia}>
                <ImageIcon color={theme.textSecondary} size={24} />
                <Text style={styles.emptyMediaText}>No media uploaded</Text>
              </View>
            ) : (
              <>
                {photos.length > 0 && (
                  <>
                    <Text style={styles.mediaLabel}>
                      Photos ({photos.length})
                    </Text>
                    <View style={styles.photoGrid}>
                      {photos.map((uri, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.photoTouchable}
                          onPress={() => setPreviewUri(uri)}
                          activeOpacity={0.8}
                        >
                          <Image source={{ uri }} style={styles.photoImage} />
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={styles.mediaHint}>Tap a photo to view full screen</Text>
                  </>
                )}
                {video && (
                  <>
                    <Text style={[styles.mediaLabel, photos.length > 0 && { marginTop: 16 }]}>
                      Video
                    </Text>
                    <VideoView
                      style={styles.videoPlayer}
                      player={player}
                      allowsFullscreen
                      nativeControls
                      contentFit="contain"
                    />
                  </>
                )}
              </>
            )}
          </View>

          {/* ===== TECHNICIAN (if assigned) ===== */}
          {request.technician && (
            <>
              <Text style={styles.sectionTitle}>Assigned Technician</Text>
              <View style={styles.card}>
                <Row
                  Icon={PersonIcon}
                  label={request.technician.name || 'Technician'}
                  value={request.technician.role || 'Facilities'}
                />
              </View>
            </>
          )}

          {/* ===== STATUS NOTE ===== */}
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              A technician will update you when this request is resolved.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* ===== FULL-SCREEN PHOTO PREVIEW ===== */}
      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setPreviewUri(null)}
          >
            <CloseIcon color="#FFFFFF" size={28} />
          </TouchableOpacity>
          {previewUri && (
            <Image
              source={{ uri: previewUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.primary,
  },

  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },

  // ===== CARD =====
  card: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  // ===== SUMMARY =====
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceType: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  referenceId: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 6,
  },

  // ===== ROW =====
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 12,
  },

  // ===== NOTES =====
  notesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
    lineHeight: 22,
  },

  // ===== MEDIA =====
  mediaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoTouchable: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mediaHint: {
    fontSize: 12,
    color: theme.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  emptyMedia: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  emptyMediaText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },

  // ===== NOTE BOX =====
  noteBox: {
    backgroundColor: theme.surfaceContainer,
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  noteText: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },

  bottomSpacer: {
    height: 40,
  },

  // ===== FULL-SCREEN PREVIEW =====
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
});
