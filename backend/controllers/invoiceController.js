
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Helper to generate unique/incremental invoice number
async function generateInvoiceNumber() {
  const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
  let nextNumber = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const match = lastInvoice.invoiceNumber.match(/INV\/(\d{4})\/(\d{6})/);
    if (match) {
      nextNumber = parseInt(match[2], 10) + 1;
    }
  }
  const year = new Date().getFullYear();
  return `INV/${year}/${String(nextNumber).padStart(6, '0')}`;
}

// Create invoice after successful transaction
exports.createInvoice = async (req, res) => {
  try {
    // Validate required fields
    const { orderId, transactionId, company, customer, paymentMethod } = req.body;
    if (!orderId || !transactionId || !company || !customer || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const order = await Order.findById(orderId);
    const transaction = await Transaction.findById(transactionId);
    if (!order || !transaction) {
      return res.status(404).json({ message: 'Order or Transaction not found' });
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber,
      order: order._id,
      transaction: transaction._id,
      paymentMethod,
      paymentStatus: transaction.paymentStatus === 'Success' ? 'Paid' : 'Unpaid',
      company,
      customer,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      gst: order.gst,
      grandTotal: order.grandTotal,
      createdBy: req.user._id,
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // TODO: Generate PDF and save path
    // invoice.pdfPath = await generateInvoicePDF(invoice);
    // await invoice.save();

    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ message: 'Error creating invoice', error: err.message });
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId).populate('order transaction createdBy');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    // Security: Allow admin, HR, Accountant, or approved Employee
    if (req.user.role === 'Employee') {
      if (!invoice.employeeAccessApproved) {
        return res.status(403).json({ message: 'HR approval required to access this invoice' });
      }
    } else if (!['Admin', 'HR', 'Accountant'].includes(req.user.role) && String(invoice.customer.email) !== req.user.email) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching invoice' });
  }
};

// Get all invoices for a user
exports.getInvoicesByUser = async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const invoices = await Invoice.find({ 'customer.email': req.user.email });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching invoices' });
  }
};

