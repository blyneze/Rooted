import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { MessageListItem } from '@/components/content/MessageCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAudioStore } from '@/store/audioStore';
import { usePlaylist, useDeletePlaylist, useRemovePlaylistItem } from '@/api/queries';
import theme from '@/theme';
import type { AudioMessage, QueueItem, Playlist } from '@/types';

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setCurrentMessage, setPlayerState, setQueue } = useAudioStore();
  const [isEditing, setIsEditing] = useState(false);

  const { data: playlist, isLoading } = usePlaylist(id);
  const deletePlaylist = useDeletePlaylist();
  const removePlaylistItem = useRemovePlaylistItem();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Typography variant="body" align="center" style={{ marginTop: 40 }}>Loading playlist...</Typography>
      </SafeAreaView>
    );
  }

  if (!playlist) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TouchableOpacity onPress={router.back} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Typography variant="body" color="tertiary" align="center">Playlist not found</Typography>
      </SafeAreaView>
    );
  }

  const handleDeletePlaylist = () => {
    Alert.alert('Delete Playlist', `Delete "${playlist.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => {
          deletePlaylist.mutate(id, {
            onSuccess: () => router.replace('/(tabs)/library'),
          });
        } 
      },
    ]);
  };

  const handleRemoveItem = (messageId: string) => {
    removePlaylistItem.mutate({ playlistId: id, messageId });
  };

  const handlePlayAll = () => {
    if (playlist.items.length === 0) return;
    const queue: QueueItem[] = playlist.items.map((m: AudioMessage) => ({
      id: m.id,
      title: m.title,
      artist: m.speaker?.name ?? 'Unknown Speaker',
      artwork: m.coverUrl,
      url: m.audioUrl,
      duration: m.duration,
      messageId: m.id,
    }));
    setQueue(queue, 0);
    setCurrentMessage(playlist.items[0]);
    setPlayerState('playing');
  };

  const handlePlayMessage = (message: AudioMessage) => {
    setCurrentMessage(message);
    setPlayerState('playing');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={router.back} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} hitSlop={12}>
            <Ionicons
              name={isEditing ? 'checkmark' : 'create-outline'}
              size={22}
              color={isEditing ? theme.colors.accent : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* ── Playlist Info ────────────────────────────────────────────────── */}
        <View style={styles.infoSection}>
          <View style={styles.playlistIcon}>
            <Ionicons name="list" size={40} color={theme.colors.accent} />
          </View>
          <Typography variant="heading2" align="center" style={styles.playlistTitle}>
            {playlist.name}
          </Typography>
          {playlist.description && (
            <Typography variant="body" color="secondary" align="center">
              {playlist.description}
            </Typography>
          )}
          <Typography variant="caption" color="tertiary" style={{ marginTop: theme.spacing.sm }}>
            {playlist.items.length} messages
          </Typography>
        </View>

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.playAllBtn, playlist.items.length === 0 && styles.playAllBtnDisabled]}
            onPress={handlePlayAll}
            disabled={playlist.items.length === 0}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Typography variant="label" style={{ color: '#FFF', fontWeight: '600' }}>
              Play All
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deletePlaylistBtn}
            onPress={handleDeletePlaylist}
          >
            <Ionicons name="trash-outline" size={22} color={theme.colors.accent} />
          </TouchableOpacity>
        </View>

        {/* ── Episodes ─────────────────────────────────────────────────────── */}
        <View style={styles.episodesSection}>
          {playlist.items.length === 0 ? (
            <EmptyState
              icon="list-outline"
              title="Playlist is empty"
              description="Add messages to this playlist from any message detail screen."
            />
          ) : (
            playlist.items.map((msg: AudioMessage, i: number) => (
              <View key={msg.id} style={styles.itemWrapper}>
                <MessageListItem
                  message={msg}
                  onPress={handlePlayMessage}
                  onMore={() => {
                    if (isEditing) handleRemoveItem(msg.id);
                  }}
                  showDivider={i < playlist.items.length - 1}
                  index={i}
                />
                {isEditing && (
                  <TouchableOpacity 
                    style={styles.removeIcon} 
                    onPress={() => handleRemoveItem(msg.id)}
                  >
                    <Ionicons name="remove-circle" size={22} color={theme.colors.accent} />
                  </TouchableOpacity>
                )}
              </View>
            ))
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
    alignSelf: 'flex-start',
  },
  scroll: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  playlistIcon: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.accent,
  },
  playlistTitle: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingBottom: theme.spacing.base,
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
  playAllBtnDisabled: {
    opacity: 0.4,
  },
  deletePlaylistBtn: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.accent,
  },
  episodesSection: {
    paddingTop: theme.spacing.base,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeIcon: {
    paddingRight: theme.spacing.base,
  },
});
