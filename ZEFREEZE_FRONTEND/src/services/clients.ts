import axios from './axios';

export const getClients = async () => {
  const response = await axios.get('/client');
  return response.data;
};

export const getClientById = async (id: string) => {
  const response = await axios.get(`/client/${id}`);
  return response.data;
};

export const createClient = async (data: any) => {
  const response = await axios.post('/client', data);
  return response.data;
};