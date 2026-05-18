import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { formatDurationLabel } from '@/constants/mockData';
import theme from '@/theme';
import type { VideoMessage } from '@/types';

interface VideoCardProps {
  video: VideoMessage;
  onPress: (video: VideoMessage) => void;
  width?: number;
}

export function VideoCard({ video, onPress, width = 220 }: VideoCardProps) {
  // Derive YouTube thumbnail URL, but prefer explicitly provided custom coverUrl
  const thumbnailUrl = video.coverUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      onPress={() => onPress(video)}
      activeOpacity={0.8}
    >
      <View style={[styles.artwork, { width, height: width * 0.5625 }]}>
        <Image
          source={{ uri: thumbnailUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={300}
        />
        
        {/* Play Icon Overlay (Requested: Subtle play icon overlay) */}
        <View style={styles.playOverlay}>
          <View style={styles.playButtonCircle}>
            <Ionicons name="play" size={20} color="#FFF" style={{ marginLeft: 3 }} />
          </View>
        </View>

        {/* Duration badge overlay */}
        <View style={styles.durationBadge}>
          <Typography variant="overline" style={{ color: '#FFF', fontSize: 10 }}>
            {formatDurationLabel(video.duration)}
          </Typography>
        </View>

        {/* Premium badge */}
        {video.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={10} color={theme.colors.accent} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Typography variant="label" numberOfLines={2} style={styles.title}>
          {video.title}
        </Typography>
        <Typography variant="caption" color="tertiary" numberOfLines={1}>
          {video.speakerName || 'Speaker'}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginRight: theme.spacing.md,
  },
  artwork: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceMid,
    marginBottom: theme.spacing.sm,
    position: 'relative',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,59,48,0.9)', // Red accent consistent with Rooted
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.sm,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    marginTop: 2,
  },
  title: {
    marginBottom: 2,
    lineHeight: 18,
  },
});
