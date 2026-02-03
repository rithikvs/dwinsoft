const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Transaction = require('./models/Transaction');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Employee.deleteMany({});
        await Transaction.deleteMany({});

        console.log('Creating Users...');
        // Hash passwords manually here as pre-save might not trigger on insertMany properly if not careful, 
        // but creating instances triggers it.

        const users = [
            { username: 'admin', email: 'admin@dwinsoft.com', password: 'password123', role: 'Admin' },
            { username: 'accountant', email: 'accountant@dwinsoft.com', password: 'password123', role: 'Accountant' },
            { username: 'hr', email: 'hr@dwinsoft.com', password: 'password123', role: 'HR' },
            { username: 'employee', email: 'employee@dwinsoft.com', password: 'password123', role: 'Employee' }
        ];

        for (const u of users) {
            const user = new User(u);
            await user.save(); // Triggers pre-save hook for hashing
        }

        console.log('Creating Employees...');
        const employees = [
            { name: 'John Doe', email: 'john@dwinsoft.com', position: 'Software Engineer', department: 'IT', salary: 80000 },
            { name: 'Jane Smith', email: 'jane@dwinsoft.com', position: 'HR Manager', department: 'HR', salary: 75000 },
            { name: 'Bob Johnson', email: 'bob@dwinsoft.com', position: 'Accountant', department: 'Finance', salary: 70000 }
        ];
        await Employee.insertMany(employees);

        console.log('Creating Transactions...');
        const transactions = [
            { description: 'Client Payment', amount: 5000, type: 'Income', category: 'Sales' },
            { description: 'Office Rent', amount: 2000, type: 'Expense', category: 'Rent' },
            { description: 'Server Costs', amount: 500, type: 'Expense', category: 'Infrastructure' }
        ];
        await Transaction.insertMany(transactions);

        console.log('Database seeded successfully! 🌱');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
