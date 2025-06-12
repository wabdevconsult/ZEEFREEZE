const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Champs de base communs
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'technician', 'client'],
    default: 'client',
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  
  // Champs spécifiques aux techniciens
  skills: {
    type: [String],
    default: undefined // N'apparaît pas si non défini
  },
  availability: {
    type: Boolean,
    default: true
  },
  
  // Champs spécifiques aux clients
  clientType: {
    type: String,
    enum: ['company', 'particulier', 'autre']
  },
  address: String,
  notes: String,
  
  // Champs communs restants
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  preferences: {
    language: {
      type: String,
      enum: ['fr', 'en'],
      default: 'fr'
    },
    timezone: {
      type: String,
      default: 'Europe/Paris'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  lastLoginAt: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Middleware de hachage du mot de passe
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);