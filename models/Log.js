const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  action: { type: String, required: true },
  statut: { type: Number, required: true },
  ip_adresse: { type: String, required: true },
  date_time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);
