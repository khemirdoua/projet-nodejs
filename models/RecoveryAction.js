const mongoose = require('mongoose');

const recoveryActionSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  type: {
    type: String,
    enum: ['call', 'email', 'visit', 'reminder'],
    required: true
  },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  actionDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('RecoveryAction', recoveryActionSchema);
