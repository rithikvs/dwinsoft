import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Invoices = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [transactionLoading, setTransactionLoading] = useState(true);
  const [transactionError, setTransactionError] = useState('');
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
    paymentMethod: 'Bank Account',
    paymentStatus: 'Paid',
    bankAccountId: '',
    handCashId: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
    notes: '',
  });
  const [bankAccounts, setBankAccounts] = useState([]);
  const [handCashRecords, setHandCashRecords] = useState([]);

  const companyDetails = {
    name: 'DWINSOFT Technologies Pvt. Ltd.',
    address: '123 Business Park, Tech Hub, Bangalore - 560001',
    phone: '+91 80 1234 5678',
    email: 'accounts@dwinsoft.com',
    gstNumber: '29AABCU9603R1ZM',
    website: 'www.dwinsoft.com'
  };

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/invoices`, {
        headers: { 'x-auth-token': token }
      });
      setInvoices(Array.isArray(res.data) ? res.data : res.data.invoices || []);
    } catch (err) {
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  // Fetch bank accounts and hand cash records
  const fetchPaymentMethods = async () => {
    try {
      const [bankRes, cashRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/bank-accounts`),
        axios.get(`${API_BASE_URL}/api/hand-cash`)
      ]);
      setBankAccounts(bankRes.data);
      setHandCashRecords(cashRes.data);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchPaymentMethods();
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setTransactionLoading(true);
    setTransactionError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/transactions`, {
        headers: { 'x-auth-token': token }
      });
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // Employee may not see transactions if not allowed
      if (err.response?.status === 403) {
        setTransactions([]);
      } else {
        setTransactionError('Failed to load transactions');
      }
    } finally {
      setTransactionLoading(false);
    }
  };

  // HR/Admin: Toggle employee access for an invoice
  const handleToggleAccess = async (invoiceId, currentlyApproved) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = currentlyApproved ? 'revoke' : 'approve';
      await axios.put(`${API_BASE_URL}/api/invoices/${endpoint}/${invoiceId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update access');
    }
  };

  const isEmployee = user?.role === 'Employee';
  const isHROrAdmin = ['HR', 'Admin'].includes(user?.role);

  // Employee: Request access to view an invoice
  const handleRequestAccess = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/invoices/request-access/${invoiceId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send access request');
    }
  };

  // Employee: Request invoice access for a transaction
  const handleRequestTransactionInvoiceAccess = async (transactionId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/transactions/request-invoice-access/${transactionId}`);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send access request');
    }
  };

  // HR/Admin: Approve/Revoke invoice access for a transaction
  const handleToggleTransactionInvoiceAccess = async (transactionId, currentlyApproved) => {
    try {
      const endpoint = currentlyApproved ? 'revoke-invoice-access' : 'approve-invoice-access';
      await axios.put(`${API_BASE_URL}/api/transactions/${endpoint}/${transactionId}`);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update access');
    }
  };

  const handleViewInvoice = (invoiceId) => {
    const token = localStorage.getItem('token');
    window.open(`${API_BASE_URL}/api/invoices/view/${invoiceId}?token=${token}`, '_blank');
  };

  const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/invoices/download/${invoiceId}`, {
        responseType: 'blob',
        headers: { 'x-auth-token': token }
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
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      // Reset IDs when changing payment method
      ...(name === 'paymentMethod' && {
        bankAccountId: '',
        handCashId: ''
      })
    }));
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
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

  const getPaymentMethodLabel = (transaction) => {
    if (transaction?.paymentMethod) return transaction.paymentMethod;
    if (transaction?.bankAccountId) return 'Bank Account';
    if (transaction?.handCashId) return 'Hand Cash';
    return '';
  };

  const downloadTransactionInvoice = (transaction) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      const invoiceNumber = generateInvoiceNumber();
      const invoiceDate = formatDate(new Date());
      const transactionDate = formatDate(transaction.date || new Date());

      const formatCurrencyPDF = (amount) => {
        return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      const primaryColor = [30, 41, 59];
      const secondaryColor = [148, 163, 184];
      const accentColor = [14, 116, 144];

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(...primaryColor);
      doc.text(companyDetails.name.split(' ')[0], margin, 25);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...secondaryColor);
      doc.text('T E C H N O L O G I E S', margin, 30);

      doc.setFontSize(32);
      doc.setTextColor(226, 232, 240);
      doc.text('INVOICE', pageWidth - margin, 35, { align: 'right' });
      doc.setTextColor(...primaryColor);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(companyDetails.address, margin, 45);
      doc.text(`GSTIN: ${companyDetails.gstNumber} | Phone: ${companyDetails.phone}`, margin, 50);
      doc.text(`Email: ${companyDetails.email} | Web: ${companyDetails.website}`, margin, 55);

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
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(transaction.category || 'General Category', margin, detailsY + 11);

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Payment Method: ${getPaymentMethodLabel(transaction) || 'Bank Account'}`, margin, detailsY + 17);
      doc.text(`Transaction Date: ${transactionDate}`, margin, detailsY + 22);

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
      doc.text('Status:', col2X, detailsY + 16);
      doc.setTextColor(...accentColor);
      doc.text('PAID', pageWidth - margin, detailsY + 16, { align: 'right' });
      doc.setTextColor(0, 0, 0);

      const GST_RATE = 18;
      const CGST_RATE = GST_RATE / 2;
      const SGST_RATE = GST_RATE / 2;
      const baseAmount = transaction.amount;
      const cgstAmount = baseAmount * (CGST_RATE / 100);
      const sgstAmount = baseAmount * (SGST_RATE / 100);
      const totalGST = cgstAmount + sgstAmount;
      const grandTotal = baseAmount + totalGST;

      autoTable(doc, {
        startY: 105,
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
          fontSize: 9,
          halign: 'center',
          cellPadding: 2
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50],
          cellPadding: 2,
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 40, halign: 'right' },
          5: { cellWidth: 45, halign: 'right' }
        },
        margin: { left: margin, right: margin }
      });

      const summaryY = doc.lastAutoTable.finalY + 5;
      const leftColX = margin;
      const rightColLabelX = pageWidth - margin - 70;
      const rightColValueX = pageWidth - margin;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Total In Words:', leftColX, summaryY + 10);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(numberToWords(grandTotal), leftColX, summaryY + 16, { maxWidth: 90 });

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

      const termsY = pageHeight - 40;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Terms & Conditions:', margin, termsY);
      doc.setFont('helvetica', 'normal');
      doc.text('1. Payment is due on receipt.', margin, termsY + 5);
      doc.text('2. Please include invoice number on your check.', margin, termsY + 9);

      doc.text('Authorized Signatory', pageWidth - margin - 30, termsY + 15, { align: 'center' });
      doc.setDrawColor(150, 150, 150);
      doc.line(pageWidth - margin - 50, termsY + 10, pageWidth - margin - 10, termsY + 10);

      doc.setFillColor(...primaryColor);
      doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 2.5, { align: 'center' });

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      try {
        window.open(url, '_blank');
      } catch (e) {
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error('Invoice generation failed', err);
      setTransactionError('Invoice generation failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate payment method selection
    if (formData.paymentMethod === 'Bank Account' && !formData.bankAccountId) {
      setFormError('Please select a bank account');
      return;
    }
    if (formData.paymentMethod === 'Hand Cash' && !formData.handCashId) {
      setFormError('Please select a hand cash record');
      return;
    }

    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        company: {
          name: formData.companyName,
          address: formData.companyAddress,
          gstNumber: formData.companyGST,
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
        bankAccountId: formData.bankAccountId,
        handCashId: formData.handCashId,
        notes: formData.notes,
      };

      await axios.post(`${API_BASE_URL}/api/invoices`, payload, {
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
        paymentMethod: 'Bank Account',
        paymentStatus: 'Paid',
        bankAccountId: '',
        handCashId: '',
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

  const cardBg = isDark ? '#1e293b' : '#fff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const darkText = isDark ? '#e2e8f0' : '#0f172a';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const sectionColor = isDark ? '#cbd5e1' : '#475569';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const sectionBg = isDark ? '#334155' : '#f8fafc';
  const thBg = isDark ? '#334155' : '#f1f5f9';

  const formStyles = {
    container: {
      background: cardBg,
      borderRadius: '16px',
      boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.08)',
      padding: '2rem',
      marginBottom: '2rem',
    },
    section: {
      marginBottom: '1.5rem',
      padding: '1.25rem',
      background: sectionBg,
      borderRadius: '12px',
      border: `1px solid ${borderColor}`,
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: sectionColor,
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
      color: mutedColor,
    },
    input: {
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      border: `1.5px solid ${borderColor}`,
      fontSize: '0.95rem',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      outline: 'none',
      background: isDark ? '#0f172a' : '#fff',
      color: textColor,
    },
    select: {
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      border: `1.5px solid ${borderColor}`,
      fontSize: '0.95rem',
      background: isDark ? '#0f172a' : '#fff',
      color: textColor,
      cursor: 'pointer',
    },
    itemsTable: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '0.75rem',
      background: thBg,
      fontWeight: '600',
      fontSize: '0.875rem',
      color: sectionColor,
      borderBottom: `2px solid ${borderColor}`,
    },
    td: {
      padding: '0.75rem',
      borderBottom: `1px solid ${borderColor}`,
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
      background: isDark ? '#334155' : '#e2e8f0',
      color: sectionColor,
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
        <div>
          <h2 style={{ margin: 0, color: textColor }}>Invoices</h2>
          {isEmployee && (
            <span style={{ fontSize: '0.85rem', color: mutedColor }}>Request HR permission to view invoices</span>
          )}
        </div>
        {!isEmployee && (
          <button
            style={{ ...formStyles.btn, ...formStyles.btnPrimary }}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Close Form' : '+ Create Invoice'}
          </button>
        )}
      </div>

      {/* Saved Invoices Section */}
      {invoices.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: darkText }}>
            {isEmployee ? 'All Invoices' : 'Saved Invoices'}
          </h3>
          <div className="row g-3">
            {invoices.map((inv) => (
              <div className="col-12 col-md-6 col-lg-4" key={inv._id}>
                <div className="card h-100 border-0" style={{ boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(15, 23, 42, 0.08)', borderRadius: '16px', background: cardBg }}>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: darkText }}>{inv.invoiceNumber}</span>
                      <span className={`badge ${inv.paymentStatus === 'Paid' ? 'bg-success' : inv.paymentStatus === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                        {inv.paymentStatus}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: mutedColor }}>
                      {formatDate(inv.invoiceDate)}
                    </div>
                    <div style={{ color: sectionColor, fontSize: '0.9rem' }}>
                      {inv.customer?.name || 'N/A'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: darkText }}>
                      {formatCurrency(inv.grandTotal)}
                    </div>

                    {/* Employee Access Badge */}
                    {!isEmployee && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span 
                        className={`badge ${inv.employeeAccessApproved ? 'bg-success' : inv.accessRequested ? 'bg-warning text-dark' : 'bg-secondary'}`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {inv.employeeAccessApproved ? 'Employee Access: Approved' : inv.accessRequested ? `Access Requested by ${inv.accessRequestedBy?.username || 'Employee'}` : 'Employee Access: Restricted'}
                      </span>
                    </div>
                    )}
                    {isEmployee && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span 
                        className={`badge ${inv.employeeAccessApproved ? 'bg-success' : inv.accessRequested ? 'bg-warning text-dark' : 'bg-secondary'}`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {inv.employeeAccessApproved ? 'Access Approved' : inv.accessRequested ? 'Request Pending' : 'No Access'}
                      </span>
                    </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                      {/* Employee view: show request / pending / view buttons based on status */}
                      {isEmployee && !inv.employeeAccessApproved && !inv.accessRequested && (
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleRequestAccess(inv._id)}
                        >
                          Request Access
                        </button>
                      )}
                      {isEmployee && !inv.employeeAccessApproved && inv.accessRequested && (
                        <span style={{ fontSize: '0.8rem', color: '#d97706', fontStyle: 'italic', padding: '0.375rem 0' }}>
                          Waiting for HR approval...
                        </span>
                      )}
                      {(!isEmployee || inv.employeeAccessApproved) && (
                        <>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewInvoice(inv._id)}
                          >
                            View PDF
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleDownloadInvoice(inv._id, inv.invoiceNumber)}
                          >
                            Download
                          </button>
                        </>
                      )}

                      {/* HR/Admin: Approve/Revoke toggle */}
                      {isHROrAdmin && (
                        <button
                          className={`btn btn-sm ${inv.employeeAccessApproved ? 'btn-outline-danger' : 'btn-outline-warning'}`}
                          onClick={() => handleToggleAccess(inv._id, inv.employeeAccessApproved)}
                          title={inv.employeeAccessApproved ? 'Revoke employee access' : 'Approve employee access'}
                        >
                          {inv.employeeAccessApproved ? 'Revoke Access' : 'Approve Access'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Invoices Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, color: darkText }}>Transaction Invoices</h3>
            <div style={{ color: mutedColor, fontSize: '0.9rem' }}>{isEmployee ? 'View invoices for all transactions' : 'Generate invoices directly from your transactions'}</div>
          </div>
        </div>

        {transactionError && (
          <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '10px', marginBottom: '1rem' }}>
            {transactionError}
          </div>
        )}

        <div className="row g-3">
          {transactionLoading ? (
            <div className="col-12">
              <div style={{ padding: '1rem', background: sectionBg, borderRadius: '12px', textAlign: 'center', color: mutedColor }}>
                Loading transactions...
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="col-12">
              <div style={{ padding: '1rem', background: sectionBg, borderRadius: '12px', textAlign: 'center', color: mutedColor }}>
                No transactions found.
              </div>
            </div>
          ) : (
            transactions.map((t) => (
              <div className="col-12 col-md-6 col-lg-4" key={t._id}>
                <div className="card h-100 border-0" style={{ boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(15, 23, 42, 0.08)', borderRadius: '16px', background: cardBg }}>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: mutedColor }}>{formatDate(t.date)}</span>
                      <span className={`badge ${t.type === 'Income' ? 'bg-success' : 'bg-danger'}`}>
                        {t.type}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, color: darkText, fontSize: '1.05rem' }}>{t.description}</div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge bg-secondary">{t.category || 'General'}</span>
                      <span className={`badge ${getPaymentMethodLabel(t) === 'Hand Cash' ? 'bg-warning text-dark' : 'bg-info'}`}>
                        {getPaymentMethodLabel(t) || 'Bank Account'}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: t.type === 'Income' ? '#16a34a' : '#dc2626' }}>
                      {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>

                    {/* Invoice Access Badge */}
                    {isEmployee && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          className={`badge ${t.invoiceAccessApproved ? 'bg-success' : t.invoiceAccessRequested ? 'bg-warning text-dark' : 'bg-secondary'}`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {t.invoiceAccessApproved ? 'Access Approved' : t.invoiceAccessRequested ? 'Request Pending' : 'No Access'}
                        </span>
                      </div>
                    )}
                    {isHROrAdmin && (t.invoiceAccessRequested || t.invoiceAccessApproved) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          className={`badge ${t.invoiceAccessApproved ? 'bg-success' : 'bg-warning text-dark'}`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {t.invoiceAccessApproved ? 'Employee Access: Approved' : `Access Requested by ${t.invoiceAccessRequestedBy?.username || 'Employee'}`}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                      {/* Employee: Request Access / Pending / View Invoice */}
                      {isEmployee && !t.invoiceAccessApproved && !t.invoiceAccessRequested && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleRequestTransactionInvoiceAccess(t._id)}
                        >
                          Request Access
                        </button>
                      )}
                      {isEmployee && !t.invoiceAccessApproved && t.invoiceAccessRequested && (
                        <span style={{ fontSize: '0.8rem', color: '#d97706', fontStyle: 'italic', padding: '0.375rem 0' }}>
                          Waiting for HR approval...
                        </span>
                      )}
                      {isEmployee && t.invoiceAccessApproved && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => downloadTransactionInvoice(t)}
                        >
                          View Invoice
                        </button>
                      )}

                      {/* HR/Admin: Generate Invoice + Approve/Revoke */}
                      {!isEmployee && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => downloadTransactionInvoice(t)}
                        >
                          Generate Invoice
                        </button>
                      )}
                      {isHROrAdmin && (t.invoiceAccessRequested || t.invoiceAccessApproved) && (
                        <button
                          type="button"
                          className={`btn btn-sm ${t.invoiceAccessApproved ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleToggleTransactionInvoiceAccess(t._id, t.invoiceAccessApproved)}
                        >
                          {t.invoiceAccessApproved ? 'Revoke Access' : 'Approve Access'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invoice Creation Form */}
      {showForm && !isEmployee && (
        <div style={formStyles.container}>
          <h3 style={{ marginBottom: '1.5rem', color: textColor }}>Create New Invoice</h3>

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
                  <label style={formStyles.label}>Payment Method *</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    style={formStyles.select}
                    required
                  >
                    <option value="">Select Payment Method</option>
                    <option value="Bank Account">Bank Account</option>
                    <option value="Hand Cash">Hand Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                
                {formData.paymentMethod === 'Bank Account' && (
                  <div style={formStyles.inputGroup}>
                    <label style={formStyles.label}>Select Bank Account *</label>
                    <select
                      name="bankAccountId"
                      value={formData.bankAccountId}
                      onChange={handleInputChange}
                      style={formStyles.select}
                      required
                    >
                      <option value="">Choose Bank Account</option>
                      {bankAccounts.map(acc => (
                        <option key={acc._id} value={acc._id}>
                          {acc.accountHolder} - {acc.accountNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {formData.paymentMethod === 'Hand Cash' && (
                  <div style={formStyles.inputGroup}>
                    <label style={formStyles.label}>Select Hand Cash Record *</label>
                    <select
                      name="handCashId"
                      value={formData.handCashId}
                      onChange={handleInputChange}
                      style={formStyles.select}
                      required
                    >
                      <option value="">Choose Hand Cash</option>
                      {handCashRecords.map(hc => (
                        <option key={hc._id} value={hc._id}>
                          {hc.holder} - ₹{hc.amount.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div style={formStyles.inputGroup}>
                  <label style={formStyles.label}>Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    style={formStyles.select}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
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

    </div>
  );
};

export default Invoices;
