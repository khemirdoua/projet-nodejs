const Joi = require('joi');

const createRecoveryActionSchema = Joi.object({
  invoiceId: Joi.string().required().messages({
    'string.empty': 'La facture est requise',
    'any.required': 'La facture est requise'
  }),
  clientId: Joi.string().required().messages({
    'string.empty': 'Le client est requis',
    'any.required': 'Le client est requis'
  }),
  type: Joi.string().valid('call', 'email', 'visit', 'reminder').required().messages({
    'any.only': 'Type doit être call, email, visit, ou reminder',
    'any.required': 'Le type est requis'
  }),
  description: Joi.string().required().messages({
    'string.empty': 'La description est requise',
    'any.required': 'La description est requise'
  }),
  status: Joi.string().valid('pending', 'completed').optional(),
  actionDate: Joi.date().required().messages({
    'date.base': 'Date invalide',
    'any.required': "La date d'action est requise"
  })
});

const updateRecoveryActionSchema = Joi.object({
  type: Joi.string().valid('call', 'email', 'visit', 'reminder').optional(),
  description: Joi.string().optional(),
  status: Joi.string().valid('pending', 'completed').optional(),
  actionDate: Joi.date().optional()
});

module.exports = { createRecoveryActionSchema, updateRecoveryActionSchema };
