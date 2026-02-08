
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { ThemeContext } from '../context/ThemeContext';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

const BankAccounts = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/api/bank-accounts`);
        setAccounts(res.data);
      } catch (err) {
        setError('Failed to load bank accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const theadBg = isDark ? '#334155' : '#f8fafc';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader title="Bank Accounts" subtitle="See balances and account details at a glance." />
      <SectionCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: textColor, margin: 0 }}>All Bank Accounts</h3>
            <p style={{ fontSize: '0.875rem', color: mutedColor, margin: '0.25rem 0 0' }}>Monitor balances across active accounts.</p>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: mutedColor, padding: '2rem' }}>Loading...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#ef4444', padding: '2rem' }}>{error}</div>
          ) : accounts.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: mutedColor, padding: '2rem' }}>No bank accounts found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-hover mb-0" style={{ color: textColor }}>
                <thead>
                  <tr style={{ background: theadBg }}>
                    <th style={{ color: mutedColor, borderColor }}>Name</th>
                    <th style={{ color: mutedColor, borderColor }}>Account Number</th>
                    <th style={{ color: mutedColor, borderColor }}>Bank Name</th>
                    <th style={{ color: mutedColor, borderColor }}>Balance</th>
                    <th style={{ color: mutedColor, borderColor }}>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(acc => (
                    <tr key={acc._id} style={{ borderColor }}>
                      <td style={{ fontWeight: '600', color: textColor, borderColor }}>{acc.name}</td>
                      <td style={{ borderColor }}>{acc.accountNumber}</td>
                      <td style={{ borderColor }}>{acc.bankName}</td>
                      <td style={{ borderColor }}>{acc.balance}</td>
                      <td style={{ borderColor }}>{acc.createdAt ? new Date(acc.createdAt).toLocaleString() : ''}</td>
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

export default BankAccounts;
