import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technicianService } from '../services/technicianService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface Technician {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  phone?: string;
  active: boolean;
  department?: string;
  skills?: string[];
  availability?: boolean;
  createdAt: string;
}

interface TechnicianFormData extends Omit<Technician, 'id' | 'createdAt'> {
  // Ajoutez ici les champs spécifiques au formulaire si nécessaire
}

interface TechnicianAvailabilityDay {
  // Définissez la structure de vos disponibilités
  day: string;
  slots: string[];
}

export const useTechnicians = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const technicians = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const data = await technicianService.getAll();
      return data.map(tech => ({
        ...tech,
        name: tech.name || `${tech.firstName || ''} ${tech.lastName || ''}`.trim(),
        department: tech.department || 'Non spécifié',
        skills: tech.skills || [],
        active: tech.active !== false // default true
      }));
    },
    enabled: !!user?._id,
    onError: (error) => {
      console.error('Failed to fetch technicians:', error);
      toast.error('Erreur lors du chargement des techniciens');
    }
  });

  const getTechnician = (id: string) => useQuery<Technician>({
    queryKey: ['technicians', id],
    queryFn: () => technicianService.getById(id),
    enabled: !!id,
  });

  const createTechnician = useMutation({
    mutationFn: (data: TechnicianFormData) => technicianService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      toast.success('Technicien créé avec succès');
    },
    onError: (error) => {
      console.error('Failed to create technician:', error);
      toast.error('Erreur lors de la création du technicien');
    },
  });

  const updateTechnician = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TechnicianFormData> }) => 
      technicianService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      toast.success('Technicien mis à jour avec succès');
    },
    onError: (error) => {
      console.error('Failed to update technician:', error);
      toast.error('Erreur lors de la mise à jour du technicien');
    },
  });

  const deleteTechnician = useMutation({
    mutationFn: (id: string) => technicianService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      toast.success('Technicien désactivé avec succès');
    },
    onError: (error) => {
      console.error('Failed to delete technician:', error);
      toast.error('Erreur lors de la désactivation du technicien');
    },
  });

  // ... (autres méthodes restent inchangées)

  return {
    technicians: {
      data: technicians.data || [],
      isLoading: technicians.isLoading,
      error: technicians.error
    },
    getTechnician,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    // ... (autres retours)
  };
};