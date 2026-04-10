import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import theme from '@/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = theme.radius.sm, style }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        animStyle,
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  style?: ViewStyle;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width={140} height={140} borderRadius={theme.radius.md} />
      <Skeleton width={100} height={12} style={{ marginTop: 10 }} />
      <Skeleton width={70} height={10} style={{ marginTop: 6 }} />
    </View>
  );
}

export function SkeletonListItem({ style }: SkeletonCardProps) {
  return (
    <View style={[styles.listItem, style]}>
      <Skeleton width={56} height={56} borderRadius={theme.radius.sm} />
      <View style={styles.listItemText}>
        <Skeleton width="70%" height={13} />
        <Skeleton width="45%" height={11} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function SkeletonHero({ style }: SkeletonCardProps) {
  return (
    <View style={[styles.hero, style]}>
      <Skeleton width="100%" height={220} borderRadius={theme.radius.xl} />
      <Skeleton width="60%" height={16} style={{ marginTop: 12 }} />
      <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.surfaceMid,
  },
  card: {
    marginRight: theme.spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  listItemText: {
    flex: 1,
    gap: 4,
  },
  hero: {
    paddingHorizontal: theme.spacing.base,
  },
});

export default Skeleton;
