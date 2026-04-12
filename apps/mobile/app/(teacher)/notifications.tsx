import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/stores/themeStore';
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
  const { colors, typography, spacing, radius } = useTheme();

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
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {notifications && notifications.length > 0 && (
        <View style={{ padding: spacing.md, alignItems: 'flex-end' }}>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={{ ...typography.labelLg, color: colors.primary }}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {notifications && notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No notifications"
          message="You're all caught up! New notifications will appear here."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleMarkRead(item.id)}
              style={{ paddingHorizontal: spacing.md }}
            >
              <Card
                variant={item.read ? 'elevated' : 'filled'}
                style={{
                  ...(!item.read && {
                    backgroundColor: colors.primaryContainer + '30',
                    borderLeftWidth: 3,
                    borderLeftColor: colors.primary,
                  }),
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 24, marginRight: spacing.sm }}>
                    {getNotificationIcon(item.type)}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        ...typography.titleSm,
                        color: colors.onSurface,
                        marginBottom: 4,
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        ...typography.bodyMd,
                        color: colors.onSurfaceVariant,
                        marginBottom: 4,
                      }}
                    >
                      {item.body}
                    </Text>
                    <Text style={{ ...typography.bodySm, color: colors.outline }}>
                      {formatDateTime(item.createdAt)}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingTop: spacing.xs, paddingBottom: spacing['2xl'] }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}
