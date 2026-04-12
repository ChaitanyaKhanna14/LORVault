import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/stores/themeStore';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing['2xl'],
        backgroundColor: colors.surface,
      }}
    >
      <Text style={{ fontSize: 48, marginBottom: spacing.md }}>⚠️</Text>
      <Text
        style={{
          ...typography.headlineSm,
          color: colors.onSurface,
          marginBottom: spacing.xs,
        }}
      >
        Something went wrong
      </Text>
      <Text
        style={{
          ...typography.bodyMd,
          color: colors.onSurfaceVariant,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}
      >
        {message}
      </Text>
      {onRetry && (
        <Button title="Try Again" onPress={onRetry} variant="primary" />
      )}
    </View>
  );
}

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.errorContainer + '30',
        borderLeftWidth: 4,
        borderLeftColor: colors.error,
        padding: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ ...typography.bodyMd, color: colors.error, flex: 1 }}>
        {message}
      </Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss}>
          <Text style={{ color: colors.error, fontSize: 18, paddingLeft: spacing.sm }}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
