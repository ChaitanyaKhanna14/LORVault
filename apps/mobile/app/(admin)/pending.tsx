import { useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lorService } from '@/services/lor.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/stores/themeStore';
import { LorStatus } from '@/utils/shared';

export default function PendingScreen() {
  const queryClient = useQueryClient();
  const { colors, typography, spacing } = useTheme();

  const { data: lors, isLoading, refetch } = useQuery({
    queryKey: ['pending-lors'],
    queryFn: () => lorService.getAll({ status: LorStatus.SUBMITTED }),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const approveMutation = useMutation({
    mutationFn: (id: string) => lorService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-lors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      Alert.alert('Success', 'LOR approved successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      lorService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-lors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      Alert.alert('Success', 'LOR rejected');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleApprove = (id: string, title: string) => {
    Alert.alert(
      'Approve LOR',
      `Are you sure you want to approve "${title}"? This will generate the canonical PDF with QR code and store the hash on the blockchain.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', style: 'default', onPress: () => approveMutation.mutate(id) },
      ]
    );
  };

  const handleReject = (id: string, title: string) => {
    Alert.prompt(
      'Reject LOR',
      `Enter a reason for rejecting "${title}":`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: (reason) => {
            if (reason?.trim()) {
              rejectMutation.mutate({ id, reason: reason.trim() });
            } else {
              Alert.alert('Error', 'Please provide a rejection reason');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {lors && lors.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No pending LORs"
          message="All letters of recommendation have been reviewed"
        />
      ) : (
        <FlatList
          data={lors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: spacing.xl }}>
              <Card>
                <View style={{ marginBottom: spacing.md }}>
                  <Text style={{ ...typography.titleLg, color: colors.onSurface, marginBottom: 4 }}>
                    {item.title}
                  </Text>
                  <Text style={{ ...typography.bodyMd, color: colors.onSurfaceVariant, marginBottom: spacing.sm }}>
                    {item.subject}
                  </Text>

                  <View
                    style={{
                      backgroundColor: colors.surfaceContainerLow,
                      borderRadius: 8,
                      padding: spacing.sm,
                    }}
                  >
                    <Text style={{ ...typography.bodySm, color: colors.onSurface, marginBottom: 4 }}>
                      <Text style={{ color: colors.onSurfaceVariant }}>Teacher: </Text>
                      {item.teacher?.fullName}
                    </Text>
                    <Text style={{ ...typography.bodySm, color: colors.onSurface }}>
                      <Text style={{ color: colors.onSurfaceVariant }}>Student: </Text>
                      {item.student?.fullName} ({item.student?.studentId})
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      title="Approve"
                      variant="primary"
                      onPress={() => handleApprove(item.id, item.title)}
                      loading={approveMutation.isPending}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      title="Reject"
                      variant="danger"
                      onPress={() => handleReject(item.id, item.title)}
                      loading={rejectMutation.isPending}
                    />
                  </View>
                </View>
              </Card>
            </View>
          )}
          contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing['2xl'] }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
          }
        />
      )}
    </View>
  );
}
