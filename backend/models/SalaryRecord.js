const mongoose = require('mongoose');

const SalaryRecordSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true, default: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    paidDate: { type: Date, default: null },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Ensure one record per user per month/year
SalaryRecordSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('SalaryRecord', SalaryRecordSchema);
