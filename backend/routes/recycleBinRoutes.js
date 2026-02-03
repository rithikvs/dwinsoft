const express = require('express');
const router = express.Router();
const recycleBinController = require('../controllers/recycleBinController');

router.get('/', recycleBinController.getDeletedTransactions);

module.exports = router;
