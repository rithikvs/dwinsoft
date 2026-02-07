import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const EmployeeProfile = () => {
  const { user } = useContext(AuthContext);

  const styles = {
    container: { padding: '1.5rem' },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    profileCard: {
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      marginBottom: '1.5rem',
    },
    profileBanner: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      height: '120px',
      position: 'relative',
    },
    avatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: '#fff',
      border: '4px solid #fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      fontWeight: '700',
      color: '#667eea',
      position: 'absolute',
      bottom: '-40px',
      left: '2rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    profileBody: {
      padding: '3.5rem 2rem 2rem 2rem',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginTop: '1.5rem',
    },
    infoCard: {
      background: '#fff',
      borderRadius: '14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      padding: '1.5rem',
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#475569',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid #f1f5f9',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.65rem 0',
      borderBottom: '1px solid #f8fafc',
    },
    label: {
      fontSize: '0.875rem',
      color: '#64748b',
      fontWeight: '500',
    },
    value: {
      fontSize: '0.875rem',
      color: '#1e293b',
      fontWeight: '600',
    },
    badge: {
      display: 'inline-block',
      padding: '0.2rem 0.65rem',
      borderRadius: '999px',
      fontSize: '0.8rem',
      fontWeight: '600',
    },
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>My Profile</h2>
        <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{today}</span>
      </div>

      {/* Profile Card */}
      <div style={styles.profileCard}>
        <div style={styles.profileBanner}>
          <div style={styles.avatar}>
            {(user?.username || 'E').charAt(0).toUpperCase()}
          </div>
        </div>
        <div style={styles.profileBody}>
          <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '1.4rem' }}>
            {user?.username || 'Employee'}
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            {user?.email || 'No email on file'}
          </p>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ ...styles.badge, background: '#ede9fe', color: '#7c3aed' }}>
              {user?.role || 'Employee'}
            </span>
            <span style={{ ...styles.badge, background: '#d1fae5', color: '#059669' }}>
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div style={styles.infoGrid}>
        {/* Account Details */}
        <div style={styles.infoCard}>
          <h4 style={styles.sectionTitle}>Account Details</h4>
          <div style={styles.infoRow}>
            <span style={styles.label}>Username</span>
            <span style={styles.value}>{user?.username || '—'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Email Address</span>
            <span style={styles.value}>{user?.email || '—'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Role</span>
            <span style={{ ...styles.badge, background: '#ede9fe', color: '#7c3aed' }}>
              {user?.role || 'Employee'}
            </span>
          </div>
          <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
            <span style={styles.label}>Account Status</span>
            <span style={{ ...styles.badge, background: '#d1fae5', color: '#059669' }}>Active</span>
          </div>
        </div>

        {/* Organization Info */}
        <div style={styles.infoCard}>
          <h4 style={styles.sectionTitle}>Organization</h4>
          <div style={styles.infoRow}>
            <span style={styles.label}>Company</span>
            <span style={styles.value}>DWINSOFT Technologies</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Domain</span>
            <span style={styles.value}>dwinsoft.com</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Email Domain</span>
            <span style={styles.value}>@dwinsoft.com</span>
          </div>
          <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
            <span style={styles.label}>Portal Access</span>
            <span style={{ ...styles.badge, background: '#dbeafe', color: '#2563eb' }}>Employee Portal</span>
          </div>
        </div>

        {/* Access & Permissions */}
        <div style={styles.infoCard}>
          <h4 style={styles.sectionTitle}>Access & Permissions</h4>
          {[
            { label: 'View Invoices', allowed: true },
            { label: 'View Debts & Deductions', allowed: true },
            { label: 'Account Settings', allowed: true },
            { label: 'Manage Transactions', allowed: false },
            { label: 'Manage Bank Accounts', allowed: false },
            { label: 'Admin Panel', allowed: false },
          ].map((perm, i, arr) => (
            <div key={perm.label} style={{ ...styles.infoRow, borderBottom: i === arr.length - 1 ? 'none' : '1px solid #f8fafc' }}>
              <span style={styles.label}>{perm.label}</span>
              <span style={{
                ...styles.badge,
                background: perm.allowed ? '#d1fae5' : '#fee2e2',
                color: perm.allowed ? '#059669' : '#dc2626',
              }}>
                {perm.allowed ? 'Allowed' : 'Restricted'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
