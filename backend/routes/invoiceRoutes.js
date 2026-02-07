
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/authMiddleware');

// Create invoice (after transaction)
router.post('/create', authenticate, invoiceController.createInvoice);

// Admin: get all invoices, filter, monthly total
router.get('/', authenticate, invoiceController.getAllInvoices);

// View invoice PDF in browser
router.get('/view/:invoiceId', authenticate, invoiceController.viewInvoicePDF);

// Download invoice PDF
router.get('/download/:invoiceId', authenticate, invoiceController.downloadInvoicePDF);

// HR/Admin: Approve employee access to invoice
router.put('/approve/:invoiceId', authenticate, invoiceController.approveEmployeeAccess);

// HR/Admin: Revoke employee access to invoice
router.put('/revoke/:invoiceId', authenticate, invoiceController.revokeEmployeeAccess);

// Employee: Request access to view an invoice
router.put('/request-access/:invoiceId', authenticate, invoiceController.requestAccess);

// HR/Admin: Bulk approve/revoke employee access
router.put('/bulk-access', authenticate, invoiceController.bulkApproveEmployeeAccess);

// Get all invoices for a user
router.get('/user/:userId', authenticate, invoiceController.getInvoicesByUser);

// Get invoice by ID (must be last as it's a catch-all pattern)
router.get('/:invoiceId', authenticate, invoiceController.getInvoiceById);

module.exports = router;
