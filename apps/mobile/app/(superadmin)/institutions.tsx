import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/stores/themeStore';

export default function InstitutionsScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const { data: institutions, isLoading, refetch } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => {
      const res = await api.get('/institutions');
      return res.data;
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {institutions && institutions.length === 0 ? (
        <EmptyState
          icon="🏛️"
          title="No Institutions"
          message="Create your first institution to get started."
        />
      ) : (
        <FlatList
          data={institutions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: spacing.xl }}>
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
                  <Text style={{ ...typography.titleLg, color: colors.onSurface, flex: 1 }}>{item.name}</Text>
                  <Badge label={item.code} color={colors.secondary} backgroundColor={colors.secondaryContainer} />
                </View>
                {item.domain && (
                  <Text style={{ ...typography.bodyMd, color: colors.onSurfaceVariant, marginBottom: spacing.xs }}>
                    {item.domain}
                  </Text>
                )}
                <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs }}>
                  <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>
                    👥 {item._count?.users || 0} users
                  </Text>
                  <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>
                    📄 {item._count?.lors || 0} LORs
                  </Text>
                </View>
              </Card>
            </View>
          )}
          contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing['2xl'] }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.secondary} colors={[colors.secondary]} />
          }
        />
      )}
    </View>
  );
}
