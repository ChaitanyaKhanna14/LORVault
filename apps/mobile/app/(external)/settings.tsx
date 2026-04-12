import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemeStore, ThemeMode } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const THEME_OPTIONS: { label: string; value: ThemeMode; icon: string }[] = [
  { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
  { label: 'Light', value: 'light', icon: 'sunny-outline' },
  { label: 'Dark', value: 'dark', icon: 'moon-outline' },
];

export default function ExternalSettings() {
  const { colors, typography, spacing, radius } = useTheme();
  const { themeMode, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing['4xl'] }}
    >
      <Card>
        <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.tertiaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
            <Text style={{ ...typography.headlineLg, color: colors.tertiary }}>{user?.fullName?.charAt(0)?.toUpperCase() || '?'}</Text>
          </View>
          <Text style={{ ...typography.titleLg, color: colors.onSurface }}>{user?.fullName}</Text>
          <Text style={{ ...typography.bodyMd, color: colors.onSurfaceVariant, marginTop: 2 }}>{user?.email}</Text>
          <View style={{ backgroundColor: colors.tertiaryContainer, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full, marginTop: spacing.xs }}>
            <Text style={{ ...typography.labelSm, color: colors.tertiary }}>VERIFIER</Text>
          </View>
        </View>
      </Card>

      <Text style={{ ...typography.labelLg, color: colors.onSurfaceVariant, marginTop: spacing.xl, marginBottom: spacing.sm, marginLeft: spacing.xxs }}>Appearance</Text>
      <Card>
        <Text style={{ ...typography.titleSm, color: colors.onSurface, marginBottom: spacing.md }}>Theme</Text>
        <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceContainerHigh, borderRadius: radius.lg, padding: 4 }}>
          {THEME_OPTIONS.map((option) => {
            const isActive = themeMode === option.value;
            return (
              <TouchableOpacity key={option.value} onPress={() => setTheme(option.value)} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.md, backgroundColor: isActive ? colors.surfaceContainerLowest : 'transparent', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, ...(isActive ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 } : {}) }} activeOpacity={0.7}>
                <Ionicons name={option.icon as any} size={16} color={isActive ? colors.onSurface : colors.onSurfaceVariant} />
                <Text style={{ ...typography.labelLg, color: isActive ? colors.onSurface : colors.onSurfaceVariant }}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Text style={{ ...typography.labelLg, color: colors.onSurfaceVariant, marginTop: spacing.xl, marginBottom: spacing.sm, marginLeft: spacing.xxs }}>Account</Text>
      <View style={{ marginTop: spacing.xs }}><Button title="Sign Out" variant="danger" onPress={logout} /></View>
      <Text style={{ ...typography.bodySm, color: colors.outlineVariant, textAlign: 'center', marginTop: spacing['2xl'] }}>LORVault v1.0.0</Text>
    </ScrollView>
  );
}
