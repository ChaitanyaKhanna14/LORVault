import { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { lorService } from '@/services/lor.service';
import { LorCard } from '@/components/LorCard';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS } from '@/utils/constants';
import { useAuthStore } from '@/stores/authStore';

export default function TeacherDashboard() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const { data: lors, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['teacher-lors'],
    queryFn: () => lorService.getAll(),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleLorPress = (lorId: string) => {
    router.push(`/(teacher)/lor/${lorId}`);
  };

  // Show skeleton on initial load
  if (isLoading && !lors) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Letters of Recommendation</Text>
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
          <Text style={styles.title}>My Letters of Recommendation</Text>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>
        <ErrorMessage 
          message={error?.message || 'Failed to load letters of recommendation'} 
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Letters of Recommendation</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {lors && lors.length === 0 ? (
        <EmptyState
          icon="📄"
          title="No LORs yet"
          message="Upload your first letter of recommendation"
        />
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
});
