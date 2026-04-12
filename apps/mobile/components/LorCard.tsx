import React from 'react';
import { Text, View } from 'react-native';
import { Lor } from '@/utils/shared';
import { Card, CardHeader } from './ui/Card';
import { StatusBadge } from './ui/Badge';
import { useTheme } from '@/stores/themeStore';
import { formatDate } from '@/utils/formatters';

interface LorCardProps {
  lor: Lor;
  onPress: () => void;
  showStudent?: boolean;
  showTeacher?: boolean;
}

export function LorCard({ lor, onPress, showStudent = true, showTeacher = false }: LorCardProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <Card onPress={onPress}>
      <CardHeader
        title={lor.title}
        subtitle={lor.subject}
        right={<StatusBadge status={lor.status} />}
      />
      <View
        style={{
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: 8,
          padding: spacing.sm,
        }}
      >
        {showStudent && lor.student && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>Student</Text>
            <Text style={{ ...typography.bodySm, color: colors.onSurface, fontFamily: 'Inter_500Medium' }}>{lor.student.fullName}</Text>
          </View>
        )}
        {showTeacher && lor.teacher && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>Teacher</Text>
            <Text style={{ ...typography.bodySm, color: colors.onSurface, fontFamily: 'Inter_500Medium' }}>{lor.teacher.fullName}</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: lor.status === 'APPROVED' && lor.approvedAt ? 4 : 0 }}>
          <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>Submitted</Text>
          <Text style={{ ...typography.bodySm, color: colors.onSurface, fontFamily: 'Inter_500Medium' }}>{formatDate(lor.submittedAt)}</Text>
        </View>
        {lor.status === 'APPROVED' && lor.approvedAt && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>Approved</Text>
            <Text style={{ ...typography.bodySm, color: colors.onSurface, fontFamily: 'Inter_500Medium' }}>{formatDate(lor.approvedAt)}</Text>
          </View>
        )}
      </View>
    </Card>
  );
}
