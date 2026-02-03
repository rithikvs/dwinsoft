const express = require('express');
const router = express.Router();
const bankAccountController = require('../controllers/bankAccountController');

router.get('/', bankAccountController.getAllBankAccounts);
router.post('/', bankAccountController.createBankAccount);

module.exports = router;
