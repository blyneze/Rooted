import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { useBibleStore } from '@/store/bibleStore';
import { PLAYLISTS } from '@/constants/mockData';
import theme from '@/theme';

function SettingRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
  destructive = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingIconWrap}>
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? theme.colors.accent : theme.colors.textSecondary}
        />
      </View>
      <Typography
        variant="body"
        style={[styles.settingLabel, destructive && { color: theme.colors.accent }]}
      >
        {label}
      </Typography>
      <View style={styles.settingRight}>
        {value && (
          <Typography variant="bodySmall" color="tertiary">
            {value}
          </Typography>
        )}
        {rightElement}
        {onPress && !rightElement && (
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Typography variant="overline" color="tertiary" style={styles.sectionHeader}>
      {title}
    </Typography>
  );
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { highlights, notes } = useBibleStore();
  const [notifications, setNotifications] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Friend';
  const initials = fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── Profile Header ─────────────────────────────────────────────── */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          {user?.imageUrl ? (
            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <Image source={{ uri: user.imageUrl }} style={[StyleSheet.absoluteFill, { borderRadius: 40 }]} />
              </View>
            </View>
          ) : (
            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <Typography variant="heading2" style={styles.avatarInitials}>
                  {initials}
                </Typography>
              </View>
            </View>
          )}
          <Typography variant="heading2" style={{ marginTop: theme.spacing.md }}>
            {fullName}
          </Typography>
          <Typography variant="body" color="secondary">
            {user?.primaryEmailAddress?.emailAddress ?? ''}
          </Typography>

          {/* Stats removed out of request */}
        </View>

        {/* ── My Playlists ────────────────────────────────────────────────── */}
        <SectionHeader title="My Playlists" />
        {PLAYLISTS.map((pl) => (
          <SettingRow
            key={pl.id}
            icon="list"
            label={pl.title}
            value={`${pl.items.length} messages`}
            onPress={() => router.push(`/playlist/${pl.id}`)}
          />
        ))}
        <TouchableOpacity style={styles.newPlaylistBtn}>
          <Ionicons name="add-circle-outline" size={18} color={theme.colors.accent} />
          <Typography variant="label" color="accent" style={{ marginLeft: 8 }}>
            New Playlist
          </Typography>
        </TouchableOpacity>

        {/* ── Notifications ───────────────────────────────────────────────── */}
        <SectionHeader title="Notifications" />
        <SettingRow
          icon="notifications-outline"
          label="Push notifications"
          rightElement={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.accent }}
              thumbColor="#FFF"
            />
          }
        />

        {/* ── Playback ────────────────────────────────────────────────────── */}
        <SectionHeader title="Playback" />
        <SettingRow
          icon="cloud-download-outline"
          label="Auto-download series"
          rightElement={
            <Switch
              value={autoDownload}
              onValueChange={setAutoDownload}
              trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.accent }}
              thumbColor="#FFF"
            />
          }
        />
        <SettingRow icon="speedometer-outline" label="Default playback speed" value="1.0x" onPress={() => {}} />

        {/* ── Bible Study ─────────────────────────────────────────────────── */}
        <SectionHeader title="Bible Study" />

        {/* Highlights summary row */}
        <SettingRow
          icon="color-fill-outline"
          label="Highlights"
          value={`${highlights.length}`}
          onPress={() => router.push('/(tabs)/bible')}
        />

        {/* Notes — expanded with scripture */}
        <View style={styles.notesSection}>
          <View style={styles.notesSectionHeader}>
            <View style={styles.settingIconWrap}>
              <Ionicons name="document-text-outline" size={18} color={theme.colors.textSecondary} />
            </View>
            <Typography variant="body" style={styles.settingLabel}>
              Notes
            </Typography>
            <Typography variant="bodySmall" color="tertiary">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </Typography>
          </View>

          {notes.length === 0 ? (
            <View style={styles.emptyNotes}>
              <Typography variant="caption" color="tertiary">
                Notes you save in the Bible will appear here.
              </Typography>
            </View>
          ) : (
            notes.slice().reverse().map((note) => (
              <TouchableOpacity
                key={note.id}
                style={styles.noteCard}
                onPress={() => router.push('/(tabs)/bible')}
                activeOpacity={0.75}
              >
                {/* Scripture reference badge */}
                <View style={styles.noteRefRow}>
                  <Ionicons name="book-outline" size={12} color={theme.colors.accent} />
                  <Typography variant="overline" style={styles.noteRef}>
                    {note.verseReference}
                  </Typography>
                </View>
                {/* Verse text */}
                {note.verseText ? (
                  <Typography variant="bodySmall" color="secondary" style={styles.noteVerseText} numberOfLines={2}>
                    "{note.verseText}"
                  </Typography>
                ) : null}
                {/* Note content */}
                <Typography variant="bodySmall" style={styles.noteContent} numberOfLines={3}>
                  {note.content}
                </Typography>
                {/* Timestamp */}
                <Typography variant="caption" color="tertiary" style={styles.noteDate}>
                  {new Date(note.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Typography>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ── Account ─────────────────────────────────────────────────────── */}
        <SectionHeader title="Account" />
        <SettingRow icon="person-outline" label="Edit profile" onPress={() => router.push('/settings/edit-profile')} />
        <SettingRow icon="lock-closed-outline" label="Change password" onPress={() => router.push('/settings/change-password')} />
        <SettingRow icon="help-circle-outline" label="Help & Support" onPress={() => router.push('/settings/help')} />
        <SettingRow icon="document-text-outline" label="Privacy Policy" onPress={() => router.push('/settings/privacy')} />
        <SettingRow icon="information-circle-outline" label="App version" value="1.0.0" />
        <SettingRow
          icon="log-out-outline"
          label="Sign out"
          onPress={handleSignOut}
          destructive
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
    marginBottom: theme.spacing.sm,
  },
  avatarOuter: {
    padding: 3,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: theme.colors.textPrimary,
    letterSpacing: 1,
  },

  sectionHeader: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
    gap: theme.spacing.md,
  },
  settingIconWrap: {
    width: 28,
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
  },
  // Notes section
  notesSection: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
    gap: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
  emptyNotes: {
    paddingHorizontal: theme.spacing.base,
    paddingLeft: theme.spacing.base + 28 + theme.spacing.md,
    paddingVertical: 12,
  },
  noteCard: {
    paddingHorizontal: theme.spacing.base,
    paddingLeft: theme.spacing.base + 28 + theme.spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
    gap: 4,
  },
  noteRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  noteRef: {
    color: theme.colors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  noteVerseText: {
    fontStyle: 'italic',
    lineHeight: 19,
    marginBottom: 4,
  },
  noteContent: {
    lineHeight: 20,
  },
  noteDate: {
    marginTop: 4,
    fontSize: 11,
  },
});
