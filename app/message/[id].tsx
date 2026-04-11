import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "@/components/ui/Typography";
import { MessageCard } from "@/components/content/MessageCard";
import { ShelfRow } from "@/components/content/ShelfRow";
import { useAudioStore } from "@/store/audioStore";
import { useUIStore } from "@/store/uiStore";
import { useDownloadStore } from "@/store/downloadStore";
import { useMessage } from "@/api/queries";
import { formatDurationLabel } from "@/constants/mockData";
import theme from "@/theme";
import type { AudioMessage } from "@/types";
import { downloadService } from "@/services/MediaDownloadService";

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setCurrentMessage, setPlayerState, currentMessage } = useAudioStore();
  const { setSelectedMediaForOptions, showPlaylistModal } = useUIStore();
  const { downloads, isDownloaded, addDownload } = useDownloadStore();

  const { data: message, isLoading } = useMessage(id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Typography
          variant="body"
          color="tertiary"
          align="center"
          style={{ marginTop: 40 }}
        >
          Loading message...
        </Typography>
      </SafeAreaView>
    );
  }

  if (!message) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <TouchableOpacity onPress={router.back} style={styles.backBtn}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <Typography variant="body" color="tertiary" align="center">
          Message not found
        </Typography>
      </SafeAreaView>
    );
  }

  const isCurrentlyPlaying = currentMessage?.id === message.id;
  const download = downloads.find((d) => d.messageId === message.id);
  const isDownloadedStatus = download?.status === "completed";
  const isDownloading =
    download?.status === "downloading" || download?.status === "pending";
  const related: AudioMessage[] = [];

  const handlePlay = () => {
    setCurrentMessage(message);
    setPlayerState("playing");
  };

  const handleDownload = async () => {
    if (isDownloadedStatus || isDownloading) return;

    addDownload({
      messageId: message.id,
      title: message.title,
      coverUrl: message.coverUrl,
      speaker: message.speaker?.name || "Speaker",
      remoteUrl: message.audioUrl,
      mediaType: "audio",
    });

    // Start processing queue
    setTimeout(() => downloadService.processQueue(), 100);
  };

  const handlePlaylist = () => {
    setSelectedMediaForOptions(message);
    showPlaylistModal();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Hero Image ──────────────────────────────────────────────────── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: message.coverUrl }}
            style={styles.heroImage}
            contentFit="cover"
            transition={400}
          />
          {/* Back button overlay */}
          <TouchableOpacity style={styles.backOverlay} onPress={router.back}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          {/* Overlay gradient */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={styles.heroGradient}
          />
        </View>

        {/* ── Meta ────────────────────────────────────────────────────────── */}
        <View style={styles.meta}>
          {message.series && (
            <TouchableOpacity
              onPress={() => router.push(`/series/${message.series!.id}`)}
              style={styles.seriesChip}
            >
              <Typography variant="caption" color="accent">
                {message.series.name}
              </Typography>
              {message.partNumber && (
                <Typography variant="caption" color="tertiary">
                  {" "}
                  · Part {message.partNumber}
                </Typography>
              )}
            </TouchableOpacity>
          )}
          <Typography variant="heading2" style={styles.title}>
            {message.title}
          </Typography>
          <View style={styles.speakerRow}>
            <Typography variant="body" color="secondary">
              {message.speakerName ||
                message.speaker?.name ||
                "Unknown Speaker"}
            </Typography>
            <View style={styles.dot} />
            <Typography variant="body" color="tertiary">
              {formatDurationLabel(message.duration)}
            </Typography>
          </View>

          {/* Progress if in progress */}
          {message.playbackProgress && message.playbackProgress > 0 && (
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${message.playbackProgress * 100}%` },
                  ]}
                />
              </View>
              <Typography
                variant="caption"
                color="accent"
                style={{ marginLeft: 8 }}
              >
                {Math.round(message.playbackProgress * 100)}% complete
              </Typography>
            </View>
          )}
        </View>

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.playBtn, isCurrentlyPlaying && styles.playBtnActive]}
            onPress={handlePlay}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isCurrentlyPlaying ? "pause" : "play"}
              size={20}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Typography
              variant="label"
              style={{ color: "#FFF", fontWeight: "600" }}
            >
              {isCurrentlyPlaying
                ? "Playing"
                : message.playbackProgress
                  ? "Resume"
                  : "Play"}
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconActionBtn}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            <Ionicons
              name={
                isDownloadedStatus
                  ? "checkmark-circle"
                  : isDownloading
                    ? "cloud-download"
                    : "arrow-down-circle-outline"
              }
              size={26}
              color={
                isDownloadedStatus
                  ? theme.colors.success
                  : isDownloading
                    ? theme.colors.accent
                    : theme.colors.textSecondary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconActionBtn}>
            <Ionicons
              name={message.isSaved ? "bookmark" : "bookmark-outline"}
              size={26}
              color={
                message.isSaved
                  ? theme.colors.accent
                  : theme.colors.textSecondary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconActionBtn}
            onPress={handlePlaylist}
          >
            <Ionicons
              name="list"
              size={26}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* ── Tags ────────────────────────────────────────────────────────── */}
        <View style={styles.tagsRow}>
          {message.topicTags?.map((tag: string) => (
            <View key={tag} style={styles.tag}>
              <Typography variant="caption" color="secondary">
                {tag}
              </Typography>
            </View>
          ))}
          {message.isPremium && (
            <View style={[styles.tag, styles.premiumTag]}>
              <Ionicons name="star" size={11} color={theme.colors.accent} />
              <Typography
                variant="caption"
                color="accent"
                style={{ marginLeft: 3 }}
              >
                Premium
              </Typography>
            </View>
          )}
        </View>

        {/* ── Description ─────────────────────────────────────────────────── */}
        <View style={styles.descriptionSection}>
          <Typography
            variant="body"
            color="secondary"
            style={styles.description}
          >
            {message.description}
          </Typography>
        </View>

        {/* ── Related Messages ─────────────────────────────────────────────── */}
        {related.length > 0 && (
          <View style={styles.relatedSection}>
            <ShelfRow title="You might also like">
              {related.map((msg) => (
                <MessageCard
                  key={msg.id}
                  message={msg}
                  onPress={(m) => router.push(`/message/${m.id}`)}
                />
              ))}
            </ShelfRow>
          </View>
        )}

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
  scroll: {},
  backBtn: {
    margin: theme.spacing.base,
    padding: 4,
  },
  heroContainer: {
    position: "relative",
    height: 280,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  backOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "rgba(10,10,10,0.6)",
  },
  meta: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.base,
  },
  seriesChip: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  speakerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.textTertiary,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: theme.colors.surfaceBorder,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.base,
    gap: theme.spacing.sm,
  },
  playBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.full,
    paddingVertical: 14,
  },
  playBtnActive: {
    backgroundColor: theme.colors.surfaceMid,
  },
  iconActionBtn: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.base,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceBorder,
  },
  premiumTag: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentMuted,
  },
  descriptionSection: {
    paddingHorizontal: theme.spacing.base,
    paddingBottom: theme.spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
    marginBottom: theme.spacing.xl,
  },
  description: {
    lineHeight: 26,
  },
  relatedSection: {
    marginBottom: theme.spacing.xl,
  },
});
