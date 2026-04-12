import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/stores/themeStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterStudentScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [institutionCode, setInstitutionCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { registerStudent } = useAuthStore();
  const { colors, typography, spacing } = useTheme();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !studentId || !institutionCode) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await registerStudent({ email, password, fullName, studentId, institutionCode });
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Could not create account');
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
          padding: spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <Text
            style={{
              ...typography.headlineLg,
              color: colors.onSurface,
              marginBottom: spacing.xs,
            }}
          >
            Join LORVault
          </Text>
          <Text
            style={{
              ...typography.bodyMd,
              color: colors.onSurfaceVariant,
            }}
          >
            Register with your institution code to access your letters of recommendation.
          </Text>
        </View>

        {/* Form */}
        <View style={{ flex: 1 }}>
          {/* Personal Information Section */}
          <Text
            style={{
              ...typography.labelLg,
              color: colors.onSurfaceVariant,
              marginBottom: spacing.sm,
            }}
          >
            Personal Information
          </Text>

          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            editable={!isLoading}
          />

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
            placeholder="Create a password (min 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          {/* Institution Section */}
          <Text
            style={{
              ...typography.labelLg,
              color: colors.onSurfaceVariant,
              marginTop: spacing.md,
              marginBottom: spacing.sm,
            }}
          >
            Institution Details
          </Text>

          <Input
            label="Student ID"
            placeholder="Enter your student ID"
            value={studentId}
            onChangeText={setStudentId}
            autoCapitalize="characters"
            editable={!isLoading}
          />

          <Input
            label="Institution Code"
            placeholder="e.g., DEMO-2026"
            value={institutionCode}
            onChangeText={setInstitutionCode}
            autoCapitalize="characters"
            editable={!isLoading}
          />

          <View style={{ marginTop: spacing.xs }}>
            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
