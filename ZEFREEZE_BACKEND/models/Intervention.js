const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interventionSchema = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  equipement: { 
    type: String, 
    enum: ['chambre froide positive', 'chambre froide négative', 'meuble réfrigéré', 'centrale frigorifique', 'VMC'], 
    required: true 
  },
  urgence: { 
    type: String, 
    enum: ['moins 4h', 'sous 24h', 'planifiée'], 
    default: 'planifiée' 
  },
  description: { type: String, required: true },
  temperature_relevee: { type: Number },
  energie: { type: String, enum: ['électricité', 'gaz', 'fluides'] },
  conforme_HACCP: { type: Boolean, default: false },
  photos: [{ type: String }],
  status: { 
    type: String, 
    enum: ['en attente', 'confirmée', 'en cours', 'terminée', 'annulée'], 
    default: 'en attente' 
  },
  technicien: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
interventionSchema.index({ client: 1 });
interventionSchema.index({ status: 1 });
interventionSchema.index({ createdAt: -1 });

// Virtuals
interventionSchema.virtual('clientDetails', {
  ref: 'User',
  localField: 'client',
  foreignField: '_id',
  justOne: true
});

interventionSchema.virtual('technicienDetails', {
  ref: 'User',
  localField: 'technicien',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Intervention', interventionSchema);