import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';

export const useClients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user._id) return;

    const fetchClients = async () => {
      try {
        const response = await axios.get('/clients');
        setClients(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des clients :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user]);

  return { clients, loading };
};
