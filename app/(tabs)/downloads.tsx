import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Typography } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDownloadStore } from '@/store/downloadStore';
import { useAudioStore } from '@/store/audioStore';
import { downloadService } from '@/services/MediaDownloadService';
import theme from '@/theme';
import type { DownloadItem } from '@/types';

function DownloadRow({ item, onPlay, onDelete }: {
  item: DownloadItem;
  onPlay: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.rowInner} onPress={onPlay} activeOpacity={0.78}>
        <Image
          source={{ uri: item.coverUrl }}
          style={styles.artwork}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Typography variant="label" numberOfLines={2} style={{ flex: 1 }}>
              {item.title}
            </Typography>
            {item.status === 'completed' && (
              <View style={styles.offlineBadge}>
                <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
              </View>
            )}
          </View>
          <Typography variant="caption" color="tertiary">
            {item.speaker}
          </Typography>
          {item.status === 'downloading' && (
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
              </View>
              <Typography variant="caption" color="accent" style={{ marginLeft: 8, minWidth: 32 }}>
                {item.progress}%
              </Typography>
            </View>
          )}
          {item.status === 'completed' && (
            <Typography variant="caption" color="tertiary">
              Available offline
            </Typography>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={onDelete}
        hitSlop={8}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}

export default function DownloadsScreen() {
  const { downloads } = useDownloadStore();
  const { setCurrentMessage, setPlayerState } = useAudioStore();

  const handlePlay = (item: DownloadItem) => {
    // Construct a temporary AudioMessage object from the DownloadItem
    // This allows offline playback even if the full message data isn't in memory
    const message: any = {
      id: item.messageId,
      title: item.title,
      coverUrl: item.coverUrl,
      audioUrl: item.localUri || item.remoteUrl,
      speakerName: item.speaker,
      duration: 0, // Duration will be loaded by the player
    };
    
    setCurrentMessage(message);
    setPlayerState('playing');
  };

  const handleDelete = (item: DownloadItem) => {
    Alert.alert(
      'Remove Download',
      `Remove "${item.title}" from your downloads?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => downloadService.removeDownload(item.messageId),
        },
      ]
    );
  };

  const totalSize = downloads
    .filter((d) => d.status === 'completed' && d.sizeBytes)
    .reduce((sum, d) => sum + (d.sizeBytes ?? 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="heading2">Downloads</Typography>
        {downloads.length > 0 && (
          <Typography variant="caption" color="tertiary">
            {(totalSize / 1_048_576).toFixed(0)} MB used
          </Typography>
        )}
      </View>

      {downloads.length === 0 ? (
        <EmptyState
          icon="arrow-down-circle-outline"
          title="No downloads yet"
          description="Download messages to listen offline. Tap the download button on any message."
        />
      ) : (
        <FlatList
          data={downloads}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <DownloadRow
              item={item}
              onPlay={() => handlePlay(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          ListHeaderComponent={
            <View style={styles.offlineNotice}>
              <Ionicons name="wifi-outline" size={16} color={theme.colors.success} />
              <Typography variant="caption" color="secondary" style={{ marginLeft: 6 }}>
                {downloads.filter((d) => d.status === 'completed').length} messages available offline
              </Typography>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: 120,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.base,
    marginVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  rowInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMid,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  offlineBadge: {},
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: theme.colors.surfaceBorder,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: theme.spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.surfaceMid,
    marginLeft: theme.spacing.base + 56 + theme.spacing.md,
  },
});
