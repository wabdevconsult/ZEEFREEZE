const mongoose = require('mongoose');
const { Schema } = mongoose;

const companySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'entreprise est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  address: {
    type: String,
    required: [true, 'L\'adresse est requise'],
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-]{8,20}$/.test(v);
      },
      message: props => `${props.value} n'est pas un numéro de téléphone valide!`
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} n'est pas un email valide!`
    }
  },
  logo: {
    type: String,
    default: null
  },
  industry: {
    type: String,
    enum: ['restaurant', 'hotel', 'supermarket', 'healthcare', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual pour les statistiques
companySchema.virtual('stats', {
  ref: 'Equipment',
  localField: '_id',
  foreignField: 'companyId',
  count: true
});

// Virtual pour les équipements
companySchema.virtual('equipment', {
  ref: 'Equipment',
  localField: '_id',
  foreignField: 'companyId'
});

// Virtual pour les utilisateurs
companySchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'companyId'
});

// Virtual pour les interventions
companySchema.virtual('interventions', {
  ref: 'Intervention',
  localField: '_id',
  foreignField: 'companyId'
});

// Middleware pour mettre à jour updatedAt avant de sauvegarder
companySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware pour supprimer les données liées avant de supprimer une entreprise
companySchema.pre('remove', async function(next) {
  await this.model('Equipment').deleteMany({ companyId: this._id });
  await this.model('User').updateMany({ companyId: this._id }, { $unset: { companyId: 1 } });
  await this.model('Intervention').deleteMany({ companyId: this._id });
  next();
});

module.exports = mongoose.model('Company', companySchema);