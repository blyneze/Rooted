import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "@/components/ui/Typography";
import { MessageListItem } from "@/components/content/MessageCard";
import { SeriesCard } from "@/components/content/SeriesCard";
import { BookCard } from "@/components/content/BookCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useUIStore } from "@/store/uiStore";
import { useAudioStore } from "@/store/audioStore";
import { useMessages, useSeries, useBooks, usePlaylists, useCreatePlaylist } from "@/api/queries";
import { CreatePlaylistModal } from "@/components/modals/CreatePlaylistModal";
import { AddToPlaylistModal } from "@/components/modals/AddToPlaylistModal";
import theme from "@/theme";
import type { LibraryFilter, AudioMessage, Series, Book, Playlist } from "@/types";

const FILTERS: { key: LibraryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "audio", label: "Audio" },
  { key: "books", label: "Books" },
  { key: "series", label: "Series" },
  { key: "playlists", label: "Playlists" },
];

export default function LibraryScreen() {
  const { libraryFilter, setLibraryFilter } = useUIStore();
  const { setCurrentMessage, setPlayerState } = useAudioStore();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: messagesData } = useMessages();
  const { data: seriesData } = useSeries();
  const { data: booksData } = useBooks();
  const { data: playlistsData } = usePlaylists();
  const createPlaylist = useCreatePlaylist();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<AudioMessage | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handlePlayMessage = (message: AudioMessage) => {
    setCurrentMessage(message);
    setPlayerState("playing");
  };

  const handleMorePress = (message: AudioMessage) => {
    setSelectedMessage(message);
    setShowAddModal(true);
  };

  // Filter content
  const filteredMessages = useMemo(() => {
    if (libraryFilter !== "all" && libraryFilter !== "audio") return [];
    const sourceData = messagesData || [];
    const q = searchQuery.toLowerCase();
    return sourceData.filter(
      (m: any) =>
        !q ||
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.speakerName && m.speakerName.toLowerCase().includes(q)) ||
        (m.speaker?.name && m.speaker.name.toLowerCase().includes(q)) ||
        (m.topics && m.topics.some((t: any) => t.topic?.name.toLowerCase().includes(q))) ||
        (m.topicTags && m.topicTags.some((t: string) => t.toLowerCase().includes(q))),
    );
  }, [libraryFilter, searchQuery, messagesData]);

  const filteredSeries = useMemo(() => {
    if (libraryFilter !== "all" && libraryFilter !== "series") return [];
    const sourceData = seriesData || [];
    const q = searchQuery.toLowerCase();
    return sourceData.filter(
      (s: any) =>
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.topics && s.topics.some((t: string) => t.toLowerCase().includes(q))),
    );
  }, [libraryFilter, searchQuery, seriesData]);

  const filteredBooks = useMemo(() => {
    if (libraryFilter !== "all" && libraryFilter !== "books") return [];
    const sourceData = booksData || [];
    const q = searchQuery.toLowerCase();
    return sourceData.filter(
      (b: any) =>
        !q ||
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)),
    );
  }, [libraryFilter, searchQuery, booksData]);

  const filteredPlaylists = useMemo(() => {
    if (libraryFilter !== "all" && libraryFilter !== "playlists") return [];
    const sourceData = playlistsData || [];
    const q = searchQuery.toLowerCase();
    return sourceData.filter((p: any) => !q || ((p.name) && (p.name).toLowerCase().includes(q)));
  }, [libraryFilter, searchQuery, playlistsData]);

  const isEmpty =
    filteredMessages.length === 0 &&
    filteredSeries.length === 0 &&
    filteredBooks.length === 0 &&
    filteredPlaylists.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Typography variant="heading2">Library</Typography>
        <TouchableOpacity style={styles.addBtn} hitSlop={8} onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.colors.textTertiary}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search library..."
            placeholderTextColor={theme.colors.textTertiary}
            selectionColor={theme.colors.accent}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={18}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              libraryFilter === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setLibraryFilter(filter.key)}
            activeOpacity={0.7}
          >
            <Typography
              variant="label"
              style={{
                color:
                  libraryFilter === filter.key
                    ? theme.colors.accent
                    : theme.colors.textSecondary,
              }}
            >
              {filter.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <FlatList
        data={[1]} // single item renders everything in ListHeaderComponent
        keyExtractor={() => "library"}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={() => null}
        ListHeaderComponent={
          isEmpty ? (
            <EmptyState
              icon="albums-outline"
              title="Nothing found"
              description={
                searchQuery
                  ? `No results for "${searchQuery}"`
                  : "Your library will appear here as you save and download content."
              }
            />
          ) : (
            <View>
              {/* Audio Messages */}
              {filteredMessages.length > 0 && (
                <View style={styles.section}>
                  {(libraryFilter === "all" || libraryFilter === "audio") && (
                    <Typography
                      variant="overline"
                      color="tertiary"
                      style={styles.sectionLabel}
                    >
                      Audio Messages
                    </Typography>
                  )}
                  {filteredMessages.map((msg: AudioMessage, i: number) => (
                    <MessageListItem
                      key={msg.id}
                      message={msg}
                      onPress={handlePlayMessage}
                      onMore={handleMorePress}
                      showDivider={i < filteredMessages.length - 1}
                    />
                  ))}
                </View>
              )}

              {/* Series */}
              {filteredSeries.length > 0 && (
                <View style={styles.section}>
                  {(libraryFilter === "all" || libraryFilter === "series") && (
                    <Typography
                      variant="overline"
                      color="tertiary"
                      style={styles.sectionLabel}
                    >
                      Series
                    </Typography>
                  )}
                  <View style={styles.seriesGrid}>
                    {filteredSeries.map((series: Series) => (
                      <TouchableOpacity
                        key={series.id}
                        style={styles.seriesGridItem}
                        onPress={() => router.push(`/series/${series.id}`)}
                        activeOpacity={0.8}
                      >
                        <SeriesCard
                          series={series}
                          onPress={(s) => router.push(`/series/${s.id}`)}
                          width={160}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Books */}
              {filteredBooks.length > 0 && (
                <View style={styles.section}>
                  {(libraryFilter === "all" || libraryFilter === "books") && (
                    <Typography
                      variant="overline"
                      color="tertiary"
                      style={styles.sectionLabel}
                    >
                      Books
                    </Typography>
                  )}
                  {filteredBooks.map((book: Book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onPress={(b) => router.push(`/book/${b.id}`)}
                      variant="list"
                    />
                  ))}
                </View>
              )}

              {/* Playlists */}
              {filteredPlaylists.length > 0 && (
                <View style={styles.section}>
                  {(libraryFilter === "all" ||
                    libraryFilter === "playlists") && (
                    <Typography
                      variant="overline"
                      color="tertiary"
                      style={styles.sectionLabel}
                    >
                      Playlists
                    </Typography>
                  )}
                  {filteredPlaylists.map((pl: Playlist) => (
                    <TouchableOpacity
                      key={pl.id}
                      style={styles.playlistItem}
                      onPress={() => router.push(`/playlist/${pl.id}`)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.playlistIcon}>
                        <Ionicons
                          name="list"
                          size={24}
                          color={theme.colors.accent}
                        />
                      </View>
                      <View style={styles.playlistInfo}>
                        <Typography variant="label" numberOfLines={1}>
                          {pl.name}
                        </Typography>
                        <Typography variant="caption" color="tertiary">
                          {pl.items?.length || 0} messages
                        </Typography>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.colors.textTertiary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )
        }
      />

      <CreatePlaylistModal
        isVisible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(name, description) => {
          createPlaylist.mutate({ name, description });
        }}
      />

      <AddToPlaylistModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
        message={selectedMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.sm,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.sm,
  },
  searchBar: {
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
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    flexWrap: "nowrap",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  filterChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentMuted,
  },
  listContent: {
    paddingBottom: 120,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionLabel: {
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  seriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.md,
  },
  seriesGridItem: {},
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
    gap: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
  playlistIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  playlistInfo: {
    flex: 1,
    gap: 3,
  },
});
