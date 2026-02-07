const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/role', require('./routes/roleRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

app.use('/api/bank-accounts', require('./routes/bankAccountRoutes'));
app.use('/api/debts', require('./routes/debtRoutes'));
app.use('/api/hand-cash', require('./routes/handCashRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/salary', require('./routes/salaryRoutes'));

app.use('/api/recycle-bin', require('./routes/recycleBinRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
