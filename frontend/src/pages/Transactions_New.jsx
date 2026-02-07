import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const initialForm = {
  description: '',
  amount: '',
  type: 'Income',
  category: '',
  paymentMethod: 'Bank Account',
  bankAccountId: '',
  handCashId: '',
  date: new Date().toISOString().slice(0, 10),
};

const Transactions = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [handCashRecords, setHandCashRecords] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({ type: '', category: '', startDate: '', endDate: '', paymentMethod: '' });
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canEdit = user && (user.role === 'Admin' || user.role === 'Accountant');
  const canView = !!user;

  // Fetch bank accounts and hand cash records
  const fetchPaymentMethods = async () => {
    try {
      const [bankRes, cashRes] = await Promise.all([
        axios.get('http://localhost:5000/api/bank-accounts'),
        axios.get('http://localhost:5000/api/hand-cash')
      ]);
      setBankAccounts(bankRes.data);
      setHandCashRecords(cashRes.data);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      let url = 'http://localhost:5000/api/transactions';
      if (filter.type || filter.category || filter.startDate || filter.endDate || filter.paymentMethod) {
        const params = [];
        if (filter.type) params.push(`type=${filter.type}`);
        if (filter.category) params.push(`category=${filter.category}`);
        if (filter.paymentMethod) params.push(`paymentMethod=${filter.paymentMethod}`);
        if (filter.startDate) params.push(`startDate=${filter.startDate}`);
        if (filter.endDate) params.push(`endDate=${filter.endDate}`);
        url += `/search/filter?${params.join('&')}`;
      }
      const res = await axios.get(url);
      setTransactions(res.data);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let bal = 0;
    transactions.forEach(t => {
      if (t.type === 'Income') bal += t.amount;
      else if (t.type === 'Expense') bal -= t.amount;
    });
    setBalance(bal);
  }, [transactions]);

  useEffect(() => {
    fetchPaymentMethods();
    fetchTransactions();
    // eslint-disable-next-line
  }, [filter]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Reset related IDs when changing payment method
    if (name === 'paymentMethod') {
      setForm({
        ...form,
        [name]: value,
        bankAccountId: '',
        handCashId: ''
      });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...form,
        amount: Number(form.amount)
      };
      
      if (editingId) {
        await axios.put(`http://localhost:5000/api/transactions/${editingId}`, payload);
        setSuccess('Transaction updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/transactions', payload);
        setSuccess('Transaction added successfully');
      }
      setForm(initialForm);
      setEditingId(null);
      fetchTransactions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save transaction');
    }
  };

  const handleEdit = t => {
    setForm({
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
      paymentMethod: t.paymentMethod || 'Bank Account',
      bankAccountId: t.bankAccountId ? t.bankAccountId._id || t.bankAccountId : '',
      handCashId: t.handCashId ? t.handCashId._id || t.handCashId : '',
      date: t.date ? t.date.slice(0, 10) : '',
    });
    setEditingId(t._id);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`);
      setSuccess('Transaction deleted successfully');
      fetchTransactions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  const handleFilterChange = e => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const categories = [
    'Salary', 'Sales', 'Payroll', 'Office', 'Utilities', 'Travel', 'Supplies', 'Other'
  ];

  const GST_RATE = 18;
  const CGST_RATE = GST_RATE / 2;
  const SGST_RATE = GST_RATE / 2;

  const companyDetails = {
    name: 'DWINSOFT Technologies Pvt. Ltd.',
    address: '123 Business Park, Tech Hub, Bangalore - 560001',
    phone: '+91 80 1234 5678',
    email: 'accounts@dwinsoft.com',
    gstNumber: '29AABCU9603R1ZM',
    website: 'www.dwinsoft.com'
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV/${year}${month}/${random}`;
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    const convert = (n) => {
      if (n < 1000) return convertLessThanThousand(n);
      if (n < 100000) return convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertLessThanThousand(n % 1000) : '');
      if (n < 10000000) return convertLessThanThousand(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
      return convertLessThanThousand(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let result = convert(rupees) + ' Rupees';
    if (paise > 0) {
      result += ' and ' + convert(paise) + ' Paise';
    }
    return result + ' Only';
  };

  const downloadInvoice = (transaction) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      const invoiceNumber = generateInvoiceNumber();
      const invoiceDate = formatDate(new Date());

      const formatCurrencyPDF = (amount) => {
        return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      const primaryColor = [44, 62, 80];
      const secondaryColor = [149, 165, 166];
      const accentColor = [52, 152, 219];

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(...primaryColor);
      doc.text('DWINSOFT', margin, 25);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...secondaryColor);
      doc.text('T E C H N O L O G I E S', margin, 30);

      doc.setFontSize(32);
      doc.setTextColor(230, 230, 230);
      doc.text('INVOICE', pageWidth - margin, 35, { align: 'right' });
      doc.setTextColor(...primaryColor);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(companyDetails.address, margin, 45);
      doc.text(`GSTIN: ${companyDetails.gstNumber} | Phone: ${companyDetails.phone}`, margin, 50);

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(margin, 60, pageWidth - margin, 60);

      const detailsY = 70;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text('BILL TO:', margin, detailsY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(transaction.type === 'Income' ? 'Cash / General Customer' : 'Internal Expense', margin, detailsY + 6);

      const col2X = pageWidth - margin - 60;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text('INVOICE DETAILS:', col2X, detailsY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('Invoice No:', col2X, detailsY + 6);
      doc.text(invoiceNumber, pageWidth - margin, detailsY + 6, { align: 'right' });
      doc.text('Date:', col2X, detailsY + 11);
      doc.text(invoiceDate, pageWidth - margin, detailsY + 11, { align: 'right' });
      doc.text('Payment Method:', col2X, detailsY + 16);
      doc.text(transaction.paymentMethod || 'Bank Account', pageWidth - margin, detailsY + 16, { align: 'right' });

      const baseAmount = transaction.amount;
      const cgstAmount = baseAmount * (CGST_RATE / 100);
      const sgstAmount = baseAmount * (SGST_RATE / 100);
      const totalGST = cgstAmount + sgstAmount;
      const grandTotal = baseAmount + totalGST;

      autoTable(doc, {
        startY: 95,
        head: [['#', 'Description', 'HSN/SAC', 'Qty', 'Rate', 'Total']],
        body: [
          [
            '1',
            transaction.description || 'Service Charges',
            '9983',
            '1',
            formatCurrencyPDF(baseAmount),
            formatCurrencyPDF(baseAmount)
          ]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50],
        },
        margin: { left: margin, right: margin }
      });

      const summaryY = doc.lastAutoTable.finalY + 5;
      const rightColLabelX = pageWidth - margin - 70;
      const rightColValueX = pageWidth - margin;

      let currY = summaryY + 5;
      const lineHeight = 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('Sub Total:', rightColLabelX, currY);
      doc.text(formatCurrencyPDF(baseAmount), rightColValueX, currY, { align: 'right' });

      currY += lineHeight;
      doc.text(`CGST (${CGST_RATE}%):`, rightColLabelX, currY);
      doc.text(formatCurrencyPDF(cgstAmount), rightColValueX, currY, { align: 'right' });

      currY += lineHeight;
      doc.text(`SGST (${SGST_RATE}%):`, rightColLabelX, currY);
      doc.text(formatCurrencyPDF(sgstAmount), rightColValueX, currY, { align: 'right' });

      currY += 3;
      doc.setDrawColor(200, 200, 200);
      doc.line(rightColLabelX, currY, pageWidth - margin, currY);

      currY += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text('Grand Total:', rightColLabelX, currY);
      doc.text(formatCurrencyPDF(grandTotal), rightColValueX, currY, { align: 'right' });

      const filename = `Invoice_${invoiceNumber.replace(/\//g, '_')}_${Date.now()}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert('Failed to download invoice');
    }
  };

  if (!canEdit && !canView) {
    return <div className="alert alert-danger">Access denied</div>;
  }

  return (
    <div>
      <h2>Transaction Management</h2>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError('')}
          ></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess('')}
          ></button>
        </div>
      )}

      {/* Add/Edit Form */}
      {canEdit && (
        <div className="card p-4 mt-4 mb-4">
          <h5 className="mb-3">{editingId ? 'Edit Transaction' : 'Add New Transaction'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label htmlFor="description" className="form-label">
                  Description<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  className="form-control"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  required
                />
              </div>
              <div className="col-md-2 mb-3">
                <label htmlFor="amount" className="form-label">
                  Amount<span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="form-control"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="col-md-2 mb-3">
                <label htmlFor="type" className="form-label">
                  Type<span className="text-danger">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  className="form-select"
                  value={form.type}
                  onChange={handleChange}
                  required
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <label htmlFor="category" className="form-label">
                  Category<span className="text-danger">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <label htmlFor="date" className="form-label">
                  Date<span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="form-control"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="row">
              <div className="col-md-4 mb-3">
                <label htmlFor="paymentMethod" className="form-label">
                  Payment Method<span className="text-danger">*</span>
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="form-select"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="Bank Account">Bank Account</option>
                  <option value="Hand Cash">Hand Cash</option>
                </select>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <button type="submit" className="btn btn-primary me-2">
                  {editingId ? 'Update Transaction' : 'Add Transaction'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filter Section */}
      {canView && (
        <div className="card p-4 mt-4 mb-4">
          <h5 className="mb-3">Filter Transactions</h5>
          <div className="row">
            <div className="col-md-2 mb-3">
              <label htmlFor="filterType" className="form-label">Type</label>
              <select
                id="filterType"
                name="type"
                className="form-select"
                value={filter.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            <div className="col-md-2 mb-3">
              <label htmlFor="filterCategory" className="form-label">Category</label>
              <select
                id="filterCategory"
                name="category"
                className="form-select"
                value={filter.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2 mb-3">
              <label htmlFor="filterPaymentMethod" className="form-label">Payment Method</label>
              <select
                id="filterPaymentMethod"
                name="paymentMethod"
                className="form-select"
                value={filter.paymentMethod}
                onChange={handleFilterChange}
              >
                <option value="">All Methods</option>
                <option value="Bank Account">Bank Account</option>
                <option value="Hand Cash">Hand Cash</option>
              </select>
            </div>
            <div className="col-md-2 mb-3">
              <label htmlFor="startDate" className="form-label">From Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-control"
                value={filter.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label htmlFor="endDate" className="form-label">To Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-control"
                value={filter.endDate}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="card p-4">
        <h5 className="mb-3">All Transactions</h5>
        {loading ? (
          <div className="text-center text-muted py-5">
            <div className="spinner-border spinner-border-sm me-2"></div>
            Loading...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-muted py-5">No transactions found</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Payment Method</th>
                  <th className="text-end">Amount</th>
                  {canEdit && <th className="text-center" style={{ width: '100px' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t._id}>
                    <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                    <td>{t.description}</td>
                    <td>
                      <span className="badge bg-secondary">{t.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${t.type === 'Income' ? 'bg-success' : 'bg-danger'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${t.paymentMethod === 'Hand Cash' ? 'bg-warning' : 'bg-info'}`}>
                        {t.paymentMethod || 'Bank Account'}
                      </span>
                    </td>
                    <td className={`text-end fw-bold ${t.type === 'Income' ? 'text-success' : 'text-danger'}`}>
                      {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    {canEdit && (
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(t)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-danger me-2"
                          onClick={() => handleDelete(t._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => downloadInvoice(t)}
                          title="Download Invoice"
                        >
                          📄
                        </button>
                      </td>
                    )}
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

export default Transactions;
