const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  amount: {
    type: Number,
    required: [true, 'Please add a positive or negative number']
  },
  type: {
    type: String,
    enum: ['Income', 'Expense'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Account', 'Hand Cash'],
    default: 'Bank Account'
  },
  bankAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount'
  },
  handCashId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HandCash'
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

  // Employee invoice access control
  invoiceAccessRequested: { type: Boolean, default: false },
  invoiceAccessRequestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  invoiceAccessRequestedAt: { type: Date },
  invoiceAccessApproved: { type: Boolean, default: false },
  invoiceApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  invoiceApprovedAt: { type: Date }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
