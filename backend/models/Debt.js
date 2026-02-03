const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema({
  debtor: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date },
  description: { type: String },
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Debt', DebtSchema);