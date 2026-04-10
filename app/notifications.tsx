import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Typography } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { NOTIFICATIONS } from '@/constants/mockData';
import theme from '@/theme';
import type { AppNotification } from '@/types';

const NOTIF_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  new_message: 'headset-outline',
  new_series: 'albums-outline',
  reminder: 'time-outline',
  system: 'information-circle-outline',
};

function NotifRow({ item }: { item: AppNotification }) {
  const timeAgo = React.useMemo(() => {
    const diff = Date.now() - new Date(item.createdAt).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    const hrs = Math.floor(diff / 3600000);
    if (hrs > 0) return `${hrs}h ago`;
    return 'Just now';
  }, [item.createdAt]);

  return (
    <TouchableOpacity
      style={[styles.notifRow, !item.isRead && styles.notifRowUnread]}
      activeOpacity={0.75}
      onPress={() => {
        if (item.actionRoute) router.push(item.actionRoute as any);
      }}
    >
      {/* Icon or image */}
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.notifImage} contentFit="cover" transition={200} />
      ) : (
        <View style={styles.notifIconWrap}>
          <Ionicons
            name={NOTIF_ICONS[item.type] ?? 'notifications-outline'}
            size={20}
            color={theme.colors.accent}
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.notifContent}>
        <View style={styles.notifTitleRow}>
          <Typography
            variant="label"
            numberOfLines={1}
            style={[styles.notifTitle, !item.isRead && { color: theme.colors.textPrimary }]}
          >
            {item.title}
          </Typography>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Typography variant="bodySmall" color="secondary" numberOfLines={2} style={styles.notifBody}>
          {item.body}
        </Typography>
        <Typography variant="caption" color="tertiary" style={styles.notifTime}>
          {timeAgo}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const unreadCount = NOTIFICATIONS.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back} hitSlop={12}>
          <Ionicons name="chevron-down" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Typography variant="heading3">Notifications</Typography>
        <TouchableOpacity hitSlop={12}>
          <Typography variant="label" color="accent">Mark all read</Typography>
        </TouchableOpacity>
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Typography variant="caption" color="accent">
            {unreadCount} unread
          </Typography>
        </View>
      )}

      {NOTIFICATIONS.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="No notifications"
          description="You're all caught up. Check back soon for new messages and updates."
        />
      ) : (
        <FlatList
          data={NOTIFICATIONS}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => <NotifRow item={item} />}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
  unreadBanner: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.accentMuted,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.accent,
  },
  listContent: {
    paddingBottom: 60,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  notifRowUnread: {
    backgroundColor: 'rgba(255,59,48,0.04)',
  },
  notifImage: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMid,
    flexShrink: 0,
  },
  notifIconWrap: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: 3,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifTitle: {
    flex: 1,
    color: theme.colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
  },
  notifBody: {
    lineHeight: 19,
  },
  notifTime: {
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.surfaceMid,
    marginLeft: theme.spacing.base + 48 + theme.spacing.md,
  },
});
