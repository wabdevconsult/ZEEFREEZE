import api from "@/lib/axios";

export const getClients = async () => {
  const response = await api.get('/client');
  return response.data;
};

export const getClientById = async (id: string) => {
  const response = await api.get(`/client/${id}`);
  return response.data;
};

export const createClient = async (data: any) => {
  const response = await api.post('/client', data);
  return response.data;
};