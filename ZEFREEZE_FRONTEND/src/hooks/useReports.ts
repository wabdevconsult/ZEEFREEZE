import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '@/services/reportService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const useReports = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get all reports
  const reportsQuery = useQuery({
    queryKey: ['reports'],
    queryFn: reportService.list,
    enabled: !!user
  });

  // Get single report
  const getReport = (id: string) => useQuery({
    queryKey: ['report', id],
    queryFn: () => reportService.get(id),
    enabled: !!id && !!user
  });

  // Create report
  const createReport = useMutation({
    mutationFn: reportService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      toast.success('Rapport créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || error.message || 'Erreur lors de la création');
    }
  });

  // Update report
  const updateReport = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      reportService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['report', variables.id]);
      toast.success('Rapport mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || error.message || 'Erreur lors de la mise à jour');
    }
  });

  // Delete report
  const deleteReport = useMutation({
    mutationFn: (id: string) => reportService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      toast.success('Rapport supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || error.message || 'Erreur lors de la suppression');
    }
  });

  // Add photos
  const addPhotos = useMutation({
    mutationFn: ({ id, photos }: { id: string; photos: File[] }) => 
      reportService.addPhotos(id, photos),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['report', variables.id]);
      toast.success('Photos ajoutées');
    }
  });

  // Sign report
  const signReport = useMutation({
    mutationFn: ({ id, signatures }: { 
      id: string; 
      signatures: { technicianSignature: string; clientSignature: string } 
    }) => reportService.sign(id, signatures),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['report', variables.id]);
      toast.success('Rapport signé');
    }
  });

  // Generate PDF
  const downloadReportPdf = useMutation({
    mutationFn: (id: string) => reportService.generatePdf(id),
    onSuccess: (pdfBlob, id) => {
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  });

  // Temperature logs
  const getTemperatureLogs = useQuery({
    queryKey: ['temperatureLogs'],
    queryFn: reportService.getTemperatureLogs,
    enabled: !!user
  });

  const addTemperatureLog = useMutation({
    mutationFn: reportService.addTemperatureLog,
    onSuccess: () => {
      queryClient.invalidateQueries(['temperatureLogs']);
      toast.success('Relevé de température ajouté');
    }
  });

  return {
    reportsQuery,
    getReport,
    createReport,
    updateReport,
    deleteReport,
    addPhotos,
    signReport,
    downloadReportPdf,
    getTemperatureLogs,
    addTemperatureLog
  };
};