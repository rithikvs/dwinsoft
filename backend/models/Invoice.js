const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  invoiceDate: { type: Date, default: Date.now },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['Paid', 'Unpaid', 'Cancelled'], default: 'Paid' },

  // Seller/Company details
  company: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    gstNumber: { type: String },
  },

  // Customer details
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
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