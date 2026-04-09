import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { verificationService, VerificationHistoryItem } from '@/services/verification.service';
import { COLORS } from '@/utils/constants';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/utils/formatters';

const getResultColor = (result: string) => {
  switch (result) {
    case 'VERIFIED':
      return COLORS.success;
    case 'REVOKED':
      return COLORS.danger;
    case 'NOT_FOUND':
      return COLORS.warning;
    default:
      return COLORS.textMuted;
  }
};

const getResultIcon = (result: string) => {
  switch (result) {
    case 'VERIFIED':
      return '✅';
    case 'REVOKED':
      return '🚫';
    case 'NOT_FOUND':
      return '❓';
    default:
      return '📋';
  }
};

function HistoryCard({ item }: { item: VerificationHistoryItem }) {
  return (
    <Card>
      <View style={styles.cardHeader}>
        <Text style={styles.resultIcon}>{getResultIcon(item.result)}</Text>
        <View style={styles.cardHeaderText}>
          <Text style={[styles.resultText, { color: getResultColor(item.result) }]}>
            {item.result.replace('_', ' ')}
          </Text>
          <Text style={styles.dateText}>{formatDate(item.verifiedAt)}</Text>
        </View>
      </View>
      
      {item.lor && (
        <View style={styles.lorDetails}>
          <Text style={styles.lorTitle}>{item.lor.title}</Text>
          <Text style={styles.lorSubject}>{item.lor.subject}</Text>
          {item.lor.student && (
            <Text style={styles.lorInfo}>Student: {item.lor.student.fullName}</Text>
          )}
          {item.lor.teacher && (
            <Text style={styles.lorInfo}>Teacher: {item.lor.teacher.fullName}</Text>
          )}
          {item.lor.institution && (
            <Text style={styles.lorInfo}>Institution: {item.lor.institution.name}</Text>
          )}
        </View>
      )}
    </Card>
  );
}

export default function HistoryScreen() {
  const { data: history, isLoading, refetch } = useQuery({
    queryKey: ['verification-history'],
    queryFn: () => verificationService.getMyHistory(),
  });

  if (!isLoading && (!history || history.length === 0)) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No Verification History</Text>
          <Text style={styles.emptySubtext}>
            Documents you verify will appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryCard item={item} />}
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
  list: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  lorDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  lorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  lorSubject: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  lorInfo: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
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
