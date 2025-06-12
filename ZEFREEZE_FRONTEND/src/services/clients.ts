import axios from './axios';

export const getClients = async () => {
  const response = await axios.get('/api/client');
  return response.data;
};

export const getClientById = async (id: string) => {
  const response = await axios.get(`/api/client/${id}`);
  return response.data;
};

export const createClient = async (data: any) => {
  const response = await axios.post('/api/client', data);
  return response.data;
};