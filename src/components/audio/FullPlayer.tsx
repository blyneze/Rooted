import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  StatusBar,
  ScrollView,
  PanResponder,
  Dimensions,
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

// ── Scrubber ─────────────────────────────────────────────────────────────────

interface ScrubberProps {
  progress: number;
  durationSecs: number;
  positionSecs: number;
  onSeekComplete: (positionSecs: number) => void;
}

function Scrubber({ progress, durationSecs, positionSecs, onSeekComplete }: ScrubberProps) {
  const trackWidth = useRef(Dimensions.get('window').width - 48);
  // Use refs NOT state for pan values — avoids stale closure bugs
  const isScrubbing = useRef(false);
  const scrubValue = useRef(progress); // 0-1
  // Use state only to trigger re-render of display
  const [displayProgress, setDisplayProgress] = useState(progress);

  // Sync display progress from props when NOT scrubbing
  React.useEffect(() => {
    if (!isScrubbing.current) {
      scrubValue.current = progress;
      setDisplayProgress(progress);
    }
  }, [progress]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        isScrubbing.current = true;
        const x = evt.nativeEvent.locationX;
        const p = Math.max(0, Math.min(1, x / trackWidth.current));
        scrubValue.current = p;
        setDisplayProgress(p);
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const p = Math.max(0, Math.min(1, x / trackWidth.current));
        scrubValue.current = p;
        setDisplayProgress(p);
      },
      onPanResponderRelease: () => {
        // Read from ref - not stale closure
        const finalProgress = scrubValue.current;
        isScrubbing.current = false;
        onSeekComplete(finalProgress * (durationSecs || 0));
      },
      onPanResponderTerminate: () => {
        isScrubbing.current = false;
      },
    })
  ).current;

  const displayPositionSecs = isScrubbing.current
    ? displayProgress * (durationSecs || 0)
    : positionSecs;
  const remaining = Math.max((durationSecs || 0) - displayPositionSecs, 0);

  return (
    <View style={scrubberStyles.wrapper}>
      <View
        style={scrubberStyles.hitArea}
        onLayout={(e) => { trackWidth.current = e.nativeEvent.layout.width; }}
        {...panResponder.panHandlers}
      >
        {/* Track background */}
        <View style={scrubberStyles.trackBg} />
        {/* Fill */}
        <View
          style={[
            scrubberStyles.fill,
            { width: `${Math.min(displayProgress * 100, 100)}%` },
          ]}
        />
        {/* Thumb */}
        <View
          style={[
            scrubberStyles.thumb,
            { left: `${Math.min(displayProgress * 100, 100)}%` },
          ]}
        />
      </View>
      {/* Time labels */}
      <View style={scrubberStyles.timeRow}>
        <Typography variant="caption" color="tertiary">
          {formatDuration(Math.round(displayPositionSecs))}
        </Typography>
        <Typography variant="caption" color="tertiary">
          -{formatDuration(Math.round(remaining))}
        </Typography>
      </View>
    </View>
  );
}

const scrubberStyles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  hitArea: {
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.surfaceBorder,
    borderRadius: 2,
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 4,
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.accent,
    marginTop: -9,
    marginLeft: -9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
});

