import { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { lorService } from '@/services/lor.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { useTheme } from '@/stores/themeStore';
import { formatDate } from '@/utils/formatters';

export default function LorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: lor, isLoading, error } = useQuery({
    queryKey: ['lor', id],
    queryFn: () => lorService.getById(id!),
    enabled: !!id,
  });

  const handleDownloadPdf = async (type: 'original' | 'canonical') => {
    try {
      setIsDownloading(true);
      const url = await lorService.getPdfUrl(id!, type);
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Failed to open PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !lor) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, padding: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: spacing.md }}>❌</Text>
        <Text style={{ ...typography.titleLg, color: colors.onSurface, marginBottom: spacing.xl }}>Failed to load LOR details</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'LOR Details', headerBackTitle: 'Back' }} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.surface, padding: spacing.xl }}>
        <Card>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Text style={{ ...typography.headlineSm, color: colors.onSurface }}>{lor.title}</Text>
              <Text style={{ ...typography.bodyMd, color: colors.onSurfaceVariant, marginTop: 4 }}>{lor.subject}</Text>
            </View>
            <StatusBadge status={lor.status} />
          </View>

          {/* Student */}
          <View style={{ backgroundColor: colors.surfaceContainerLow, borderRadius: 8, padding: spacing.sm, marginBottom: spacing.md }}>
            <Text style={{ ...typography.labelMd, color: colors.onSurfaceVariant, marginBottom: 4 }}>Student</Text>
            <Text style={{ ...typography.titleSm, color: colors.onSurface }}>{lor.student?.fullName || 'N/A'}</Text>
            {lor.student?.email && (
              <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 }}>{lor.student.email}</Text>
            )}
          </View>

          {/* Institution */}
          <View style={{ backgroundColor: colors.surfaceContainerLow, borderRadius: 8, padding: spacing.sm, marginBottom: spacing.md }}>
            <Text style={{ ...typography.labelMd, color: colors.onSurfaceVariant, marginBottom: 4 }}>Institution</Text>
            <Text style={{ ...typography.titleSm, color: colors.onSurface }}>{lor.institution?.name || 'N/A'}</Text>
          </View>

          {/* Timeline */}
          <View style={{ backgroundColor: colors.surfaceContainerLow, borderRadius: 8, padding: spacing.sm, marginBottom: spacing.md }}>
            <Text style={{ ...typography.labelMd, color: colors.onSurfaceVariant, marginBottom: spacing.xs }}>Timeline</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>Submitted</Text>
              <Text style={{ ...typography.bodySm, color: colors.onSurface, fontFamily: 'Inter_500Medium' }}>{formatDate(lor.submittedAt)}</Text>
            </View>
            {lor.approvedAt && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>Approved</Text>
                <Text style={{ ...typography.bodySm, color: colors.onSurface, fontFamily: 'Inter_500Medium' }}>{formatDate(lor.approvedAt)}</Text>
              </View>
            )}
            {lor.revokedAt && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>Revoked</Text>
                <Text style={{ ...typography.bodySm, color: colors.error, fontFamily: 'Inter_500Medium' }}>{formatDate(lor.revokedAt)}</Text>
              </View>
            )}
          </View>

          {/* Rejection/Revoke Reason */}
          {lor.rejectionReason && (
            <View style={{ backgroundColor: colors.errorContainer + '1A', borderRadius: 8, padding: spacing.sm, marginBottom: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.error }}>
              <Text style={{ ...typography.labelMd, color: colors.error, marginBottom: 2 }}>Rejection Reason</Text>
              <Text style={{ ...typography.bodyMd, color: colors.onSurface, fontStyle: 'italic' }}>{lor.rejectionReason}</Text>
            </View>
          )}

          {lor.revokeReason && (
            <View style={{ backgroundColor: colors.surfaceContainerHigh, borderRadius: 8, padding: spacing.sm, marginBottom: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.outline }}>
              <Text style={{ ...typography.labelMd, color: colors.outline, marginBottom: 2 }}>Revoke Reason</Text>
              <Text style={{ ...typography.bodyMd, color: colors.onSurface, fontStyle: 'italic' }}>{lor.revokeReason}</Text>
            </View>
          )}

          {/* Document Hash */}
          {lor.hash && (
            <View style={{ backgroundColor: colors.surfaceContainerLow, borderRadius: 8, padding: spacing.sm }}>
              <Text style={{ ...typography.labelMd, color: colors.onSurfaceVariant, marginBottom: 4 }}>Document Hash</Text>
              <Text style={{ fontSize: 11, color: colors.onSurfaceVariant, fontFamily: 'monospace' }} numberOfLines={2}>{lor.hash}</Text>
            </View>
          )}
        </Card>

        {/* Actions */}
        <View style={{ marginTop: spacing.xl, marginBottom: spacing['2xl'], gap: spacing.sm }}>
          <Button title="View Original PDF" onPress={() => handleDownloadPdf('original')} variant="outline" loading={isDownloading} />
          {lor.status === 'APPROVED' && lor.canonicalPdfUrl && (
            <Button title="View Approved PDF (with QR)" onPress={() => handleDownloadPdf('canonical')} loading={isDownloading} />
          )}
        </View>
      </ScrollView>
    </>
  );
}
