import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { verificationService, VerificationHistoryItem } from '@/services/verification.service';
import { Card } from '@/components/ui/Card';
import { VerifyBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/stores/themeStore';
import { formatDate } from '@/utils/formatters';

const getResultIcon = (result: string) => {
  switch (result) {
    case 'VERIFIED': return '✅';
    case 'REVOKED': return '🚫';
    case 'NOT_FOUND': return '❓';
    default: return '📋';
  }
};

function HistoryCard({ item }: { item: VerificationHistoryItem }) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={{ paddingHorizontal: spacing.xl }}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: item.lor ? spacing.md : 0 }}>
          <Text style={{ fontSize: 32, marginRight: spacing.sm }}>{getResultIcon(item.result)}</Text>
          <View style={{ flex: 1 }}>
            <VerifyBadge result={item.result as any} />
            <Text style={{ ...typography.bodySm, color: colors.outline, marginTop: 4 }}>
              {formatDate(item.verifiedAt)}
            </Text>
          </View>
        </View>

        {item.lor && (
          <View style={{ backgroundColor: colors.surfaceContainerLow, borderRadius: 8, padding: spacing.sm }}>
            <Text style={{ ...typography.titleSm, color: colors.onSurface }}>{item.lor.title}</Text>
            <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 }}>{item.lor.subject}</Text>
            {item.lor.student && (
              <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 4 }}>
                Student: {item.lor.student.fullName}
              </Text>
            )}
            {item.lor.teacher && (
              <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 }}>
                Teacher: {item.lor.teacher.fullName}
              </Text>
            )}
            {item.lor.institution && (
              <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 }}>
                Institution: {item.lor.institution.name}
              </Text>
            )}
          </View>
        )}
      </Card>
    </View>
  );
}

export default function HistoryScreen() {
  const { colors } = useTheme();

  const { data: history, isLoading, refetch } = useQuery({
    queryKey: ['verification-history'],
    queryFn: () => verificationService.getMyHistory(),
  });

  if (!isLoading && (!history || history.length === 0)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <EmptyState
          icon="📋"
          title="No Verification History"
          message="Documents you verify will appear here"
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryCard item={item} />}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
        }
      />
    </View>
  );
}
