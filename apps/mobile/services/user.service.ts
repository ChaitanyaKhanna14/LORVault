import { api } from './api';
import { User } from '@/utils/shared';

export const userService = {
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  updateProfile: async (data: { fullName?: string }): Promise<User> => {
    const response = await api.patch<User>('/users/me', data);
    return response.data;
  },

  getStudents: async (): Promise<Array<{
    id: string;
    email: string;
    fullName: string;
    studentId: string;
    status: string;
  }>> => {
    const response = await api.get('/users/students');
    return response.data;
  },

  getTeachers: async (): Promise<Array<{
    id: string;
    email: string;
    fullName: string;
    status: string;
  }>> => {
    const response = await api.get('/users/teachers');
    return response.data;
  },

  inviteTeacher: async (data: { email: string; fullName: string }): Promise<any> => {
    const response = await api.post('/users/invite/teacher', data);
    return response.data;
  },

  addStudent: async (data: { email: string; fullName: string; studentId: string }): Promise<any> => {
    const response = await api.post('/users/students', data);
    return response.data;
  },

  importStudents: async (students: Array<{ email: string; fullName: string; studentId: string }>): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> => {
    const response = await api.post('/users/students/import', { students });
    return response.data;
  },
};
