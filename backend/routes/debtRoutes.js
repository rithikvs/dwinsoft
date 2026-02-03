const express = require('express');
const router = express.Router();
const debtController = require('../controllers/debtController');

router.get('/', debtController.getAllDebts);
router.post('/', debtController.createDebt);

module.exports = router;
