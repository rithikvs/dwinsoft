const mongoose = require('mongoose');

const DeletedTransactionSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  type: String,
  category: String,
  date: Date,
  deletedAt: { type: Date, default: Date.now },
  originalId: mongoose.Schema.Types.ObjectId,
});

module.exports = mongoose.model('DeletedTransaction', DeletedTransactionSchema);