// ── Full Player ───────────────────────────────────────────────────────────────

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
  const translateY = useSharedValue(600);

  React.useEffect(() => {
    if (isFullPlayerVisible) {
      opacity.value = withTiming(1, { duration: 220 });
      translateY.value = withSpring(0, { damping: 24, stiffness: 220 });
    } else {
      opacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(600, { duration: 220 });
    }
  }, [isFullPlayerVisible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!currentMessage) return null;

  const download = currentMessage ? downloads.find(d => d.messageId === currentMessage.id) : null;
  const isDownloaded = download?.status === 'completed';
  const isDownloading = download?.status === 'downloading' || download?.status === 'pending';

  const isPlaying = playerState === 'playing';
  const durationSecs = Math.max(duration || currentMessage.duration || 0, 0);
  const positionSecs = Math.max(Math.min(position || 0, durationSecs), 0);
  const safeProgress = durationSecs > 0 ? Math.min(positionSecs / durationSecs, 1) : 0;

  const handlePlayPause = () => setPlayerState(isPlaying ? 'paused' : 'playing');
  const handleSkipBack = () => seekTo(Math.max(0, positionSecs - 15));
  const handleSkipForward = () => seekTo(Math.min(positionSecs + 30, durationSecs));

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
          <View style={styles.handle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ── Header ── */}
            <View style={styles.header}>
              <TouchableOpacity onPress={closeFullPlayer} hitSlop={12} style={styles.headerBtn}>
                <Ionicons name="chevron-down" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <Typography variant="overline" color="tertiary" style={{ letterSpacing: 1.5 }}>
                  NOW PLAYING
                </Typography>
                {currentMessage.series?.name ? (
                  <Typography variant="caption" color="secondary" numberOfLines={1}>
                    {currentMessage.series.name}
                  </Typography>
                ) : null}
              </View>
              <TouchableOpacity hitSlop={12} style={styles.headerBtn}>
                <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* ── Artwork ── */}
            <View style={styles.artworkContainer}>
              <Image
                source={{ uri: currentMessage.coverUrl }}
                style={styles.artwork}
                contentFit="cover"
                transition={400}
              />
            </View>

            {/* ── Track Info ── */}
            <View style={styles.trackInfo}>
              <View style={styles.trackText}>
                <Typography variant="heading3" numberOfLines={2} style={styles.trackTitle}>
                  {currentMessage.title}
                </Typography>
                <Typography variant="body" color="secondary" numberOfLines={1} style={{ marginTop: 4 }}>
                  {currentMessage.speakerName || currentMessage.speaker?.name || 'Unknown Speaker'}
                </Typography>
              </View>
              <TouchableOpacity style={styles.saveBtn} hitSlop={12}>
                <Ionicons
                  name={currentMessage.isSaved ? 'heart' : 'heart-outline'}
                  size={26}
                  color={currentMessage.isSaved ? theme.colors.accent : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* ── Scrubber ── */}
            <Scrubber
              progress={safeProgress}
              durationSecs={durationSecs}
              positionSecs={positionSecs}
              onSeekComplete={seekTo}
            />

            {/* ── Controls — Clean 3-button layout ── */}
            <View style={styles.controls}>
              {/* Skip back 15s */}
              <TouchableOpacity onPress={handleSkipBack} hitSlop={16} style={styles.skipBtn}>
                <Ionicons name="play-back" size={28} color={theme.colors.textPrimary} />
                <View style={styles.skipBadge}>
                  <Typography style={styles.skipBadgeText}>15</Typography>
                </View>
              </TouchableOpacity>

              {/* Play / Pause */}
              <TouchableOpacity
                style={styles.playPauseBtn}
                onPress={handlePlayPause}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={34}
                  color="#FFF"
                  style={isPlaying ? {} : { marginLeft: 4 }}
                />
              </TouchableOpacity>

              {/* Skip forward 30s */}
              <TouchableOpacity onPress={handleSkipForward} hitSlop={16} style={styles.skipBtn}>
                <Ionicons name="play-forward" size={28} color={theme.colors.textPrimary} />
                <View style={styles.skipBadge}>
                  <Typography style={styles.skipBadgeText}>30</Typography>
                </View>
              </TouchableOpacity>
            </View>

            {/* ── Secondary row ── */}
            <View style={styles.secondaryControls}>
              {/* Speed */}
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setShowSpeeds(!showSpeeds)}
              >
                <View style={[styles.speedPill, showSpeeds && styles.speedPillActive]}>
                  <Typography
                    variant="label"
                    style={{ color: showSpeeds ? theme.colors.accent : theme.colors.textSecondary, fontSize: 13 }}
                  >
                    {speed}x
                  </Typography>
                </View>
              </TouchableOpacity>

              {/* Download */}
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleDownload} disabled={isDownloading}>
                <Ionicons
                  name={isDownloaded ? 'checkmark-circle' : isDownloading ? 'cloud-download' : 'arrow-down-circle-outline'}
                  size={26}
                  color={isDownloaded ? theme.colors.success : isDownloading ? theme.colors.accent : theme.colors.textSecondary}
                />
              </TouchableOpacity>

              {/* Queue */}
              <TouchableOpacity style={styles.secondaryBtn}>
                <Ionicons name="list-outline" size={26} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {/* Sleep timer */}
              <TouchableOpacity style={styles.secondaryBtn}>
                <Ionicons name="moon-outline" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Speed picker */}
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
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '96%',
  },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surfaceBorder,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  artworkContainer: {
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
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
    marginBottom: theme.spacing.lg,
  },
  trackText: {
    flex: 1,
    marginRight: theme.spacing.base,
  },
  trackTitle: {
    lineHeight: 28,
  },
  saveBtn: {
    padding: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    gap: 40,
  },
  skipBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 44,
    height: 44,
  },
  skipBadge: {
    position: 'absolute',
    bottom: 2,
    right: 0,
    backgroundColor: theme.colors.surfaceMid,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  skipBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  playPauseBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.surfaceMid,
    marginBottom: theme.spacing.sm,
  },
  secondaryBtn: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  speedPillActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentMuted,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.base,
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
