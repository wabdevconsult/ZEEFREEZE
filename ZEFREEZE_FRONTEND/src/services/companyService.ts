import api from '@/lib/axios';

export interface Company {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  industry?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  stats?: {
    equipmentCount: number;
    userCount: number;
    interventionCount: number;
  };
}

export interface CompanyDetails extends Company {
  equipment?: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    lastMaintenance: string;
  }>;
  users?: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
  }>;
  interventions?: Array<{
    id: string;
    type: string;
    status: string;
    date: string;
    technician: string;
  }>;
}

export const companyService = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    industry?: string;
  }): Promise<Company[]> => {
    try {
      const response = await api.get('/company', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Company> => {
    try {
      const response = await api.get(`/company/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  },

  getCompanyDetails: async (id: string): Promise<CompanyDetails> => {
    try {
      const response = await api.get(`/company/${id}/details`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching company details ${id}:`, error);
      throw error;
    }
  },

  create: async (data: Omit<Company, 'id'>): Promise<Company> => {
    try {
      const response = await api.post('/company', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Company>): Promise<Company> => {
    try {
      const response = await api.put(`/company/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating company ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/company/${id}`);
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error);
      throw error;
    }
  },

  importCompanies: async (data: any[]): Promise<{
    importedCount: number;
    totalCount: number;
    errors: any[];
  }> => {
    try {
      const response = await api.post('/company/import', data);
      return response.data.data;
    } catch (error) {
      console.error('Error importing companies:', error);
      throw error;
    }
  },

  getCompanyStats: async (): Promise<{
    totalCompanies: number;
    activeCompanies: number;
    industries: string[];
    industryStats: { _id: string; count: number }[];
  }> => {
    try {
      const response = await api.get('/company/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching company stats:', error);
      throw error;
    }
  },

  getCompanyEquipment: async (companyId: string) => {
    try {
      const response = await api.get(`/equipment?companyId=${companyId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching company equipment:', error);
      throw error;
    }
  },

  getCompanyUsers: async (companyId: string) => {
    try {
      const response = await api.get(`/users?companyId=${companyId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching company users:', error);
      throw error;
    }
  },

  getCompanyInterventions: async (companyId: string) => {
    try {
      const response = await api.get(`/interventions?companyId=${companyId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching company interventions:', error);
      throw error;
    }
  },
};