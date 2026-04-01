import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { userService } from '@/services/user.service';
import { lorService } from '@/services/lor.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/utils/constants';

export default function UploadScreen() {
  const router = useRouter();
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

      setPdfFile({
        uri: file.uri,
        name: file.name,
        type: 'application/pdf',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }
    if (!selectedStudent) {
      Alert.alert('Error', 'Please select a student');
      return;
    }
    if (!pdfFile) {
      Alert.alert('Error', 'Please select a PDF file');
      return;
    }

    setIsLoading(true);
    try {
      await lorService.create({
        title: title.trim(),
        subject: subject.trim(),
        studentId: selectedStudent,
        pdf: pdfFile,
      });

      Alert.alert('Success', 'LOR submitted successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit LOR');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.description}>
        Upload a letter of recommendation for a student in your institution.
      </Text>

      <Input
        label="Title"
        placeholder="e.g., Recommendation for MS in Computer Science"
        value={title}
        onChangeText={setTitle}
      />

      <Input
        label="Subject"
        placeholder="e.g., Computer Science"
        value={subject}
        onChangeText={setSubject}
      />

      <View style={styles.section}>
        <Text style={styles.label}>Select Student</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.studentScroll}
        >
          {students?.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={[
                styles.studentChip,
                selectedStudent === student.id && styles.studentChipSelected,
              ]}
              onPress={() => {
                setSelectedStudent(student.id);
                setSelectedStudentName(student.fullName);
              }}
            >
              <Text
                style={[
                  styles.studentChipText,
                  selectedStudent === student.id && styles.studentChipTextSelected,
                ]}
              >
                {student.fullName}
              </Text>
              <Text style={styles.studentId}>{student.studentId}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {selectedStudentName && (
          <Text style={styles.selectedText}>Selected: {selectedStudentName}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>PDF File</Text>
        <Card onPress={handlePickPdf}>
          {pdfFile ? (
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{pdfFile.name}</Text>
              <Text style={styles.fileHint}>Tap to change</Text>
            </View>
          ) : (
            <View style={styles.filePicker}>
              <Text style={styles.fileIcon}>📄</Text>
              <Text style={styles.filePickerText}>Tap to select PDF</Text>
              <Text style={styles.fileHint}>Max 10MB</Text>
            </View>
          )}
        </Card>
      </View>

      <Button
        title="Submit LOR"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={!title || !subject || !selectedStudent || !pdfFile}
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
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  studentScroll: {
    marginBottom: 8,
  },
  studentChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  studentChipSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  studentChipText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  studentChipTextSelected: {
    color: COLORS.primary,
  },
  studentId: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  selectedText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 8,
  },
  filePicker: {
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
  },
  fileHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  fileInfo: {
    alignItems: 'center',
  },
  fileName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
});
