const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Accountant', 'HR', 'Employee', 'Auditor'],
        default: 'Accountant'
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    joiningDate: { type: Date, default: null },
    salary: { type: Number, default: 0 },
    bankName: { type: String, default: '' },
    bankAccountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' }
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);
