import { api } from './api';
import { Lor, LorStatus, PaginatedResponse } from '@/utils/shared';

export const lorService = {
  create: async (data: { title: string; subject: string; studentId: string; pdf: any }): Promise<Lor> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('subject', data.subject);
    formData.append('studentId', data.studentId);
    formData.append('pdf', data.pdf);

    const response = await api.post<Lor>('/lors', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (filters?: { status?: LorStatus }): Promise<Lor[]> => {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', filters.status);
    }
    const response = await api.get<Lor[]>(`/lors?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<Lor> => {
    const response = await api.get<Lor>(`/lors/${id}`);
    return response.data;
  },

  approve: async (id: string): Promise<Lor> => {
    const response = await api.patch<Lor>(`/lors/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, reason: string): Promise<Lor> => {
    const response = await api.patch<Lor>(`/lors/${id}/reject`, { reason });
    return response.data;
  },

  revoke: async (id: string, reason: string): Promise<Lor> => {
    const response = await api.patch<Lor>(`/lors/${id}/revoke`, { reason });
    return response.data;
  },

  acknowledge: async (id: string): Promise<void> => {
    await api.post(`/lors/${id}/acknowledge`);
  },

  getShareLink: async (id: string): Promise<{ shareUrl: string; qrUrl: string }> => {
    const response = await api.get<{ shareUrl: string; qrUrl: string }>(`/lors/${id}/share-link`);
    return response.data;
  },

  getPdfUrl: async (id: string, type: 'original' | 'canonical' = 'canonical'): Promise<string> => {
    return `${api.defaults.baseURL}/lors/${id}/pdf?type=${type}`;
  },
};
