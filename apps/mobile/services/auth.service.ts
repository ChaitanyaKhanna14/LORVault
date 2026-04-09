import {
  LoginRequest,
  RegisterStudentRequest,
  RegisterExternalRequest,
  AuthResponse,
  Role,
  UserStatus,
} from '@/utils/shared';

// Mock mode - set to false when backend is ready
const MOCK_MODE = false;

const createMockResponse = (email: string, role: Role, fullName?: string): AuthResponse => ({
  user: {
    id: 'mock-user-' + Date.now(),
    email,
    fullName: fullName || email.split('@')[0],
    role,
    status: UserStatus.REGISTERED,
    createdAt: new Date().toISOString(),
  },
  tokens: {
    accessToken: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
  },
});

// Determine role from email for demo purposes
const getRoleFromEmail = (email: string): Role => {
  if (email.includes('admin')) return Role.ADMIN;
  if (email.includes('teacher')) return Role.TEACHER;
  if (email.includes('student')) return Role.STUDENT;
  if (email.includes('super')) return Role.SUPER_ADMIN;
  return Role.EXTERNAL;
};

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 500)); // Simulate network delay
      return createMockResponse(data.email, getRoleFromEmail(data.email));
    }
    const { api } = await import('./api');
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  registerStudent: async (data: RegisterStudentRequest): Promise<AuthResponse> => {
    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 500));
      return createMockResponse(data.email, Role.STUDENT, data.fullName);
    }
    const { api } = await import('./api');
    const response = await api.post<AuthResponse>('/auth/register/student', data);
    return response.data;
  },

  registerExternal: async (data: RegisterExternalRequest): Promise<AuthResponse> => {
    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 500));
      return createMockResponse(data.email, Role.EXTERNAL, data.fullName);
    }
    const { api } = await import('./api');
    const response = await api.post<AuthResponse>('/auth/register/external', data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    if (MOCK_MODE) {
      return createMockResponse('mock@user.com', Role.STUDENT);
    }
    const { api } = await import('./api');
    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    if (MOCK_MODE) return;
    const { api } = await import('./api');
    await api.post('/auth/logout', { refreshToken });
  },
};
