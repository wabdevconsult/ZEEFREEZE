import api from "@/lib/axios";

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

export const technicianService = {
  getAll: async (): Promise<Technician[]> => {
    const res = await api.get("/technician");
    return res.data.map((tech: any) => ({
      ...tech,
      name: tech.name || `${tech.firstName || ''} ${tech.lastName || ''}`.trim(),
      department: tech.department || 'Non spécifié',
      skills: tech.skills || [],
      active: tech.active !== false
    }));
  },

  getById: async (id: string): Promise<Technician> => {
    const res = await api.get(`/technician/${id}`);
    return {
      ...res.data,
      name: res.data.name || `${res.data.firstName || ''} ${res.data.lastName || ''}`.trim()
    };
  },

  create: async (data: any): Promise<Technician> => {
    const res = await api.post("/technician", data);
    return res.data;
  },

  update: async (id: string, data: any): Promise<Technician> => {
    const res = await api.put(`/technician/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/technician/${id}`);
  },

  getAvailability: async (id: string) => {
    const res = await api.get(`/technician/${id}/availability`);
    return res.data;
  },

  saveAvailability: async (technicianId: string, availability: any) => {
    const res = await api.put(`/technician/${technicianId}/availability`, { availability });
    return res.data;
  },

  getSchedule: async (id: string, startDate: string, endDate: string) => {
    const res = await api.get(`/technician/${id}/schedule`, {
      params: { startDate, endDate }
    });
    return res.data;
  },

  findAvailableTechnicians: async (date: string, slot?: string, expertise?: string) => {
    const res = await api.get("/technician/available", {
      params: { date, slot, expertise }
    });
    return res.data;
  },
};