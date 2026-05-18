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
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import theme from '@/theme';

export default function ChangePasswordScreen() {
  const { user } = useUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all standard fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsSaving(true);
    try {
      await user.updatePassword({
        currentPassword,
        newPassword
      });
      Alert.alert('Success', 'Your password has been securely updated.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.errors?.[0]?.longMessage || error.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = currentPassword && newPassword && confirmPassword;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Typography variant="heading3" style={styles.headerTitle}>Change Password</Typography>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={isSaving || !isFormValid} 
            style={styles.headerRight}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <Typography 
                variant="body" 
                color={isFormValid ? "accent" : "tertiary"} 
              >
                Save
              </Typography>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Typography variant="body" color="secondary" style={styles.description}>
            Your password must be at least 8 characters long and contain a mix of letters and numbers.
          </Typography>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Typography variant="label" color="secondary" style={styles.label}>Current Password</Typography>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={theme.colors.textTertiary}
              selectionColor={theme.colors.accent}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Typography variant="label" color="secondary" style={styles.label}>New Password</Typography>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={theme.colors.textTertiary}
              selectionColor={theme.colors.accent}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Typography variant="label" color="secondary" style={styles.label}>Confirm New Password</Typography>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={theme.colors.textTertiary}
              selectionColor={theme.colors.accent}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
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
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  content: {
    padding: theme.spacing.base,
    paddingBottom: 80,
  },
  description: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
    lineHeight: 22,
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
});
