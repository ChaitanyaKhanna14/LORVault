import { api } from './api';
import { VerificationResponse, VerificationLog } from '@/utils/shared';

export interface VerificationHistoryItem {
  id: string;
  result: string;
  verifiedAt: string;
  verifierEmail?: string;
  verifierInstitution?: string;
  lor?: {
    id: string;
    title: string;
    subject: string;
    teacher?: { fullName: string };
    student?: { fullName: string };
    institution?: { name: string };
  };
}

export const verificationService = {
  verifyByUpload: async (data: {
    pdf: any;
    verifierEmail?: string;
    verifierInstitution?: string;
  }): Promise<VerificationResponse> => {
    const formData = new FormData();
    formData.append('pdf', data.pdf);
    if (data.verifierEmail) {
      formData.append('verifierEmail', data.verifierEmail);
    }
    if (data.verifierInstitution) {
      formData.append('verifierInstitution', data.verifierInstitution);
    }

    const response = await api.post<VerificationResponse>('/verify/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  verifyByLorId: async (lorId: string): Promise<VerificationResponse> => {
    const response = await api.get<VerificationResponse>(`/verify/${lorId}`);
    return response.data;
  },

  getMyHistory: async (): Promise<VerificationHistoryItem[]> => {
    const response = await api.get<VerificationHistoryItem[]>('/verify/history/my');
    return response.data;
  },
};
