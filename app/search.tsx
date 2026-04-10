import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "@/components/ui/Typography";
import { MessageListItem, MessageCard } from "@/components/content/MessageCard";
import { SeriesCard } from "@/components/content/SeriesCard";
import { BookCard } from "@/components/content/BookCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useUIStore } from "@/store/uiStore";
import { useAudioStore } from "@/store/audioStore";
import { useMessages, useSeries, useBooks } from "@/api/queries";
import theme from "@/theme";
import type { SearchFilterType, AudioMessage, Series, Book } from "@/types";
import { useLocalSearchParams } from "expo-router";

const SEARCH_FILTERS: { key: SearchFilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "audio", label: "Audio" },
  { key: "series", label: "Series" },
  { key: "books", label: "Books" },
];

export default function SearchScreen() {
  const { filter: initialFilter } = useLocalSearchParams<{
    filter?: SearchFilterType;
  }>();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useUIStore();
  const { setCurrentMessage, setPlayerState } = useAudioStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilterType>(
    initialFilter || "all",
  );

  const { data: messagesData } = useMessages();
  const { data: seriesData } = useSeries();
  const { data: booksData } = useBooks();

  const q = query.toLowerCase().trim();

  const results = useMemo(() => {
    if (!q && filter === "all") return { messages: [], series: [], books: [] };

    return {
      messages:
        filter === "all" || filter === "audio"
          ? (messagesData || []).filter(
              (m: any) =>
                !q ||
                (m.title && m.title.toLowerCase().includes(q)) ||
                (m.speaker?.name && m.speaker.name.toLowerCase().includes(q)) ||
                (m.topics &&
                  m.topics.some((t: any) =>
                    t.topic?.name.toLowerCase().includes(q),
                  )) ||
                (m.topicTags &&
                  m.topicTags.some((t: string) =>
                    t.toLowerCase().includes(q),
                  )) ||
                (m.description && m.description.toLowerCase().includes(q)),
            )
          : [],
      series:
        filter === "all" || filter === "series"
          ? (seriesData || []).filter(
              (s: any) =>
                !q ||
                (s.title && s.title.toLowerCase().includes(q)) ||
                (s.name && s.name.toLowerCase().includes(q)) ||
                (s.description && s.description.toLowerCase().includes(q)) ||
                (s.topics &&
                  s.topics.some((t: string) => t.toLowerCase().includes(q))),
            )
          : [],
      books:
        filter === "all" || filter === "books"
          ? (booksData || []).filter(
              (b: any) =>
                !q ||
                (b.title && b.title.toLowerCase().includes(q)) ||
                (b.author && b.author.toLowerCase().includes(q)) ||
                (b.description && b.description.toLowerCase().includes(q)),
            )
          : [],
    };
  }, [q, filter, messagesData, seriesData, booksData]);

  const hasResults =
    results.messages.length + results.series.length + results.books.length > 0;
  const hasQuery = q.length > 0;

  const handleSubmitSearch = () => {
    if (q) addRecentSearch(q);
  };

  const handlePlayMessage = (message: AudioMessage) => {
    setCurrentMessage(message);
    setPlayerState("playing");
    addRecentSearch(message.title);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ── Search bar ───────────────────────────────────────────────────── */}
        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={18}
              color={theme.colors.textTertiary}
            />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Messages, series, books..."
              placeholderTextColor={theme.colors.textTertiary}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={handleSubmitSearch}
              selectionColor={theme.colors.accent}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.colors.textTertiary}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.cancelBtn}
            hitSlop={8}
          >
            <Typography variant="body" color="accent">
              Cancel
            </Typography>
          </TouchableOpacity>
        </View>

        {/* ── Filters (always shown) ──────────────────────────────── */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {SEARCH_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterChip,
                  filter === f.key && styles.filterChipActive,
                ]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.7}
              >
                <Typography
                  variant="label"
                  style={{
                    color:
                      filter === f.key
                        ? theme.colors.accent
                        : theme.colors.textSecondary,
                  }}
                >
                  {f.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Empty query — show recent searches ────────────────────────── */}
          {!hasQuery && filter === "all" && (
            <>
              {recentSearches.length > 0 ? (
                <View>
                  <View style={styles.recentHeader}>
                    <Typography variant="overline" color="tertiary">
                      Recent searches
                    </Typography>
                    <TouchableOpacity onPress={clearRecentSearches} hitSlop={8}>
                      <Typography variant="label" color="accent">
                        Clear
                      </Typography>
                    </TouchableOpacity>
                  </View>
                  {recentSearches.map((rs, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.recentItem}
                      onPress={() => setQuery(rs)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color={theme.colors.textTertiary}
                      />
                      <Typography
                        variant="body"
                        style={{ flex: 1, marginLeft: 12 }}
                      >
                        {rs}
                      </Typography>
                      <Ionicons
                        name="arrow-up-outline"
                        size={16}
                        color={theme.colors.textTertiary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <EmptyState
                  icon="search-outline"
                  title="Search Rooted"
                  description="Find messages, series, books, and more"
                />
              )}
            </>
          )}

          {/* ── Has query, no results ─────────────────────────────────────── */}
          {(hasQuery || filter !== "all") && !hasResults && (
            <EmptyState
              icon="search-outline"
              title="No results"
              description={`Nothing found. Try a different search term or filter.`}
            />
          )}

          {/* ── Results ──────────────────────────────────────────────────── */}
          {(hasQuery || filter !== "all") && hasResults && (
            <View>
              {/* Messages */}
              {results.messages.length > 0 && (
                <View style={styles.resultSection}>
                  <Typography
                    variant="overline"
                    color="tertiary"
                    style={styles.resultSectionLabel}
                  >
                    Audio messages
                  </Typography>
                  {results.messages.map((msg: any, i: number) => (
                    <MessageListItem
                      key={msg.id}
                      message={msg}
                      onPress={handlePlayMessage}
                      showDivider={i < results.messages.length - 1}
                    />
                  ))}
                </View>
              )}

              {/* Series */}
              {results.series.length > 0 && (
                <View style={styles.resultSection}>
                  <Typography
                    variant="overline"
                    color="tertiary"
                    style={styles.resultSectionLabel}
                  >
                    Series
                  </Typography>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingLeft: theme.spacing.base,
                      gap: theme.spacing.md,
                    }}
                  >
                    {results.series.map((s: any) => (
                      <SeriesCard
                        key={s.id}
                        series={s}
                        onPress={(ser) => router.push(`/series/${ser.id}`)}
                        variant="featured"
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Books */}
              {results.books.length > 0 && (
                <View style={styles.resultSection}>
                  <Typography
                    variant="overline"
                    color="tertiary"
                    style={styles.resultSectionLabel}
                  >
                    Books
                  </Typography>
                  {results.books.map((book: any) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onPress={(b) => router.push(`/book/${b.id}`)}
                      variant="list"
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    gap: theme.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.colors.textPrimary,
  },
  cancelBtn: {
    paddingHorizontal: 4,
  },
  filtersScroll: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    fontSize: theme.fontSize.sm,
    backgroundColor: theme.colors.surface,
  },
  filterChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentMuted,
  },
  resultsContent: {
    paddingBottom: 80,
    flexGrow: 1,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
  resultSection: {
    marginBottom: theme.spacing.xl,
  },
  resultSectionLabel: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
});
