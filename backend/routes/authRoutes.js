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

module.exports = router;
