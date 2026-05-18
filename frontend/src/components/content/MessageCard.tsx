import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { formatDurationLabel } from '@/constants/mockData';
import theme from '@/theme';
import type { AudioMessage } from '@/types';

// ── Vertical Card (shelf use) ─────────────────────────────────────────────────

interface MessageCardProps {
  message: AudioMessage;
  onPress: (message: AudioMessage) => void;
  width?: number;
}

export function MessageCard({ message, onPress, width = 140 }: MessageCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      onPress={() => onPress(message)}
      activeOpacity={0.8}
    >
      <View style={[styles.artwork, { width, height: width }]}>
        <Image
          source={{ uri: message.coverUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={300}
        />
        {/* Play overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={14} color="#FFF" />
          </View>
        </View>
        {/* Progress bar */}
        {message.playbackProgress && message.playbackProgress > 0 && (
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBarFill, { width: `${message.playbackProgress * 100}%` }]}
            />
          </View>
        )}
        {/* Premium badge */}
        {message.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={10} color={theme.colors.accent} />
          </View>
        )}
      </View>
      <Typography variant="label" numberOfLines={2} style={styles.title}>
        {message.title}
      </Typography>
      <Typography variant="caption" color="tertiary" numberOfLines={1}>
        {formatDurationLabel(message.duration)}
      </Typography>
    </TouchableOpacity>
  );
}

// ── Horizontal List Item ───────────────────────────────────────────────────────

interface MessageListItemProps {
  message: AudioMessage;
  onPress: (message: AudioMessage) => void;
  onMore?: (message: AudioMessage) => void;
  showDivider?: boolean;
  index?: number;
}

export function MessageListItem({ message, onPress, onMore, showDivider = true, index }: MessageListItemProps) {
  return (
    <>
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => onPress(message)}
        activeOpacity={0.75}
      >
        {index !== undefined && (
          <Typography variant="caption" color="tertiary" style={styles.listIndex}>
            {String(index + 1).padStart(2, '0')}
          </Typography>
        )}
        <Image
          source={{ uri: message.coverUrl }}
          style={styles.listArtwork}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.listInfo}>
          <Typography variant="label" numberOfLines={2} style={styles.listTitle}>
            {message.title}
          </Typography>
          <Typography variant="body" color="secondary" numberOfLines={1}>
            {message.speakerName || message.speaker?.name || 'Unknown Speaker'} · {formatDurationLabel(message.duration)}
          </Typography>
          {message.playbackProgress && message.playbackProgress > 0 && (
            <View style={styles.listProgressRow}>
              <View style={styles.listProgressBar}>
                <View
                  style={[
                    styles.listProgressFill,
                    { width: `${message.playbackProgress * 100}%` },
                  ]}
                />
              </View>
              <Typography variant="caption" color="accent" style={{ marginLeft: 8 }}>
                {Math.round(message.playbackProgress * 100)}%
              </Typography>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={styles.listMore} 
          hitSlop={12}
          onPress={() => onMore?.(message)}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </TouchableOpacity>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

// ── Featured Hero Card ─────────────────────────────────────────────────────────

interface FeaturedCardProps {
  message: AudioMessage;
  onPress: (message: AudioMessage) => void;
  onMore?: (message: AudioMessage) => void;
}

export function FeaturedCard({ message, onPress, onMore }: FeaturedCardProps) {
  return (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => onPress(message)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: message.coverUrl }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={400}
      />
      {/* Bottom-to-transparent gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.82)']}
        style={styles.featuredGradient}
      />
      {/* Content */}
      <View style={styles.featuredContent}>
        <View style={styles.featuredBadge}>
          <Typography variant="overline" style={{ color: theme.colors.accent, fontSize: 9 }}>
            Featured
          </Typography>
        </View>
        {message.series && (
          <Typography variant="overline" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 2, fontSize: 10 }}>
            {message.series.name}
          </Typography>
        )}
        <Typography variant="title" style={{ color: '#FFF', marginBottom: 3, fontSize: 15 }} numberOfLines={1}>
          {message.title}
        </Typography>
        <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 12, fontSize: 11 }}>
          {message.speakerName || message.speaker?.name || 'Unknown Speaker'} · {formatDurationLabel(message.duration)}
        </Typography>
        <View style={styles.featuredActions}>
          <View style={styles.featuredPlayBtn}>
            <Ionicons name="play" size={14} color="#FFF" />
            <Typography variant="label" style={{ color: '#FFF', marginLeft: 6, fontSize: 12 }}>
              Play
            </Typography>
          </View>
          <TouchableOpacity 
            style={styles.featuredSaveBtn} 
            activeOpacity={0.7}
            onPress={() => onMore?.(message)}
          >
            <Ionicons
              name={message.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={message.isSaved ? theme.colors.accent : 'rgba(255,255,255,0.7)'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Vertical card
  card: {
    marginRight: theme.spacing.md,
  },
  artwork: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceMid,
    marginBottom: theme.spacing.sm,
  },
  playOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
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
  title: {
    marginBottom: 2,
  },

  // List item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.md,
  },
  listIndex: {
    width: 20,
    textAlign: 'right',
  },
  listArtwork: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMid,
  },
  listInfo: {
    flex: 1,
    gap: 2,
  },
  listTitle: {
    lineHeight: 19,
  },
  listProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  listProgressBar: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.surfaceBorder,
    borderRadius: 1,
    overflow: 'hidden',
  },
  listProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
  },
  listMore: {
    padding: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.surfaceMid,
    marginLeft: theme.spacing.base + 52 + theme.spacing.md,
  },

  // Featured
  featuredCard: {
    height: 380,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.base,
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.base,
    paddingBottom: theme.spacing.base,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    marginBottom: 8,
  },
  featuredActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  featuredPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.radius.full,
  },
  featuredSaveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
