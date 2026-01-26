
import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    <div>
      <h2>Bank Accounts</h2>
      <div className="card p-4 mt-4">
        <div className="d-flex align-items-center mb-3">
          <span className="fw-bold fs-5">All Bank Accounts</span>
        </div>
        {loading ? (
          <div className="text-center text-muted">Loading...</div>
        ) : error ? (
          <div className="text-danger text-center">{error}</div>
        ) : accounts.length === 0 ? (
          <div className="text-center text-muted">No bank accounts found</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
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
                    <td>{acc.name}</td>
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
    </div>
  );
};

export default BankAccounts;
