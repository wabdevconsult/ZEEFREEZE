// src/services/installationService.ts

import api from '@/lib/axios';  

export const installationService = {
  getAll: async () => {
    const { data } = await api.get('/installations');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/installations/${id}`);
    return data;
  },

  create: async (payload: any) => {
    const { data } = await api.post('/installations', payload);
    return data;
  },

  update: async (id: string, payload: any) => {
    const { data } = await api.put(`/installations/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/installations/${id}`);
    return data;
  },
};
