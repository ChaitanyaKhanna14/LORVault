import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/stores/themeStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const { colors, typography, spacing, isDark } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.surface }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing['3xl'],
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header — editorial style */}
        <View style={{ marginBottom: spacing['4xl'] }}>
          {/* Wordmark */}
          <View
            style={{
              backgroundColor: colors.primaryContainer,
              width: 56,
              height: 56,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.xl,
            }}
          >
            <Text
              style={{
                ...typography.headlineLg,
                color: colors.primary,
              }}
            >
              L
            </Text>
          </View>

          <Text
            style={{
              ...typography.displayLg,
              color: colors.onSurface,
              marginBottom: spacing.xs,
            }}
          >
            Welcome{'\n'}Back
          </Text>
          <Text
            style={{
              ...typography.bodyLg,
              color: colors.onSurfaceVariant,
            }}
          >
            Sign in to your LORVault account
          </Text>
        </View>

        {/* Form */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <View style={{ marginTop: spacing.xs }}>
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <Text
            style={{
              ...typography.bodyMd,
              color: colors.onSurfaceVariant,
            }}
          >
            Don't have an account?
          </Text>

          <Link href="/(auth)/register-student" asChild>
            <TouchableOpacity
              style={{
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.md,
              }}
            >
              <Text
                style={{
                  ...typography.labelLg,
                  color: colors.primary,
                }}
              >
                Register as Student
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/register-external" asChild>
            <TouchableOpacity
              style={{
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.md,
              }}
            >
              <Text
                style={{
                  ...typography.labelLg,
                  color: colors.primary,
                }}
              >
                Register for Verification
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
