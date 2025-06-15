import api from "@/lib/axios";

interface ReportData {
  type: string;
  [key: string]: any;
}

export const reportService = {
  // Get all reports
  list: async (): Promise<any[]> => {
    const response = await api.get('/report');
    return response.data.data;
  },

  // Get single report
  get: async (id: string): Promise<any> => {
    const response = await api.get(`/report/${id}`);
    return response.data.data;
  },

  // Create report
  create: async (data: ReportData): Promise<any> => {
    const formData = new FormData();
    
    // Append all data fields
    Object.keys(data).forEach(key => {
      if (key === 'photos' && data.photos instanceof FileList) {
        Array.from(data.photos).forEach(photo => {
          formData.append('photos', photo);
        });
      } else {
        formData.append(key, data[key]);
      }
    });
    
    const response = await api.post('/report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  // Update report
  update: async (id: string, data: Partial<ReportData>): Promise<any> => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'photos' && data.photos instanceof FileList) {
        Array.from(data.photos).forEach(photo => {
          formData.append('photos', photo);
        });
      } else {
        formData.append(key, data[key]);
      }
    });
    
    const response = await api.put(`/report/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  // Delete report
  delete: async (id: string): Promise<void> => {
    await api.delete(`/report/${id}`);
  },

  // Add photos to report
  addPhotos: async (id: string, photos: File[]): Promise<any> => {
    const formData = new FormData();
    photos.forEach(photo => formData.append('photos', photo));
    
    const response = await api.post(`/report/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  // Sign report
  sign: async (id: string, signatures: { 
    technicianSignature: string; 
    clientSignature: string 
  }): Promise<any> => {
    const response = await api.post(`/report/${id}/sign`, signatures);
    return response.data.data;
  },

  // Generate PDF
  generatePdf: async (id: string): Promise<Blob> => {
    const response = await api.get(`/report/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Temperature logs
  getTemperatureLogs: async (): Promise<any[]> => {
    const response = await api.get('/report/temperature/logs');
    return response.data.data;
  },

  addTemperatureLog: async (data: {
    equipmentId: string;
    temperature: number;
    notes?: string;
  }): Promise<any> => {
    const response = await api.post('/report/temperature/logs', data);
    return response.data.data;
  }
};
