import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { lorService } from '@/services/lor.service';
import { COLORS } from '@/utils/constants';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';

export default function LorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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
    } catch (err) {
      Alert.alert('Error', 'Failed to open PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !lor) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorText}>Failed to load LOR details</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'LOR Details',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container}>
        <Card>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{lor.title}</Text>
              <Text style={styles.subject}>{lor.subject}</Text>
            </View>
            <StatusBadge status={lor.status} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Student</Text>
            <Text style={styles.sectionValue}>{lor.student?.fullName || 'N/A'}</Text>
            {lor.student?.email && (
              <Text style={styles.sectionSubvalue}>{lor.student.email}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Institution</Text>
            <Text style={styles.sectionValue}>{lor.institution?.name || 'N/A'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <Text style={styles.timelineLabel}>Submitted</Text>
                <Text style={styles.timelineValue}>{formatDate(lor.submittedAt)}</Text>
              </View>
              {lor.approvedAt && (
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Approved</Text>
                  <Text style={styles.timelineValue}>{formatDate(lor.approvedAt)}</Text>
                </View>
              )}
              {lor.revokedAt && (
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Revoked</Text>
                  <Text style={styles.timelineValue}>{formatDate(lor.revokedAt)}</Text>
                </View>
              )}
            </View>
          </View>

          {lor.rejectionReason && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rejection Reason</Text>
              <Text style={styles.rejectionText}>{lor.rejectionReason}</Text>
            </View>
          )}

          {lor.revokeReason && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Revoke Reason</Text>
              <Text style={styles.rejectionText}>{lor.revokeReason}</Text>
            </View>
          )}

          {lor.hash && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Document Hash</Text>
              <Text style={styles.hashText} numberOfLines={2}>{lor.hash}</Text>
            </View>
          )}
        </Card>

        <View style={styles.actions}>
          <Button
            title="View Original PDF"
            onPress={() => handleDownloadPdf('original')}
            variant="outline"
            loading={isDownloading}
            style={styles.actionButton}
          />
          {lor.status === 'APPROVED' && lor.canonicalPdfUrl && (
            <Button
              title="View Approved PDF (with QR)"
              onPress={() => handleDownloadPdf('canonical')}
              loading={isDownloading}
              style={styles.actionButton}
            />
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  subject: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  sectionSubvalue: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timelineLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  timelineValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  rejectionText: {
    fontSize: 14,
    color: COLORS.danger,
    fontStyle: 'italic',
  },
  hashText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  actions: {
    marginTop: 24,
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
});
