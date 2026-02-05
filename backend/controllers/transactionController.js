const Transaction = require('../models/Transaction');
const Employee = require('../models/Employee');

// Get all transactions (Admin/Accountant), payroll only for HR, none for Employee
exports.getTransactions = async (req, res) => {
    try {
        const role = req.user.role;
        let transactions;
        if (role === 'Admin' || role === 'Accountant' || role === 'HR') {
            transactions = await Transaction.find();
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Add transaction (Admin/Accountant only)
exports.addTransaction = async (req, res) => {
    console.log('Adding transaction:', req.body);
    console.log('User role:', req.user ? req.user.role : 'No user');

    if (!(req.user.role === 'Admin' || req.user.role === 'Accountant')) {
        console.log('Access denied for role:', req.user.role);
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const { description, amount, type, category, date } = req.body;
        const transaction = new Transaction({ description, amount, type, category, date });
        await transaction.save();
        console.log('Transaction saved:', transaction);
        res.status(201).json(transaction);
    } catch (err) {
        console.error('Error in addTransaction:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Edit transaction (Admin/Accountant only)
exports.updateTransaction = async (req, res) => {
    if (!(req.user.role === 'Admin' || req.user.role === 'Accountant')) {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!transaction) return res.status(404).json({ message: 'Not found' });
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete transaction (Admin/Accountant only)
exports.deleteTransaction = async (req, res) => {
    if (!(req.user.role === 'Admin' || req.user.role === 'Accountant')) {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Not found' });
        // Move to recycle bin
        const { addDeletedTransaction } = require('./recycleBinController');
        await addDeletedTransaction(transaction.toObject());
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Filter/search transactions (Admin/Accountant/HR)
exports.filterTransactions = async (req, res) => {
    try {
        const role = req.user.role;
        const { type, category, startDate, endDate } = req.query;
        let filter = {};
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }
        // HR can now see all categories, not just Payroll
        if (!(role === 'Admin' || role === 'Accountant' || role === 'HR')) {
            return res.status(403).json({ message: 'Access denied' });
        }
        console.log('Transaction filter:', filter);
        const transactions = await Transaction.find(filter);
        console.log('Transactions found:', transactions.length);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
