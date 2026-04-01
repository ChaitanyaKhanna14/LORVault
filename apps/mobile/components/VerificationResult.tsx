import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VerificationResponse, VerifyResult } from '@/utils/shared';
import { Card } from './ui/Card';
import { VerifyBadge } from './ui/Badge';
import { COLORS, VERIFY_COLORS } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';

interface VerificationResultProps {
  result: VerificationResponse;
}

export function VerificationResultView({ result }: VerificationResultProps) {
  const getIcon = () => {
    switch (result.result) {
      case VerifyResult.VERIFIED:
        return '✅';
      case VerifyResult.NOT_FOUND:
        return '❌';
      case VerifyResult.REVOKED:
        return '🚫';
      default:
        return '❓';
    }
  };

  const getMessage = () => {
    switch (result.result) {
      case VerifyResult.VERIFIED:
        return 'This letter of recommendation is authentic and valid.';
      case VerifyResult.NOT_FOUND:
        return 'This document could not be verified. It may not be an authentic LORVault document.';
      case VerifyResult.REVOKED:
        return 'This letter of recommendation has been revoked and is no longer valid.';
      default:
        return 'Unable to determine verification status.';
    }
  };

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <VerifyBadge result={result.result} />
      </View>

      <Text style={styles.message}>{getMessage()}</Text>

      {result.lor && (
        <View style={styles.details}>
          <Text style={styles.sectionTitle}>Document Details</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Title:</Text>
            <Text style={styles.value}>{result.lor.title}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Subject:</Text>
            <Text style={styles.value}>{result.lor.subject}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Student:</Text>
            <Text style={styles.value}>{result.lor.studentName}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Teacher:</Text>
            <Text style={styles.value}>{result.lor.teacherName}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Institution:</Text>
            <Text style={styles.value}>{result.lor.institutionName}</Text>
          </View>

          {result.lor.approvedAt && (
            <View style={styles.row}>
              <Text style={styles.label}>Approved:</Text>
              <Text style={styles.value}>{formatDateTime(result.lor.approvedAt)}</Text>
            </View>
          )}

          {result.lor.revokedAt && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Revoked:</Text>
                <Text style={[styles.value, { color: COLORS.danger }]}>
                  {formatDateTime(result.lor.revokedAt)}
                </Text>
              </View>
              {result.lor.revokeReason && (
                <View style={styles.row}>
                  <Text style={styles.label}>Reason:</Text>
                  <Text style={[styles.value, { color: COLORS.danger }]}>
                    {result.lor.revokeReason}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}

      <Text style={styles.timestamp}>
        Verified at: {formatDateTime(result.verifiedAt)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  message: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  details: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  value: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
