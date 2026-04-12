import { useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lorService } from '@/services/lor.service';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { LorStatus } from '@/utils/shared';
import { formatDate } from '@/utils/formatters';
import { Share } from 'react-native';

export default function StudentDashboard() {
  const { colors, typography, spacing } = useTheme();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: lors, isLoading, refetch } = useQuery({
    queryKey: ['student-lors'],
    queryFn: () => lorService.getAll(),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => lorService.acknowledge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-lors'] });
    },
  });

  const handleShare = async (lorId: string) => {
    try {
      const { shareUrl } = await lorService.getShareLink(lorId);
      await Share.share({
        message: `Verify my Letter of Recommendation: ${shareUrl}`,
        url: shareUrl,
      });
    } catch {
      // Share was cancelled or failed — no action needed
    }
  };

  const firstName = user?.fullName?.split(' ')[0] || 'Student';

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing['4xl'] + 16,
          paddingBottom: spacing.lg,
          backgroundColor: colors.surface,
        }}
      >
        <Text
          style={{
            ...typography.displayMd,
            color: colors.onSurface,
          }}
        >
          Hello, {firstName}
        </Text>
        <Text
          style={{
            ...typography.bodyLg,
            color: colors.onSurfaceVariant,
            marginTop: spacing.xxs,
          }}
        >
          Your letters of recommendation
        </Text>
      </View>

      {lors && lors.length === 0 ? (
        <EmptyState
          icon="📄"
          title="No LORs yet"
          message="Your teachers haven't submitted any letters of recommendation for you yet."
        />
      ) : (
        <FlatList
          data={lors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={{ marginHorizontal: spacing.xl }}>
              {/* Card Header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: spacing.md,
                }}
              >
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text
                    style={{
                      ...typography.titleLg,
                      color: colors.onSurface,
                      marginBottom: 2,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      ...typography.bodyMd,
                      color: colors.onSurfaceVariant,
                    }}
                  >
                    {item.subject}
                  </Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              {/* Details */}
              <View
                style={{
                  backgroundColor: colors.surfaceContainerLow,
                  borderRadius: 8,
                  padding: spacing.sm,
                  marginBottom: spacing.md,
                }}
              >
                <Text
                  style={{
                    ...typography.bodySm,
                    color: colors.onSurface,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ color: colors.onSurfaceVariant }}>From: </Text>
                  {item.teacher?.fullName}
                </Text>
                <Text
                  style={{
                    ...typography.bodySm,
                    color: colors.onSurface,
                    marginBottom: item.approvedAt ? 4 : 0,
                  }}
                >
                  <Text style={{ color: colors.onSurfaceVariant }}>Submitted: </Text>
                  {formatDate(item.submittedAt)}
                </Text>
                {item.approvedAt && (
                  <Text
                    style={{
                      ...typography.bodySm,
                      color: colors.onSurface,
                    }}
                  >
                    <Text style={{ color: colors.onSurfaceVariant }}>Approved: </Text>
                    {formatDate(item.approvedAt)}
                  </Text>
                )}
              </View>

              {/* Actions */}
              {item.status === LorStatus.APPROVED && (
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {!item.consent?.acknowledged && (
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Acknowledge"
                        variant="secondary"
                        onPress={() => acknowledgeMutation.mutate(item.id)}
                        loading={acknowledgeMutation.isPending}
                      />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Button
                      title="Share"
                      variant="primary"
                      onPress={() => handleShare(item.id)}
                      disabled={!item.consent?.acknowledged}
                    />
                  </View>
                </View>
              )}

              {/* Rejection/Revocation reason */}
              {item.status === LorStatus.REJECTED && item.rejectionReason && (
                <View
                  style={{
                    backgroundColor: colors.errorContainer + '1A',
                    borderRadius: 8,
                    padding: spacing.sm,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.error,
                  }}
                >
                  <Text style={{ ...typography.labelMd, color: colors.error, marginBottom: 2 }}>
                    Rejection reason
                  </Text>
                  <Text style={{ ...typography.bodySm, color: colors.onSurface }}>
                    {item.rejectionReason}
                  </Text>
                </View>
              )}

              {item.status === LorStatus.REVOKED && item.revokeReason && (
                <View
                  style={{
                    backgroundColor: colors.surfaceContainerHigh,
                    borderRadius: 8,
                    padding: spacing.sm,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.outline,
                  }}
                >
                  <Text style={{ ...typography.labelMd, color: colors.outline, marginBottom: 2 }}>
                    Revoked
                  </Text>
                  <Text style={{ ...typography.bodySm, color: colors.onSurface }}>
                    {item.revokeReason}
                  </Text>
                </View>
              )}
            </Card>
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
