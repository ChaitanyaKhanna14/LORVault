import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/stores/themeStore';

interface Stats {
  totalLors: number;
  pendingLors: number;
  approvedLors: number;
  rejectedLors: number;
  totalTeachers: number;
  totalStudents: number;
}

export default function AdminDashboard() {
  const { colors, typography, spacing } = useTheme();

  const { data: stats, isLoading, refetch } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/institutions/my-stats');
      return res.data;
    },
  });

  const statCards = [
    { label: 'Pending Review', value: stats?.pendingLors, bg: colors.primaryContainer + '40', accent: colors.primary },
    { label: 'Approved', value: stats?.approvedLors, bg: colors.secondaryContainer + '40', accent: colors.secondary },
    { label: 'Rejected', value: stats?.rejectedLors, bg: colors.errorContainer + '30', accent: colors.error },
    { label: 'Total LORs', value: stats?.totalLors, bg: colors.surfaceContainerLow, accent: colors.onSurface },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
      }
    >
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'] + 16, paddingBottom: spacing.lg }}>
        <Text style={{ ...typography.displayMd, color: colors.onSurface }}>Dashboard</Text>
        <Text style={{ ...typography.bodyLg, color: colors.onSurfaceVariant, marginTop: spacing.xxs }}>
          Institution overview
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl - 6 }}>
        {statCards.map((stat, index) => (
          <View key={index} style={{ width: '50%', paddingHorizontal: 6, marginBottom: spacing.sm }}>
            <Card
              variant="filled"
              style={{ backgroundColor: stat.bg, paddingVertical: spacing.lg }}
            >
              <Text style={{ ...typography.displayMd, color: stat.accent }}>
                {stat.value ?? '—'}
              </Text>
              <Text style={{ ...typography.labelMd, color: colors.onSurfaceVariant, marginTop: spacing.xxs }}>
                {stat.label}
              </Text>
            </Card>
          </View>
        ))}
      </View>

      {/* Users Section */}
      <Text
        style={{
          ...typography.headlineSm,
          color: colors.onSurface,
          paddingHorizontal: spacing.xl,
          marginTop: spacing.lg,
          marginBottom: spacing.sm,
        }}
      >
        Users
      </Text>

      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.sm }}>
        <Card style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.lg }}>
          <Text style={{ fontSize: 32, marginBottom: spacing.xs }}>👨‍🏫</Text>
          <Text style={{ ...typography.headlineLg, color: colors.onSurface }}>{stats?.totalTeachers ?? '—'}</Text>
          <Text style={{ ...typography.labelMd, color: colors.onSurfaceVariant, marginTop: 2 }}>Teachers</Text>
        </Card>

        <Card style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.lg }}>
          <Text style={{ fontSize: 32, marginBottom: spacing.xs }}>👨‍🎓</Text>
          <Text style={{ ...typography.headlineLg, color: colors.onSurface }}>{stats?.totalStudents ?? '—'}</Text>
          <Text style={{ ...typography.labelMd, color: colors.onSurfaceVariant, marginTop: 2 }}>Students</Text>
        </Card>
      </View>
    </ScrollView>
  );
}
