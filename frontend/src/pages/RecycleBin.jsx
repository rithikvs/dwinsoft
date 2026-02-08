
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

const RecycleBin = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [deletedTransactions, setDeletedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDeleted = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/api/recycle-bin`);
        setDeletedTransactions(res.data);
      } catch (err) {
        setError('Failed to load recycle bin');
      } finally {
        setLoading(false);
      }
    };
    fetchDeleted();
  }, []);

  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const theadBg = isDark ? '#334155' : '#f8fafc';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader title="Recycle Bin" subtitle="Deleted transactions retained for audit visibility." />
      <SectionCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: textColor, margin: 0 }}>Deleted Records</h3>
            <p style={{ fontSize: '0.875rem', color: mutedColor, margin: '0.25rem 0 0' }}>Recoverable history of removed transactions.</p>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: mutedColor, padding: '2rem' }}>Loading...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#ef4444', padding: '2rem' }}>{error}</div>
          ) : deletedTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: mutedColor, padding: '2rem' }}>Recycle bin is empty</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-hover mb-0" style={{ color: textColor }}>
                <thead>
                  <tr style={{ background: theadBg }}>
                    <th style={{ color: mutedColor, borderColor }}>Date Deleted</th>
                    <th style={{ color: mutedColor, borderColor }}>Description</th>
                    <th style={{ color: mutedColor, borderColor }}>Type</th>
                    <th style={{ color: mutedColor, borderColor }}>Category</th>
                    <th style={{ color: mutedColor, borderColor }}>Amount</th>
                    <th style={{ color: mutedColor, borderColor }}>Original Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedTransactions.map(t => (
                    <tr key={t._id} style={{ borderColor }}>
                      <td style={{ borderColor }}>{t.deletedAt ? new Date(t.deletedAt).toLocaleString() : ''}</td>
                      <td style={{ fontWeight: '600', color: textColor, borderColor }}>{t.description}</td>
                      <td style={{ borderColor }}>{t.type}</td>
                      <td style={{ borderColor }}>{t.category}</td>
                      <td style={{ borderColor }}>₹{t.amount?.toLocaleString()}</td>
                      <td style={{ borderColor }}>{t.date ? new Date(t.date).toLocaleDateString() : ''}</td>
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

export default RecycleBin;
