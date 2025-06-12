export interface EquipmentFormData {
  name: string;
  type: 'cold_storage' | 'vmc' | 'other';
  brand: string;
  model: string;
  serialNumber: string;
  installationDate: string;
  locationId: string;
  locationName?: string;
  specifications: {
    temperature?: {
      min?: number;
      max?: number;
    };
    power?: number;
    dimensions?: {
      width?: number;
      height?: number;
      depth?: number;
    };
  };
}