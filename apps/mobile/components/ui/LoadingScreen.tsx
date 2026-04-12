import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '@/stores/themeStore';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <Text
        style={{
          ...typography.bodyMd,
          color: colors.onSurfaceVariant,
          marginTop: spacing.md,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
