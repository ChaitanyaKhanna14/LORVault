import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/stores/themeStore';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  /** Use 'elevated' for ambient shadow, 'filled' for bg color only */
  variant?: 'elevated' | 'filled' | 'outlined';
}

export function Card({ children, style, onPress, variant = 'elevated' }: CardProps) {
  const { colors, shadows, radius } = useTheme();
  const Container = onPress ? TouchableOpacity : View;

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surfaceContainerLowest,
          ...shadows.card,
        };
      case 'filled':
        return {
          backgroundColor: colors.surfaceContainerLow,
        };
      case 'outlined':
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: colors.outlineVariant + '26', // 15% opacity
        };
      default:
        return {
          backgroundColor: colors.surfaceContainerLowest,
        };
    }
  };

  return (
    <Container
      style={[
        {
          borderRadius: radius['2xl'],
          padding: 24,
          marginBottom: 12,
        },
        getVariantStyle(),
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function CardHeader({ title, subtitle, right }: CardHeaderProps) {
  const { colors, typography } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
      }}
    >
      <View style={{ flex: 1, marginRight: right ? 12 : 0 }}>
        <Text
          style={{
            ...typography.titleLg,
            color: colors.onSurface,
            marginBottom: subtitle ? 4 : 0,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              ...typography.bodyMd,
              color: colors.onSurfaceVariant,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}
