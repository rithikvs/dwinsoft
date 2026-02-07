const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transactionController');

// Get all or filtered transactions
// Add transaction
// Update transaction
// Delete transaction
// Filter/search transactions
router.get('/', authenticate, transactionController.getTransactions);
router.post('/', authenticate, transactionController.addTransaction);
router.get('/search/filter', authenticate, transactionController.filterTransactions);

// Employee: Request invoice access for a transaction
router.put('/request-invoice-access/:id', authenticate, transactionController.requestInvoiceAccess);

// HR/Admin: Approve invoice access for a transaction
router.put('/approve-invoice-access/:id', authenticate, transactionController.approveInvoiceAccess);

// HR/Admin: Revoke invoice access for a transaction
router.put('/revoke-invoice-access/:id', authenticate, transactionController.revokeInvoiceAccess);

router.put('/:id', authenticate, transactionController.updateTransaction);
router.delete('/:id', authenticate, transactionController.deleteTransaction);

module.exports = router;
