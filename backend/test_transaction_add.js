const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const testAdd = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const t = new Transaction({
            description: 'Test Transaction',
            amount: 100,
            type: 'Income',
            category: 'Sales',
            date: new Date()
        });

        const saved = await t.save();
        console.log('Transaction saved:', saved);
    } catch (err) {
        console.error('Error saving:', err);
    } finally {
        mongoose.disconnect();
    }
};

testAdd();
