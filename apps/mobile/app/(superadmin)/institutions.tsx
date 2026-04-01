import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { COLORS } from '@/utils/constants';
import { useAuthStore } from '@/stores/authStore';

export default function InstitutionsScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const { data: institutions, isLoading, refetch } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => {
      const res = await api.get('/institutions');
      return res.data;
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Institutions</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="+ Create Institution"
        onPress={() => router.push('/(superadmin)/create-institution')}
        style={styles.createButton}
      />

      <FlatList
        data={institutions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.code}>{item.code}</Text>
            </View>
            {item.domain && (
              <Text style={styles.domain}>{item.domain}</Text>
            )}
            <View style={styles.stats}>
              <Text style={styles.stat}>👥 {item._count?.users || 0} users</Text>
              <Text style={styles.stat}>📄 {item._count?.lors || 0} LORs</Text>
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
  createButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  code: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  domain: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  stat: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
