
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HandCash = () => {
  const [handCash, setHandCash] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHandCash = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:5000/api/hand-cash');
        setHandCash(res.data);
      } catch (err) {
        setError('Failed to load hand cash records');
      } finally {
        setLoading(false);
      }
    };
    fetchHandCash();
  }, []);

  return (
    <div>
      <h2>Hand Cash</h2>
      <div className="card p-4 mt-4">
        <div className="d-flex align-items-center mb-3">
          <span className="fw-bold fs-5">All Hand Cash Records</span>
        </div>
        {loading ? (
          <div className="text-center text-muted">Loading...</div>
        ) : error ? (
          <div className="text-danger text-center">{error}</div>
        ) : handCash.length === 0 ? (
          <div className="text-center text-muted">No hand cash records found</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Holder</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {handCash.map(hc => (
                  <tr key={hc._id}>
                    <td>{hc.holder}</td>
                    <td>{hc.amount}</td>
                    <td>{hc.description}</td>
                    <td>{hc.createdAt ? new Date(hc.createdAt).toLocaleString() : ''}</td>
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

export default HandCash;
