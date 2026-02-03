const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// GET /api/stats/users
router.get('/users', async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/stats/revenue
router.get('/revenue', async (req, res) => {
    try {
        // Sum of all Income transactions
        const result = await Transaction.aggregate([
            { $match: { type: 'Income' } },
            { $group: { _id: null, amount: { $sum: '$amount' } } }
        ]);
        const amount = result[0]?.amount || 0;
        res.json({ amount });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/stats/pending-approvals
router.get('/pending-approvals', async (req, res) => {
    try {
        // Example: count of users with status 'pending' (adjust as needed)
        const count = await User.countDocuments({ status: 'pending' });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/stats/system-alerts
router.get('/system-alerts', async (req, res) => {
    try {
        // Example: count of transactions with amount > 100000 (as an alert)
        const count = await Transaction.countDocuments({ amount: { $gt: 100000 } });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
