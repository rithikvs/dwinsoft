const express = require('express');
const router = express.Router();
const { authenticate, authorize, permit } = require('../middleware/authMiddleware');

// Example: Admin-only route
router.get('/admin', authenticate, authorize('Admin'), (req, res) => {
    res.json({ message: 'Admin dashboard: full access.' });
});

// Accountant routes
router.get('/finance', authenticate, authorize('Accountant', 'Admin'), permit('view_financials'), (req, res) => {
    res.json({ message: 'Finance dashboard: income, expenses, invoicing, payroll, taxation, reports.' });
});

// HR routes
router.get('/hr', authenticate, authorize('HR', 'Admin'), permit('view_employee'), (req, res) => {
    res.json({ message: 'HR dashboard: employee management, attendance, payroll view, payslip generation.' });
});

// Employee routes
router.get('/employee', authenticate, authorize('Employee'), permit('view_own_profile'), (req, res) => {
    res.json({ message: 'Employee dashboard: view own profile, payslips, tax details.' });
});

// Auditor routes
router.get('/audit', authenticate, authorize('Auditor', 'Admin'), permit('view_reports'), (req, res) => {
    res.json({ message: 'Auditor dashboard: read-only access to financial reports.' });
});

// Access denied fallback (for frontend to redirect)
router.get('/access-denied', (req, res) => {
    res.status(403).json({ message: 'Access Denied' });
});

module.exports = router;
