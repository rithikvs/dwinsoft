const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { getAllStaff, updateStaffInfo, getMyProfile } = require('../controllers/salaryController');

// GET own profile (any authenticated user)
router.get('/me', authenticate, getMyProfile);

// GET all HR + Employee staff (Admin only)
router.get('/staff', authenticate, authorize('Admin'), getAllStaff);

// PUT update salary & info for a user (Admin only)
router.put('/staff/:id', authenticate, authorize('Admin'), updateStaffInfo);

module.exports = router;
