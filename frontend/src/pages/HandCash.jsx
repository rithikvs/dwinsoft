import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';

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
  const [showForm, setShowForm] = useState(false);

  const fetchHandCash = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/hand-cash`);
      setHandCash(res.data);
    } catch (err) {
      setError('Failed to load hand cash records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandCash();
  }, []);

  const totalCash = handCash.reduce((sum, hc) => sum + (hc.amount || 0), 0);

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
        await axios.put(`${API_BASE_URL}/api/hand-cash/${editingId}`, payload);
        setSuccess('Hand cash record updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/hand-cash`, payload);
        setSuccess('Hand cash record added successfully');
      }
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
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
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/hand-cash/${id}`);
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
    setShowForm(false);
    setError('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const filteredHandCash = handCash.filter((hc) =>
    hc.holder.toLowerCase().includes(search.toLowerCase()) ||
    (hc.description && hc.description.toLowerCase().includes(search.toLowerCase()))
  );

  const styles = {
    container: {
      padding: '1.5rem',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    formContainer: {
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      padding: '2rem',
      marginBottom: '2rem',
    },
    section: {
      marginBottom: '1.5rem',
      padding: '1.25rem',
      background: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#475569',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    row: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#64748b',
    },
    input: {
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      border: '1.5px solid #e2e8f0',
      fontSize: '0.95rem',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      outline: 'none',
      width: '100%',
    },
    btn: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
    },
    btnSecondary: {
      background: '#e2e8f0',
      color: '#475569',
    },
    btnDanger: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    statCard: {
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    searchInput: {
      padding: '0.75rem 1rem',
      borderRadius: '10px',
      border: '1.5px solid #e2e8f0',
      fontSize: '0.95rem',
      outline: 'none',
      flex: 1,
      maxWidth: '400px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    card: {
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
      overflow: 'hidden',
    },
    cardBody: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      padding: '1.25rem',
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '999px',
      fontSize: '0.8rem',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Hand Cash</h2>
        <button
          style={{ ...styles.btn, ...styles.btnPrimary }}
          onClick={() => { setShowForm(!showForm); if (showForm) handleCancel(); }}
        >
          {showForm ? 'Close' : '+ Add Hand Cash'}
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '0.75rem 1rem', background: '#d1fae5', color: '#059669', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>Total Cash</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>{formatCurrency(totalCash)}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>Total Records</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>{handCash.length}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>Holders</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>{new Set(handCash.map(h => h.holder)).size}</div>
          </div>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={styles.formContainer}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
            {editingId ? 'Edit Hand Cash Record' : 'Add New Hand Cash Record'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                Cash Details
              </div>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Holder Name *</label>
                  <input
                    type="text"
                    name="holder"
                    value={form.holder}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    placeholder="Enter holder name"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Amount (₹) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              <div style={{ ...styles.inputGroup, marginTop: '1rem' }}>
                <label style={styles.label}>Description</label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Optional description for this cash record"
                />
              </div>
            </div>

            {form.amount && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '10px',
                color: '#fff',
                marginBottom: '1.5rem',
              }}>
                <span style={{ fontSize: '1.125rem' }}>Amount:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {formatCurrency(Number(form.amount))}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{ ...styles.btn, ...styles.btnSecondary }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ ...styles.btn, ...styles.btnPrimary }}
              >
                {editingId ? 'Update Record' : 'Add Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0f172a' }}>All Hand Cash Records</h3>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Track and manage cash holdings by each holder</div>
          </div>
          <input
            type="text"
            placeholder="Search by holder or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div className="row g-3">
          {loading ? (
            <div className="col-12">
              <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                Loading hand cash records...
              </div>
            </div>
          ) : filteredHandCash.length === 0 ? (
            <div className="col-12">
              <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                {search ? 'No matching records found.' : 'No hand cash records found. Click "+ Add Hand Cash" to create one.'}
              </div>
            </div>
          ) : (
            filteredHandCash.map((hc) => (
              <div className="col-12 col-md-6 col-lg-4" key={hc._id}>
                <div style={styles.card}>
                  <div style={styles.cardBody}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        {hc.createdAt ? formatDate(hc.createdAt) : '—'}
                      </span>
                      <span style={{
                        ...styles.badge,
                        background: '#d1fae5',
                        color: '#059669',
                      }}>
                        Active
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        flexShrink: 0,
                      }}>
                        {hc.holder.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{hc.holder}</div>
                    </div>

                    {hc.description && (
                      <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.4 }}>
                        {hc.description}
                      </div>
                    )}

                    <div style={{
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      color: '#16a34a',
                    }}>
                      {formatCurrency(hc.amount)}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(hc)}
                        style={{ borderRadius: '8px', fontWeight: '500' }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(hc._id)}
                        style={{ borderRadius: '8px', fontWeight: '500' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HandCash;
