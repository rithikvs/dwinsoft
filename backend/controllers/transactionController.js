const Transaction = require('../models/Transaction');

// Get all transactions (Admin/Accountant/HR full, Employee read-only)
exports.getTransactions = async (req, res) => {
    try {
        const role = req.user.role;
        let transactions;
        if (role === 'Admin' || role === 'Accountant' || role === 'HR' || role === 'Employee') {
            transactions = await Transaction.find()
                .populate('bankAccountId', 'accountNumber accountHolder balance')
                .populate('handCashId', 'holder amount')
                .populate('invoiceAccessRequestedBy', 'username email')
                .populate('invoiceApprovedBy', 'username email');
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
        const { description, amount, type, category, date, paymentMethod, bankAccountId, handCashId } = req.body;
        const normalizedPaymentMethod = paymentMethod || 'Bank Account';
        const normalizedBankAccountId = bankAccountId || undefined;
        const normalizedHandCashId = handCashId || undefined;
        const transaction = new Transaction({ 
            description, 
            amount, 
            type, 
            category, 
            date,
            paymentMethod: normalizedPaymentMethod,
            bankAccountId: normalizedPaymentMethod === 'Bank Account' ? normalizedBankAccountId : undefined,
            handCashId: normalizedPaymentMethod === 'Hand Cash' ? normalizedHandCashId : undefined
        });
        await transaction.save();
        await transaction.populate('bankAccountId', 'accountNumber accountHolder balance');
        await transaction.populate('handCashId', 'holder amount');
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
        const payload = { ...req.body };
        if (payload.paymentMethod) {
            if (payload.paymentMethod === 'Bank Account') {
                payload.handCashId = undefined;
                payload.bankAccountId = payload.bankAccountId || undefined;
            }
            if (payload.paymentMethod === 'Hand Cash') {
                payload.bankAccountId = undefined;
                payload.handCashId = payload.handCashId || undefined;
            }
        } else {
            payload.bankAccountId = payload.bankAccountId || undefined;
            payload.handCashId = payload.handCashId || undefined;
        }
        const transaction = await Transaction.findByIdAndUpdate(req.params.id, payload, { new: true })
            .populate('bankAccountId', 'accountNumber accountHolder balance')
            .populate('handCashId', 'holder amount');
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
        const { type, category, startDate, endDate, paymentMethod } = req.query;
        let filter = {};
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (paymentMethod) filter.paymentMethod = paymentMethod;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }
        // HR and Employee can see all categories (Employee is read-only)
        if (!(role === 'Admin' || role === 'Accountant' || role === 'HR' || role === 'Employee')) {
            return res.status(403).json({ message: 'Access denied' });
        }
        console.log('Transaction filter:', filter);
        const transactions = await Transaction.find(filter)
            .populate('bankAccountId', 'accountNumber accountHolder balance')
            .populate('handCashId', 'holder amount');
        console.log('Transactions found:', transactions.length);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Employee: Request invoice access for a transaction
exports.requestInvoiceAccess = async (req, res) => {
    try {
        if (req.user.role !== 'Employee') {
            return res.status(403).json({ message: 'Only employees can request invoice access' });
        }
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        if (transaction.invoiceAccessApproved) {
            return res.status(400).json({ message: 'Invoice access already approved' });
        }
        if (transaction.invoiceAccessRequested) {
            return res.status(400).json({ message: 'Access request already pending' });
        }

        transaction.invoiceAccessRequested = true;
        transaction.invoiceAccessRequestedBy = req.user._id;
        transaction.invoiceAccessRequestedAt = new Date();
        await transaction.save();

        res.json({ message: 'Invoice access request sent to HR', transaction });
    } catch (err) {
        res.status(500).json({ message: 'Error requesting access', error: err.message });
    }
};

// HR/Admin: Approve invoice access for a transaction
exports.approveInvoiceAccess = async (req, res) => {
    try {
        if (!['HR', 'Admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Only HR or Admin can approve invoice access' });
        }
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        transaction.invoiceAccessApproved = true;
        transaction.invoiceApprovedBy = req.user._id;
        transaction.invoiceApprovedAt = new Date();
        transaction.invoiceAccessRequested = false;
        transaction.invoiceAccessRequestedBy = undefined;
        transaction.invoiceAccessRequestedAt = undefined;
        await transaction.save();

        res.json({ message: 'Invoice access approved', transaction });
    } catch (err) {
        res.status(500).json({ message: 'Error approving access', error: err.message });
    }
};

// HR/Admin: Revoke invoice access for a transaction
exports.revokeInvoiceAccess = async (req, res) => {
    try {
        if (!['HR', 'Admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Only HR or Admin can revoke invoice access' });
        }
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        transaction.invoiceAccessApproved = false;
        transaction.invoiceApprovedBy = undefined;
        transaction.invoiceApprovedAt = undefined;
        transaction.invoiceAccessRequested = false;
        transaction.invoiceAccessRequestedBy = undefined;
        transaction.invoiceAccessRequestedAt = undefined;
        await transaction.save();

        res.json({ message: 'Invoice access revoked', transaction });
    } catch (err) {
        res.status(500).json({ message: 'Error revoking access', error: err.message });
    }
};
