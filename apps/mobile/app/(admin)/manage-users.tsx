import { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/stores/themeStore';

export default function ManageUsersScreen() {
  const queryClient = useQueryClient();
  const { colors, typography, spacing, radius } = useTheme();
  const [activeTab, setActiveTab] = useState<'teachers' | 'students'>('teachers');

  // Teacher invite form
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherName, setTeacherName] = useState('');

  // Student add form
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => userService.getTeachers(),
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => userService.getStudents(),
  });

  const inviteTeacherMutation = useMutation({
    mutationFn: () => userService.inviteTeacher({ email: teacherEmail, fullName: teacherName }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      Alert.alert('Teacher Invited', `${teacherName} has been invited.\n\nTemporary password: ${data.tempPassword}\n\nPlease share this securely.`);
      setTeacherEmail('');
      setTeacherName('');
    },
    onError: (error: any) => Alert.alert('Error', error.message),
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
    onError: (error: any) => Alert.alert('Error', error.message),
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ padding: spacing.xl }}
    >
      {/* Tab Switcher */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
        <View style={{ flex: 1 }}>
          <Button
            title="Teachers"
            variant={activeTab === 'teachers' ? 'primary' : 'outline'}
            onPress={() => setActiveTab('teachers')}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title="Students"
            variant={activeTab === 'students' ? 'primary' : 'outline'}
            onPress={() => setActiveTab('students')}
          />
        </View>
      </View>

      {activeTab === 'teachers' && (
        <>
          <Card style={{ marginBottom: spacing.xl }}>
            <Text style={{ ...typography.titleSm, color: colors.onSurface, marginBottom: spacing.md }}>Invite Teacher</Text>
            <Input label="Full Name" placeholder="Dr. John Smith" value={teacherName} onChangeText={setTeacherName} />
            <Input label="Email" placeholder="teacher@institution.edu" value={teacherEmail} onChangeText={setTeacherEmail} keyboardType="email-address" autoCapitalize="none" />
            <Button title="Send Invitation" onPress={() => inviteTeacherMutation.mutate()} loading={inviteTeacherMutation.isPending} disabled={!teacherEmail || !teacherName} />
          </Card>

          <Text style={{ ...typography.headlineSm, color: colors.onSurface, marginBottom: spacing.sm }}>
            Teachers ({teachers?.length || 0})
          </Text>
          {teachers?.map((teacher: any) => (
            <Card key={teacher.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs, paddingVertical: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...typography.titleSm, color: colors.onSurface }}>{teacher.fullName}</Text>
                <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 }}>{teacher.email}</Text>
              </View>
              <Badge
                label={teacher.status}
                color={teacher.status === 'REGISTERED' ? colors.secondary : colors.outline}
                backgroundColor={teacher.status === 'REGISTERED' ? colors.secondaryContainer : colors.surfaceContainerHigh}
              />
            </Card>
          ))}
        </>
      )}

      {activeTab === 'students' && (
        <>
          <Card style={{ marginBottom: spacing.xl }}>
            <Text style={{ ...typography.titleSm, color: colors.onSurface, marginBottom: spacing.md }}>Add Student to Roster</Text>
            <Input label="Full Name" placeholder="Jane Doe" value={studentName} onChangeText={setStudentName} />
            <Input label="Email" placeholder="student@institution.edu" value={studentEmail} onChangeText={setStudentEmail} keyboardType="email-address" autoCapitalize="none" />
            <Input label="Student ID" placeholder="STU001" value={studentId} onChangeText={setStudentId} autoCapitalize="characters" />
            <Button title="Add Student" onPress={() => addStudentMutation.mutate()} loading={addStudentMutation.isPending} disabled={!studentEmail || !studentName || !studentId} />
          </Card>

          <Text style={{ ...typography.headlineSm, color: colors.onSurface, marginBottom: spacing.sm }}>
            Students ({students?.length || 0})
          </Text>
          {students?.map((student: any) => (
            <Card key={student.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs, paddingVertical: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...typography.titleSm, color: colors.onSurface }}>{student.fullName}</Text>
                <Text style={{ ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 }}>{student.email}</Text>
                <Text style={{ ...typography.bodySm, color: colors.primary, marginTop: 2 }}>ID: {student.studentId}</Text>
              </View>
              <Badge
                label={student.status}
                color={student.status === 'REGISTERED' ? colors.secondary : colors.outline}
                backgroundColor={student.status === 'REGISTERED' ? colors.secondaryContainer : colors.surfaceContainerHigh}
              />
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}
