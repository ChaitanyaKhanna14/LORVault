import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/stores/themeStore';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.surfaceContainerHigh,
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  const { colors, radius, spacing } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: radius['2xl'],
        padding: spacing.xl,
        marginBottom: spacing.md,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Skeleton height={18} width="70%" style={{ marginBottom: 8 }} />
          <Skeleton height={14} width="40%" />
        </View>
        <Skeleton width={80} height={26} borderRadius={9999} />
      </View>
      <View
        style={{
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: radius.md,
          padding: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Skeleton height={14} width="60%" style={{ marginBottom: 8 }} />
        <Skeleton height={14} width="50%" style={{ marginBottom: 8 }} />
        <Skeleton height={14} width="45%" />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Skeleton height={48} style={{ flex: 1 }} borderRadius={9999} />
        <Skeleton height={48} style={{ flex: 1 }} borderRadius={9999} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  const { spacing } = useTheme();

  return (
    <View style={{ padding: spacing.md }}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}
