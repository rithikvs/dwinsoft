
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

  const handleViewInvoice = (invoiceId) => {
    // Open PDF in new tab
    window.open(`http://localhost:5000/api/invoices/view/${invoiceId}`, '_blank');
  };

  const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/invoices/download/${invoiceId}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceNumber.replace(/\//g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download invoice');
    }
  };

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
                  <th>Actions</th>
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
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewInvoice(inv._id)}
                          title="View Invoice"
                        >
                          <i className="bi bi-eye"></i> View
                        </button>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleDownloadInvoice(inv._id, inv.invoiceNumber)}
                          title="Download Invoice"
                        >
                          <i className="bi bi-download"></i> Download
                        </button>
                      </div>
                    </td>
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
