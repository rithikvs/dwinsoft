
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError('');
      try {
        // Try admin API shape first, fallback to user shape
        const res = await axios.get('http://localhost:5000/api/invoices');
        // If admin, res.data.invoices; else, res.data is array
        setInvoices(Array.isArray(res.data) ? res.data : res.data.invoices || []);
      } catch (err) {
        setError('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div>
      <h2>Invoices</h2>
      <div className="card p-4 mt-4">
        <div className="d-flex align-items-center mb-3">
          <span className="fw-bold fs-5">All Invoices</span>
        </div>
        {loading ? (
          <div className="text-center text-muted">Loading...</div>
        ) : error ? (
          <div className="text-danger text-center">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="text-center text-muted">No invoices found</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Invoice Number</th>
                  <th>Company</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Grand Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id}>
                    <td>{inv.invoiceNumber}</td>
                    <td>{inv.company?.name}</td>
                    <td>{inv.customer?.name} <br />{inv.customer?.email}</td>
                    <td>{inv.paymentMethod}</td>
                    <td>{inv.paymentStatus}</td>
                    <td>{inv.grandTotal?.toLocaleString?.('en-IN', { style: 'currency', currency: 'INR' })}</td>
                    <td>{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleString() : ''}</td>
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

export default Invoices;
