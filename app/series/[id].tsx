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
import { MessageListItem } from '@/components/content/MessageCard';
import { useAudioStore } from '@/store/audioStore';
import { useUIStore } from '@/store/uiStore';
import theme from '@/theme';
import type { AudioMessage, QueueItem } from '@/types';
import { useSeriesById } from '@/api/queries';
import { SkeletonHero } from '@/components/ui/Skeleton';

export default function SeriesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setCurrentMessage, setPlayerState, setQueue } = useAudioStore();
  const { setSelectedMediaForOptions } = useUIStore();
  const [isSaved, setIsSaved] = useState(false);

  const { data: series, isLoading, error } = useSeriesById(id!);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SkeletonHero />
      </SafeAreaView>
    );
  }

  if (error || !series) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TouchableOpacity onPress={router.back} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Typography variant="body" color="tertiary" align="center">
          {error ? 'Failed to load series' : 'Series not found'}
        </Typography>
      </SafeAreaView>
    );
  }

  const handlePlayAll = () => {
    if (!series.messages || series.messages.length === 0) return;
    const queue: QueueItem[] = series.messages.map((m: any) => ({
      id: m.id,
      title: m.title,
      artist: m.speakerName ?? 'Unknown Speaker',
      artwork: m.coverUrl,
      url: m.audioUrl,
      duration: m.duration,
      seriesName: series.name,
      messageId: m.id,
    }));
    setQueue(queue, 0);
    setCurrentMessage(series.messages[0]);
    setPlayerState('playing');
  };

  const handleMessagePress = (message: any) => {
    if (message.youtubeId) {
      router.push(`/video/${message.id}`);
    } else {
      setCurrentMessage(message);
      setPlayerState('playing');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <Image
            source={{ uri: series.artworkUrl }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={400}
          />
          <View style={styles.heroOverlay} />
          <TouchableOpacity style={styles.backOverlay} onPress={router.back}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <Typography variant="overline" style={{ color: theme.colors.accent, marginBottom: 8 }}>
              SERIES
            </Typography>
            <Typography variant="heading1" style={{ color: '#FFF', marginBottom: 8 }}>
              {series.name}
            </Typography>
            <Typography variant="bodySmall" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {series.messageCount} messages {series.topics?.length > 0 ? `· ${series.topics.slice(0, 2).join(', ')}` : ''}
            </Typography>
          </View>
        </View>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.playAllBtn} onPress={handlePlayAll} activeOpacity={0.85}>
            <Ionicons name="play" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Typography variant="label" style={{ color: '#FFF', fontWeight: '600' }}>
              Play All
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => setIsSaved(!isSaved)}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={isSaved ? theme.colors.accent : theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn}>
            <Ionicons name="share-outline" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Description ─────────────────────────────────────────────────── */}
        <View style={styles.descSection}>
          <Typography variant="body" color="secondary" style={{ lineHeight: 26 }}>
            {series.description}
          </Typography>
        </View>

        {/* ── Topic tags ──────────────────────────────────────────────────── */}
        <View style={styles.tagsRow}>
          {series.topics?.map((topic: string) => (
            <View key={topic} style={styles.tag}>
              <Typography variant="caption" color="secondary">{topic}</Typography>
            </View>
          ))}
        </View>

        {/* ── Episodes ────────────────────────────────────────────────────── */}
        <View style={styles.episodesSection}>
          <Typography variant="heading3" style={styles.episodesTitle}>
            Episodes
          </Typography>
          {series.messages.length === 0 ? (
            <View style={styles.emptyEpisodes}>
              <Typography variant="body" color="tertiary" align="center">
                Episodes coming soon
              </Typography>
            </View>
          ) : (
            series.messages.map((msg: any, i: number) => {
              // Polyfill thumbnail for videos if coverUrl is missing
              const cover = msg.coverUrl || (msg.youtubeId ? `https://img.youtube.com/vi/${msg.youtubeId}/hqdefault.jpg` : '');
              const itemData = { ...msg, coverUrl: cover };
              
              return (
                <MessageListItem
                  key={msg.id}
                  message={itemData}
                  onPress={handleMessagePress}
                  onMore={(m) => setSelectedMediaForOptions(m)}
                  showDivider={i < series.messages.length - 1}
                  index={i}
                />
              );
            })
          )}
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
  },
  scroll: {},
  hero: {
    height: 320,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  backOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroContent: {
    padding: theme.spacing.base,
    paddingBottom: theme.spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
    gap: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
  playAllBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.full,
    paddingVertical: 14,
  },
  saveBtn: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descSection: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  episodesSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.surfaceMid,
    paddingTop: theme.spacing.base,
  },
  episodesTitle: {
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.sm,
  },
  emptyEpisodes: {
    paddingVertical: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.base,
  },
});
