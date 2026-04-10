import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import theme from '@/theme';
import { useBook } from '@/api/queries';
import { SkeletonHero } from '@/components/ui/Skeleton';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isSaved, setIsSaved] = useState(false);

  const { data: book, isLoading, error } = useBook(id!);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.backBtn}>
          <SkeletonHero />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TouchableOpacity onPress={router.back} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Typography variant="body" color="tertiary" align="center">
          {error ? 'Failed to load book' : 'Book not found'}
        </Typography>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Back */}
        <TouchableOpacity onPress={router.back} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        {/* ── Book Cover ──────────────────────────────────────────────────── */}
        <View style={styles.coverSection}>
          <View style={styles.coverShadow}>
            <Image
              source={{ uri: book.coverUrl }}
              style={styles.cover}
              contentFit="cover"
              transition={400}
            />
          </View>
        </View>

        {/* ── Book Meta ───────────────────────────────────────────────────── */}
        <View style={styles.meta}>
          <Typography variant="heading2" align="center" style={styles.title}>
            {book.title}
          </Typography>
          <Typography variant="body" color="secondary" align="center">
            {book.author}
          </Typography>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Typography variant="caption" color="tertiary">{book.category}</Typography>
            </View>
            {book.isPremium && (
              <View style={[styles.badge, styles.premiumBadge]}>
                <Ionicons name="star" size={11} color={theme.colors.accent} />
                <Typography variant="caption" color="accent" style={{ marginLeft: 3 }}>Premium</Typography>
              </View>
            )}
            {book.pageCount && (
              <View style={styles.badge}>
                <Typography variant="caption" color="tertiary">{book.pageCount} pages</Typography>
              </View>
            )}
          </View>

          {/* Reading progress */}
          {book.readingProgress && book.readingProgress > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${book.readingProgress * 100}%` }]} />
              </View>
              <Typography variant="caption" color="accent" style={{ marginTop: 6 }}>
                {Math.round(book.readingProgress * 100)}% read
              </Typography>
            </View>
          )}
        </View>

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <View style={styles.actions}>
          <Button
            label={book.readingProgress ? 'Continue Reading' : 'Read Now'}
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => {}}
            style={styles.readBtn}
          />
          <View style={styles.iconActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setIsSaved(!isSaved)}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={isSaved ? theme.colors.accent : theme.colors.textSecondary}
              />
              <Typography variant="caption" color={isSaved ? 'accent' : 'secondary'}>Save</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="arrow-down-circle-outline" size={24} color={theme.colors.textSecondary} />
              <Typography variant="caption" color="secondary">Download</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="share-outline" size={24} color={theme.colors.textSecondary} />
              <Typography variant="caption" color="secondary">Share</Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── About ───────────────────────────────────────────────────────── */}
        <View style={styles.aboutSection}>
          <Typography variant="heading3" style={styles.sectionTitle}>About this book</Typography>
          <Typography variant="body" color="secondary" style={styles.description}>
            {book.description}
          </Typography>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backBtn: {
    margin: theme.spacing.base,
    padding: 4,
    alignSelf: 'flex-start',
  },
  scroll: {},
  coverSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  coverShadow: {
    ...theme.shadow.lg,
    borderRadius: theme.radius.sm,
  },
  cover: {
    width: 160,
    height: 224,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMid,
  },
  meta: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceBorder,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentMuted,
  },
  progressSection: {
    width: '100%',
    marginTop: theme.spacing.base,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.surfaceBorder,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
  },
  actions: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.base,
  },
  readBtn: {},
  iconActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing['3xl'],
  },
  iconBtn: {
    alignItems: 'center',
    gap: 6,
  },
  aboutSection: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.surfaceMid,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  description: {
    lineHeight: 26,
  },
});
