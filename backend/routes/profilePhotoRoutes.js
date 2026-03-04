const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/authMiddleware');
const { uploadProfilePhoto, deleteProfilePhoto, getUserProfile } = require('../controllers/profilePhotoController');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'profile-photos');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for profile photos with memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        console.log('[Multer] File received:', file.fieldname, file.mimetype);
        // Only allow image files
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Test endpoint to verify authentication
router.get('/test', authenticate, (req, res) => {
    console.log('[Test] Auth OK, user:', req.user._id);
    res.json({ 
        message: 'Auth working', 
        userId: req.user._id, 
        username: req.user.username,
        uploadDirExists: fs.existsSync(uploadsDir)
    });
});

// Wrapper to handle async errors
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Routes
router.post('/upload', 
    authenticate,
    (req, res, next) => {
        upload.single('profilePhoto')(req, res, (err) => {
            if (err) {
                console.error('[Upload] Multer error:', err.message);
                return res.status(400).json({ error: 'Upload error: ' + err.message });
            }
            next();
        });
    },
    uploadProfilePhoto
);

router.delete('/delete', authenticate, deleteProfilePhoto);
router.get('/me', authenticate, getUserProfile);

module.exports = router;
