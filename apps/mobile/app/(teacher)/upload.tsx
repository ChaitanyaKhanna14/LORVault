import { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { userService } from '@/services/user.service';
import { lorService } from '@/services/lor.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/stores/themeStore';

export default function UploadScreen() {
  const router = useRouter();
  const { colors, typography, spacing, radius } = useTheme();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [pdfFile, setPdfFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => userService.getStudents(),
  });

  const handlePickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('Error', 'File size must be less than 10MB');
        return;
      }
      setPdfFile({ uri: file.uri, name: file.name, type: 'application/pdf' });
    } catch {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Please enter a title'); return; }
    if (!subject.trim()) { Alert.alert('Error', 'Please enter a subject'); return; }
    if (!selectedStudent) { Alert.alert('Error', 'Please select a student'); return; }
    if (!pdfFile) { Alert.alert('Error', 'Please select a PDF file'); return; }

    setIsLoading(true);
    try {
      await lorService.create({ title: title.trim(), subject: subject.trim(), studentId: selectedStudent, pdf: pdfFile });
      Alert.alert('Success', 'LOR submitted successfully!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit LOR');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ padding: spacing.xl }}
    >
      <Text style={{ ...typography.bodyMd, color: colors.onSurfaceVariant, marginBottom: spacing.xl }}>
        Upload a letter of recommendation for a student in your institution.
      </Text>

      <Input label="Title" placeholder="e.g., Recommendation for MS in CS" value={title} onChangeText={setTitle} />
      <Input label="Subject" placeholder="e.g., Computer Science" value={subject} onChangeText={setSubject} />

      {/* Student Selector */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{ ...typography.labelLg, color: colors.onSurfaceVariant, marginBottom: spacing.xs }}>
          Select Student
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {students?.map((student: any) => {
            const isSelected = selectedStudent === student.id;
            return (
              <TouchableOpacity
                key={student.id}
                style={{
                  backgroundColor: isSelected ? colors.primaryContainer : colors.surfaceContainerLow,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: radius.lg,
                  marginRight: spacing.sm,
                  borderWidth: 1.5,
                  borderColor: isSelected ? colors.primary : colors.outlineVariant + '26',
                }}
                onPress={() => { setSelectedStudent(student.id); setSelectedStudentName(student.fullName); }}
              >
                <Text style={{ ...typography.titleSm, color: isSelected ? colors.primary : colors.onSurface }}>
                  {student.fullName}
                </Text>
                <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 }}>
                  {student.studentId}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {selectedStudentName && (
          <Text style={{ ...typography.bodySm, color: colors.secondary, marginTop: spacing.xs }}>
            Selected: {selectedStudentName}
          </Text>
        )}
      </View>

      {/* PDF Picker */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{ ...typography.labelLg, color: colors.onSurfaceVariant, marginBottom: spacing.xs }}>
          PDF File
        </Text>
        <Card variant="filled" onPress={handlePickPdf}>
          {pdfFile ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...typography.titleSm, color: colors.onSurface }}>{pdfFile.name}</Text>
              <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 4 }}>Tap to change</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', padding: spacing.xl }}>
              <Text style={{ fontSize: 48, marginBottom: spacing.sm }}>📄</Text>
              <Text style={{ ...typography.titleSm, color: colors.onSurface }}>Tap to select PDF</Text>
              <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 4 }}>Max 10MB</Text>
            </View>
          )}
        </Card>
      </View>

      <Button title="Submit LOR" onPress={handleSubmit} loading={isLoading} disabled={!title || !subject || !selectedStudent || !pdfFile} />
    </ScrollView>
  );
}
