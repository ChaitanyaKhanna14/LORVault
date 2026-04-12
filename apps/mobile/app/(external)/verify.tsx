import { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { verificationService } from '@/services/verification.service';
import { VerificationResultView } from '@/components/VerificationResult';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/stores/themeStore';
import { VerificationResponse } from '@/utils/shared';
import { useAuthStore } from '@/stores/authStore';

export default function VerifyScreen() {
  const { user } = useAuthStore();
  const { colors, typography, spacing } = useTheme();
  const [pdfFile, setPdfFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);

  const handlePickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (result.canceled) return;
      const file = result.assets[0];
      setPdfFile({ uri: file.uri, name: file.name, type: 'application/pdf' });
      setResult(null);
    } catch {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleVerify = async () => {
    if (!pdfFile) { Alert.alert('Error', 'Please select a PDF file'); return; }
    setIsLoading(true);
    try {
      const verificationResult = await verificationService.verifyByUpload({ pdf: pdfFile, verifierEmail: user?.email });
      setResult(verificationResult);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => { setPdfFile(null); setResult(null); };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ padding: spacing.xl }}
    >
      {/* Header */}
      <Text style={{ ...typography.headlineLg, color: colors.onSurface, marginBottom: spacing.xs }}>
        Verify LOR
      </Text>
      <Text style={{ ...typography.bodyMd, color: colors.onSurfaceVariant, marginBottom: spacing.xl }}>
        Upload a PDF to verify its authenticity. The document will be checked against the LORVault blockchain.
      </Text>

      {!result ? (
        <>
          <Card variant="filled" onPress={handlePickPdf}>
            {pdfFile ? (
              <View style={{ alignItems: 'center', padding: spacing.xl }}>
                <Text style={{ fontSize: 48, marginBottom: spacing.sm }}>📄</Text>
                <Text style={{ ...typography.titleSm, color: colors.onSurface }}>{pdfFile.name}</Text>
                <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 4 }}>Tap to change file</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', padding: spacing['2xl'] }}>
                <Text style={{ fontSize: 48, marginBottom: spacing.sm }}>📄</Text>
                <Text style={{ ...typography.titleSm, color: colors.onSurface }}>Tap to select PDF</Text>
                <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' }}>
                  Upload the letter of recommendation to verify
                </Text>
              </View>
            )}
          </Card>

          <View style={{ marginTop: spacing.xl }}>
            <Button title="Verify Document" onPress={handleVerify} loading={isLoading} disabled={!pdfFile} />
          </View>
        </>
      ) : (
        <>
          <VerificationResultView result={result} />
          <View style={{ marginTop: spacing.xl }}>
            <Button title="Verify Another" onPress={handleReset} variant="outline" />
          </View>
        </>
      )}
    </ScrollView>
  );
}
