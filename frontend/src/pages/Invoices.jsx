import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    companyGST: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'Cash',
    paymentStatus: 'Pending',
    items: [{ description: '', quantity: 1, rate: 0 }],
    notes: '',
  });

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/invoices', {
        headers: { 'x-auth-token': token }
      });
      setInvoices(Array.isArray(res.data) ? res.data : res.data.invoices || []);
    } catch (err) {
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleViewInvoice = (invoiceId) => {
    window.open(`http://localhost:5000/api/invoices/view/${invoiceId}`, '_blank');
  };

  const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/invoices/download/${invoiceId}`, {
        responseType: 'blob'
      });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'quantity' || field === 'rate' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        company: {
          name: formData.companyName,
          address: formData.companyAddress,
          gst: formData.companyGST,
        },
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          address: formData.customerAddress,
        },
        items: formData.items,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes,
      };

      await axios.post('http://localhost:5000/api/invoices', payload, {
        headers: { 'x-auth-token': token }
      });

      setFormSuccess('Invoice created successfully!');
      setFormData({
        companyName: '',
        companyAddress: '',
        companyGST: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        paymentMethod: 'Cash',
        paymentStatus: 'Pending',
        items: [{ description: '', quantity: 1, rate: 0 }],
        notes: '',
      });
      fetchInvoices();
      setTimeout(() => setShowForm(false), 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setFormLoading(false);
    }
  };

  const formStyles = {
    container: {
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      padding: '2rem',
      marginBottom: '2rem',
    },
    section: {
      marginBottom: '1.5rem',
      padding: '1.25rem',
      background: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#475569',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    row: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#64748b',
    },
    input: {
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      border: '1.5px solid #e2e8f0',
      fontSize: '0.95rem',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      outline: 'none',
    },
    select: {
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      border: '1.5px solid #e2e8f0',
      fontSize: '0.95rem',
      background: '#fff',
      cursor: 'pointer',
    },
    itemsTable: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '0.75rem',
      background: '#f1f5f9',
      fontWeight: '600',
      fontSize: '0.875rem',
      color: '#475569',
      borderBottom: '2px solid #e2e8f0',
    },
    td: {
      padding: '0.75rem',
      borderBottom: '1px solid #e2e8f0',
      verticalAlign: 'middle',
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '1rem',
      marginTop: '1rem',
      padding: '1rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '10px',
      color: '#fff',
    },
    btn: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
    },
    btnSecondary: {
      background: '#e2e8f0',
      color: '#475569',
    },
    btnSuccess: {
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      color: '#fff',
    },
    btnDanger: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
    },
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Invoices</h2>
        <button
          style={{ ...formStyles.btn, ...formStyles.btnPrimary }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Close Form' : '+ Create Invoice'}
        </button>
      </div>

      {/* Invoice Creation Form */}
      {showForm && (
        <div style={formStyles.container}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Create New Invoice</h3>

          {formError && (
            <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem' }}>
              {formError}
            </div>
          )}
          {formSuccess && (
            <div style={{ padding: '1rem', background: '#d1fae5', color: '#059669', borderRadius: '8px', marginBottom: '1rem' }}>
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Company Details Section */}
            <div style={formStyles.section}>
              <div style={formStyles.sectionTitle}>
                <span>🏢</span> Company Details
              </div>
              <div style={formStyles.row}>
                <div style={formStyles.inputGroup}>
                  <label style={formStyles.label}>Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    style={formStyles.input}
                    required
                    placeholder="DWINSOFT Pvt Ltd"
                  />
                </div>
                <div style={formStyles.inputGroup}>
                  <label style={formStyles.label}>GST Number</label>
                  <input
                    type="text"
                    name="companyGST"
                    value={formData.companyGST}
                    onChange={handleInputChange}
                    style={formStyles.input}
                    placeholder="33AAACB1234A1Z5"
                  />
                </div>
              </div>
              <div style={{ ...formStyles.inputGroup, marginTop: '1rem' }}>
                <label style={formStyles.label}>Company Address</label>
                <input
                  type="text"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  style={formStyles.input}
                  placeholder="123 Business Park, Chennai, TN 600001"
                />
              </div>
            </div>

            {/* Customer Details Section */}
            <div style={formStyles.section}>
              <div style={formStyles.sectionTitle}>
                <span>👤</span> Customer Details
              </div>
              <div style={formStyles.row}>
                <div style={formStyles.inputGroup}>
                  <label style={formStyles.label}>Customer Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    style={formStyles.input}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div style={formStyles.inputGroup}>
                  <label style={formStyles.label}>Email *</label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    style={formStyles.input}
                    required
                    placeholder="john@example.com"
                  />
                </div>
                <div style={formStyles.inputGroup}>
                  <label style={formStyles.label}>Phone</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    style={formStyles.input}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
              <div style={{ ...formStyles.inputGroup, marginTop: '1rem' }}>
                <label style={formStyles.label}>Customer Address</label>
                <input
                  type="text"
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleInputChange}
                  style={formStyles.input}
                  placeholder="456 Customer Street, City, State - 600001"
                />
              </div>
            </div>

            {/* Invoice Items Section */}
            <div style={formStyles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={formStyles.sectionTitle}>
                  <span>📦</span> Invoice Items
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  style={{ ...formStyles.btn, ...formStyles.btnSuccess, padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  + Add Item
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={formStyles.itemsTable}>
                  <thead>
                    <tr>
                      <th style={{ ...formStyles.th, width: '40%' }}>Description</th>
                      <th style={{ ...formStyles.th, width: '15%', textAlign: 'center' }}>Quantity</th>
                      <th style={{ ...formStyles.th, width: '20%', textAlign: 'right' }}>Rate (₹)</th>
                      <th style={{ ...formStyles.th, width: '20%', textAlign: 'right' }}>Amount (₹)</th>
                      <th style={{ ...formStyles.th, width: '5%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td style={formStyles.td}>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            style={{ ...formStyles.input, width: '100%' }}
                            placeholder="Service/Product description"
                            required
                          />
                        </td>
                        <td style={{ ...formStyles.td, textAlign: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            style={{ ...formStyles.input, width: '80px', textAlign: 'center' }}
                            required
                          />
                        </td>
                        <td style={{ ...formStyles.td, textAlign: 'right' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            style={{ ...formStyles.input, width: '120px', textAlign: 'right' }}
                            required
                          />
                        </td>
                        <td style={{ ...formStyles.td, textAlign: 'right', fontWeight: '600', color: '#475569' }}>
                          ₹{(item.quantity * item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={formStyles.td}>
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              style={{ ...formStyles.btn, ...formStyles.btnDanger }}
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={formStyles.totalRow}>
                <span style={{ fontSize: '1.125rem' }}>Grand Total:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  ₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Payment & Notes Section */}
            <div style={formStyles.section}>
              <div style={formStyles.sectionTitle}>
                <span>💳</span> Payment Details
              </div>
              <div style={formStyles.row}>
                <div style={formStyles.inputGroup}>
                  <label style={formStyles.label}>Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    style={formStyles.select}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div style={formStyles.inputGroup}>
                  <label style={formStyles.label}>Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    style={formStyles.select}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div style={{ ...formStyles.inputGroup, marginTop: '1rem' }}>
                <label style={formStyles.label}>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  style={{ ...formStyles.input, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Additional notes or terms..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ ...formStyles.btn, ...formStyles.btnSecondary }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                style={{ ...formStyles.btn, ...formStyles.btnPrimary, opacity: formLoading ? 0.7 : 1 }}
              >
                {formLoading ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoices Table */}
      <div style={formStyles.container}>
        <div style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '1rem', color: '#1e293b' }}>
          All Invoices
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#dc2626', padding: '2rem' }}>{error}</div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No invoices found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={formStyles.itemsTable}>
              <thead>
                <tr>
                  <th style={formStyles.th}>Invoice #</th>
                  <th style={formStyles.th}>Company</th>
                  <th style={formStyles.th}>Customer</th>
                  <th style={formStyles.th}>Payment</th>
                  <th style={formStyles.th}>Status</th>
                  <th style={{ ...formStyles.th, textAlign: 'right' }}>Total</th>
                  <th style={formStyles.th}>Date</th>
                  <th style={formStyles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id}>
                    <td style={{ ...formStyles.td, fontWeight: '600', color: '#667eea' }}>{inv.invoiceNumber}</td>
                    <td style={formStyles.td}>{inv.company?.name}</td>
                    <td style={formStyles.td}>
                      <div>{inv.customer?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{inv.customer?.email}</div>
                    </td>
                    <td style={formStyles.td}>{inv.paymentMethod}</td>
                    <td style={formStyles.td}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: inv.paymentStatus === 'Paid' ? '#d1fae5' : inv.paymentStatus === 'Pending' ? '#fef3c7' : '#fee2e2',
                        color: inv.paymentStatus === 'Paid' ? '#059669' : inv.paymentStatus === 'Pending' ? '#d97706' : '#dc2626',
                      }}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td style={{ ...formStyles.td, textAlign: 'right', fontWeight: '600' }}>
                      {inv.grandTotal?.toLocaleString?.('en-IN', { style: 'currency', currency: 'INR' })}
                    </td>
                    <td style={formStyles.td}>{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : ''}</td>
                    <td style={formStyles.td}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleViewInvoice(inv._id)}
                          style={{ ...formStyles.btn, padding: '0.375rem 0.75rem', fontSize: '0.8rem', background: '#e0e7ff', color: '#4f46e5' }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(inv._id, inv.invoiceNumber)}
                          style={{ ...formStyles.btn, padding: '0.375rem 0.75rem', fontSize: '0.8rem', background: '#d1fae5', color: '#059669' }}
                        >
                          Download
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
