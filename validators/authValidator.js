const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Le nom est requis',
    'string.min': 'Le nom doit contenir au moins 2 caractères'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'string.empty': 'L\'email est requis'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
    'string.empty': 'Le mot de passe est requis'
  }),
  role: Joi.string().valid('agent', 'manager', 'admin').default('agent')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'string.empty': 'L\'email est requis'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Le mot de passe est requis'
  })
});

module.exports = { registerSchema, loginSchema };
