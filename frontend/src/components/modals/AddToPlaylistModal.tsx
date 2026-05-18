import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylists, useAddPlaylistItem } from '@/api/queries';
import { CreatePlaylistModal } from './CreatePlaylistModal';
import theme from '@/theme';
import type { AudioMessage, Playlist } from '@/types';

interface AddToPlaylistModalProps {
  isVisible: boolean;
  onClose: () => void;
  message: AudioMessage | null;
}

export function AddToPlaylistModal({ isVisible, onClose, message }: AddToPlaylistModalProps) {
  const { data: playlists } = usePlaylists();
  const addPlaylistItem = useAddPlaylistItem();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleAddToPlaylist = (playlistId: string) => {
    if (!message) return;
    addPlaylistItem.mutate({ playlistId, messageId: message.id }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => handleAddToPlaylist(item.id)}
    >
      <View style={styles.playlistIcon}>
        <Ionicons name="list" size={20} color={theme.colors.accent} />
      </View>
      <View style={styles.playlistInfo}>
        <Typography variant="label">{item.name}</Typography>
        <Typography variant="caption" color="tertiary">
          {item.items?.length || 0} messages
        </Typography>
      </View>
      <Ionicons name="add-circle-outline" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <>
      <Modal
        visible={isVisible && !showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.header}>
                  <View style={styles.handle} />
                  <Typography variant="heading3" style={styles.title}>Add to Playlist</Typography>
                  <Typography variant="bodySmall" color="tertiary" style={styles.subtitle}>
                    {message?.title}
                  </Typography>
                </View>

                <TouchableOpacity
                  style={styles.createNewBtn}
                  onPress={() => setShowCreateModal(true)}
                >
                  <View style={[styles.playlistIcon, styles.createIcon]}>
                    <Ionicons name="add" size={20} color={theme.colors.accent} />
                  </View>
                  <Typography variant="label" style={{ color: theme.colors.accent }}>Create New Playlist</Typography>
                </TouchableOpacity>

                <FlatList
                  data={playlists}
                  keyExtractor={(item) => item.id}
                  renderItem={renderPlaylistItem}
                  contentContainerStyle={styles.list}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Typography variant="bodySmall" color="tertiary">
                        You haven't created any playlists yet.
                      </Typography>
                    </View>
                  }
                />

                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Typography variant="label" color="secondary">Cancel</Typography>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <CreatePlaylistModal
        isVisible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(name, desc) => {
          // This would ideally create and then add, but for now we'll just create
          // and the user can pick it from the list after refresh.
          // Or we could implement createAndAdd mutation.
        }}
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
    maxHeight: '80%',
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
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  createNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 16,
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.accentMuted,
  },
  createIcon: {
    backgroundColor: theme.colors.background,
  },
  list: {
    paddingVertical: theme.spacing.sm,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 12,
    gap: theme.spacing.md,
  },
  playlistIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistInfo: {
    flex: 1,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  closeBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.surfaceBorder,
  },
});
