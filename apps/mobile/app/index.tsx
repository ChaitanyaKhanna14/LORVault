import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Role } from '@lorvault/shared';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
});
