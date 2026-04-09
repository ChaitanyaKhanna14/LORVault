import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { useAuthStore } from '@/stores/authStore';

// Initialize Sentry for crash reporting
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.2, // 20% of transactions for performance monitoring
  _experiments: {
    profilesSampleRate: 0.1, // 10% of transactions for profiling
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function RootLayoutContent() {
  const { initialize } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initialize();
      } catch (e: any) {
        Sentry.captureException(e);
        setError(e?.message || 'Unknown error');
      } finally {
        setReady(true);
      }
    };
    init();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', padding: 20 }}>
        <Text style={{ color: '#EF4444', fontSize: 18, marginBottom: 10 }}>App Error</Text>
        <Text style={{ color: '#F8FAFC', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <Text style={{ color: '#F8FAFC' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F172A',
          },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#0F172A',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(student)" options={{ headerShown: false }} />
        <Stack.Screen name="(external)" options={{ headerShown: false }} />
        <Stack.Screen name="(superadmin)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}

// Wrap with Sentry for automatic error boundary
export default Sentry.wrap(RootLayoutContent);
}
