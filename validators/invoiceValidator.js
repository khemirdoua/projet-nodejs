const Joi = require('joi');

const createInvoiceSchema = Joi.object({
  invoiceNumber: Joi.string().required().messages({
    'string.empty': 'Le numéro de facture est requis'
  }),
  client: Joi.string().required().messages({
    'string.empty': 'Le client est requis'
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Le montant doit être positif',
    'any.required': 'Le montant est requis'
  }),
  dueDate: Joi.date().required().messages({
    'date.base': 'Date d\'échéance invalide',
    'any.required': 'La date d\'échéance est requise'
  }),
  status: Joi.string().valid('En attente', 'Payée', 'En retard', 'Partiellement payée', 'Annulée').default('En attente'),
  description: Joi.string().allow('').optional()
});

const updateInvoiceSchema = Joi.object({
  amount: Joi.number().positive(),
  dueDate: Joi.date(),
  status: Joi.string().valid('En attente', 'Payée', 'En retard', 'Partiellement payée', 'Annulée'),
  description: Joi.string().allow('')
}).min(1);

module.exports = { createInvoiceSchema, updateInvoiceSchema };
