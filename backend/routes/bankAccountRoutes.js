const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const bankAccountController = require('../controllers/bankAccountController');

router.get('/', authenticate, bankAccountController.getAllBankAccounts);
router.post('/', authenticate, bankAccountController.createBankAccount);
router.put('/:id', authenticate, bankAccountController.updateBankAccount);
router.delete('/:id', authenticate, bankAccountController.deleteBankAccount);

module.exports = router;
