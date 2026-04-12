import React from 'react';
import { View, Text } from 'react-native';
import { VerificationResponse, VerifyResult } from '@/utils/shared';
import { Card } from './ui/Card';
import { VerifyBadge } from './ui/Badge';
import { useTheme } from '@/stores/themeStore';
import { formatDateTime } from '@/utils/formatters';

interface VerificationResultProps {
  result: VerificationResponse;
}

export function VerificationResultView({ result }: VerificationResultProps) {
  const { colors, typography, spacing } = useTheme();

  const getIcon = () => {
    switch (result.result) {
      case VerifyResult.VERIFIED: return '✅';
      case VerifyResult.NOT_FOUND: return '❌';
      case VerifyResult.REVOKED: return '🚫';
      default: return '❓';
    }
  };

  const getMessage = () => {
    switch (result.result) {
      case VerifyResult.VERIFIED: return 'This letter of recommendation is authentic and valid.';
      case VerifyResult.NOT_FOUND: return 'This document could not be verified. It may not be an authentic LORVault document.';
      case VerifyResult.REVOKED: return 'This letter of recommendation has been revoked and is no longer valid.';
      default: return 'Unable to determine verification status.';
    }
  };

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <Text style={{ fontSize: 32, marginRight: spacing.sm }}>{getIcon()}</Text>
        <VerifyBadge result={result.result} />
      </View>

      <Text style={{ ...typography.bodyLg, color: colors.onSurface, marginBottom: spacing.md }}>
        {getMessage()}
      </Text>

      {result.lor && (
        <View style={{ backgroundColor: colors.surfaceContainerLow, borderRadius: 8, padding: spacing.sm, marginBottom: spacing.sm }}>
          <Text style={{ ...typography.titleSm, color: colors.onSurface, marginBottom: spacing.sm }}>Document Details</Text>

          {[
            { label: 'Title', value: result.lor.title },
            { label: 'Subject', value: result.lor.subject },
            { label: 'Student', value: result.lor.studentName },
            { label: 'Teacher', value: result.lor.teacherName },
            { label: 'Institution', value: result.lor.institutionName },
            result.lor.approvedAt ? { label: 'Approved', value: formatDateTime(result.lor.approvedAt) } : null,
          ]
            .filter(Boolean)
            .map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>{item!.label}</Text>
                <Text style={{ ...typography.bodySm, color: colors.onSurface, fontFamily: 'Inter_500Medium', flex: 1, textAlign: 'right', marginLeft: 12 }}>
                  {item!.value}
                </Text>
              </View>
            ))}

          {result.lor.revokedAt && (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>Revoked</Text>
                <Text style={{ ...typography.bodySm, color: colors.error, fontFamily: 'Inter_500Medium' }}>{formatDateTime(result.lor.revokedAt)}</Text>
              </View>
              {result.lor.revokeReason && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant }}>Reason</Text>
                  <Text style={{ ...typography.bodySm, color: colors.error, flex: 1, textAlign: 'right', marginLeft: 12 }}>{result.lor.revokeReason}</Text>
                </View>
              )}
            </>
          )}
        </View>
      )}

      <Text style={{ ...typography.bodySm, color: colors.outline, textAlign: 'center' }}>
        Verified at: {formatDateTime(result.verifiedAt)}
      </Text>
    </Card>
  );
}
