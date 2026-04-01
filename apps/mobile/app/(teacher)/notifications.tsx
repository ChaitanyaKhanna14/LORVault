import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';
import { NotificationType } from '@/utils/shared';

const getNotificationIcon = (type: NotificationType) => {
  const icons: Record<NotificationType, string> = {
    LOR_SUBMITTED: '📤',
    LOR_APPROVED: '✅',
    LOR_REJECTED: '❌',
    LOR_REVOKED: '🚫',
    LOR_VERIFIED: '🔍',
    CONSENT_REQUIRED: '📝',
  };
  return icons[type] || '📢';
};

export default function NotificationsScreen() {
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll(),
  });

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    refetch();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    refetch();
  };

  return (
    <View style={styles.container}>
      {notifications && notifications.length > 0 && (
        <View style={styles.header}>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllRead}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}

      {notifications && notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleMarkRead(item.id)}>
              <Card style={[styles.notification, !item.read && styles.unread]}>
                <View style={styles.notificationContent}>
                  <Text style={styles.icon}>{getNotificationIcon(item.type)}</Text>
                  <View style={styles.textContent}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.body}>{item.body}</Text>
                    <Text style={styles.time}>{formatDateTime(item.createdAt)}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    alignItems: 'flex-end',
  },
  markAllRead: {
    color: COLORS.primary,
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  notification: {
    marginBottom: 8,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notificationContent: {
    flexDirection: 'row',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 4,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
});
