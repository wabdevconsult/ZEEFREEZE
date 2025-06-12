// equipmentService.ts
import api from '@/lib/axios';  // Modification ici - utilisation du chemin @/ pour pointer vers src/

export const equipmentService = {
  async getAll() {
    const response = await api.get('/api/equipment');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/api/equipment/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/api/equipment', data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.put(`/api/equipment/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/api/equipment/${id}`);
    return response.data;
  },

  async updateStatus(id: string, status: string) {
    const response = await api.patch(`/api/equipment/${id}/status`, { status });
    return response.data;
  },

  async getMaintenanceSchedule() {
    const response = await api.get('/api/equipment/maintenance/schedule');
    return response.data;
  },

  async addMaintenanceRecord(id: string, record: any) {
    const response = await api.post(`/api/equipment/${id}/maintenance`, record);
    return response.data;
  }
};