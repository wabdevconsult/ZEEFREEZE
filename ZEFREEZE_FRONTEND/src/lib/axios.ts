// src/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://zeefreeze.fr/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Gérer la déconnexion si nécessaire
      console.error('Unauthorized - redirect to login');
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirection côté client
    }
    return Promise.reject(error);
  }
);

export default api;