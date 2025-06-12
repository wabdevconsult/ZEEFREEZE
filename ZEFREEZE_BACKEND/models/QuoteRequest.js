const mongoose = require('mongoose');

const quoteRequestSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Le nom du client est requis']
  },
  contact: {
    type: String,
    required: [true, 'Les informations de contact sont requises'],
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$|^[0-9]{10,15}$/, 'Veuillez fournir un email ou un numéro de téléphone valide']
  },
  projectDetails: {
    type: String,
    required: [true, 'Les détails du projet sont requis'],
    minlength: [20, 'Les détails du projet doivent contenir au moins 20 caractères']
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'rejected', 'in_progress'], 
    default: 'pending' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  attachments: [{
    url: String,
    name: String,
    size: Number
  }],
  budgetRange: {
    min: Number,
    max: Number
  },
  deadline: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Index pour améliorer les performances de recherche
quoteRequestSchema.index({ status: 1 });
quoteRequestSchema.index({ createdBy: 1 });
quoteRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('QuoteRequest', quoteRequestSchema);
