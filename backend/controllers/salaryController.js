const User = require('../models/User');
const SalaryRecord = require('../models/SalaryRecord');

// GET all HR + Employee users with salary info (Admin only)
const getAllStaff = async (req, res) => {
    try {
        const users = await User.find(
            { role: { $in: ['HR', 'Employee'] } },
            '-password'
        ).sort({ role: 1, username: 1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// PUT update salary & personal info for a user (Admin only)
const updateStaffInfo = async (req, res) => {
    try {
        const { salary, phone, address, department, designation, joiningDate, bankName, bankAccountNumber, ifscCode } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!['HR', 'Employee'].includes(user.role)) {
            return res.status(400).json({ message: 'Can only update HR and Employee profiles' });
        }

        const updateFields = {};
        if (salary !== undefined) updateFields.salary = salary;
        if (phone !== undefined) updateFields.phone = phone;
        if (address !== undefined) updateFields.address = address;
        if (department !== undefined) updateFields.department = department;
        if (designation !== undefined) updateFields.designation = designation;
        if (joiningDate !== undefined) updateFields.joiningDate = joiningDate;
        if (bankName !== undefined) updateFields.bankName = bankName;
        if (bankAccountNumber !== undefined) updateFields.bankAccountNumber = bankAccountNumber;
        if (ifscCode !== undefined) updateFields.ifscCode = ifscCode;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
        ).select('-password');
        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// POST create/update monthly salary record (Admin only)
const upsertMonthlySalary = async (req, res) => {
    try {
        const { userId, month, year, basicSalary, bonus, deductions, notes, status } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!['HR', 'Employee'].includes(user.role)) {
            return res.status(400).json({ message: 'Can only assign salary to HR and Employees' });
        }

        const netSalary = (Number(basicSalary) || 0) + (Number(bonus) || 0) - (Number(deductions) || 0);

        const record = await SalaryRecord.findOneAndUpdate(
            { user: userId, month, year },
            {
                basicSalary: Number(basicSalary) || 0,
                bonus: Number(bonus) || 0,
                deductions: Number(deductions) || 0,
                netSalary,
                notes: notes || '',
                status: status || 'Pending',
                paidDate: status === 'Paid' ? new Date() : null,
                createdBy: req.user.id,
            },
            { new: true, upsert: true }
        );
        const populated = await SalaryRecord.findById(record._id).populate('user', 'username email role');
        res.json(populated);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Salary record already exists for this month' });
        }
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// GET salary records for a specific user (Admin)
const getSalaryRecordsByUser = async (req, res) => {
    try {
        const records = await SalaryRecord.find({ user: req.params.userId })
            .populate('user', 'username email role')
            .sort({ year: -1, month: -1 });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// GET all salary records (Admin) — optional filter by month/year
const getAllSalaryRecords = async (req, res) => {
    try {
        const { month, year } = req.query;
        const filter = {};
        if (month) filter.month = Number(month);
        if (year) filter.year = Number(year);
        const records = await SalaryRecord.find(filter)
            .populate('user', 'username email role department designation')
            .sort({ year: -1, month: -1, 'user.username': 1 });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// GET own salary records (HR/Employee)
const getMySalaryRecords = async (req, res) => {
    try {
        const records = await SalaryRecord.find({ user: req.user.id })
            .sort({ year: -1, month: -1 });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// DELETE a salary record (Admin only)
const deleteSalaryRecord = async (req, res) => {
    try {
        const record = await SalaryRecord.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        res.json({ message: 'Salary record deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// GET own profile (any authenticated user)
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getAllStaff, updateStaffInfo, getMyProfile, upsertMonthlySalary, getSalaryRecordsByUser, getAllSalaryRecords, getMySalaryRecords, deleteSalaryRecord };
