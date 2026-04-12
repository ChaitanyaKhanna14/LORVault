import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/stores/themeStore';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing['2xl'],
      }}
    >
      <Text style={{ fontSize: 64, marginBottom: spacing.md }}>{icon}</Text>
      <Text
        style={{
          ...typography.headlineSm,
          color: colors.onSurface,
          marginBottom: spacing.xs,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          ...typography.bodyMd,
          color: colors.onSurfaceVariant,
          textAlign: 'center',
          maxWidth: 280,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
