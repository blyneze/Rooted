import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import theme from '@/theme';
import type { Series } from '@/types';

interface SeriesCardProps {
  series: Series;
  onPress: (series: Series) => void;
  variant?: 'shelf' | 'featured';
  width?: number;
}

export function SeriesCard({ series, onPress, variant = 'shelf', width = 160 }: SeriesCardProps) {
  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => onPress(series)}
        activeOpacity={0.82}
      >
        <Image
          source={{ uri: series.artworkUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.featuredOverlay}>
          <View style={styles.featuredMeta}>
            <Typography variant="overline" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
              {series.messageCount} Messages
            </Typography>
            <Typography variant="heading3" style={{ color: '#FFF' }} numberOfLines={2}>
              {series.name}
            </Typography>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.shelfCard, { width }]}
      onPress={() => onPress(series)}
      activeOpacity={0.8}
    >
      <View style={[styles.shelfArtwork, { width, height: width * 0.75 }]}>
        <Image
          source={{ uri: series.artworkUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.messageCountBadge}>
          <Typography variant="caption" style={{ color: '#FFF', fontSize: 10 }}>
            {series.messageCount}
          </Typography>
          <Ionicons name="headset" size={10} color="rgba(255,255,255,0.8)" style={{ marginLeft: 3 }} />
        </View>
      </View>
      <Typography variant="label" numberOfLines={2} style={styles.shelfName}>
        {series.name}
      </Typography>
      <Typography variant="caption" color="tertiary">
        {series.topics?.slice(0, 2).join(' · ') || ''}
      </Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shelfCard: {
    marginRight: theme.spacing.md,
  },
  shelfArtwork: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceMid,
    marginBottom: theme.spacing.sm,
  },
  messageCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  shelfName: {
    marginBottom: 2,
  },

  featuredCard: {
    height: 200,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceMid,
    marginRight: theme.spacing.md,
    width: 280,
    flex: 0,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.base,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
  },
  featuredMeta: {},
});

export default SeriesCard;
