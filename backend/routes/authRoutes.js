const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/authMiddleware');
const { createUser, loginUser, getAllUsers } = require('../controllers/authController');
// Admin: get all users
router.get('/users', authenticate, authorize('Admin'), getAllUsers);

// Only Admin can create users
router.post('/create-user', authenticate, authorize('Admin'), createUser);
// No public registration route
router.post('/login', loginUser);
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update own profile (name, email)
router.put('/me', authenticate, async (req, res) => {
    try {
        const User = require('../models/User');
        const { username, email } = req.body;
        const updated = await User.findByIdAndUpdate(req.user.id, { username, email }, { new: true }).select('-password');
        res.json(updated);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
    try {
        const User = require('../models/User');
        const bcrypt = require('bcryptjs');
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
        if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await User.findByIdAndUpdate(user._id, { password: user.password });
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
