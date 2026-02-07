import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invRes, debtRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/invoices`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/api/debts`).catch(() => ({ data: [] })),
        ]);
        const invData = Array.isArray(invRes.data) ? invRes.data : invRes.data.invoices || [];
        setInvoices(invData.slice(0, 5));
        setDebts(Array.isArray(debtRes.data) ? debtRes.data : []);
      } catch (err) {
        console.error('Error fetching employee data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount || 0);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  const totalDebtAmount = debts.reduce((sum, d) => sum + (d.amount || 0), 0);
  const pendingDebts = debts.filter(d => d.status !== 'Paid');

  const styles = {
    container: { padding: '1.5rem' },
    welcomeCard: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '2rem',
      color: '#fff',
      marginBottom: '1.5rem',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    statCard: {
      background: '#fff',
      borderRadius: '14px',
      padding: '1.25rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    statIcon: {
      width: '44px',
      height: '44px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1rem',
    },
    card: {
      background: '#fff',
      borderRadius: '14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      marginBottom: '1.5rem',
    },
    cardHeader: {
      padding: '1rem 1.25rem',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardBody: { padding: '1.25rem' },
    quickActionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    quickAction: {
      background: '#fff',
      borderRadius: '14px',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      border: 'none',
      textAlign: 'left',
      width: '100%',
    },
    btn: {
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      fontSize: '0.85rem',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 0',
      borderBottom: '1px solid #f1f5f9',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Welcome Banner */}
      <div style={styles.welcomeCard}>
        <div style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '0.25rem' }}>{greeting},</div>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: '700' }}>
          {user?.username || 'Employee'}
        </h2>
        <p style={{ margin: 0, opacity: 0.85, fontSize: '0.95rem' }}>
          Welcome to the DWINSOFT Employee Portal. Access your invoices, deductions, and account settings.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: '500',
          }}>
            Role: {user?.role || 'Employee'}
          </span>
          <span style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: '500',
          }}>
            {user?.email || '—'}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#ede9fe' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>Invoices</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>{invoices.length}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#fef3c7' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>Pending Debts</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>{pendingDebts.length}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#fee2e2' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>Total Deductions</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>{formatCurrency(totalDebtAmount)}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#d1fae5' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>Account Status</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#059669' }}>Active</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '0.5rem' }}>
        <h3 style={styles.sectionTitle}>Quick Actions</h3>
      </div>
      <div style={styles.quickActionGrid}>
        <button
          style={styles.quickAction}
          onClick={() => navigate('/invoices')}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>View Invoices</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Check your payslips and invoices</div>
        </button>
        <button
          style={styles.quickAction}
          onClick={() => navigate('/debts')}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>View Deductions</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Track your debts and deductions</div>
        </button>
        <button
          style={styles.quickAction}
          onClick={() => navigate('/employee/profile')}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>My Profile</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>View and update your details</div>
        </button>
        <button
          style={styles.quickAction}
          onClick={() => navigate('/settings')}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>Settings</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Manage your account preferences</div>
        </button>
      </div>

      {/* Two-column layout: Recent Invoices & Debts */}
      <div className="row g-4">
        {/* Recent Invoices */}
        <div className="col-12 col-lg-7">
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h5 style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>Recent Invoices</h5>
              <button
                style={{ ...styles.btn, background: '#f1f5f9', color: '#475569' }}
                onClick={() => navigate('/invoices')}
              >
                View All
              </button>
            </div>
            <div style={styles.cardBody}>
              {invoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No invoices found. Your payslips will appear here.
                </div>
              ) : (
                invoices.map((inv, i) => (
                  <div key={inv._id || i} style={{ ...styles.infoRow, borderBottom: i === invoices.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
                        {inv.invoiceNumber || `Invoice #${i + 1}`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {inv.customer?.name || 'N/A'} &middot; {inv.createdAt ? formatDate(inv.createdAt) : '—'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {formatCurrency(inv.totalAmount || inv.items?.reduce((s, it) => s + (it.quantity * it.rate), 0) || 0)}
                      </div>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: inv.paymentStatus === 'Paid' ? '#d1fae5' : inv.paymentStatus === 'Pending' ? '#fef3c7' : '#fee2e2',
                        color: inv.paymentStatus === 'Paid' ? '#059669' : inv.paymentStatus === 'Pending' ? '#d97706' : '#dc2626',
                      }}>
                        {inv.paymentStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Debts / Deductions */}
        <div className="col-12 col-lg-5">
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h5 style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>Deductions & Debts</h5>
              <button
                style={{ ...styles.btn, background: '#f1f5f9', color: '#475569' }}
                onClick={() => navigate('/debts')}
              >
                View All
              </button>
            </div>
            <div style={styles.cardBody}>
              {debts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No deductions or debts recorded.
                </div>
              ) : (
                debts.slice(0, 5).map((d, i) => (
                  <div key={d._id || i} style={{ ...styles.infoRow, borderBottom: i === Math.min(debts.length, 5) - 1 ? 'none' : '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
                        {d.debtor || 'Debt'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {d.description || '—'} &middot; Due: {d.dueDate ? formatDate(d.dueDate) : '—'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: '#dc2626' }}>{formatCurrency(d.amount)}</div>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: d.status === 'Paid' ? '#d1fae5' : '#fef3c7',
                        color: d.status === 'Paid' ? '#059669' : '#d97706',
                      }}>
                        {d.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Account Info */}
          <div style={{ ...styles.card, marginTop: '1rem' }}>
            <div style={styles.cardHeader}>
              <h5 style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>Account Information</h5>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.infoRow}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Username</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{user?.username || '—'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Email</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{user?.email || '—'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Role</span>
                <span style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: '#ede9fe',
                  color: '#7c3aed',
                }}>{user?.role || 'Employee'}</span>
              </div>
              <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Status</span>
                <span style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: '#d1fae5',
                  color: '#059669',
                }}>Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
