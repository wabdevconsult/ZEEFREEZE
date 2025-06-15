import { api } from '../lib/axios';
import { Message, MessageFormData } from '../types/message';

export const messageService = {
  getAll: async () => {
    const response = await api.get<Message[]>('/message');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Message>(`/message/${id}`);
    return response.data;
  },

  create: async (data: MessageFormData) => {
    const response = await api.post<Message>('/message', data);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch<Message>(`/message/${id}/read`);
    return response.data;
  }
};