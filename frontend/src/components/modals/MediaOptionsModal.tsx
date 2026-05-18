import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { useUIStore } from '@/store/uiStore';
import { useDownloadStore } from '@/store/downloadStore';
import { downloadService } from '@/services/MediaDownloadService';
import { AddToPlaylistModal } from './AddToPlaylistModal';
import theme from '@/theme';

export function MediaOptionsModal() {
  const { 
    selectedMediaForOptions: media, 
    setSelectedMediaForOptions,
    isPlaylistModalVisible,
    showPlaylistModal,
    hidePlaylistModal
  } = useUIStore();

  const addDownload = useDownloadStore((state) => state.addDownload);
  const isDownloaded = useDownloadStore((state) => state.isDownloaded);

  if (!media) return null;

  const isVideo = 'youtubeId' in media;
  const downloaded = isDownloaded(media.id);

  const handleClose = () => {
    setSelectedMediaForOptions(null);
  };

  const handleDownload = () => {
    if (isVideo) {
      // Currently not supporting generic video downloading due to YouTube embed format
      return;
    }

    if (!downloaded && 'audioUrl' in media && media.audioUrl) {
      addDownload({
        messageId: media.id,
        title: media.title,
        coverUrl: media.coverUrl,
        speaker: media.speakerName || media.speaker?.name || 'Unknown Speaker',
        remoteUrl: media.audioUrl,
        mediaType: 'audio'
      });
      // Start processing the queue in the background
      downloadService.processQueue();
    }
    
    handleClose();
  };

  const handleAddToPlaylist = () => {
    showPlaylistModal();
  };

  const handleClosePlaylistModal = () => {
    hidePlaylistModal();
    handleClose(); // Also clear the selected media when playlist flow is done
  };

  return (
    <>
      <Modal
        visible={!!media && !isPlaylistModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.header}>
                  <View style={styles.handle} />
                  <Typography variant="heading3" style={styles.title} numberOfLines={1}>
                    {media.title}
                  </Typography>
                  <Typography variant="bodySmall" color="tertiary" style={styles.subtitle}>
                    {media.speakerName || (media as any).speaker?.name || 'Unknown Speaker'}
                  </Typography>
                </View>

                <View style={styles.actions}>
                  {!isVideo && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={handleDownload}
                      disabled={downloaded}
                      activeOpacity={0.7}
                    >
                      <View style={styles.actionIcon}>
                        <Ionicons 
                          name={downloaded ? "checkmark-circle" : "download-outline"} 
                          size={24} 
                          color={downloaded ? theme.colors.success : theme.colors.textPrimary} 
                        />
                      </View>
                      <Typography 
                        variant="body" 
                        color={downloaded ? "tertiary" : "primary"}
                      >
                        {downloaded ? "Downloaded" : "Download"}
                      </Typography>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={handleAddToPlaylist}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionIcon}>
                      <Ionicons name="list" size={24} color={theme.colors.textPrimary} />
                    </View>
                    <Typography variant="body">Add to Playlist</Typography>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                  <Typography variant="label" color="secondary">Cancel</Typography>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* When they select Add To Playlist, this modal takes over */}
      <AddToPlaylistModal 
        isVisible={isPlaylistModalVisible}
        onClose={handleClosePlaylistModal}
        message={'audioUrl' in media ? media : null} 
        // Note: Currently AddToPlaylistModal only supports AudioMessages, 
        // we might want to extend it to VideoMessage in the future based on API limits.
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surfaceMid,
    marginBottom: 8,
  },
  title: {
    marginHorizontal: theme.spacing.xl,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    paddingHorizontal: theme.spacing.xl,
  },
  actions: {
    paddingVertical: theme.spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 14,
    gap: theme.spacing.md,
  },
  actionIcon: {
    width: 40,
    alignItems: 'center',
  },
  closeBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.surfaceBorder,
    marginTop: theme.spacing.sm,
  },
});
