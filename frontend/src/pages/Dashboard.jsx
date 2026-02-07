import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        income: 0,
        expense: 0,
        balance: 0,
        transactionCount: 0,
        totalHandCash: 0,
        totalBankBalance: 0,
        handCashCount: 0,
        bankAccountCount: 0
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const getPaymentMethodLabel = (transaction) => {
        if (transaction?.paymentMethod) return transaction.paymentMethod;
        if (transaction?.bankAccountId) return 'Bank Account';
        if (transaction?.handCashId) return 'Hand Cash';
        return '';
    };

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch all transactions
            const transRes = await axios.get(`${API_BASE_URL}/api/transactions`);
            const transactions = transRes.data;

            // Fetch bank accounts
            const bankRes = await axios.get(`${API_BASE_URL}/api/bank-accounts`);
            const bankAccounts = bankRes.data;

            let income = 0;
            let expense = 0;
            let handCashIncome = 0;
            let handCashExpense = 0;
            const handCashIds = new Set();

            transactions.forEach(t => {
                if (t.type === 'Income') income += t.amount;
                else if (t.type === 'Expense') expense += t.amount;

                const method = getPaymentMethodLabel(t);
                if (method === 'Hand Cash') {
                    if (t.type === 'Income') handCashIncome += t.amount;
                    else if (t.type === 'Expense') handCashExpense += t.amount;
                    if (t.handCashId) {
                        handCashIds.add(t.handCashId._id || t.handCashId);
                    }
                }
            });

            const totalHandCash = handCashIncome - handCashExpense;
            const totalBankBalance = bankAccounts.reduce((sum, ba) => sum + (ba.balance || 0), 0);
            const handCashTransactionCount = transactions.filter(t => getPaymentMethodLabel(t) === 'Hand Cash').length;

            setStats({
                income,
                expense,
                balance: income - expense,
                transactionCount: transactions.length,
                totalHandCash,
                totalBankBalance,
                handCashCount: handCashIds.size || handCashTransactionCount,
                bankAccountCount: bankAccounts.length
            });

            // Get last 5 transactions for preview
            setRecentTransactions(transactions.slice(0, 5));
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (loading) {
        return <div className="text-center mt-5">Loading Dashboard...</div>;
    }

    // Employee role gets a dedicated dashboard
    if (user?.role === 'Employee') {
        return <EmployeeDashboard />;
    }

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Dashboard</h2>

            {/* Welcome Section */}
            <div className="alert alert-primary mb-4" role="alert">
                <h4 className="alert-heading">Welcome back, {user?.name || 'User'}!</h4>
                <p className="mb-0">Here's an overview of your financial status and records.</p>
            </div>

            {/* Transaction Stats Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card text-white bg-success h-100 shadow-sm">
                        <div className="card-body">
                            <h6 className="card-title">Total Income</h6>
                            <h2 className="card-text">{formatCurrency(stats.income)}</h2>
                            <small className="text-white-50">{stats.transactionCount} transactions</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-danger h-100 shadow-sm">
                        <div className="card-body">
                            <h6 className="card-title">Total Expenses</h6>
                            <h2 className="card-text">{formatCurrency(stats.expense)}</h2>
                            <small className="text-white-50">Outgoing funds</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-info h-100 shadow-sm">
                        <div className="card-body">
                            <h6 className="card-title">Net Balance</h6>
                            <h2 className="card-text">{formatCurrency(stats.balance)}</h2>
                            <small className="text-white-50">Income - Expense</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-warning h-100 shadow-sm">
                        <div className="card-body">
                            <h6 className="card-title">Bank Balance</h6>
                            <h2 className="card-text">{formatCurrency(stats.totalBankBalance)}</h2>
                            <small className="text-white-50">{stats.bankAccountCount} accounts</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Recent Transactions</h5>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/transactions')}>
                                View All
                            </button>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Category</th>
                                        <th>Payment Method</th>
                                        <th>Type</th>
                                        <th className="text-end">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.length > 0 ? (
                                        recentTransactions.map(t => (
                                            <tr key={t._id}>
                                                <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                                                <td>{t.description}</td>
                                                <td>
                                                    <span className="badge bg-secondary">{t.category}</span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getPaymentMethodLabel(t) === 'Hand Cash' ? 'bg-warning' : 'bg-info'}`}>
                                                        {getPaymentMethodLabel(t) || 'Bank Account'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${t.type === 'Income' ? 'bg-success' : 'bg-danger'}`}>
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className={`text-end fw-bold ${t.type === 'Income' ? 'text-success' : 'text-danger'}`}>
                                                    {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-3 text-muted">No recent transactions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="d-flex gap-2 flex-wrap">
                        <button className="btn btn-primary" onClick={() => navigate('/transactions')}>
                            📝 Manage Transactions
                        </button>
                        <button className="btn btn-success" onClick={() => navigate('/hand-cash')}>
                            💰 Manage Hand Cash
                        </button>
                        <button className="btn btn-info" onClick={() => navigate('/bank-accounts')}>
                            🏦 Manage Bank Accounts
                        </button>
                        <button className="btn btn-warning" onClick={() => navigate('/invoices')}>
                            📄 View Invoices
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
