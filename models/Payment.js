const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true, min: 0 },
  method: {
    type: String,
    enum: ['Espèces', 'Virement', 'Chèque', 'Carte bancaire'],
    required: true
  },
  reference: { type: String },
  note: { type: String },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
