import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '@/stores/themeStore';
import { LorStatus, VerifyResult } from '@/utils/shared';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export function Badge({ label, color, backgroundColor, style }: BadgeProps) {
  const { colors, typography, radius } = useTheme();
  const textColor = color || colors.primary;
  const bgColor = backgroundColor || (textColor + '1A'); // 10% opacity fallback

  return (
    <View
      style={[
        {
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: radius.full,
          alignSelf: 'flex-start',
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      <Text
        style={{
          ...typography.labelSm,
          color: textColor,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

interface StatusBadgeProps {
  status: LorStatus;
  style?: ViewStyle;
}

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const { colors } = useTheme();

  const config: Record<LorStatus, { label: string; color: string; bg: string }> = {
    SUBMITTED: {
      label: 'PENDING',
      color: colors.primary,
      bg: colors.primaryContainer,
    },
    APPROVED: {
      label: 'VERIFIED',
      color: colors.secondary,
      bg: colors.secondaryContainer,
    },
    REJECTED: {
      label: 'REJECTED',
      color: colors.error,
      bg: colors.errorContainer + '40', // 25% opacity
    },
    REVOKED: {
      label: 'REVOKED',
      color: colors.outline,
      bg: colors.surfaceContainerHigh,
    },
  };

  const { label, color, bg } = config[status];

  return (
    <Badge
      label={label}
      color={color}
      backgroundColor={bg}
      style={style}
    />
  );
}

interface VerifyBadgeProps {
  result: VerifyResult;
  style?: ViewStyle;
}

export function VerifyBadge({ result, style }: VerifyBadgeProps) {
  const { colors } = useTheme();

  const config: Record<VerifyResult, { label: string; color: string; bg: string }> = {
    VERIFIED: {
      label: 'VERIFIED ON LEDGER',
      color: colors.secondary,
      bg: colors.secondaryContainer,
    },
    NOT_FOUND: {
      label: 'NOT FOUND',
      color: colors.error,
      bg: colors.errorContainer + '40',
    },
    REVOKED: {
      label: 'REVOKED',
      color: colors.outline,
      bg: colors.surfaceContainerHigh,
    },
  };

  const { label, color, bg } = config[result];

  return (
    <Badge
      label={label}
      color={color}
      backgroundColor={bg}
      style={style}
    />
  );
}
