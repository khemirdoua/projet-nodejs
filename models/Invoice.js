const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['En attente', 'Payée', 'En retard', 'Partiellement payée', 'Annulée'],
    default: 'En attente'
  },
  paidAmount: { type: Number, default: 0, min: 0 },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
