import { api } from './api';
import { VerificationResponse } from '@/utils/shared';

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
};
