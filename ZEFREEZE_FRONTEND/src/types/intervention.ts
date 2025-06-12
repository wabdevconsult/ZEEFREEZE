import { User } from './user';

export type EquipementType = 
  | 'chambre froide positive' 
  | 'chambre froide négative' 
  | 'meuble réfrigéré' 
  | 'centrale frigorifique' 
  | 'VMC';

export type UrgenceType = 'moins 4h' | 'sous 24h' | 'planifiée';
export type EnergieType = 'électricité' | 'gaz' | 'fluides';
export type StatusType = 'en attente' | 'confirmée' | 'en cours' | 'terminée' | 'annulée';

export interface Intervention {
  _id: string;
  client: string | User;
  equipement: EquipementType;
  urgence: UrgenceType;
  description: string;
  temperature_relevee?: number;
  energie?: EnergieType;
  conforme_HACCP: boolean;
  photos: string[];
  status: StatusType;
  technicien?: string | User;
  createdAt: string;
  updatedAt: string;
  createdBy: string | User;
}

export interface InterventionFormData {
  client?: string;
  equipement: EquipementType;
  urgence: UrgenceType;
  description: string;
  temperature_relevee?: number;
  energie?: EnergieType;
  conforme_HACCP?: boolean;
  photos?: File[];
  status?: StatusType;
  technicien?: string;
}