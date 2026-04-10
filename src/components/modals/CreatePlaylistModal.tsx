import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/theme';

interface CreatePlaylistModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

export function CreatePlaylistModal({ isVisible, onClose, onCreate }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim());
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.container}
            >
              <View style={styles.content}>
                <View style={styles.header}>
                  <Typography variant="heading3">New Playlist</Typography>
                  <TouchableOpacity onPress={onClose} hitSlop={12}>
                    <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  <Typography variant="label" style={styles.label}>Name</Typography>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter playlist name..."
                    placeholderTextColor={theme.colors.textTertiary}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                    selectionColor={theme.colors.accent}
                  />

                  <Typography variant="label" style={[styles.label, { marginTop: 16 }]}>Description (Optional)</Typography>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What's this playlist about?"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    selectionColor={theme.colors.accent}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.createBtn, !name.trim() && styles.createBtnDisabled]}
                  onPress={handleCreate}
                  disabled={!name.trim()}
                >
                  <Typography variant="label" style={styles.createBtnText}>Create Playlist</Typography>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  container: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    marginBottom: 6,
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: theme.fontSize.base,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  createBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnDisabled: {
    backgroundColor: theme.colors.surfaceMid,
    opacity: 0.7,
  },
  createBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
