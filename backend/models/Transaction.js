
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['Success', 'Failed', 'Pending'], default: 'Success' },
  transactionDate: { type: Date, default: Date.now },
  description: { type: String },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
        required: true
