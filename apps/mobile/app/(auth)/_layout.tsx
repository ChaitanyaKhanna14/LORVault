import { Stack } from 'expo-router';
import { useTheme } from '@/stores/themeStore';

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.onSurface,
        headerTitleStyle: {
          fontFamily: 'Manrope_600SemiBold',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.surface,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Sign In',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register-student"
        options={{
          title: 'Student Registration',
        }}
      />
      <Stack.Screen
        name="register-external"
        options={{
          title: 'Create Account',
        }}
      />
    </Stack>
  );
}
