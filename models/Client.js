const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String },
  type: { type: String, enum: ['Particulier', 'Entreprise'], default: 'Particulier' },
  debtAmount: { type: Number, default: 0 }, // Montant de la dette
  status: { type: String, enum: ['Actif', 'En Recouvrement', 'Litige'], default: 'Actif' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);