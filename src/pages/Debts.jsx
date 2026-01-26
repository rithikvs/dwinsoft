
import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    <div>
      <h2>Debts</h2>
      <div className="card p-4 mt-4">
        <div className="d-flex align-items-center mb-3">
          <span className="fw-bold fs-5">All Debts</span>
        </div>
        {loading ? (
          <div className="text-center text-muted">Loading...</div>
        ) : error ? (
          <div className="text-danger text-center">{error}</div>
        ) : debts.length === 0 ? (
          <div className="text-center text-muted">No debts found</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
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
                    <td>{debt.debtor}</td>
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
    </div>
  );
};

export default Debts;
