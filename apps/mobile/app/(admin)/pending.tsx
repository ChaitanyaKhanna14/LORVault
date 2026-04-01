import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lorService } from '@/services/lor.service';
import { LorCard } from '@/components/LorCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/utils/constants';
import { LorStatus } from '@/utils/shared';

export default function PendingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

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
        {
          text: 'Approve',
          style: 'default',
          onPress: () => approveMutation.mutate(id),
        },
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
    <View style={styles.container}>
      {lors && lors.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyText}>No pending LORs</Text>
          <Text style={styles.emptySubtext}>
            All letters of recommendation have been reviewed
          </Text>
        </View>
      ) : (
        <FlatList
          data={lors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subject}>{item.subject}</Text>
                <View style={styles.details}>
                  <Text style={styles.detail}>
                    <Text style={styles.label}>Teacher: </Text>
                    {item.teacher?.fullName}
                  </Text>
                  <Text style={styles.detail}>
                    <Text style={styles.label}>Student: </Text>
                    {item.student?.fullName} ({item.student?.studentId})
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <Button
                  title="Approve"
                  variant="secondary"
                  onPress={() => handleApprove(item.id, item.title)}
                  loading={approveMutation.isPending}
                  style={styles.actionButton}
                />
                <Button
                  title="Reject"
                  variant="danger"
                  onPress={() => handleReject(item.id, item.title)}
                  loading={rejectMutation.isPending}
                  style={styles.actionButton}
                />
              </View>
            </Card>
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
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardContent: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  subject: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  details: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
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
    paddingVertical: 12,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
