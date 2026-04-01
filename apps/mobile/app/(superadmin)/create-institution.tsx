import { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/utils/constants';

export default function CreateInstitutionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [domain, setDomain] = useState('');
  
  // First admin details
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      // Create institution
      const instRes = await api.post('/institutions', {
        name,
        code: code.toUpperCase(),
        domain: domain || undefined,
      });

      // Create first admin
      if (adminEmail && adminName && adminPassword) {
        await api.post(`/institutions/${instRes.data.id}/admins`, {
          email: adminEmail,
          fullName: adminName,
          password: adminPassword,
        });
      }

      return instRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      Alert.alert('Success', 'Institution created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleCreate = () => {
    if (!name.trim() || !code.trim()) {
      Alert.alert('Error', 'Name and code are required');
      return;
    }

    createMutation.mutate();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.section}>
        <Input
          label="Institution Name"
          placeholder="e.g., Demo University"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Institution Code"
          placeholder="e.g., DEMO-2026"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
        <Input
          label="Domain (optional)"
          placeholder="e.g., demo.edu"
          value={domain}
          onChangeText={setDomain}
          autoCapitalize="none"
        />
      </Card>

      <Card style={styles.section}>
        <Input
          label="Admin Name"
          placeholder="First admin's full name"
          value={adminName}
          onChangeText={setAdminName}
        />
        <Input
          label="Admin Email"
          placeholder="admin@institution.edu"
          value={adminEmail}
          onChangeText={setAdminEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Admin Password"
          placeholder="Temporary password"
          value={adminPassword}
          onChangeText={setAdminPassword}
          secureTextEntry
        />
      </Card>

      <Button
        title="Create Institution"
        onPress={handleCreate}
        loading={createMutation.isPending}
        disabled={!name || !code}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
});
