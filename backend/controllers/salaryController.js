const User = require('../models/User');

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

        if (salary !== undefined) user.salary = salary;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (department !== undefined) user.department = department;
        if (designation !== undefined) user.designation = designation;
        if (joiningDate !== undefined) user.joiningDate = joiningDate;
        if (bankName !== undefined) user.bankName = bankName;
        if (bankAccountNumber !== undefined) user.bankAccountNumber = bankAccountNumber;
        if (ifscCode !== undefined) user.ifscCode = ifscCode;

        await user.save();
        const updatedUser = await User.findById(req.params.id).select('-password');
        res.json(updatedUser);
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

module.exports = { getAllStaff, updateStaffInfo, getMyProfile };
