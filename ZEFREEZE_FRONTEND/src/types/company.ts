export interface Company {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  industry?: string;
  status?: string;
}

export interface CompanyDetails extends Company {
  stats?: {
    equipmentCount: number;
    userCount: number;
    interventionCount: number;
  };
  equipment?: Equipment[];
  users?: User[];
  interventions?: Intervention[];
}