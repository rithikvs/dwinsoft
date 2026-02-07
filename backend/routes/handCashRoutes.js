const express = require('express');
const router = express.Router();
const handCashController = require('../controllers/handCashController');

router.get('/', handCashController.getAllHandCash);
router.post('/', handCashController.createHandCash);
router.get('/:id', handCashController.getHandCashById);
router.put('/:id', handCashController.updateHandCash);
router.delete('/:id', handCashController.deleteHandCash);

module.exports = router;
