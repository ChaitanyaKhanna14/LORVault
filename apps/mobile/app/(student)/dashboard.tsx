import { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Share } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lorService } from '@/services/lor.service';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import { useAuthStore } from '@/stores/authStore';
import { LorStatus } from '@lorvault/shared';

export default function StudentDashboard() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: lors, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['student-lors'],
    queryFn: () => lorService.getAll(),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
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
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Show skeleton on initial load
  if (isLoading && !lors) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Letters of Recommendation</Text>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>
        <SkeletonList count={3} />
      </View>
    );
  }

  // Show error state
  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Letters of Recommendation</Text>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>
        <ErrorMessage 
          message={error?.message || 'Failed to load your letters of recommendation'} 
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Letters of Recommendation</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
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
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subject}>{item.subject}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.details}>
                <Text style={styles.detail}>
                  <Text style={styles.label}>From: </Text>
                  {item.teacher?.fullName}
                </Text>
                <Text style={styles.detail}>
                  <Text style={styles.label}>Submitted: </Text>
                  {formatDate(item.submittedAt)}
                </Text>
                {item.approvedAt && (
                  <Text style={styles.detail}>
                    <Text style={styles.label}>Approved: </Text>
                    {formatDate(item.approvedAt)}
                  </Text>
                )}
              </View>

              {item.status === LorStatus.APPROVED && (
                <View style={styles.actions}>
                  {!item.consent?.acknowledged && (
                    <Button
                      title="Acknowledge"
                      variant="secondary"
                      onPress={() => acknowledgeMutation.mutate(item.id)}
                      loading={acknowledgeMutation.isPending}
                      style={styles.actionButton}
                    />
                  )}
                  <Button
                    title="Share"
                    variant="primary"
                    onPress={() => handleShare(item.id)}
                    style={styles.actionButton}
                    disabled={!item.consent?.acknowledged}
                  />
                </View>
              )}

              {item.status === LorStatus.REJECTED && item.rejectionReason && (
                <View style={styles.rejection}>
                  <Text style={styles.rejectionLabel}>Rejection reason:</Text>
                  <Text style={styles.rejectionText}>{item.rejectionReason}</Text>
                </View>
              )}

              {item.status === LorStatus.REVOKED && item.revokeReason && (
                <View style={styles.rejection}>
                  <Text style={styles.rejectionLabel}>Revoked:</Text>
                  <Text style={styles.rejectionText}>{item.revokeReason}</Text>
                </View>
              )}
            </Card>
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  logout: {
    color: COLORS.danger,
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    flex: 1,
    marginRight: 12,
  },
  subject: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  details: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detail: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 4,
  },
  label: {
    color: COLORS.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
  },
  rejection: {
    backgroundColor: COLORS.danger + '10',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  rejectionLabel: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '500',
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 13,
    color: COLORS.text,
  },
});
