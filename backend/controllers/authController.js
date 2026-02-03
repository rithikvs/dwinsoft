// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Only Admin can create users. No public registration.
const createUser = async (req, res) => {
    // Only allow Admin to access this controller (route must be protected)
    const { username, email, password, role } = req.body;
    try {
        // Only allow dwinsoft.com emails
        if (!email.endsWith('@dwinsoft.com')) {
            return res.status(400).json({ message: 'Email must be an official dwinsoft.com address.' });
        }
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        user = new User({ username, email, password, role });
        await user.save();
        res.status(201).json({ message: 'User created successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        // Only allow login for emails created by Admin (i.e., present in DB)
        if (!user) {
            return res.status(403).json({ message: 'Access denied. Contact Admin.' });
        }
        // Only allow dwinsoft.com emails
        if (!email.endsWith('@dwinsoft.com')) {
            return res.status(403).json({ message: 'Access denied. Only official emails allowed.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        const payload = {
            id: user.id,
            role: user.role
        };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role, username: user.username });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { createUser, loginUser, getAllUsers };
