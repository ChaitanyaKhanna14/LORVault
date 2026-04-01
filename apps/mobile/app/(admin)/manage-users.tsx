import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/utils/constants';

export default function ManageUsersScreen() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'teachers' | 'students'>('teachers');
  
  // Teacher invite form
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherName, setTeacherName] = useState('');
  
  // Student add form
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');

  const { data: teachers, isLoading: loadingTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => userService.getTeachers(),
  });

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: () => userService.getStudents(),
  });

  const inviteTeacherMutation = useMutation({
    mutationFn: () => userService.inviteTeacher({ email: teacherEmail, fullName: teacherName }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      Alert.alert(
        'Teacher Invited',
        `${teacherName} has been invited.\n\nTemporary password: ${data.tempPassword}\n\nPlease share this securely.`
      );
      setTeacherEmail('');
      setTeacherName('');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  const addStudentMutation = useMutation({
    mutationFn: () => userService.addStudent({ email: studentEmail, fullName: studentName, studentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      Alert.alert('Success', 'Student added to roster');
      setStudentEmail('');
      setStudentName('');
      setStudentId('');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.tabs}>
        <Button
          title="Teachers"
          variant={activeTab === 'teachers' ? 'primary' : 'outline'}
          onPress={() => setActiveTab('teachers')}
          style={styles.tab}
        />
        <Button
          title="Students"
          variant={activeTab === 'students' ? 'primary' : 'outline'}
          onPress={() => setActiveTab('students')}
          style={styles.tab}
        />
      </View>

      {activeTab === 'teachers' && (
        <>
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Invite Teacher</Text>
            <Input
              label="Full Name"
              placeholder="Dr. John Smith"
              value={teacherName}
              onChangeText={setTeacherName}
            />
            <Input
              label="Email"
              placeholder="teacher@institution.edu"
              value={teacherEmail}
              onChangeText={setTeacherEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              title="Send Invitation"
              onPress={() => inviteTeacherMutation.mutate()}
              loading={inviteTeacherMutation.isPending}
              disabled={!teacherEmail || !teacherName}
            />
          </Card>

          <Text style={styles.sectionTitle}>Teachers ({teachers?.length || 0})</Text>
          {teachers?.map((teacher) => (
            <Card key={teacher.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{teacher.fullName}</Text>
                <Text style={styles.userEmail}>{teacher.email}</Text>
              </View>
              <Badge
                label={teacher.status}
                color={teacher.status === 'REGISTERED' ? COLORS.secondary : COLORS.warning}
              />
            </Card>
          ))}
        </>
      )}

      {activeTab === 'students' && (
        <>
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Add Student to Roster</Text>
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              value={studentName}
              onChangeText={setStudentName}
            />
            <Input
              label="Email"
              placeholder="student@institution.edu"
              value={studentEmail}
              onChangeText={setStudentEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Student ID"
              placeholder="STU001"
              value={studentId}
              onChangeText={setStudentId}
              autoCapitalize="characters"
            />
            <Button
              title="Add Student"
              onPress={() => addStudentMutation.mutate()}
              loading={addStudentMutation.isPending}
              disabled={!studentEmail || !studentName || !studentId}
            />
          </Card>

          <Text style={styles.sectionTitle}>Students ({students?.length || 0})</Text>
          {students?.map((student) => (
            <Card key={student.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{student.fullName}</Text>
                <Text style={styles.userEmail}>{student.email}</Text>
                <Text style={styles.studentId}>ID: {student.studentId}</Text>
              </View>
              <Badge
                label={student.status}
                color={student.status === 'REGISTERED' ? COLORS.secondary : COLORS.warning}
              />
            </Card>
          ))}
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
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
  },
  formCard: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  studentId: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
  },
});
