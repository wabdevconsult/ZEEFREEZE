// backendZ/validations/userValidation.js
const Joi = require('joi');
const { BadRequestError } = require('../errors');

// Options de validation communes
const validationOptions = {
  abortEarly: false, // Retourne toutes les erreurs, pas seulement la première
  allowUnknown: false, // N'autorise pas les champs non définis dans le schéma
  stripUnknown: true // Supprime les champs inconnus
};

// Schéma de base pour les utilisateurs
const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required()
    .messages({
      'string.empty': 'Le nom est requis',
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne doit pas dépasser 50 caractères'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.empty': 'L\'email est requis',
      'string.email': 'L\'email doit être une adresse valide'
    }),
  password: Joi.string().min(8).required()
    .messages({
      'string.empty': 'Le mot de passe est requis',
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères'
    }),
  role: Joi.string().valid('admin', 'technician', 'client').required()
    .messages({
      'any.only': 'Le rôle doit être admin, technician ou client'
    }),
  phone: Joi.string().pattern(/^\+?[0-9\s]{10,15}$/)
    .messages({
      'string.pattern.base': 'Le numéro de téléphone doit être valide'
    }),
  companyId: Joi.string().hex().length(24)
    .when('role', {
      is: 'client',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'string.hex': 'L\'ID de l\'entreprise doit être un ObjectId valide',
      'string.length': 'L\'ID de l\'entreprise doit être un ObjectId valide'
    })
});

// Schéma pour la création d'utilisateur
const createUserSchema = userSchema.keys({
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({
      'any.only': 'Les mots de passe doivent correspondre'
    })
});

// Schéma pour la mise à jour d'utilisateur
const updateUserSchema = userSchema.keys({
  password: Joi.string().min(8).optional(),
  currentPassword: Joi.string().when('password', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional()
  })
}).min(1); // Au moins un champ doit être fourni

// Fonction de validation
const validateUser = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, validationOptions);
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    throw new BadRequestError('Validation error', { errors });
  }

  // Remplace le body par les données validées et nettoyées
  req.body = value;
  next();
};

module.exports = {
  createUserSchema,
  updateUserSchema,
  validateUser
};