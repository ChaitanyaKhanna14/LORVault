import React, { useState } from 'react';
import { View, Text, TextInput as RNTextInput, TextInputProps as RNTextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '@/stores/themeStore';

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, style, containerStyle, onFocus, onBlur, ...props }: InputProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBackgroundColor = () => {
    if (isFocused) return colors.primaryContainer + '40'; // 25% opacity tint
    return colors.surfaceContainerLow;
  };

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.outlineVariant + '26'; // 15% opacity — ghost border
  };

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label && (
        <Text
          style={{
            ...typography.labelLg,
            color: isFocused ? colors.primary : colors.onSurfaceVariant,
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      <RNTextInput
        style={[
          {
            backgroundColor: getBackgroundColor(),
            borderRadius: radius.md,
            paddingVertical: 16,
            paddingHorizontal: 16,
            fontSize: typography.bodyLg.fontSize,
            fontFamily: typography.bodyLg.fontFamily,
            color: colors.onSurface,
            borderWidth: 1,
            borderColor: getBorderColor(),
          },
          style,
        ]}
        placeholderTextColor={colors.onSurfaceVariant + '80'} // 50% opacity
        cursorColor={colors.primary}
        selectionColor={colors.primaryContainer}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && (
        <Text
          style={{
            ...typography.bodySm,
            color: colors.error,
            marginTop: spacing.xxs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
