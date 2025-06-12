const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['feasibility', 'haccp', 'installation', 'intervention', 'temperature', 'maintenance', 'repair']
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.type !== 'temperature'; }
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  interventionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intervention'
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  photos: [String],
  notes: String,
  recommendations: String,
  technicianSignature: String,
  clientSignature: String,
  signedAt: Date,
  
  data: {
    feasibility: {
      location: {
        address: String,
        additionalInfo: String
      },
      projectType: String,
      projectDescription: String,
      technicalConditions: {
        electricalSupply: Boolean,
        waterSupply: Boolean,
        spaceAvailability: Boolean,
        accessConditions: Boolean,
        structuralConstraints: Boolean
      },
      feasibilityScore: String,
      estimatedCost: Number,
      estimatedDuration: Number
    },
    
    haccp: {
      temperature: {
        before: Number,
        after: Number
      },
      compliance: {
        haccp: Boolean,
        refrigerantLeak: Boolean,
        frost: Boolean,
        safetySystem: Boolean,
        cleaningProcedures: Boolean
      },
      correctiveActions: String,
      nextInspectionDate: Date
    },
    
    installation: {
      installationType: String,
      workPerformed: String,
      partsReplaced: String,
      temperature: {
        after: Number
      },
      clientFeedback: String
    },
    
    temperature: {
      value: Number,
      minThreshold: Number,
      maxThreshold: Number,
      isCompliant: Boolean,
      time: String
    },
    
    maintenance: {
      workPerformed: String,
      partsReplaced: String,
      observations: String
    },
    
    repair: {
      issueDescription: String,
      solutionApplied: String,
      partsReplaced: String,
      warrantyApplied: Boolean
    }
  },
  
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

reportSchema.virtual('client', {
  ref: 'User',
  localField: 'clientId',
  foreignField: '_id',
  justOne: true
});

reportSchema.virtual('technician', {
  ref: 'User',
  localField: 'technicianId',
  foreignField: '_id',
  justOne: true
});

reportSchema.virtual('equipment', {
  ref: 'Equipment',
  localField: 'equipmentId',
  foreignField: '_id',
  justOne: true
});

reportSchema.virtual('intervention', {
  ref: 'Intervention',
  localField: 'interventionId',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Report', reportSchema);