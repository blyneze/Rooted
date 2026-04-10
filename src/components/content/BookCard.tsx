import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import theme from '@/theme';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
  onPress: (book: Book) => void;
  variant?: 'shelf' | 'list';
  width?: number;
}

export function BookCard({ book, onPress, variant = 'shelf', width = 120 }: BookCardProps) {
  if (variant === 'list') {
    return (
      <TouchableOpacity style={styles.listItem} onPress={() => onPress(book)} activeOpacity={0.75}>
        <Image
          source={{ uri: book.coverUrl }}
          style={styles.listCover}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.listInfo}>
          <Typography variant="label" numberOfLines={2}>{book.title}</Typography>
          <Typography variant="caption" color="tertiary">{book.author}</Typography>
          {book.readingProgress && book.readingProgress > 0 && (
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${book.readingProgress * 100}%` }]} />
              </View>
              <Typography variant="caption" color="accent" style={{ marginLeft: 8 }}>
                {Math.round(book.readingProgress * 100)}%
              </Typography>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.shelfCard, { width }]}
      onPress={() => onPress(book)}
      activeOpacity={0.8}
    >
      <View style={[styles.cover, { width, height: width * 1.4 }]}>
        <Image
          source={{ uri: book.coverUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={300}
        />
        {book.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={10} color={theme.colors.accent} />
          </View>
        )}
        {/* Reading progress */}
        {book.readingProgress && book.readingProgress > 0 && (
          <View style={styles.bookProgress}>
            <View style={[styles.bookProgressFill, { height: `${book.readingProgress * 100}%` }]} />
          </View>
        )}
      </View>
      <Typography variant="label" numberOfLines={2} style={styles.title}>
        {book.title}
      </Typography>
      <Typography variant="caption" color="tertiary" numberOfLines={1}>
        {book.author}
      </Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shelfCard: {
    marginRight: theme.spacing.md,
  },
  cover: {
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceMid,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  premiumBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookProgress: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 4,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bookProgressFill: {
    width: '100%',
    backgroundColor: theme.colors.accent,
  },
  title: {
    marginBottom: 2,
  },

  // List variant
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.md,
  },
  listCover: {
    width: 52,
    height: 72,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.surfaceMid,
  },
  listInfo: {
    flex: 1,
    gap: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.surfaceBorder,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
  },
});

export default BookCard;
