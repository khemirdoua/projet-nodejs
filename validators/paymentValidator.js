const Joi = require('joi');

const createPaymentSchema = Joi.object({
  invoice: Joi.string().required().messages({
    'string.empty': 'La facture est requise'
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Le montant doit être positif',
    'any.required': 'Le montant est requis'
  }),
  method: Joi.string().valid('Espèces', 'Virement', 'Chèque', 'Carte bancaire').required().messages({
    'any.required': 'Le mode de paiement est requis'
  }),
  reference: Joi.string().allow('').optional(),
  note: Joi.string().allow('').optional()
});

module.exports = { createPaymentSchema };
