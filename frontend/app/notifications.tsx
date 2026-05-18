import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import theme from '@/theme';
import type { AppNotification } from '@/types';
import { 
  useNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead, 
  useDeleteNotification 
} from '@/api/queries';

function NotifRow({ 
  item, 
  onDelete, 
  onRead 
}: { 
  item: AppNotification; 
  onDelete: () => void; 
  onRead: () => void;
}) {
  const timeAgo = React.useMemo(() => {
    const diff = Date.now() - new Date(item.createdAt).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    const hrs = Math.floor(diff / 3600000);
    if (hrs > 0) return `${hrs}h ago`;
    const mins = Math.floor(diff / 60000);
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  }, [item.createdAt]);

  return (
    <TouchableOpacity
      style={[styles.notifRow, !item.isRead && styles.notifRowUnread]}
      activeOpacity={0.7}
      onPress={() => {
        onRead();
        if (item.actionRoute) {
          // @ts-ignore
          router.push(item.actionRoute);
        }
      }}
    >
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <View style={styles.titleWrap}>
            {!item.isRead && <View style={styles.unreadDot} />}
            <Typography variant="body" weight={!item.isRead ? 'semibold' : 'regular'} style={styles.notifTitle}>
              {item.title}
            </Typography>
          </View>
          <Typography variant="caption" color="tertiary" style={styles.timeTag}>
            {timeAgo}
          </Typography>
        </View>
        <Typography variant="bodySmall" color="secondary" style={styles.notifBody}>
          {item.body}
        </Typography>
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={12}>
        <Typography variant="caption" color="accent">Delete</Typography>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const { data: notifications = [], isLoading, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Typography variant="heading3">Notifications</Typography>
          {unreadCount > 0 && (
            <Typography variant="caption" color="tertiary" style={{ marginLeft: 6 }}>
              ({unreadCount})
            </Typography>
          )}
        </View>
        
        <TouchableOpacity 
          hitSlop={12} 
          onPress={handleMarkAllRead} 
          disabled={unreadCount === 0 || markAllRead.isPending}
        >
          <Typography variant="label" color={unreadCount > 0 ? "accent" : "tertiary"}>
            {markAllRead.isPending ? 'Working...' : 'Mark read'}
          </Typography>
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="No notifications"
          description="You're all caught up. Check back soon for new messages."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <NotifRow 
              item={item} 
              onDelete={() => deleteNotif.mutate(item.id)}
              onRead={() => {
                if (!item.isRead) markRead.mutate(item.id);
              }}
            />
          )}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.lg,
  },
  backBtn: {
    minWidth: 44,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  listContent: {
    paddingBottom: 60,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  notifRowUnread: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
  },
  notifContent: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
    marginRight: 8,
  },
  notifTitle: {
    flex: 1,
    color: theme.colors.textPrimary,
  },
  timeTag: {
    marginLeft: 8,
  },
  notifBody: {
    lineHeight: 22,
  },
  deleteBtn: {
    paddingVertical: 8,
    paddingLeft: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.surfaceBorder,
    marginHorizontal: theme.spacing.xl,
  },
});
