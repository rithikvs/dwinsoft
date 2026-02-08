
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { ThemeContext } from '../context/ThemeContext';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

const Debts = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDebts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/api/debts`);
        setDebts(res.data);
      } catch (err) {
        setError('Failed to load debts');
      } finally {
        setLoading(false);
      }
    };
    fetchDebts();
  }, []);

  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const theadBg = isDark ? '#334155' : '#f8fafc';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader title="Debts" subtitle="Track outstanding obligations across teams." />
      <SectionCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: textColor, margin: 0 }}>All Debts</h3>
            <p style={{ fontSize: '0.875rem', color: mutedColor, margin: '0.25rem 0 0' }}>Monitor debtor status and due dates.</p>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: mutedColor, padding: '2rem' }}>Loading...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#ef4444', padding: '2rem' }}>{error}</div>
          ) : debts.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: mutedColor, padding: '2rem' }}>No debts found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-hover mb-0" style={{ color: textColor }}>
                <thead>
                  <tr style={{ background: theadBg }}>
                    <th style={{ color: mutedColor, borderColor }}>Debtor</th>
                    <th style={{ color: mutedColor, borderColor }}>Amount</th>
                    <th style={{ color: mutedColor, borderColor }}>Due Date</th>
                    <th style={{ color: mutedColor, borderColor }}>Description</th>
                    <th style={{ color: mutedColor, borderColor }}>Status</th>
                    <th style={{ color: mutedColor, borderColor }}>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map(debt => (
                    <tr key={debt._id} style={{ borderColor }}>
                      <td style={{ fontWeight: '600', color: textColor, borderColor }}>{debt.debtor}</td>
                      <td style={{ borderColor }}>{debt.amount}</td>
                      <td style={{ borderColor }}>{debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : ''}</td>
                      <td style={{ borderColor }}>{debt.description}</td>
                      <td style={{ borderColor }}>{debt.status}</td>
                      <td style={{ borderColor }}>{debt.createdAt ? new Date(debt.createdAt).toLocaleString() : ''}</td>
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

export default Debts;
