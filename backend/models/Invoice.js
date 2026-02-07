const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  invoiceDate: { type: Date, default: Date.now },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  paymentMethod: { type: String, enum: ['Bank Account', 'Hand Cash', 'Cash', 'Cheque'], required: true },
  paymentStatus: { type: String, enum: ['Paid', 'Unpaid', 'Cancelled', 'Pending'], default: 'Paid' },

  // Link to HandCash if payment method is Hand Cash
  handCash: { type: mongoose.Schema.Types.ObjectId, ref: 'HandCash' },
  bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },

  // Seller/Company details
  company: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    gstNumber: { type: String },
  },

  // Customer details
  customer: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
  },

  // Item table
  items: [
    {
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
    }
  ],

  // Billing summary
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  gst: {
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
  },
  grandTotal: { type: Number, required: true },

  pdfPath: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Active', 'Cancelled'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);