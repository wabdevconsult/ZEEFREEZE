const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const temperatureSchema = new Schema({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 0 },
  current: { type: Number }
}, { _id: false });

const dimensionsSchema = new Schema({
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  depth: { type: Number, default: 0 }
}, { _id: false });

const specificationsSchema = new Schema({
  temperature: { type: temperatureSchema, default: () => ({}) },
  power: { type: Number, default: 0 },
  dimensions: { type: dimensionsSchema, default: () => ({}) }
}, { _id: false });

const locationSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  address: { type: String }
}, { _id: false });

const maintenanceHistorySchema = new Schema({
  type: { 
    type: String, 
    enum: ['repair', 'maintenance', 'inspection'], 
    required: true 
  },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  technician: {
    name: { type: String, required: true },
    _id: { type: Schema.Types.ObjectId }
  },
  cost: { type: Number, required: true }
}, { _id: false });

const equipmentSchema = new Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['cold_storage', 'vmc', 'other'], 
    required: true 
  },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  installationDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['operational', 'maintenance_needed', 'out_of_service'],
    default: 'operational'
  },
  specifications: { type: specificationsSchema, default: () => ({}) },
  location: { type: locationSchema, required: true },
  lastMaintenanceDate: { type: Date, required: true },
  nextMaintenanceDate: { type: Date, required: true },
  maintenanceHistory: [maintenanceHistorySchema],
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ... (le reste du modèle inchangé)

module.exports = mongoose.model('Equipment', equipmentSchema);