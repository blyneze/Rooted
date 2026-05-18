import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';
import { Typography } from '@/components/ui/Typography';
import theme from '@/theme';

export default function EditProfileScreen() {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress || '';
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const initials = fullName ? fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.errors?.[0]?.longMessage || error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickImage = async () => {
    if (!user) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true, // Need base64 for Clerk setProfileImage
      });

      if (!result.canceled && result.assets[0].base64) {
        setIsUploadingImage(true);
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await user.setProfileImage({
          file: base64Image,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.errors?.[0]?.longMessage || error.message || 'Failed to update profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Typography variant="body" color="secondary">Cancel</Typography>
          </TouchableOpacity>
          <Typography variant="heading3" style={styles.headerTitle}>Edit Profile</Typography>
          <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.headerRight}>
            {isSaving ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <Typography variant="body" color="accent" style={{ fontWeight: '600' }}>Save</Typography>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} style={styles.avatarOuter}>
              <View style={styles.avatar}>
                {isUploadingImage ? (
                  <ActivityIndicator color={theme.colors.textPrimary} />
                ) : user?.imageUrl ? (
                  <React.Fragment>
                    {/* Expose Clerk Image */}
                    <View style={[StyleSheet.absoluteFill, { borderRadius: 50, overflow: 'hidden' }]}>
                      <Image source={{ uri: user.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    </View>
                    <View style={styles.cameraIconWrap}>
                      <Ionicons name="camera" size={16} color="#FFF" />
                    </View>
                  </React.Fragment>
                ) : (
                  <Typography variant="heading2" style={styles.avatarInitials}>{initials}</Typography>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickImage} style={{ marginTop: theme.spacing.sm }}>
              <Typography variant="label" color="accent">Change Profile Photo</Typography>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Typography variant="label" color="secondary" style={styles.label}>First Name</Typography>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              placeholderTextColor={theme.colors.textTertiary}
              selectionColor={theme.colors.accent}
            />
          </View>

          <View style={styles.formGroup}>
            <Typography variant="label" color="secondary" style={styles.label}>Last Name</Typography>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              placeholderTextColor={theme.colors.textTertiary}
              selectionColor={theme.colors.accent}
            />
          </View>

          <View style={styles.formGroup}>
            <Typography variant="label" color="secondary" style={styles.label}>Email Address (Read Only)</Typography>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={email}
              editable={false}
              placeholder="Email"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
  backBtn: {
    width: 60,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  content: {
    padding: theme.spacing.base,
    paddingBottom: 80,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
    marginTop: theme.spacing.md,
  },
  avatarOuter: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surfaceMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: theme.colors.textPrimary,
    letterSpacing: 1,
  },
  cameraIconWrap: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.background,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    marginBottom: theme.spacing.sm,
    marginLeft: 4,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    fontSize: theme.fontSize.base,
    color: theme.colors.textPrimary,
  },
  readOnlyInput: {
    backgroundColor: theme.colors.surfaceMid,
    color: theme.colors.textSecondary,
    opacity: 0.8,
  },
});
