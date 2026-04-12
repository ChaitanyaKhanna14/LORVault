import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/stores/themeStore';
import { getRoleAccent } from '@/utils/theme';

export default function SuperAdminLayout() {
  const { colors, isDark } = useTheme();
  const accent = getRoleAccent('superAdmin', isDark);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface, elevation: 0, shadowOpacity: 0 },
        headerTintColor: colors.onSurface,
        headerTitleStyle: { fontFamily: 'Manrope_600SemiBold' },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outlineVariant + '26',
          borderTopWidth: 1,
          elevation: 0,
          paddingTop: 4,
        },
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="institutions"
        options={{
          title: 'Institutions',
          tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-institution"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
