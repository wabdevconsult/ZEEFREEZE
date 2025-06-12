// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export const useUsers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: userService.list,
    enabled: !!user && user.role === 'admin',
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const getUser = (id: string) => useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.get(id),
    enabled: !!id && !!user
  });

  const createUser = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Utilisateur créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || error.message || 'Erreur lors de la création');
    }
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserData> }) => 
      userService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user', variables.id]);
      toast.success('Utilisateur mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || error.message || 'Erreur lors de la mise à jour');
    }
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Utilisateur supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || error.message || 'Erreur lors de la suppression');
    }
  });

  return {
    usersQuery,
    getUser,
    createUser,
    updateUser,
    deleteUser
  };
};

interface UserData {
  id?: string;
  name: string;
  email: string;
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
}