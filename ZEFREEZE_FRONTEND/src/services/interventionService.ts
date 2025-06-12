import axios from '@/lib/axios';
import { Intervention, InterventionFormData } from '@/types/intervention';

export const interventionService = {
  getAll: async (params?: Record<string, any>) => {
    const response = await axios.get<Intervention[]>('/api/intervention', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get<Intervention>(`/api/intervention/${id}`);
    return response.data;
  },

  create: async (data: InterventionFormData) => {
    const response = await axios.post<Intervention>('/api/intervention', data);
    return response.data;
  },

  update: async (id: string, data: Partial<InterventionFormData>) => {
    const response = await axios.patch<Intervention>(`/api/intervention/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`/api/intervention/${id}`);
  },

  uploadPhotos: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));
    
    const response = await axios.post<Intervention>(`/api/intervention/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateStatus: async (id: string, status: StatusType) => {
    const response = await axios.patch<Intervention>(`/api/intervention/${id}/status`, { status });
    return response.data;
  }
};