import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import Badge from '../components/ui/Badge';

const initialForm = {
  holder: '',
  amount: '',
  description: '',
};

const HandCash = () => {
  const [handCash, setHandCash] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalCash, setTotalCash] = useState(0);

  // Fetch hand cash records
  const fetchHandCash = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/hand-cash');
      setHandCash(res.data);
    } catch (err) {
      setError('Failed to load hand cash records');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total cash
  useEffect(() => {
    const total = handCash.reduce((sum, hc) => sum + (hc.amount || 0), 0);
    setTotalCash(total);
  }, [handCash]);

  useEffect(() => {
    fetchHandCash();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.holder.trim() || !form.amount) {
      setError('Holder and amount are required');
      return;
    }

    try {
      const payload = { ...form, amount: Number(form.amount) };
      
      if (editingId) {
        await axios.put(`http://localhost:5000/api/hand-cash/${editingId}`, payload);
        setSuccess('Hand cash record updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/hand-cash', payload);
        setSuccess('Hand cash record added successfully');
      }
      
      setForm(initialForm);
      setEditingId(null);
      fetchHandCash();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save hand cash record');
    }
  };

  const handleEdit = (hc) => {
    setForm({
      holder: hc.holder,
      amount: hc.amount,
      description: hc.description || '',
    });
    setEditingId(hc._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/hand-cash/${id}`);
      setSuccess('Hand cash record deleted successfully');
      fetchHandCash();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete hand cash record');
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter hand cash records
  const filteredHandCash = handCash.filter((hc) =>
    hc.holder.toLowerCase().includes(search.toLowerCase()) ||
    (hc.description && hc.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <PageHeader title="Hand Cash" subtitle="Manage cash holdings by employee or department." />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {success}
        </div>
      )}

      <SectionCard>
        <h3 className="text-lg font-semibold text-slate-900">{editingId ? 'Edit Hand Cash Record' : 'Add New Hand Cash Record'}</h3>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="md:col-span-1">
            <label htmlFor="holder" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Holder Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="holder"
              name="holder"
              className="input-field mt-2"
              value={form.holder}
              onChange={handleChange}
              placeholder="Enter holder name"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Amount<span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="input-field mt-2"
              value={form.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              className="input-field mt-2"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter description (optional)"
            />
          </div>
          <div className="md:col-span-4 flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">All Hand Cash Records</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="info">Total Cash: {formatCurrency(totalCash)}</Badge>
              <Badge tone="slate">Total Records: {filteredHandCash.length}</Badge>
            </div>
          </div>
          <input
            type="text"
            className="input-field w-full sm:w-72"
            placeholder="Search by holder or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-center text-sm text-slate-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-sm text-rose-600">{error}</div>
          ) : filteredHandCash.length === 0 ? (
            <div className="text-center text-sm text-slate-400">
              {search ? 'No matching records found' : 'No hand cash records found'}
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Holder</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHandCash.map((hc) => (
                    <tr key={hc._id}>
                      <td className="font-semibold text-slate-900">{hc.holder}</td>
                      <td>
                        <Badge tone="success">{formatCurrency(hc.amount)}</Badge>
                      </td>
                      <td>{hc.description || '-'}</td>
                      <td className="text-sm text-slate-500">{formatDate(hc.createdAt)}</td>
                      <td className="text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="btn-secondary"
                            onClick={() => handleEdit(hc)}
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            className="btn-ghost"
                            onClick={() => handleDelete(hc._id)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
};

export default HandCash;
