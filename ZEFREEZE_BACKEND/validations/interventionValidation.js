const Joi = require('joi');

const equipementTypes = [
  'chambre froide positive',
  'chambre froide négative',
  'meuble réfrigéré',
  'centrale frigorifique',
  'VMC'
];

const urgenceTypes = ['moins 4h', 'sous 24h', 'planifiée'];
const energieTypes = ['électricité', 'gaz', 'fluides'];
const statusTypes = ['en attente', 'confirmée', 'en cours', 'terminée', 'annulée'];

// Schéma de base pour les interventions
const baseInterventionSchema = Joi.object({
  client: Joi.string().hex().length(24),
  equipement: Joi.string().valid(...equipementTypes).required(),
  urgence: Joi.string().valid(...urgenceTypes).default('planifiée'),
  description: Joi.string().required().min(10).max(1000),
  temperature_relevee: Joi.number().min(-50).max(50),
  energie: Joi.string().valid(...energieTypes),
  conforme_HACCP: Joi.boolean().default(false),
  status: Joi.string().valid(...statusTypes).default('en attente'),
  technicien: Joi.string().hex().length(24)
});

// Schéma pour la création
const createInterventionSchema = baseInterventionSchema.keys({
  photos: Joi.forbidden() // Ne pas accepter de photos dans la création
});

// Schéma pour la mise à jour
const updateInterventionSchema = baseInterventionSchema.keys({
  status: Joi.string().valid(...statusTypes),
  photos: Joi.array().items(Joi.string()).max(3)
}).min(1); // Au moins un champ doit être présent

// Schéma pour le changement de statut
const statusSchema = Joi.object({
  status: Joi.string().valid(...statusTypes).required()
});

module.exports = {
  createInterventionSchema,
  updateInterventionSchema,
  statusSchema // Déjà présent dans votre fichier
};