import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Lor } from '@/utils/shared';
import { Card, CardHeader } from './ui/Card';
import { StatusBadge } from './ui/Badge';
import { COLORS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';

interface LorCardProps {
  lor: Lor;
  onPress: () => void;
  showStudent?: boolean;
  showTeacher?: boolean;
}

export function LorCard({ lor, onPress, showStudent = true, showTeacher = false }: LorCardProps) {
  return (
    <Card onPress={onPress}>
      <CardHeader
        title={lor.title}
        subtitle={lor.subject}
        right={<StatusBadge status={lor.status} />}
      />
      <View style={styles.details}>
        {showStudent && lor.student && (
          <View style={styles.row}>
            <Text style={styles.label}>Student:</Text>
            <Text style={styles.value}>{lor.student.fullName}</Text>
          </View>
        )}
        {showTeacher && lor.teacher && (
          <View style={styles.row}>
            <Text style={styles.label}>Teacher:</Text>
            <Text style={styles.value}>{lor.teacher.fullName}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Submitted:</Text>
          <Text style={styles.value}>{formatDate(lor.submittedAt)}</Text>
        </View>
        {lor.status === 'APPROVED' && lor.approvedAt && (
          <View style={styles.row}>
            <Text style={styles.label}>Approved:</Text>
            <Text style={styles.value}>{formatDate(lor.approvedAt)}</Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  details: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  value: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
});
