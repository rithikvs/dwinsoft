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
router.put('/:id', authenticate, transactionController.updateTransaction);
router.delete('/:id', authenticate, transactionController.deleteTransaction);
router.get('/search/filter', authenticate, transactionController.filterTransactions);

module.exports = router;
