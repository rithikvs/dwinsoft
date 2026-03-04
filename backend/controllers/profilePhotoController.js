const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Upload or update profile photo
exports.uploadProfilePhoto = async (req, res) => {
    try {
        console.log('\n========== PHOTO UPLOAD START ==========');
        console.log('User:', req.user ? req.user._id : 'NO USER');
        console.log('File:', req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            size: req.file.size
        } : 'NO FILE');

        if (!req.user) {
            console.error('ERROR: No authenticated user');
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!req.file) {
            console.error('ERROR: No file in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!req.file.buffer) {
            console.error('ERROR: File has no buffer');
            return res.status(400).json({ error: 'File buffer missing' });
        }

        const userId = String(req.user._id);
        console.log('UserId:', userId);
        console.log('Fetching user from database...');

        const user = await User.findById(userId);
        console.log('User found:', user ? user.username : 'NOT FOUND');

        if (!user) {
            console.error('ERROR: User not found in database');
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete old photo if exists
        if (user.profilePhoto) {
            const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
            console.log('Old photo exists, deleting from:', oldPhotoPath);
            if (fs.existsSync(oldPhotoPath)) {
                try {
                    fs.unlinkSync(oldPhotoPath);
                    console.log('Old photo deleted successfully');
                } catch (delErr) {
                    console.error('Failed to delete old photo:', delErr.message);
                }
            } else {
                console.warn('Old photo file does not exist at path');
            }
        }

        // Generate filename
        const uploadsDir = path.join(__dirname, '..', 'uploads', 'profile-photos');
        console.log('Upload directory:', uploadsDir);
        console.log('Directory exists:', fs.existsSync(uploadsDir));

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(req.file.originalname).toLowerCase();
        const filename = 'profile-' + userId + '-' + uniqueSuffix + ext;
        const filePath = path.join(uploadsDir, filename);

        console.log('Writing file:',  filename);
        console.log('Full path:', filePath);
        console.log('Buffer size:', req.file.buffer.length);

        // Write file from buffer
        try {
            fs.writeFileSync(filePath, req.file.buffer);
            console.log('File written successfully');
            console.log('File exists after write:', fs.existsSync(filePath));
            console.log('File size on disk:', fs.statSync(filePath).size);
        } catch (writeErr) {
            console.error('ERROR writing file:', writeErr);
            return res.status(500).json({ error: 'Failed to write file: ' + writeErr.message });
        }

        // Save new photo path
        const photoPath = `/uploads/profile-photos/${filename}`;
        console.log('Saving photo path to database:', photoPath);
        
        user.profilePhoto = photoPath;
        const savedUser = await user.save();
        
        console.log('User saved successfully');
        console.log('========== PHOTO UPLOAD SUCCESS ==========\n');

        res.json({
            message: 'Profile photo uploaded successfully',
            profilePhoto: photoPath
        });
    } catch (err) {
        console.error('========== PHOTO UPLOAD FAILED ==========');
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
        console.error('==========================================\n');
        
        res.status(500).json({ 
            error: 'Failed to upload profile photo', 
            details: err.message 
        });
    }
};

// Delete profile photo
exports.deleteProfilePhoto = async (req, res) => {
    try {
        console.log('[PhotoDelete] Starting delete for user:', req.user._id);

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            console.error('[PhotoDelete] User not found:', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.profilePhoto) {
            const photoPath = path.join(__dirname, '..', user.profilePhoto);
            console.log('[PhotoDelete] Deleting photo from:', photoPath);
            if (fs.existsSync(photoPath)) {
                try {
                    fs.unlinkSync(photoPath);
                    console.log('[PhotoDelete] Photo file deleted');
                } catch (delErr) {
                    console.error('[PhotoDelete] Failed to delete file:', delErr.message);
                }
            }
            user.profilePhoto = null;
            await user.save();
            console.log('[PhotoDelete] User updated in database');
        }

        console.log('[PhotoDelete] Success for user:', userId);
        res.json({ message: 'Profile photo deleted successfully' });
    } catch (err) {
        console.error('[PhotoDelete] Error:', err);
        res.status(500).json({ error: 'Failed to delete profile photo', details: err.message });
    }
};

// Get user profile including photo
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('[ProfileFetch] Fetching profile for user:', userId);
        const user = await User.findById(userId).select('-password');

        if (!user) {
            console.error('[ProfileFetch] User not found:', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('[ProfileFetch] User profile fetched:', userId);
        res.json(user);
    } catch (err) {
        console.error('[ProfileFetch] Error:', err);
        res.status(500).json({ error: 'Failed to fetch user profile', details: err.message });
    }
};
