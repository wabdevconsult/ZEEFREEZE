import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interventionService } from '@/services/interventionService';
import { InterventionFormData } from '@/types/intervention';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export const useInterventions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const interventionsQuery = useQuery({
    queryKey: ['interventions'],
    queryFn: () => interventionService.getAll({ 
      ...(user?.role !== 'admin' && { clientId: user?._id })
    }),
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: interventionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['interventions']);
      toast.success('Intervention créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InterventionFormData> }) => 
      interventionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['interventions']);
      toast.success('Intervention mise à jour');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: interventionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['interventions']);
      toast.success('Intervention supprimée');
    }
  });

  const uploadPhotosMutation = useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) => 
      interventionService.uploadPhotos(id, files),
    onSuccess: () => {
      queryClient.invalidateQueries(['interventions']);
      toast.success('Photos téléchargées');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusType }) =>
      interventionService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['interventions']);
      toast.success('Statut mis à jour');
    }
  });

  return {
    interventions: interventionsQuery.data || [],
    isLoading: interventionsQuery.isLoading,
    isError: interventionsQuery.isError,
    refetch: interventionsQuery.refetch,
    createIntervention: createMutation.mutateAsync,
    updateIntervention: updateMutation.mutateAsync,
    deleteIntervention: deleteMutation.mutateAsync,
    uploadPhotos: uploadPhotosMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isUploading: uploadPhotosMutation.isLoading,
    isUpdatingStatus: updateStatusMutation.isLoading
  };
};