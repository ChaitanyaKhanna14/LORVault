import { useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { lorService } from '@/services/lor.service';
import { LorCard } from '@/components/LorCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/stores/themeStore';

export default function TeacherDashboard() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

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
    router.push(`/(teacher)/lor/${lorId}` as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing['4xl'] + 16,
          paddingBottom: spacing.lg,
        }}
      >
        <Text style={{ ...typography.displayMd, color: colors.onSurface }}>
          My Letters
        </Text>
        <Text style={{ ...typography.bodyLg, color: colors.onSurfaceVariant, marginTop: spacing.xxs }}>
          Letters of recommendation you've written
        </Text>
      </View>

      {lors && lors.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No LORs yet"
          message="Upload your first letter of recommendation"
        />
      ) : (
        <FlatList
          data={lors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: spacing.xl }}>
              <LorCard lor={item} onPress={() => handleLorPress(item.id)} showStudent />
            </View>
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
