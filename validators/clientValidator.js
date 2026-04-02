const Joi = require('joi');

const createClientSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Le nom est requis',
    'string.min': 'Le nom doit contenir au moins 2 caractères'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'string.empty': 'L\'email est requis'
  }),
  phone: Joi.string().min(8).max(20).required().messages({
    'string.empty': 'Le téléphone est requis'
  }),
  address: Joi.string().allow('').optional(),
  type: Joi.string().valid('Particulier', 'Entreprise').default('Particulier'),
  debtAmount: Joi.number().min(0).default(0),
  status: Joi.string().valid('Actif', 'En Recouvrement', 'Litige').default('Actif')
});

const updateClientSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  phone: Joi.string().min(8).max(20),
  address: Joi.string().allow(''),
  type: Joi.string().valid('Particulier', 'Entreprise'),
  debtAmount: Joi.number().min(0),
  status: Joi.string().valid('Actif', 'En Recouvrement', 'Litige')
}).min(1).messages({
  'object.min': 'Au moins un champ doit être fourni'
});

module.exports = { createClientSchema, updateClientSchema };
