import { Stack } from 'expo-router';
import { COLORS } from '@/utils/constants';

export default function SuperAdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="institutions"
        options={{ title: 'Institutions' }}
      />
      <Stack.Screen
        name="create-institution"
        options={{ title: 'Create Institution' }}
      />
    </Stack>
  );
}
