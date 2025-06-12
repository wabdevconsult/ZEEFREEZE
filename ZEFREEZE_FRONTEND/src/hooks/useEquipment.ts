// useEquipment.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService } from '@/services/equipmentService';
import { EquipmentFormData } from '@/types/equipment';
import { useAuth } from '@/contexts/AuthContext';

export const useEquipment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const equipment = useQuery({
    queryKey: ['equipment'],
    queryFn: equipmentService.getAll,
    enabled: !!user?._id
  });

  const getEquipment = (id: string) =>
    useQuery({
      queryKey: ['equipment', id],
      queryFn: () => equipmentService.getById(id),
      enabled: !!id && !!user?._id
    });

  const maintenanceSchedule = useQuery({
    queryKey: ['equipment', 'maintenance-schedule'],
    queryFn: equipmentService.getMaintenanceSchedule,
    enabled: !!user?._id
  });

  const createEquipment = useMutation({
    mutationFn: (data: EquipmentFormData) => equipmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  const updateEquipment = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EquipmentFormData> }) =>
      equipmentService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', id] });
    },
  });

  const deleteEquipment = useMutation({
    mutationFn: (id: string) => equipmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  const updateEquipmentStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      equipmentService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', id] });
    },
  });

  const addMaintenanceRecord = useMutation({
    mutationFn: ({ id, record }: { id: string; record: any }) =>
      equipmentService.addMaintenanceRecord(id, record),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['equipment', id] });
    },
  });

  return {
    equipment,
    getEquipment,
    maintenanceSchedule,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    updateEquipmentStatus,
    addMaintenanceRecord
  };
};