const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BankAccount = require('./models/BankAccount');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dwinsoft')
    .then(async () => {
        console.log('Connected to MongoDB');
        const accounts = await BankAccount.find();
        console.log('Bank Accounts:', JSON.stringify(accounts, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
