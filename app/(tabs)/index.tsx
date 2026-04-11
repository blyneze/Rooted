import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "@clerk/expo";
import { Typography } from "@/components/ui/Typography";
import { ShelfRow } from "@/components/content/ShelfRow";
import {
  MessageCard,
  MessageListItem,
  FeaturedCard,
} from "@/components/content/MessageCard";
import { SeriesCard } from "@/components/content/SeriesCard";
import { BookCard } from "@/components/content/BookCard";
import { VideoCard } from "@/components/content/VideoCard";
import { SkeletonCard, SkeletonHero } from "@/components/ui/Skeleton";
import { useAudioStore } from "@/store/audioStore";
import { useUIStore } from "@/store/uiStore";
import { useBibleStore } from "@/store/bibleStore";
import { getTimeGreeting } from "@/constants/mockData";
import { useHomeFeed, usePlaybackProgress } from "@/api/queries";
import theme from "@/theme";
import type { AudioMessage, Series, Book, VideoMessage } from "@/types";

export default function HomeScreen() {
  const { user } = useUser();
  const { setCurrentMessage, setPlayerState } = useAudioStore();
  const { setSelectedMediaForOptions } = useUIStore();
  const { highlights, notes, readingPosition } = useBibleStore();

  const { data: homeFeed, isLoading, isFetching, refetch } = useHomeFeed();
  const { data: progressData } = usePlaybackProgress();

  const greeting = getTimeGreeting();
  const firstName = user?.firstName ?? "Friend";

  const handlePlayMessage = useCallback(
    (message: AudioMessage) => {
      setCurrentMessage(message);
      setPlayerState("playing");
    },
    [setCurrentMessage, setPlayerState],
  );

  const handleOpenSeries = useCallback((series: Series) => {
    router.push(`/series/${series.id}`);
  }, []);

  const handleOpenVideo = useCallback((video: VideoMessage) => {
    router.push(`/video/${video.id}`);
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
    <SafeAreaView style={styles.container} edges={["top"]}>
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
              onPress={() => router.push("/notifications")}
              hitSlop={8}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={theme.colors.textPrimary}
              />
              <View style={styles.notifBadge} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push("/search")}
              hitSlop={8}
            >
              <Ionicons
                name="search-outline"
                size={22}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Featured Message ─────────────────────────────────────────────── */}
        {isLoading ? (
          <SkeletonHero style={{ marginBottom: theme.spacing["2xl"] }} />
        ) : FEATURED_MESSAGE ? (
          <View style={{ marginBottom: theme.spacing["2xl"] }}>
            <FeaturedCard
              message={FEATURED_MESSAGE}
              onPress={handlePlayMessage}
              onMore={(msg) => setSelectedMediaForOptions(msg)}
            />
          </View>
        ) : null}

        {/* ── Continue Listening ───────────────────────────────────────────── */}
        {CONTINUE_LISTENING.length > 0 && (
          <ShelfRow
            title="Continue Listening"
            subtitle="Pick up where you left off"
          >
            {CONTINUE_LISTENING.map((msg: AudioMessage) => (
              <MessageCard
                key={msg.id}
                message={msg}
                onPress={handlePlayMessage}
                width={150}
              />
            ))}
          </ShelfRow>
        )}

        {/* ── Video Teachings ──────────────────────────────────────────────── */}
        {homeFeed?.videos?.length > 0 && (
          <ShelfRow
            title="Video Teachings"
            onSeeAll={() =>
              router.push({ pathname: "/search", params: { filter: "video" } })
            }
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : homeFeed.videos.map((video: VideoMessage) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPress={handleOpenVideo}
                  />
                ))}
          </ShelfRow>
        )}

        {/* ── New Series ───────────────────────────────────────────────────── */}
        <ShelfRow
          title="Series"
          onSeeAll={() =>
            router.push({ pathname: "/search", params: { filter: "series" } })
          }
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
            onSeeAll={() =>
              router.push({ pathname: "/search", params: { filter: "audio" } })
            }
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : homeFeed.trending.map((msg: AudioMessage) => (
                  <MessageCard
                    key={msg.id}
                    message={msg}
                    onPress={handlePlayMessage}
                  />
                ))}
          </ShelfRow>
        )}

        {/* ── Recently Added ───────────────────────────────────────────────── */}
        {homeFeed?.recent?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography variant="heading3">Recently Added</Typography>
            </View>
            {homeFeed?.recent
              ?.slice(0, 4)
              .map((msg: AudioMessage, i: number) => (
                <MessageListItem
                  key={msg.id}
                  message={msg}
                  onPress={() => handleOpenMessage(msg)}
                  onMore={(m) => setSelectedMediaForOptions(m)}
                  showDivider={
                    i < Math.min(3, (homeFeed?.recent?.length ?? 0) - 1)
                  }
                />
              ))}
          </View>
        )}

        {/* ── Books ────────────────────────────────────────────────────────── */}
        {homeFeed?.books?.length > 0 && (
          <ShelfRow
            title="Books & Resources"
            onSeeAll={() =>
              router.push({ pathname: "/search", params: { filter: "books" } })
            }
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : homeFeed.books.map((book: Book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onPress={handleOpenBook}
                  />
                ))}
          </ShelfRow>
        )}

        {/* ── Bible Study Card ─────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.bibleCard}
          onPress={() => router.push("/(tabs)/bible")}
          activeOpacity={0.88}
        >
          <View style={styles.bibleCardContent}>
            <View style={styles.bibleIconWrap}>
              <Ionicons
                name="book"
                size={24}
                color={theme.colors.textPrimary}
              />
            </View>
            <View style={styles.bibleCardText}>
              <Typography variant="title">Bible Study</Typography>
              <Typography
                variant="bodySmall"
                color="secondary"
                style={{ marginTop: 2 }}
              >
                Read, highlight, and take notes
              </Typography>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.bibleCardStats}>
            <View style={styles.bibleStatItem}>
              <Typography variant="title" weight="bold">
                {highlights.length}
              </Typography>
              <Typography
                variant="caption"
                color="tertiary"
                style={{ marginTop: 1 }}
              >
                Highlights
              </Typography>
            </View>
            <View style={styles.bibleStatDivider} />
            <View style={styles.bibleStatItem}>
              <Typography variant="title" weight="bold">
                {notes.length}
              </Typography>
              <Typography
                variant="caption"
                color="tertiary"
                style={{ marginTop: 1 }}
              >
                Notes
              </Typography>
            </View>
            <View style={styles.bibleStatDivider} />
            <View style={styles.bibleStatItem}>
              <Typography
                variant="title"
                color="primary"
                weight="bold"
                numberOfLines={1}
              >
                {readingPosition?.bookName} {readingPosition?.chapter}
              </Typography>
              <Typography
                variant="caption"
                color="tertiary"
                style={{ marginTop: 1 }}
              >
                Last read
              </Typography>
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
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.xl,
  },
  greetingBlock: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginLeft: theme.spacing.base,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
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
    marginBottom: theme.spacing["2xl"],
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.md,
  },
  // Bible card
  bibleCard: {
    marginHorizontal: theme.spacing.base,
    marginBottom: theme.spacing["4xl"],
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.surfaceMid,
    overflow: "hidden",
    ...theme.shadow.md,
  },
  bibleCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.base,
  },
  bibleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMid,
    alignItems: "center",
    justifyContent: "center",
  },
  bibleCardText: {
    flex: 1,
  },
  bibleCardStats: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceMid,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  bibleStatItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
    color: theme.colors.textPrimary,
  },
  bibleStatDivider: {
    width: 1,
    height: "60%",
    alignSelf: "center",
    backgroundColor: theme.colors.surfaceBorder,
    opacity: 0.5,
  },
});
