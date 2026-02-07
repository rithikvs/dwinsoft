const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { getAllStaff, updateStaffInfo, getMyProfile, upsertMonthlySalary, getSalaryRecordsByUser, getAllSalaryRecords, getMySalaryRecords, deleteSalaryRecord } = require('../controllers/salaryController');

// GET own profile (any authenticated user)
router.get('/me', authenticate, getMyProfile);

// GET own salary records (HR/Employee)
router.get('/my-records', authenticate, getMySalaryRecords);

// GET all HR + Employee staff (Admin only)
router.get('/staff', authenticate, authorize('Admin'), getAllStaff);

// GET all salary records (Admin only) — optional ?month=&year= query
router.get('/records', authenticate, authorize('Admin'), getAllSalaryRecords);

// GET salary records for a specific user (Admin only)
router.get('/records/:userId', authenticate, authorize('Admin'), getSalaryRecordsByUser);

// POST create/update monthly salary record (Admin only)
router.post('/records', authenticate, authorize('Admin'), upsertMonthlySalary);

// DELETE a salary record (Admin only)
router.delete('/records/:id', authenticate, authorize('Admin'), deleteSalaryRecord);

// PUT update staff personal info (Admin only)
router.put('/staff/:id', authenticate, authorize('Admin'), updateStaffInfo);

module.exports = router;
