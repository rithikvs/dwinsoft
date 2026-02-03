const mongoose = require('mongoose');

const HandCashSchema = new mongoose.Schema({
  holder: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('HandCash', HandCashSchema);