import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/stores/themeStore';
import { Role } from '@/utils/shared';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect based on role
  switch (user?.role) {
    case Role.SUPER_ADMIN:
      return <Redirect href="/(superadmin)/institutions" />;
    case Role.ADMIN:
      return <Redirect href="/(admin)/dashboard" />;
    case Role.TEACHER:
      return <Redirect href="/(teacher)/dashboard" />;
    case Role.STUDENT:
      return <Redirect href="/(student)/dashboard" />;
    case Role.EXTERNAL:
      return <Redirect href="/(external)/verify" />;
    default:
      return <Redirect href="/(auth)/login" />;
  }
}
