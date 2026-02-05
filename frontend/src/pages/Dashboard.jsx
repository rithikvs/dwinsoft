import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        income: 0,
        expense: 0,
        balance: 0,
        transactionCount: 0
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // Fetch all transactions to calculate stats
                // faster would be a specific stats endpoint, but this ensures consistency with Transactions page logic
                const res = await axios.get('http://localhost:5000/api/transactions');
                const transactions = res.data;

                let income = 0;
                let expense = 0;

                transactions.forEach(t => {
                    if (t.type === 'Income') income += t.amount;
                    else if (t.type === 'Expense') expense += t.amount;
                });

                setStats({
                    income,
                    expense,
                    balance: income - expense,
                    transactionCount: transactions.length
                });

                // Get last 5 transactions for preview
                setRecentTransactions(transactions.slice(0, 5));
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

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

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Dashboard</h2>

            {/* Welcome Section */}
            <div className="alert alert-primary mb-4" role="alert">
                <h4 className="alert-heading">Welcome back, {user?.name || 'User'}!</h4>
                <p className="mb-0">Here's an overview of your financial status.</p>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card text-white bg-success h-100 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Total Income</h5>
                            <h2 className="card-text">{formatCurrency(stats.income)}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white bg-danger h-100 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Total Expenses</h5>
                            <h2 className="card-text">{formatCurrency(stats.expense)}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white bg-primary h-100 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Net Balance</h5>
                            <h2 className="card-text">{formatCurrency(stats.balance)}</h2>
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
                                            <td colspan="5" className="text-center py-3 text-muted">No recent transactions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
