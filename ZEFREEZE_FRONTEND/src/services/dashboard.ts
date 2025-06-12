import api from '@/lib/axios';   // Cohérent avec les autres services

/**
 * Récupère l'ID de l'entreprise associée à un utilisateur donné.
 * @param userId ID utilisateur
 */
export const getClientCompany = async (userId: string): Promise<string | null> => {
  try {
    const res = await api.get(`/api/user/${userId}/company`);
    return res.data.companyId;
  } catch (error) {
    console.error('Erreur getClientCompany:', error);
    return null;
  }
};

/**
 * Récupère les équipements d'une entreprise.
 * @param companyId ID de l'entreprise
 */
export const getClientEquipment = async (companyId: string): Promise<any[]> => {
  try {
    const res = await api.get(`/api/company/${companyId}/equipment`);
    return res.data;
  } catch (error) {
    console.error('Erreur getClientEquipment:', error);
    return [];
  }
};

/**
 * Récupère les interventions associées à une entreprise.
 * @param companyId ID de l'entreprise
 */
export const getClientInterventions = async (companyId: string): Promise<any[]> => {
  try {
    const res = await api.get(`/api/company/${companyId}/api/intervention`);
    return res.data;
  } catch (error) {
    console.error('Erreur getClientInterventions:', error);
    return [];
  }
};

/**
 * Récupère les rapports d'une entreprise.
 * @param companyId ID de l'entreprise
 */
export const getClientReports = async (companyId: string): Promise<any[]> => {
  try {
    const res = await api.get(`/api/company/${companyId}/reports`);
    return res.data;
  } catch (error) {
    console.error('Erreur getClientReports:', error);
    return [];
  }
};

/**
 * Récupère les missions assignées à un technicien.
 * @param technicianId ID du technicien
 */
export const getTechnicianAssignments = async (technicianId: string): Promise<any[]> => {
  try {
    const res = await api.get(`/api/technician/${technicianId}/assignments`);
    return res.data;
  } catch (error) {
    console.error('Erreur getTechnicianAssignments:', error);
    return [];
  }
};

/**
 * Récupère les statistiques d'intervention d'un technicien.
 * @param technicianId ID du technicien
 */
export const getTechnicianStats = async (technicianId: string): Promise<any> => {
  try {
    const res = await api.get(`/api/technician/${technicianId}/stats`);
    return res.data;
  } catch (error) {
    console.error('Erreur getTechnicianStats:', error);
    return {};
  }
};

/**
 * Met à jour le statut d'une intervention.
 * @param interventionId ID de l'intervention
 * @param status Nouveau statut
 */
export const updateInterventionStatus = async (interventionId: string, status: string): Promise<any> => {
  try {
    const res = await api.patch(`/api/intervention/${interventionId}/status`, { status });
    return res.data;
  } catch (error) {
    console.error('Erreur updateInterventionStatus:', error);
    return null;
  }
};
