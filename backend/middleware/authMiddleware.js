const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied: ${req.user ? req.user.role : 'No user'} is not authorized to access this route.`
            });
        }
        next();
    };
};



// Strict RBAC route mapping for API usage
const rolePermissions = {
    Admin: [
        'manage_users', 'manage_roles', 'view_financials', 'manage_financials', 'view_hr', 'manage_hr', 'view_employee', 'manage_employee', 'view_audit', 'manage_audit'
    ],
    Accountant: [
        'view_financials', 'manage_financials', 'view_reports', 'manage_payroll', 'manage_invoices', 'manage_taxation'
    ],
    HR: [
        'view_employee', 'manage_employee', 'view_attendance', 'view_payroll', 'generate_payslip'
    ],
    Employee: [
        'view_own_profile', 'view_own_payslip', 'view_own_tax'
    ],
    Auditor: [
        'view_reports'
    ]
};

const permit = (permission) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !rolePermissions[userRole] || !rolePermissions[userRole].includes(permission)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions.' });
        }
        next();
    };
};

module.exports = { authenticate, authorize, permit };
