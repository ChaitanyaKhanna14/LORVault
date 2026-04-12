import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/stores/themeStore';
import { Typography as TypographyTokens } from '@/utils/theme';

// ---------------------------------------------------------------------------
// Base themed text component
// ---------------------------------------------------------------------------

interface ThemedTextProps extends TextProps {
  color?: string;
}

function ThemedText({ style, color, ...props }: ThemedTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[{ color: color || colors.onSurface }, style]}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Display — Largest editorial headlines (Manrope)
// ---------------------------------------------------------------------------

export function DisplayLg({ style, ...props }: ThemedTextProps) {
  return <ThemedText style={[TypographyTokens.displayLg, style]} {...props} />;
}

export function DisplayMd({ style, ...props }: ThemedTextProps) {
  return <ThemedText style={[TypographyTokens.displayMd, style]} {...props} />;
}

// ---------------------------------------------------------------------------
// Headline — Section headers (Manrope)
// ---------------------------------------------------------------------------

export function HeadlineLg({ style, ...props }: ThemedTextProps) {
  return <ThemedText style={[TypographyTokens.headlineLg, style]} {...props} />;
}

export function HeadlineMd({ style, ...props }: ThemedTextProps) {
  return <ThemedText style={[TypographyTokens.headlineMd, style]} {...props} />;
}

export function HeadlineSm({ style, ...props }: ThemedTextProps) {
  return <ThemedText style={[TypographyTokens.headlineSm, style]} {...props} />;
}

// ---------------------------------------------------------------------------
// Title — Card titles and emphasis (Manrope/Inter)
// ---------------------------------------------------------------------------

export function TitleLg({ style, ...props }: ThemedTextProps) {
  return <ThemedText style={[TypographyTokens.titleLg, style]} {...props} />;
}

export function TitleMd({ style, ...props }: ThemedTextProps) {
  return <ThemedText style={[TypographyTokens.titleMd, style]} {...props} />;
}

export function TitleSm({ style, ...props }: ThemedTextProps) {
  return <ThemedText style={[TypographyTokens.titleSm, style]} {...props} />;
}

// ---------------------------------------------------------------------------
// Body — Readable content (Inter)
// ---------------------------------------------------------------------------

export function BodyLg({ style, ...props }: ThemedTextProps) {
  const { colors } = useTheme();
  return <ThemedText color={colors.onSurface} style={[TypographyTokens.bodyLg, style]} {...props} />;
}

export function BodyMd({ style, ...props }: ThemedTextProps) {
  const { colors } = useTheme();
  return <ThemedText color={colors.onSurfaceVariant} style={[TypographyTokens.bodyMd, style]} {...props} />;
}

export function BodySm({ style, ...props }: ThemedTextProps) {
  const { colors } = useTheme();
  return <ThemedText color={colors.onSurfaceVariant} style={[TypographyTokens.bodySm, style]} {...props} />;
}

// ---------------------------------------------------------------------------
// Label — UI labels, chips, captions (Inter Medium)
// ---------------------------------------------------------------------------

export function LabelLg({ style, ...props }: ThemedTextProps) {
  return <ThemedText style={[TypographyTokens.labelLg, style]} {...props} />;
}

export function LabelMd({ style, ...props }: ThemedTextProps) {
  const { colors } = useTheme();
  return <ThemedText color={colors.onSurfaceVariant} style={[TypographyTokens.labelMd, style]} {...props} />;
}

export function LabelSm({ style, ...props }: ThemedTextProps) {
  const { colors } = useTheme();
  return <ThemedText color={colors.onSurfaceVariant} style={[TypographyTokens.labelSm, style]} {...props} />;
}
