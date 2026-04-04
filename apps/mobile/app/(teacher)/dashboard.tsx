import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { lorService } from '@/services/lor.service';
import { LorCard } from '@/components/LorCard';
import { COLORS } from '@/utils/constants';
import { useAuthStore } from '@/stores/authStore';

export default function TeacherDashboard() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const { data: lors, isLoading, refetch } = useQuery({
    queryKey: ['teacher-lors'],
    queryFn: () => lorService.getAll(),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const handleLorPress = (lorId: string) => {
    router.push(`/(teacher)/lor/${lorId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Letters of Recommendation</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {lors && lors.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyText}>No LORs yet</Text>
          <Text style={styles.emptySubtext}>
            Upload your first letter of recommendation
          </Text>
        </View>
      ) : (
        <FlatList
          data={lors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LorCard lor={item} onPress={() => handleLorPress(item.id)} showStudent />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
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
