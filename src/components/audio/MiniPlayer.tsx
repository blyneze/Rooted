import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { useAudioStore } from '@/store/audioStore';
import theme from '@/theme';

export function MiniPlayer() {
  const { currentMessage, playerState, openFullPlayer, setPlayerState, isMiniPlayerVisible, progress } =
    useAudioStore();

  const translateY = useSharedValue(isMiniPlayerVisible ? 0 : 80);

  React.useEffect(() => {
    translateY.value = withSpring(isMiniPlayerVisible ? 0 : 80, {
      damping: 20,
      stiffness: 200,
    });
  }, [isMiniPlayerVisible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(translateY.value, [0, 80], [1, 0]),
  }));

  if (!currentMessage) return null;

  const isPlaying = playerState === 'playing';

  const handlePlayPause = () => {
    setPlayerState(isPlaying ? 'paused' : 'playing');
  };

  const handleSkipNext = () => {
    // Controller will handle queue logic eventually
  };

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <Pressable style={styles.inner} onPress={openFullPlayer}>
        {/* Artwork */}
        <Image
          source={{ uri: currentMessage.coverUrl }}
          style={styles.artwork}
          contentFit="cover"
          transition={200}
        />

        {/* Info */}
        <View style={styles.info}>
          <Typography variant="label" numberOfLines={1} style={styles.title}>
            {currentMessage.title}
          </Typography>
          <Typography variant="caption" color="tertiary" numberOfLines={1}>
            {currentMessage.speakerName || currentMessage.speaker?.name || 'Unknown Speaker'}
          </Typography>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.controlBtn}
            hitSlop={12}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={22}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} hitSlop={12} onPress={handleSkipNext}>
            <Ionicons name="play-skip-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Pressable>

      {/* Progress bar at bottom */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressFill, { width: `${(progress ?? 0) * 100}%` }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surfaceElevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.surfaceMid,
    zIndex: theme.zIndex.player,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMid,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    lineHeight: 18,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  controlBtn: {
    padding: 4,
  },
  progressContainer: {
    height: 2,
    backgroundColor: theme.colors.surfaceMid,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
  },
});

export default MiniPlayer;
