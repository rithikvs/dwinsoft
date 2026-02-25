const mongoose = require('mongoose');

const BankAccountSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Internal reference name
  accountHolderName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  bankName: { type: String, required: true },
  ifscCode: { type: String, required: true },
  branchName: { type: String },
  accountType: {
    type: String,
    enum: ['Savings', 'Current', 'Business', 'Other'],
    default: 'Savings'
  },
  balance: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BankAccount', BankAccountSchema);