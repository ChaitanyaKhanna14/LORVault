import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore, useTheme } from '@/stores/themeStore';

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
  const { initialize: initAuth } = useAuthStore();
  const { initialize: initTheme } = useThemeStore();
  const { colors, isDark } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    const init = async () => {
      try {
        await initTheme();
        await initAuth();
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, padding: 20 }}>
        <Text style={{ color: colors.error, fontSize: 18, marginBottom: 10 }}>App Error</Text>
        <Text style={{ color: colors.onSurface, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  if (!ready || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.onSurface,
          headerTitleStyle: {
            fontWeight: '600',
            fontFamily: 'Manrope_600SemiBold',
          },
          contentStyle: {
            backgroundColor: colors.surface,
          },
          headerShadowVisible: false,
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
