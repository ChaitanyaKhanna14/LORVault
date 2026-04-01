import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, STATUS_COLORS, VERIFY_COLORS } from '@/utils/constants';
import { LorStatus, VerifyResult } from '@/utils/shared';

interface BadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}

export function Badge({ label, color = COLORS.primary, style }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

interface StatusBadgeProps {
  status: LorStatus;
  style?: ViewStyle;
}

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const labels: Record<LorStatus, string> = {
    SUBMITTED: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    REVOKED: 'Revoked',
  };

  return (
    <Badge
      label={labels[status]}
      color={STATUS_COLORS[status]}
      style={style}
    />
  );
}

interface VerifyBadgeProps {
  result: VerifyResult;
  style?: ViewStyle;
}

export function VerifyBadge({ result, style }: VerifyBadgeProps) {
  const labels: Record<VerifyResult, string> = {
    VERIFIED: 'Verified',
    NOT_FOUND: 'Not Found',
    REVOKED: 'Revoked',
  };

  return (
    <Badge
      label={labels[result]}
      color={VERIFY_COLORS[result]}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
