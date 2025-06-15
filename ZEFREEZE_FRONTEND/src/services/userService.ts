// src/services/userService.ts
import api from '@/lib/axios';

interface UserData {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'technician' | 'client';
  phone?: string;
  companyId?: string;
  preferences?: {
    language: 'fr' | 'en';
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  metadata?: Record<string, any>;
}

export const userService = {
  list: async (): Promise<UserData[]> => {
    const response = await api.get('/user', {
      withCredentials: true // Important pour les cookies
    });
    return response.data.data;
  },

  get: async (id: string): Promise<UserData> => {
    const response = await api.get(`/user${id}`);
    return response.data.data;
  },

  create: async (data: Omit<UserData, 'id'>): Promise<UserData> => {
    const response = await api.post('/user', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<UserData>): Promise<UserData> => {
    const response = await api.put(`/user${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/user${id}`);
    return response.data.data;
  },

  updateRole: async (id: string, role: 'admin' | 'technician' | 'client'): Promise<UserData> => {
    const response = await api.patch(`/user${id}/role`, { role });
    return response.data.data;
  }
};