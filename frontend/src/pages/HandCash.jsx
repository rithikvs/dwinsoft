import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiHash, FiPlus, FiX, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const initialForm = {
  holder: '',
  amount: '',
  type: 'Income',
  description: '',
};

const HandCash = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const isAdmin = user?.role === 'Admin';

  const [handCash, setHandCash] = useState([]);
  const [handCashTransactions, setHandCashTransactions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('records');

  const fetchHandCash = async () => {
    setLoading(true);
    setError('');
    try {
      const [hcRes, txnRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/hand-cash`),
        axios.get(`${API_BASE_URL}/api/transactions`)
      ]);
      setHandCash(hcRes.data);
      const hcTxns = txnRes.data.filter(t =>
        t.paymentMethod === 'Hand Cash' || (!t.paymentMethod && t.handCashId)
      );
      setHandCashTransactions(hcTxns);
    } catch (err) {
      setError('Failed to load hand cash records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHandCash(); }, []);

  // ── Calculations ──
  const hcIncome = handCash.filter(hc => hc.type === 'Income' || !hc.type).reduce((s, hc) => s + (hc.amount || 0), 0);
  const hcExpense = handCash.filter(hc => hc.type === 'Expense').reduce((s, hc) => s + (hc.amount || 0), 0);
  const txnIncome = handCashTransactions.filter(t => t.type === 'Income').reduce((s, t) => s + (t.amount || 0), 0);
  const txnExpense = handCashTransactions.filter(t => t.type === 'Expense').reduce((s, t) => s + (t.amount || 0), 0);
  const totalIncome = hcIncome + txnIncome;
  const totalExpense = hcExpense + txnExpense;
  const netBalance = totalIncome - totalExpense;

  // ── Handlers (Admin only) ──
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setError(''); setSuccess('');
    if (!form.holder.trim() || !form.amount) { setError('Holder and amount are required'); return; }
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/hand-cash/${editingId}`, payload);
        setSuccess('Hand cash record updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/hand-cash`, payload);
        setSuccess('Hand cash record added successfully');
      }
      setForm(initialForm); setEditingId(null); setShowForm(false);
      fetchHandCash();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save hand cash record');
    }
  };

  const handleEdit = (hc) => {
    if (!isAdmin) return;
    setForm({ holder: hc.holder, amount: hc.amount, type: hc.type || 'Income', description: hc.description || '' });
    setEditingId(hc._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
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

  const handleCancel = () => { setForm(initialForm); setEditingId(null); setShowForm(false); setError(''); };

  const fmt = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount || 0);
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const filteredHandCash = handCash.filter(hc =>
    hc.holder.toLowerCase().includes(search.toLowerCase()) ||
    (hc.description && hc.description.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredTransactions = handCashTransactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    (t.category && t.category.toLowerCase().includes(search.toLowerCase()))
  );

  // ── Theme Tokens ──
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const text = isDark ? '#e2e8f0' : '#1e293b';
  const muted = isDark ? '#94a3b8' : '#64748b';
  const border = isDark ? '#334155' : '#e2e8f0';
  const inputBg = isDark ? '#0f172a' : '#ffffff';
  const headerBg = isDark ? '#334155' : '#f8fafc';

  // ── Stat Cards ──
  const statCards = [
    { title: 'Total Income', value: fmt(totalIncome), sub: `Records: ${fmt(hcIncome)} | Txns: ${fmt(txnIncome)}`, gradient: 'linear-gradient(135deg, #059669, #34d399)', icon: <FiTrendingUp size={20} />, shadow: 'rgba(5,150,105,0.3)' },
    { title: 'Total Expense', value: fmt(totalExpense), sub: `Records: ${fmt(hcExpense)} | Txns: ${fmt(txnExpense)}`, gradient: 'linear-gradient(135deg, #dc2626, #f87171)', icon: <FiTrendingDown size={20} />, shadow: 'rgba(220,38,38,0.3)' },
    { title: 'Net Balance', value: fmt(netBalance), sub: 'Income − Expense', gradient: netBalance >= 0 ? 'linear-gradient(135deg, #2563eb, #60a5fa)' : 'linear-gradient(135deg, #dc2626, #ef4444)', icon: <FiDollarSign size={20} />, shadow: netBalance >= 0 ? 'rgba(37,99,235,0.3)' : 'rgba(220,38,38,0.3)' },
    { title: 'Total Entries', value: `${handCash.length + handCashTransactions.length}`, sub: `${handCash.length} records  |  ${handCashTransactions.length} transactions`, gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)', icon: <FiHash size={20} />, shadow: 'rgba(124,58,237,0.3)' },
  ];

  return (
    <div style={{ padding: '1.5rem 2rem' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: text, fontSize: '1.5rem' }}>💵 Hand Cash</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: muted }}>
            {isAdmin ? 'Manage all hand cash records and transactions' : 'View hand cash records and transactions'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) handleCancel(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.7rem 1.5rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
              border: 'none', fontSize: '0.9rem',
              background: showForm ? (isDark ? '#334155' : '#e2e8f0') : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: showForm ? muted : '#fff',
              boxShadow: showForm ? 'none' : '0 4px 14px rgba(102,126,234,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {showForm ? <><FiX size={16} /> Close</> : <><FiPlus size={16} /> Add Hand Cash</>}
          </button>
        )}
      </div>

      {/* ── Alert Messages ── */}
      {error && (
        <div style={{
          padding: '0.75rem 1.25rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.88rem',
          background: isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2',
          color: isDark ? '#fca5a5' : '#dc2626',
          border: `1px solid ${isDark ? 'rgba(239,68,68,0.25)' : '#fecdd3'}`,
        }}>{error}</div>
      )}
      {success && (
        <div style={{
          padding: '0.75rem 1.25rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.88rem',
          background: isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5',
          color: isDark ? '#6ee7b7' : '#059669',
          border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : '#a7f3d0'}`,
        }}>{success}</div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {statCards.map((c, i) => (
          <div key={i} style={{
            background: c.gradient, borderRadius: '16px', padding: '1.25rem 1.5rem',
            color: '#fff', position: 'relative', overflow: 'hidden',
            boxShadow: `0 6px 20px ${c.shadow}`,
            transition: 'transform 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', opacity: 0.9 }}>{c.title}</span>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.35rem', display: 'flex' }}>{c.icon}</div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>{c.value}</div>
            <div style={{ fontSize: '0.68rem', marginTop: '0.4rem', opacity: 0.7 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Add / Edit Form (Admin only) ── */}
      {isAdmin && showForm && (
        <div style={{
          background: cardBg, borderRadius: '18px', padding: '1.75rem',
          border: `1px solid ${border}`, marginBottom: '1.75rem',
          boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <h5 style={{ margin: '0 0 1.25rem', fontWeight: 700, color: text, fontSize: '1.1rem' }}>
            {editingId ? '✏️ Edit Hand Cash Record' : '➕ Add New Hand Cash Record'}
          </h5>
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
              padding: '1.25rem', background: headerBg, borderRadius: '14px',
              border: `1px solid ${border}`, marginBottom: '1.25rem',
            }}>
              {/* Holder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: muted }}>Holder Name *</label>
                <input type="text" name="holder" value={form.holder} onChange={handleChange} required
                  placeholder="Enter holder name"
                  style={{
                    padding: '0.7rem 1rem', borderRadius: '10px', border: `1.5px solid ${border}`,
                    fontSize: '0.9rem', background: inputBg, color: text, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              {/* Amount */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: muted }}>Amount (₹) *</label>
                <input type="number" name="amount" value={form.amount} onChange={handleChange} required
                  step="0.01" min="0" placeholder="Enter amount"
                  style={{
                    padding: '0.7rem 1rem', borderRadius: '10px', border: `1.5px solid ${border}`,
                    fontSize: '0.9rem', background: inputBg, color: text, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              {/* Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: muted }}>Type *</label>
                <select name="type" value={form.type} onChange={handleChange}
                  style={{
                    padding: '0.7rem 1rem', borderRadius: '10px', border: `1.5px solid ${border}`,
                    fontSize: '0.9rem', background: inputBg, color: text, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = border}
                >
                  <option value="Income">💰 Income</option>
                  <option value="Expense">💸 Expense</option>
                </select>
              </div>
              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: muted }}>Description</label>
                <input type="text" name="description" value={form.description} onChange={handleChange}
                  placeholder="Optional description"
                  style={{
                    padding: '0.7rem 1rem', borderRadius: '10px', border: `1.5px solid ${border}`,
                    fontSize: '0.9rem', background: inputBg, color: text, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
            </div>

            {/* Preview + Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              {form.amount ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.65rem 1.25rem', borderRadius: '12px',
                  background: form.type === 'Expense'
                    ? 'linear-gradient(135deg, #dc2626, #f43f5e)'
                    : 'linear-gradient(135deg, #059669, #10b981)',
                  color: '#fff',
                }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{form.type}:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{fmt(Number(form.amount))}</span>
                </div>
              ) : <div />}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={handleCancel} style={{
                  padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${border}`, background: 'transparent', color: muted, fontSize: '0.88rem',
                }}>Cancel</button>
                <button type="submit" style={{
                  padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer',
                  border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff', fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                }}>{editingId ? 'Update Record' : 'Add Record'}</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── Tabs + Search Row ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { key: 'records', label: `📋 Records (${handCash.length})` },
            { key: 'transactions', label: `🔄 Transactions (${handCashTransactions.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '0.55rem 1.25rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.85rem',
              cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              background: activeTab === tab.key ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : (isDark ? '#334155' : '#f1f5f9'),
              color: activeTab === tab.key ? '#fff' : muted,
              boxShadow: activeTab === tab.key ? '0 4px 12px rgba(102,126,234,0.3)' : 'none',
            }}>{tab.label}</button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <FiSearch size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: muted }} />
          <input
            type="text" placeholder="Search..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '0.6rem 1rem 0.6rem 2.4rem', borderRadius: '10px',
              border: `1.5px solid ${border}`, fontSize: '0.88rem', outline: 'none',
              width: '260px', background: inputBg, color: text,
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#667eea'}
            onBlur={e => e.target.style.borderColor = border}
          />
        </div>
      </div>

      {/* ── RECORDS TAB ── */}
      {activeTab === 'records' && (
        <div style={{
          background: cardBg, borderRadius: '18px', overflow: 'hidden',
          border: `1px solid ${border}`,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle" style={{ color: text }}>
              <thead>
                <tr style={{ background: headerBg }}>
                  <th style={{ color: muted, borderColor: border, fontWeight: 600, fontSize: '0.78rem', padding: '0.85rem 1rem' }}>#</th>
                  <th style={{ color: muted, borderColor: border, fontWeight: 600, fontSize: '0.78rem', padding: '0.85rem 1rem' }}>Holder</th>
                  <th style={{ color: muted, borderColor: border, fontWeight: 600, fontSize: '0.78rem', padding: '0.85rem 1rem' }}>Type</th>
                  <th style={{ color: muted, borderColor: border, fontWeight: 600, fontSize: '0.78rem', padding: '0.85rem 1rem' }}>Description</th>
                  <th style={{ color: muted, borderColor: border, fontWeight: 600, fontSize: '0.78rem', padding: '0.85rem 1rem' }}>Date</th>
                  <th className="text-end" style={{ color: muted, borderColor: border, fontWeight: 600, fontSize: '0.78rem', padding: '0.85rem 1rem' }}>Amount</th>
                  {isAdmin && <th className="text-center" style={{ color: muted, borderColor: border, fontWeight: 600, fontSize: '0.78rem', padding: '0.85rem 1rem' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-4" style={{ color: muted }}>Loading records...</td></tr>
                ) : filteredHandCash.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-4" style={{ color: muted }}>
                    {search ? 'No matching records found.' : 'No hand cash records yet.'}
                  </td></tr>
                ) : (
                  filteredHandCash.map((hc, idx) => {
                    const isIncome = (hc.type || 'Income') === 'Income';
                    return (
                      <tr key={hc._id} style={{ borderColor: border }}>
                        <td style={{ borderColor: border, color: muted, padding: '0.8rem 1rem' }}>{idx + 1}</td>
                        <td style={{ borderColor: border, fontWeight: 600, padding: '0.8rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                            }}>{hc.holder.charAt(0).toUpperCase()}</div>
                            {hc.holder}
                          </div>
                        </td>
                        <td style={{ borderColor: border, padding: '0.8rem 1rem' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                            background: isIncome ? (isDark ? 'rgba(16,185,129,0.12)' : '#d1fae5') : (isDark ? 'rgba(239,68,68,0.12)' : '#fee2e2'),
                            color: isIncome ? '#10b981' : '#ef4444',
                          }}>
                            {isIncome ? '💰' : '💸'} {hc.type || 'Income'}
                          </span>
                        </td>
                        <td style={{ borderColor: border, color: muted, padding: '0.8rem 1rem' }}>{hc.description || '—'}</td>
                        <td style={{ borderColor: border, color: muted, fontSize: '0.85rem', padding: '0.8rem 1rem' }}>{hc.createdAt ? fmtDate(hc.createdAt) : '—'}</td>
                        <td className="text-end fw-bold" style={{
                          borderColor: border, padding: '0.8rem 1rem',
                          color: isIncome ? '#10b981' : '#ef4444',
                        }}>
                          {isIncome ? '+' : '−'}{fmt(hc.amount)}
                        </td>
                        {isAdmin && (
                          <td className="text-center" style={{ borderColor: border, padding: '0.8rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                              <button onClick={() => handleEdit(hc)} title="Edit" style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '30px', height: '30px', borderRadius: '8px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                background: isDark ? '#1e293b' : '#f8fafc', color: '#3b82f6',
                                cursor: 'pointer', transition: 'all 0.15s',
                              }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#1e293b' : '#f8fafc'; e.currentTarget.style.color = '#3b82f6'; }}
                              ><FiEdit2 size={14} /></button>
                              <button onClick={() => handleDelete(hc._id)} title="Delete" style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '30px', height: '30px', borderRadius: '8px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                background: isDark ? '#1e293b' : '#f8fafc', color: '#ef4444',
                                cursor: 'pointer', transition: 'all 0.15s',
                              }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#1e293b' : '#f8fafc'; e.currentTarget.style.color = '#ef4444'; }}
                              ><FiTrash2 size={14} /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
                {!loading && filteredHandCash.length > 0 && (
                  <tr style={{ background: headerBg, borderColor: border }}>
                    <td colSpan={isAdmin ? 5 : 5} className="fw-bold" style={{ borderColor: border, color: text, padding: '0.85rem 1rem' }}>Hand Cash Records Net</td>
                    <td className="text-end fw-bold" style={{
                      borderColor: border, fontSize: '1.05rem', padding: '0.85rem 1rem',
                      color: (hcIncome - hcExpense) >= 0 ? '#10b981' : '#ef4444',
                    }}>{fmt(hcIncome - hcExpense)}</td>
                    {isAdmin && <td style={{ borderColor: border }} />}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TRANSACTIONS TAB ── */}
      {activeTab === 'transactions' && (
        <div style={{
          background: cardBg, borderRadius: '18px', overflow: 'hidden',
          border: `1px solid ${border}`,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle" style={{ color: text }}>
              <thead>
                <tr style={{ background: headerBg }}>
                  <th style={{ color: muted, borderColor: border, fontWeight: 600, fontSize: '0.78rem', padding: '0.85rem 1rem' }}>#</th>
                  <th style={{ color: muted, borderColor: border, fontWeight: 600, fontSize: '0.78rem', padding: '0.85rem 1rem' }}>Date</th>
                  <th style={{ color: muted, borderColor: border, fontWeight: 600, fontSize: '0.78rem', padding: '0.85rem 1rem' }}>Description</th>
                  <th style={{ color: muted, borderColor: border, fontWeight: 600, fontSize: '0.78rem', padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ color: muted, borderColor: border, fontWeight: 600, fontSize: '0.78rem', padding: '0.85rem 1rem' }}>Type</th>
                  <th className="text-end" style={{ color: muted, borderColor: border, fontWeight: 600, fontSize: '0.78rem', padding: '0.85rem 1rem' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-4" style={{ color: muted }}>Loading transactions...</td></tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4" style={{ color: muted }}>
                    {search ? 'No matching transactions found.' : 'No hand cash transactions found.'}
                  </td></tr>
                ) : (
                  filteredTransactions.map((t, idx) => (
                    <tr key={t._id} style={{ borderColor: border }}>
                      <td style={{ borderColor: border, color: muted, padding: '0.8rem 1rem' }}>{idx + 1}</td>
                      <td style={{ borderColor: border, color: muted, fontSize: '0.85rem', padding: '0.8rem 1rem' }}>{t.date ? fmtDate(t.date) : '—'}</td>
                      <td style={{ borderColor: border, fontWeight: 500, padding: '0.8rem 1rem' }}>{t.description}</td>
                      <td style={{ borderColor: border, padding: '0.8rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500,
                          background: isDark ? '#334155' : '#f1f5f9', color: muted,
                        }}>{t.category}</span>
                      </td>
                      <td style={{ borderColor: border, padding: '0.8rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                          background: t.type === 'Income' ? (isDark ? 'rgba(16,185,129,0.12)' : '#d1fae5') : (isDark ? 'rgba(239,68,68,0.12)' : '#fee2e2'),
                          color: t.type === 'Income' ? '#10b981' : '#ef4444',
                        }}>
                          {t.type === 'Income' ? '💰' : '💸'} {t.type}
                        </span>
                      </td>
                      <td className="text-end fw-bold" style={{
                        borderColor: border, padding: '0.8rem 1rem',
                        color: t.type === 'Income' ? '#10b981' : '#ef4444',
                      }}>
                        {t.type === 'Income' ? '+' : '−'}{fmt(t.amount)}
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filteredTransactions.length > 0 && (
                  <>
                    <tr style={{ borderColor: border }}>
                      <td colSpan="5" style={{ borderColor: border, color: '#10b981', fontWeight: 600, padding: '0.75rem 1rem' }}>Transactions Income</td>
                      <td className="text-end fw-bold text-success" style={{ borderColor: border, padding: '0.75rem 1rem' }}>+{fmt(txnIncome)}</td>
                    </tr>
                    <tr style={{ borderColor: border }}>
                      <td colSpan="5" style={{ borderColor: border, color: '#ef4444', fontWeight: 600, padding: '0.75rem 1rem' }}>Transactions Expense</td>
                      <td className="text-end fw-bold text-danger" style={{ borderColor: border, padding: '0.75rem 1rem' }}>−{fmt(txnExpense)}</td>
                    </tr>
                    <tr style={{ background: headerBg, borderColor: border }}>
                      <td colSpan="5" className="fw-bold" style={{ borderColor: border, color: text, padding: '0.85rem 1rem' }}>Transactions Net</td>
                      <td className="text-end fw-bold" style={{
                        borderColor: border, fontSize: '1.05rem', padding: '0.85rem 1rem',
                        color: (txnIncome - txnExpense) >= 0 ? '#10b981' : '#ef4444',
                      }}>{fmt(txnIncome - txnExpense)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Non-admin notice ── */}
      {!isAdmin && (
        <div style={{
          marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: '12px',
          background: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb',
          border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : '#fde68a'}`,
          color: isDark ? '#fcd34d' : '#92400e', fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          🔒 Only administrators can add, edit, or delete hand cash records.
        </div>
      )}
    </div>
  );
};

export default HandCash;