// Get all invoices (admin, HR, Accountant, Employee)
exports.getAllInvoices = async (req, res) => {
  try {
    const role = req.user.role;
    // Employee: can only see approved invoices
    if (role === 'Employee') {
      const invoices = await Invoice.find({ employeeAccessApproved: true });
      return res.json({ invoices, monthlyTotal: 0 });
    }
    // HR, Accountant, Admin can see all
    if (!['Admin', 'HR', 'Accountant'].includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Filters: date, payment status, monthly total
    const { startDate, endDate, paymentStatus } = req.query;
    let filter = {};
    if (startDate && endDate) {
      filter.invoiceDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }
    const invoices = await Invoice.find(filter).populate('approvedBy', 'username email');
    // Monthly total calculation
    let monthlyTotal = 0;
    if (startDate && endDate) {
      monthlyTotal = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    }
    res.json({ invoices, monthlyTotal });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching invoices' });
  }
};

// Download invoice PDF (stub)
exports.downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId).populate('order transaction createdBy');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Security: Only allow owner, admin, HR, Accountant, or approved Employee
    if (req.user.role === 'Employee') {
      if (!invoice.employeeAccessApproved) {
        return res.status(403).json({ message: 'HR approval required to download this invoice' });
      }
    } else if (req.user.role !== 'Admin' && req.user.role !== 'HR' && req.user.role !== 'Accountant' && String(invoice.customer.email) !== req.user.email) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate PDF on the fly
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoiceNumber.replace(/\//g, '_')}.pdf`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Invoice details
    doc.fontSize(12);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`);
    doc.text(`Payment Status: ${invoice.paymentStatus}`);
    doc.text(`Payment Method: ${invoice.paymentMethod}`);
    doc.moveDown();
    
    // Company details
    doc.fontSize(14).text('Company Details', { underline: true });
    doc.fontSize(12);
    doc.text(`Name: ${invoice.company.name}`);
    doc.text(`Address: ${invoice.company.address}`);
    if (invoice.company.gstNumber) {
      doc.text(`GST Number: ${invoice.company.gstNumber}`);
    }
    doc.moveDown();
    
    // Customer details
    doc.fontSize(14).text('Customer Details', { underline: true });
    doc.fontSize(12);
    doc.text(`Name: ${invoice.customer.name}`);
    doc.text(`Email: ${invoice.customer.email}`);
    doc.text(`Phone: ${invoice.customer.phone}`);
    doc.moveDown();
    
    // Items table header
    doc.fontSize(14).text('Items', { underline: true });
    doc.moveDown(0.5);
    
    // Table header
    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text('Product', 50, tableTop, { width: 200 });
    doc.text('Qty', 250, tableTop, { width: 50 });
    doc.text('Price', 300, tableTop, { width: 80 });
    doc.text('Total', 400, tableTop, { width: 80 });
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    
    // Items
    let y = tableTop + 25;
    invoice.items.forEach(item => {
      doc.text(item.productName, 50, y, { width: 200 });
      doc.text(item.quantity.toString(), 250, y, { width: 50 });
      doc.text(`₹${item.price.toFixed(2)}`, 300, y, { width: 80 });
      doc.text(`₹${item.total.toFixed(2)}`, 400, y, { width: 80 });
      y += 20;
    });
    
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 15;
    
    // Summary
    doc.fontSize(12);
    doc.text(`Subtotal: ₹${invoice.subtotal.toFixed(2)}`, 350, y);
    y += 20;
    if (invoice.discount > 0) {
      doc.text(`Discount: -₹${invoice.discount.toFixed(2)}`, 350, y);
      y += 20;
    }
    if (invoice.gst?.cgst > 0) {
      doc.text(`CGST: ₹${invoice.gst.cgst.toFixed(2)}`, 350, y);
      y += 20;
    }
    if (invoice.gst?.sgst > 0) {
      doc.text(`SGST: ₹${invoice.gst.sgst.toFixed(2)}`, 350, y);
      y += 20;
    }
    doc.fontSize(14).text(`Grand Total: ₹${invoice.grandTotal.toFixed(2)}`, 350, y, { underline: true });
    
    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'Error downloading PDF', error: err.message });
  }
};

// View invoice PDF in browser
exports.viewInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId).populate('order transaction createdBy');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Security: Only allow owner, admin, HR, Accountant, or approved Employee
    if (req.user.role === 'Employee') {
      if (!invoice.employeeAccessApproved) {
        return res.status(403).json({ message: 'HR approval required to view this invoice' });
      }
    } else if (req.user.role !== 'Admin' && req.user.role !== 'HR' && req.user.role !== 'Accountant' && String(invoice.customer.email) !== req.user.email) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate PDF on the fly
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for inline PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Invoice_${invoice.invoiceNumber.replace(/\//g, '_')}.pdf`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Invoice details
    doc.fontSize(12);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`);
    doc.text(`Payment Status: ${invoice.paymentStatus}`);
    doc.text(`Payment Method: ${invoice.paymentMethod}`);
    doc.moveDown();
    
    // Company details
    doc.fontSize(14).text('Company Details', { underline: true });
    doc.fontSize(12);
    doc.text(`Name: ${invoice.company.name}`);
    doc.text(`Address: ${invoice.company.address}`);
    if (invoice.company.gstNumber) {
      doc.text(`GST Number: ${invoice.company.gstNumber}`);
    }
    doc.moveDown();
    
    // Customer details
    doc.fontSize(14).text('Customer Details', { underline: true });
    doc.fontSize(12);
    doc.text(`Name: ${invoice.customer.name}`);
    doc.text(`Email: ${invoice.customer.email}`);
    doc.text(`Phone: ${invoice.customer.phone}`);
    doc.moveDown();
    
    // Items table header
    doc.fontSize(14).text('Items', { underline: true });
    doc.moveDown(0.5);
    
    // Table header
    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text('Product', 50, tableTop, { width: 200 });
    doc.text('Qty', 250, tableTop, { width: 50 });
    doc.text('Price', 300, tableTop, { width: 80 });
    doc.text('Total', 400, tableTop, { width: 80 });
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    
    // Items
    let y = tableTop + 25;
    invoice.items.forEach(item => {
      doc.text(item.productName, 50, y, { width: 200 });
      doc.text(item.quantity.toString(), 250, y, { width: 50 });
      doc.text(`₹${item.price.toFixed(2)}`, 300, y, { width: 80 });
      doc.text(`₹${item.total.toFixed(2)}`, 400, y, { width: 80 });
      y += 20;
    });
    
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 15;
    
    // Summary
    doc.fontSize(12);
    doc.text(`Subtotal: ₹${invoice.subtotal.toFixed(2)}`, 350, y);
    y += 20;
    if (invoice.discount > 0) {
      doc.text(`Discount: -₹${invoice.discount.toFixed(2)}`, 350, y);
      y += 20;
    }
    if (invoice.gst?.cgst > 0) {
      doc.text(`CGST: ₹${invoice.gst.cgst.toFixed(2)}`, 350, y);
      y += 20;
    }
    if (invoice.gst?.sgst > 0) {
      doc.text(`SGST: ₹${invoice.gst.sgst.toFixed(2)}`, 350, y);
      y += 20;
    }
    doc.fontSize(14).text(`Grand Total: ₹${invoice.grandTotal.toFixed(2)}`, 350, y, { underline: true });
    
    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'Error viewing PDF', error: err.message });
  }
};

// Approve employee access to invoice (HR/Admin only)
exports.approveEmployeeAccess = async (req, res) => {
  try {
    if (!['HR', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only HR or Admin can approve invoice access' });
    }
    const invoice = await Invoice.findById(req.params.invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.employeeAccessApproved = true;
    invoice.approvedBy = req.user._id;
    invoice.approvedAt = new Date();
    await invoice.save();

    res.json({ message: 'Employee access approved', invoice });
  } catch (err) {
    res.status(500).json({ message: 'Error approving access', error: err.message });
  }
};

// Revoke employee access to invoice (HR/Admin only)
exports.revokeEmployeeAccess = async (req, res) => {
  try {
    if (!['HR', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only HR or Admin can revoke invoice access' });
    }
    const invoice = await Invoice.findById(req.params.invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.employeeAccessApproved = false;
    invoice.approvedBy = undefined;
    invoice.approvedAt = undefined;
    await invoice.save();

    res.json({ message: 'Employee access revoked', invoice });
  } catch (err) {
    res.status(500).json({ message: 'Error revoking access', error: err.message });
  }
};

// Bulk approve/revoke employee access (HR/Admin only)
exports.bulkApproveEmployeeAccess = async (req, res) => {
  try {
    if (!['HR', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only HR or Admin can manage invoice access' });
    }
    const { invoiceIds, approve } = req.body;
    if (!invoiceIds || !Array.isArray(invoiceIds)) {
      return res.status(400).json({ message: 'invoiceIds array is required' });
    }
    const updateData = approve
      ? { employeeAccessApproved: true, approvedBy: req.user._id, approvedAt: new Date() }
      : { employeeAccessApproved: false, $unset: { approvedBy: '', approvedAt: '' } };

    await Invoice.updateMany({ _id: { $in: invoiceIds } }, updateData);
    res.json({ message: `Employee access ${approve ? 'approved' : 'revoked'} for ${invoiceIds.length} invoices` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating access', error: err.message });
  }
};
