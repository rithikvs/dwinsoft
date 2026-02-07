
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDebts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:5000/api/debts');
        setDebts(res.data);
      } catch (err) {
        setError('Failed to load debts');
      } finally {
        setLoading(false);
      }
    };
    fetchDebts();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader title="Debts" subtitle="Track outstanding obligations across teams." />
      <SectionCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">All Debts</h3>
            <p className="text-sm text-slate-500">Monitor debtor status and due dates.</p>
          </div>
        </div>
        <div className="mt-4">
          {loading ? (
            <div className="text-center text-sm text-slate-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-sm text-rose-600">{error}</div>
          ) : debts.length === 0 ? (
            <div className="text-center text-sm text-slate-400">No debts found</div>
          ) : (
            <div className="overflow-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Debtor</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map(debt => (
                    <tr key={debt._id}>
                      <td className="font-semibold text-slate-900">{debt.debtor}</td>
                      <td>{debt.amount}</td>
                      <td>{debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : ''}</td>
                      <td>{debt.description}</td>
                      <td>{debt.status}</td>
                      <td>{debt.createdAt ? new Date(debt.createdAt).toLocaleString() : ''}</td>
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
