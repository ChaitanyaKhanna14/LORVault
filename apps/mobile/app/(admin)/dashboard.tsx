import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/utils/constants';
import { useAuthStore } from '@/stores/authStore';

interface Stats {
  totalLors: number;
  pendingLors: number;
  approvedLors: number;
  rejectedLors: number;
  totalTeachers: number;
  totalStudents: number;
}

export default function AdminDashboard() {
  const { logout } = useAuthStore();

  const { data: stats, isLoading, refetch } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/institutions/my-stats');
      return res.data;
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { borderLeftColor: COLORS.warning }]}>
          <Text style={styles.statNumber}>{stats?.pendingLors ?? '-'}</Text>
          <Text style={styles.statLabel}>Pending Review</Text>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: COLORS.secondary }]}>
          <Text style={styles.statNumber}>{stats?.approvedLors ?? '-'}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: COLORS.danger }]}>
          <Text style={styles.statNumber}>{stats?.rejectedLors ?? '-'}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
          <Text style={styles.statNumber}>{stats?.totalLors ?? '-'}</Text>
          <Text style={styles.statLabel}>Total LORs</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Users</Text>

      <View style={styles.userStats}>
        <Card style={styles.userCard}>
          <Text style={styles.userIcon}>👨‍🏫</Text>
          <Text style={styles.userNumber}>{stats?.totalTeachers ?? '-'}</Text>
          <Text style={styles.userLabel}>Teachers</Text>
        </Card>

        <Card style={styles.userCard}>
          <Text style={styles.userIcon}>👨‍🎓</Text>
          <Text style={styles.userNumber}>{stats?.totalStudents ?? '-'}</Text>
          <Text style={styles.userLabel}>Students</Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  logout: {
    color: COLORS.danger,
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 12,
    borderLeftWidth: 4,
    padding: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userCard: {
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    padding: 20,
  },
  userIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  userNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  userLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
