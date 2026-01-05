
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const initialForm = {
  description: '',
  amount: '',
  type: 'Income',
  category: '',
  date: new Date().toISOString().slice(0, 10),
};

const Transactions = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({ type: '', category: '', startDate: '', endDate: '' });
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canEdit = user && (user.role === 'Admin' || user.role === 'Accountant');
  const canView = user && (user.role === 'Admin' || user.role === 'Accountant' || user.role === 'HR');

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      let url = 'http://localhost:5000/api/transactions';
      if (filter.type || filter.category || filter.startDate || filter.endDate) {
        const params = [];
        if (filter.type) params.push(`type=${filter.type}`);
        if (filter.category) params.push(`category=${filter.category}`);
        if (filter.startDate) params.push(`startDate=${filter.startDate}`);
        if (filter.endDate) params.push(`endDate=${filter.endDate}`);
        url += `/search/filter?${params.join('&')}`;
      }
      const res = await axios.get(url);
      setTransactions(res.data);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Calculate balance
  useEffect(() => {
    let bal = 0;
    transactions.forEach(t => {
      if (t.type === 'Income') bal += t.amount;
      else if (t.type === 'Expense') bal -= t.amount;
    });
    setBalance(bal);
  }, [transactions]);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [filter]);

  // Handle form input
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update transaction
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) {
        await axios.put(`http://localhost:5000/api/transactions/${editingId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/transactions', payload);
      }
      setForm(initialForm);
      setEditingId(null);
      fetchTransactions();
    } catch (err) {
      setError('Failed to save transaction');
    }
  };

  // Edit transaction
  const handleEdit = t => {
    setForm({
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.date ? t.date.slice(0, 10) : '',
    });
    setEditingId(t._id);
  };

  // Delete transaction
  const handleDelete = async id => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  // Filter change
  const handleFilterChange = e => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // Reset form
  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  // Category options (could be dynamic)
  const categories = [
    'Salary', 'Sales', 'Payroll', 'Office', 'Utilities', 'Travel', 'Supplies', 'Other'
  ];

  return (
    <div>
      <h2>Transactions</h2>
      <div className="mb-3">
        <span className="fw-bold">Current Balance: </span>
        <span className={balance >= 0 ? 'text-success' : 'text-danger'}>
          ₹{balance.toLocaleString()}
        </span>
      </div>

      {/* Filter/Search - visible to all who canView */}
      {canView && (
        <form className="row g-2 mb-4" onSubmit={e => { e.preventDefault(); fetchTransactions(); }}>
          <div className="col-md-2">
            <select className="form-select" name="type" value={filter.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" name="category" value={filter.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <input type="date" className="form-control" name="startDate" value={filter.startDate} onChange={handleFilterChange} />
          </div>
          <div className="col-md-2">
            <input type="date" className="form-control" name="endDate" value={filter.endDate} onChange={handleFilterChange} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-primary w-100" type="submit">Filter</button>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" type="button" onClick={() => setFilter({ type: '', category: '', startDate: '', endDate: '' })}>Reset</button>
          </div>
        </form>
      )}

      {/* Add/Edit Form (Admin/Accountant only) */}
      {canEdit && (
        <div className="card mb-4 p-3">
          <h5>{editingId ? 'Edit Transaction' : 'Add Transaction'}</h5>
          <form className="row g-2" onSubmit={handleSubmit}>
            <div className="col-md-3">
              <input type="text" className="form-control" name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <input type="number" className="form-control" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required min="0" />
            </div>
            <div className="col-md-2">
              <select className="form-select" name="type" value={form.type} onChange={handleChange} required>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <input type="date" className="form-control" name="date" value={form.date} onChange={handleChange} required />
            </div>
            <div className="col-md-1 d-flex gap-1">
              <button className="btn btn-success" type="submit">{editingId ? 'Update' : 'Add'}</button>
              {editingId && <button className="btn btn-secondary" type="button" onClick={handleCancel}>Cancel</button>}
            </div>
          </form>
        </div>
      )}

      {/* Transactions Table - visible to all who canView */}
      {canView && (
        <div className="card p-3">
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={canEdit ? 6 : 5} className="text-center">Loading...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={canEdit ? 6 : 5} className="text-center text-muted">No transactions found</td></tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t._id}>
                      <td>{t.date ? t.date.slice(0, 10) : ''}</td>
                      <td>{t.description}</td>
                      <td>{t.type}</td>
                      <td>{t.category}</td>
                      <td className={t.type === 'Income' ? 'text-success' : 'text-danger'}>
                        {t.type === 'Income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                      </td>
                      {canEdit && (
                        <td>
                          <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(t)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t._id)}>Delete</button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  );
};

export default Transactions;

