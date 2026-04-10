import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  StatusBar,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { useAudioStore } from '@/store/audioStore';
import { formatDuration } from '@/constants/mockData';
import { useDownloadStore } from '@/store/downloadStore';
import { downloadService } from '@/services/MediaDownloadService';
import theme from '@/theme';
import type { PlaybackSpeed } from '@/types';

const SPEEDS: PlaybackSpeed[] = [0.75, 1.0, 1.25, 1.5, 2.0];

export function FullPlayer() {
  const {
    currentMessage,
    playerState,
    progress,
    position,
    duration,
    speed,
    isFullPlayerVisible,
    closeFullPlayer,
    setPlayerState,
    setSpeed,
    seekTo,
  } = useAudioStore();

  const { downloads, addDownload } = useDownloadStore();
  const [showSpeeds, setShowSpeeds] = useState(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(60);

  const download = currentMessage ? downloads.find(d => d.messageId === currentMessage.id) : null;
  const isDownloaded = download?.status === 'completed';
  const isDownloading = download?.status === 'downloading' || download?.status === 'pending';

  React.useEffect(() => {
    if (isFullPlayerVisible) {
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(60, { duration: 200 });
    }
  }, [isFullPlayerVisible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!currentMessage) return null;

  const isPlaying = playerState === 'playing';
  const durationSecs = duration || currentMessage.duration;
  const positionSecs = position || progress * durationSecs;

  const handlePlayPause = () => setPlayerState(isPlaying ? 'paused' : 'playing');
  const handleSkipForward = () => seekTo(positionSecs + 30);
  const handleSkipBack = () => seekTo(Math.max(0, positionSecs - 30));

  const handleDownload = () => {
    if (!currentMessage || isDownloaded || isDownloading) return;
    addDownload({
      messageId: currentMessage.id,
      title: currentMessage.title,
      coverUrl: currentMessage.coverUrl,
      speaker: currentMessage.speakerName || currentMessage.speaker?.name || 'Speaker',
      remoteUrl: currentMessage.audioUrl,
      mediaType: 'audio',
    });
    // Trigger queue processing
    setTimeout(() => downloadService.processQueue(), 100);
  };

  return (
    <Modal
      visible={isFullPlayerVisible}
      animationType="none"
      transparent
      onRequestClose={closeFullPlayer}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <Pressable style={styles.backdrop} onPress={closeFullPlayer} />
      <Animated.View style={[styles.sheet, containerStyle]}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Handle bar */}
          <View style={styles.handle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header row */}
            <View style={styles.header}>
              <TouchableOpacity onPress={closeFullPlayer} hitSlop={12}>
                <Ionicons name="chevron-down" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <Typography variant="overline" color="tertiary">
                {currentMessage.series?.name ?? 'Now Playing'}
              </Typography>
              <TouchableOpacity hitSlop={12}>
                <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Large Artwork */}
            <View style={styles.artworkContainer}>
              <Image
                source={{ uri: currentMessage.coverUrl }}
                style={styles.artwork}
                contentFit="cover"
                transition={400}
              />
            </View>

            {/* Track info + save */}
            <View style={styles.trackInfo}>
              <View style={styles.trackText}>
                <Typography variant="heading3" numberOfLines={2}>
                  {currentMessage.title}
                </Typography>
                <Typography variant="body" color="secondary" numberOfLines={1} style={{ marginTop: 4 }}>
                  {currentMessage.speakerName || currentMessage.speaker?.name || 'Unknown Speaker'}
                </Typography>
              </View>
              <TouchableOpacity style={styles.saveBtn} hitSlop={12}>
                <Ionicons
                  name={currentMessage.isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={currentMessage.isSaved ? theme.colors.accent : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Progress */}
            <View style={styles.progressSection}>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]}
                />
                <View
                  style={[
                    styles.progressThumb,
                    { left: `${Math.min(progress * 100, 100)}%` },
                  ]}
                />
              </View>
              <View style={styles.timeRow}>
                <Typography variant="caption" color="tertiary">
                  {formatDuration(positionSecs)}
                </Typography>
                <Typography variant="caption" color="tertiary">
                  -{formatDuration(Math.max(durationSecs - positionSecs, 0))}
                </Typography>
              </View>
            </View>

            {/* Main controls */}
            <View style={styles.controls}>
              <TouchableOpacity onPress={handleSkipBack} hitSlop={12}>
                <Ionicons name="play-back" size={28} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backwardSkip}
                onPress={handleSkipBack}
                hitSlop={8}
              >
                <Ionicons name="refresh" size={26} color={theme.colors.textPrimary} />
                <Typography variant="caption" style={styles.skipLabel}>
                  30
                </Typography>
              </TouchableOpacity>

              {/* Play / Pause */}
              <TouchableOpacity
                style={styles.playPauseBtn}
                onPress={handlePlayPause}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color="#FFF"
                  style={isPlaying ? {} : { marginLeft: 4 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.forwardSkip}
                onPress={handleSkipForward}
                hitSlop={8}
              >
                <View style={{ transform: [{ scaleX: -1 }] }}>
                  <Ionicons name="refresh" size={26} color={theme.colors.textPrimary} />
                </View>
                <Typography variant="caption" style={styles.skipLabel}>
                  30
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSkipForward} hitSlop={12}>
                <Ionicons name="play-forward" size={28} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Secondary actions */}
            <View style={styles.secondaryControls}>
              {/* Speed */}
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setShowSpeeds(!showSpeeds)}
              >
                <Typography variant="label" color={showSpeeds ? 'accent' : 'secondary'}>
                  {speed}x
                </Typography>
              </TouchableOpacity>

              {/* Download */}
              <TouchableOpacity 
                style={styles.secondaryBtn} 
                onPress={handleDownload}
                disabled={isDownloading}
              >
                <Ionicons
                  name={isDownloaded ? 'checkmark-circle' : isDownloading ? 'cloud-download' : 'arrow-down-circle-outline'}
                  size={24}
                  color={isDownloaded ? theme.colors.success : isDownloading ? theme.colors.accent : theme.colors.textSecondary}
                />
              </TouchableOpacity>

              {/* Queue */}
              <TouchableOpacity style={styles.secondaryBtn}>
                <Ionicons name="list" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {/* Sleep timer */}
              <TouchableOpacity style={styles.secondaryBtn}>
                <Ionicons name="moon-outline" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Speed selector */}
            {showSpeeds && (
              <View style={styles.speedRow}>
                {SPEEDS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.speedChip, speed === s && styles.speedChipActive]}
                    onPress={() => { setSpeed(s); setShowSpeeds(false); }}
                  >
                    <Typography
                      variant="label"
                      style={{ color: speed === s ? theme.colors.accent : theme.colors.textSecondary }}
                    >
                      {s}x
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: theme.radius['2xl'],
    borderTopRightRadius: theme.radius['2xl'],
    maxHeight: '95%',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surfaceBorder,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  artworkContainer: {
    paddingHorizontal: theme.spacing['2xl'],
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadow.lg,
  },
  artwork: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surfaceMid,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  trackText: {
    flex: 1,
    marginRight: theme.spacing.base,
  },
  saveBtn: {
    padding: 8,
  },
  progressSection: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  progressTrack: {
    height: 3,
    backgroundColor: theme.colors.surfaceBorder,
    borderRadius: 2,
    marginBottom: theme.spacing.sm,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.accent,
    marginLeft: -7,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  backwardSkip: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  forwardSkip: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  skipLabel: {
    position: 'absolute',
    fontSize: 9,
    color: theme.colors.textPrimary,
  },
  playPauseBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.md,
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.base,
  },
  secondaryBtn: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  speedChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  speedChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentMuted,
  },
});

export default FullPlayer;
