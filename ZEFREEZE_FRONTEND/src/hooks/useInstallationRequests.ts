import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { installationService } from "@/services/installationService";
import { InstallationRequest, TechnicianAvailability } from '../types/installation';
import { useAuth } from '../contexts/AuthContext'; // adapte selon le chemin exact

export const useInstallationRequests = () => {
    const { user } = useAuth();

  if (!user || !user._id) {
    return { data: [], isLoading: false };
  }

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`/api/installations?technicianId=${user._id}`);
        setData(res.data);
      } catch (err) {
        console.error('Erreur chargement des installations', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user]);


  const queryClient = useQueryClient();

  const requests = useQuery({
    queryKey: ['installation-requests'],
    queryFn: installationService.getAllRequests,
  });

  const getRequest = (id: string) => useQuery({
    queryKey: ['installation-requests', id],
    queryFn: () => installationService.getRequestById(id),
    enabled: !!id,
  });

  const createRequest = useMutation({
    mutationFn: (data: Omit<InstallationRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => 
      installationService.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-requests'] });
    }
  });

  const assignTechnician = useMutation({
    mutationFn: ({ 
      requestId, 
      technicianId, 
      scheduledDate 
    }: { 
      requestId: string; 
      technicianId: string; 
      scheduledDate: string;
    }) => 
      installationService.assignTechnician(requestId, technicianId, scheduledDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['installations'] });
    }
  });

  const getTechnicianAvailability = (requestId: string) => useQuery({
    queryKey: ['technician-availability', requestId],
    queryFn: () => installationService.getTechnicianAvailability(requestId),
    enabled: !!requestId,
  });

  const updateRequestStatus = useMutation({
    mutationFn: ({ 
      requestId, 
      status 
    }: { 
      requestId: string; 
      status: InstallationRequest['status'];
    }) => 
      installationService.updateRequestStatus(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['installations'] });
    }
  });

  return {
      
    requests,
    getRequest,
    createRequest,
    assignTechnician,
    getTechnicianAvailability,
    updateRequestStatus,
  };
};