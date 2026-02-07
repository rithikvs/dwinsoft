
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

const RecycleBin = () => {
  const { user } = useContext(AuthContext);
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

  return (
    <div className="space-y-8">
      <PageHeader title="Recycle Bin" subtitle="Deleted transactions retained for audit visibility." />
      <SectionCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Deleted Records</h3>
            <p className="text-sm text-slate-500">Recoverable history of removed transactions.</p>
          </div>
        </div>
        <div className="mt-4">
          {loading ? (
            <div className="text-center text-sm text-slate-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-sm text-rose-600">{error}</div>
          ) : deletedTransactions.length === 0 ? (
            <div className="text-center text-sm text-slate-400">Recycle bin is empty</div>
          ) : (
            <div className="overflow-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Date Deleted</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Original Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedTransactions.map(t => (
                    <tr key={t._id}>
                      <td>{t.deletedAt ? new Date(t.deletedAt).toLocaleString() : ''}</td>
                      <td className="font-semibold text-slate-900">{t.description}</td>
                      <td>{t.type}</td>
                      <td>{t.category}</td>
                      <td>₹{t.amount?.toLocaleString()}</td>
                      <td>{t.date ? new Date(t.date).toLocaleDateString() : ''}</td>
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
