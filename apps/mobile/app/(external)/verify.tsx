import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { verificationService } from '@/services/verification.service';
import { VerificationResultView } from '@/components/VerificationResult';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/utils/constants';
import { VerificationResponse } from '@/utils/shared';
import { useAuthStore } from '@/stores/authStore';

export default function VerifyScreen() {
  const { logout, user } = useAuthStore();
  const [pdfFile, setPdfFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);

  const handlePickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setPdfFile({
        uri: file.uri,
        name: file.name,
        type: 'application/pdf',
      });
      setResult(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleVerify = async () => {
    if (!pdfFile) {
      Alert.alert('Error', 'Please select a PDF file');
      return;
    }

    setIsLoading(true);
    try {
      const verificationResult = await verificationService.verifyByUpload({
        pdf: pdfFile,
        verifierEmail: user?.email,
      });
      setResult(verificationResult);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPdfFile(null);
    setResult(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Verify Letter of Recommendation</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        Upload a PDF to verify its authenticity. The document will be checked against the LORVault
        blockchain to confirm it hasn't been tampered with.
      </Text>

      {!result ? (
        <>
          <Card onPress={handlePickPdf}>
            {pdfFile ? (
              <View style={styles.fileInfo}>
                <Text style={styles.fileIcon}>📄</Text>
                <Text style={styles.fileName}>{pdfFile.name}</Text>
                <Text style={styles.fileHint}>Tap to change file</Text>
              </View>
            ) : (
              <View style={styles.filePicker}>
                <Text style={styles.fileIcon}>📄</Text>
                <Text style={styles.filePickerText}>Tap to select PDF</Text>
                <Text style={styles.fileHint}>Upload the letter of recommendation to verify</Text>
              </View>
            )}
          </Card>

          <Button
            title="Verify Document"
            onPress={handleVerify}
            loading={isLoading}
            disabled={!pdfFile}
          />
        </>
      ) : (
        <>
          <VerificationResultView result={result} />
          <Button title="Verify Another" onPress={handleReset} variant="outline" />
        </>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  logout: {
    color: COLORS.danger,
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 24,
    lineHeight: 20,
  },
  filePicker: {
    alignItems: 'center',
    padding: 32,
  },
  fileInfo: {
    alignItems: 'center',
    padding: 24,
  },
  fileIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  filePickerText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
