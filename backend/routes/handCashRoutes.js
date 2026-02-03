const express = require('express');
const router = express.Router();
const handCashController = require('../controllers/handCashController');

router.get('/', handCashController.getAllHandCash);
router.post('/', handCashController.createHandCash);

module.exports = router;
