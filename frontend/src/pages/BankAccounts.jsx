
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

const BankAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:5000/api/bank-accounts');
        setAccounts(res.data);
      } catch (err) {
        setError('Failed to load bank accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader title="Bank Accounts" subtitle="See balances and account details at a glance." />
      <SectionCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">All Bank Accounts</h3>
            <p className="text-sm text-slate-500">Monitor balances across active accounts.</p>
          </div>
        </div>
        <div className="mt-4">
          {loading ? (
            <div className="text-center text-sm text-slate-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-sm text-rose-600">{error}</div>
          ) : accounts.length === 0 ? (
            <div className="text-center text-sm text-slate-400">No bank accounts found</div>
          ) : (
            <div className="overflow-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Account Number</th>
                    <th>Bank Name</th>
                    <th>Balance</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(acc => (
                    <tr key={acc._id}>
                      <td className="font-semibold text-slate-900">{acc.name}</td>
                      <td>{acc.accountNumber}</td>
                      <td>{acc.bankName}</td>
                      <td>{acc.balance}</td>
                      <td>{acc.createdAt ? new Date(acc.createdAt).toLocaleString() : ''}</td>
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
