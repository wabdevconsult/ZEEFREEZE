import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { companyService } from '@/services/companyService';

export const useCompanies = (params?: {
  search?: string;
  status?: string;
  industry?: string;
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    totalCompanies: number;
    activeCompanies: number;
    industries: string[];
    industryStats: { _id: string; count: number }[];
  } | null>(null);

  const {
    data: companies,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['companies', params],
    queryFn: () => companyService.getAll(params),
    enabled: !!user,
  });

  useEffect(() => {
    if (user) {
      companyService.getCompanyStats()
        .then(data => setStats(data))
        .catch(console.error);
    }
  }, [user]);

  return {
    companies,
    stats,
    isLoading,
    error,
    refetch,
  };
};