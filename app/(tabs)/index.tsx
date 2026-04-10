import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/expo';
import { Typography } from '@/components/ui/Typography';
import { ShelfRow } from '@/components/content/ShelfRow';
import { MessageCard, MessageListItem, FeaturedCard } from '@/components/content/MessageCard';
import { SeriesCard } from '@/components/content/SeriesCard';
import { BookCard } from '@/components/content/BookCard';
import { SkeletonCard, SkeletonHero } from '@/components/ui/Skeleton';
import { useAudioStore } from '@/store/audioStore';
import { getTimeGreeting } from '@/constants/mockData';
import { useHomeFeed, usePlaybackProgress } from '@/api/queries';
import theme from '@/theme';
import type { AudioMessage, Series, Book } from '@/types';

export default function HomeScreen() {
  const { user } = useUser();
  const { setCurrentMessage, setPlayerState } = useAudioStore();

  const { data: homeFeed, isLoading, isFetching, refetch } = useHomeFeed();
  const { data: progressData } = usePlaybackProgress();

  const greeting = getTimeGreeting();
  const firstName = user?.firstName ?? 'Friend';

  const handlePlayMessage = useCallback((message: AudioMessage) => {
    setCurrentMessage(message);
    setPlayerState('playing');
  }, [setCurrentMessage, setPlayerState]);

  const handleOpenSeries = useCallback((series: Series) => {
    router.push(`/series/${series.id}`);
  }, []);

  const handleOpenBook = useCallback((book: Book) => {
    router.push(`/book/${book.id}`);
  }, []);

  const handleOpenMessage = useCallback((message: AudioMessage) => {
    router.push(`/message/${message.id}`);
  }, []);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const CONTINUE_LISTENING = progressData 
    ? progressData.map((p: any) => p.message) 
    : [];

  const FEATURED_MESSAGE = homeFeed?.featured?.[0]?.items?.[0]?.message;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent}
          />
        }
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.greetingBlock}>
            <Typography variant="overline" color="tertiary">
              {greeting}
            </Typography>
            <Typography variant="heading2" style={{ marginTop: 2 }}>
              {firstName}
            </Typography>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push('/notifications')}
              hitSlop={8}
            >
              <Ionicons name="notifications-outline" size={22} color={theme.colors.textPrimary} />
              <View style={styles.notifBadge} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push('/search')}
              hitSlop={8}
            >
              <Ionicons name="search-outline" size={22} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Featured Message ─────────────────────────────────────────────── */}
        {isLoading ? (
          <SkeletonHero style={{ marginBottom: theme.spacing['2xl'] }} />
        ) : FEATURED_MESSAGE ? (
          <View style={{ marginBottom: theme.spacing['2xl'] }}>
            <FeaturedCard message={FEATURED_MESSAGE} onPress={handlePlayMessage} />
          </View>
        ) : null}

        {/* ── Continue Listening ───────────────────────────────────────────── */}
        {CONTINUE_LISTENING.length > 0 && (
          <ShelfRow
            title="Continue Listening"
            subtitle="Pick up where you left off"
          >
            {CONTINUE_LISTENING.map((msg: AudioMessage) => (
              <MessageCard key={msg.id} message={msg} onPress={handlePlayMessage} width={150} />
            ))}
          </ShelfRow>
        )}

        {/* ── New Series ───────────────────────────────────────────────────── */}
        <ShelfRow
          title="Series"
          onSeeAll={() => router.push({ pathname: '/search', params: { filter: 'series' } })}
        >
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : homeFeed?.series?.map((series: Series) => (
                <SeriesCard
                  key={series.id}
                  series={series}
                  onPress={handleOpenSeries}
                  variant="featured"
                />
              ))}
        </ShelfRow>

        {/* ── Trending Messages ────────────────────────────────────────────── */}
        {homeFeed?.trending?.length > 0 && (
          <ShelfRow
            title="Trending"
            onSeeAll={() => router.push({ pathname: '/search', params: { filter: 'audio' } })}
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : homeFeed.trending.map((msg: AudioMessage) => (
                  <MessageCard key={msg.id} message={msg} onPress={handlePlayMessage} />
                ))}
          </ShelfRow>
        )}

        {/* ── Recently Added ───────────────────────────────────────────────── */}
        {homeFeed?.recent?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography variant="heading3">Recently Added</Typography>
            </View>
            {homeFeed.recent.slice(0, 4).map((msg: AudioMessage, i: number) => (
              <MessageListItem
                key={msg.id}
                message={msg}
                onPress={handleOpenMessage}
                showDivider={i < Math.min(3, homeFeed.recent.length - 1)}
              />
            ))}
          </View>
        )}

        {/* ── Books ────────────────────────────────────────────────────────── */}
        {homeFeed?.books?.length > 0 && (
          <ShelfRow
            title="Books & Resources"
            onSeeAll={() => router.push({ pathname: '/search', params: { filter: 'books' } })}
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : homeFeed.books.map((book: Book) => (
                  <BookCard key={book.id} book={book} onPress={handleOpenBook} />
                ))}
          </ShelfRow>
        )}

        {/* ── Bible Study Card ─────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.bibleCard}
          onPress={() => router.push('/(tabs)/bible')}
          activeOpacity={0.82}
        >
          <View style={styles.bibleCardContent}>
            <View style={styles.bibleIconWrap}>
              <Ionicons name="book" size={28} color={theme.colors.accent} />
            </View>
            <View style={styles.bibleCardText}>
              <Typography variant="title">Bible Study</Typography>
              <Typography variant="bodySmall" color="secondary" style={{ marginTop: 2 }}>
                Read, highlight, and take notes
              </Typography>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </View>
          <View style={styles.bibleCardStats}>
            <View style={styles.bibleStatItem}>
              <Typography variant="heading3" color="accent">3</Typography>
              <Typography variant="caption" color="tertiary">Highlights</Typography>
            </View>
            <View style={styles.bibleStatDivider} />
            <View style={styles.bibleStatItem}>
              <Typography variant="heading3" color="accent">2</Typography>
              <Typography variant="caption" color="tertiary">Notes</Typography>
            </View>
            <View style={styles.bibleStatDivider} />
            <View style={styles.bibleStatItem}>
              <Typography variant="heading3" color="accent">John 3</Typography>
              <Typography variant="caption" color="tertiary">Last read</Typography>
            </View>
          </View>
        </TouchableOpacity>

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: theme.spacing.base,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.xl,
  },
  greetingBlock: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginLeft: theme.spacing.base,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.accent,
    borderWidth: 1.5,
    borderColor: theme.colors.surface,
  },
  // Recently added section
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.md,
  },
  // Bible card
  bibleCard: {
    marginHorizontal: theme.spacing.base,
    marginBottom: theme.spacing['2xl'],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceBorder,
    overflow: 'hidden',
  },
  bibleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.base,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  bibleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bibleCardText: {
    flex: 1,
  },
  bibleCardStats: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.surfaceMid,
    paddingVertical: theme.spacing.md,
  },
  bibleStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  bibleStatDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.surfaceMid,
  },
});
