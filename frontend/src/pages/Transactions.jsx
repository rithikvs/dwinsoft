
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const initialForm = {
  description: '',
  amount: '',
  type: 'Income',
  category: '',
  date: new Date().toISOString().slice(0, 10),
};

const Transactions = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({ type: '', category: '', startDate: '', endDate: '' });
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canEdit = user && (user.role === 'Admin' || user.role === 'Accountant');
  const canView = user && (user.role === 'Admin' || user.role === 'Accountant' || user.role === 'HR');

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      let url = 'http://localhost:5000/api/transactions';
      if (filter.type || filter.category || filter.startDate || filter.endDate) {
        const params = [];
        if (filter.type) params.push(`type=${filter.type}`);
        if (filter.category) params.push(`category=${filter.category}`);
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

  // Calculate balance
  useEffect(() => {
    let bal = 0;
    transactions.forEach(t => {
      if (t.type === 'Income') bal += t.amount;
      else if (t.type === 'Expense') bal -= t.amount;
    });
    setBalance(bal);
  }, [transactions]);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [filter]);

  // Handle form input
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update transaction
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) {
        await axios.put(`http://localhost:5000/api/transactions/${editingId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/transactions', payload);
      }
      setForm(initialForm);
      setEditingId(null);
      fetchTransactions();
    } catch (err) {
      setError('Failed to save transaction');
    }
  };

  // Edit transaction
  const handleEdit = t => {
    setForm({
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.date ? t.date.slice(0, 10) : '',
    });
    setEditingId(t._id);
  };

  // Delete transaction
  const handleDelete = async id => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  // Filter change
  const handleFilterChange = e => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // Reset form
  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  // Category options (could be dynamic)
  const categories = [
    'Salary', 'Sales', 'Payroll', 'Office', 'Utilities', 'Travel', 'Supplies', 'Other'
  ];

  // GST Configuration
  const GST_RATE = 18; // 18% GST (9% CGST + 9% SGST)
  const CGST_RATE = GST_RATE / 2;
  const SGST_RATE = GST_RATE / 2;

  // Company Details (can be configured)
  const companyDetails = {
    name: 'DWINSOFT Technologies Pvt. Ltd.',
    address: '123 Business Park, Tech Hub, Bangalore - 560001',
    phone: '+91 80 1234 5678',
    email: 'accounts@dwinsoft.com',
    gstNumber: '29AABCU9603R1ZM',
    website: 'www.dwinsoft.com'
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Generate Invoice Number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV/${year}${month}/${random}`;
  };

  // Convert number to words for amount
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

  // Download Invoice for a single transaction
  const downloadInvoice = (transaction) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const invoiceNumber = generateInvoiceNumber();
    const invoiceDate = formatDate(new Date());
    const transactionDate = formatDate(transaction.date || new Date());
    
    // Calculate GST values
    const baseAmount = transaction.amount / (1 + GST_RATE / 100);
    const cgstAmount = baseAmount * (CGST_RATE / 100);
    const sgstAmount = baseAmount * (SGST_RATE / 100);
    const totalGST = cgstAmount + sgstAmount;
    
    // Header - Company Logo Area
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Company Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(companyDetails.name, 15, 20);
    
    // Company tagline
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Excellence in Technology Solutions', 15, 28);
    
    // Invoice Title on right
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 15, 25, { align: 'right' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Invoice Details Box
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Number:', 15, 52);
    doc.text('Invoice Date:', 15, 60);
    doc.text('Transaction Date:', 15, 68);
    doc.text('Transaction Type:', 15, 76);
    
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceNumber, 60, 52);
    doc.text(invoiceDate, 60, 60);
    doc.text(transactionDate, 60, 68);
    doc.text(transaction.type || 'N/A', 60, 76);
    
    // Company Details Box (Right side)
    doc.setFont('helvetica', 'bold');
    doc.text('From:', pageWidth - 80, 52);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(companyDetails.name, pageWidth - 80, 60);
    doc.text(companyDetails.address, pageWidth - 80, 67, { maxWidth: 70 });
    doc.text(`GST: ${companyDetails.gstNumber}`, pageWidth - 80, 81);
    doc.text(`Phone: ${companyDetails.phone}`, pageWidth - 80, 88);
    
    // Divider Line
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(15, 95, pageWidth - 15, 95);
    
    // Transaction Details Table
    doc.autoTable({
      startY: 105,
      head: [['S.No', 'Description', 'Category', 'HSN/SAC', 'Quantity', 'Rate', 'Amount']],
      body: [
        [
          '1',
          transaction.description || 'Transaction',
          transaction.category || 'General',
          '998311', // Default SAC code for business services
          '1',
          formatCurrency(baseAmount),
          formatCurrency(baseAmount)
        ]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 25, halign: 'right' }
      }
    });
    
    // GST Summary Table
    const summaryY = doc.lastAutoTable.finalY + 10;
    
    doc.autoTable({
      startY: summaryY,
      body: [
        ['Subtotal (Before GST)', '', '', '', '', '', formatCurrency(baseAmount)],
        [`CGST @ ${CGST_RATE}%`, '', '', '', '', '', formatCurrency(cgstAmount)],
        [`SGST @ ${SGST_RATE}%`, '', '', '', '', '', formatCurrency(sgstAmount)],
        ['Total GST', '', '', '', '', '', formatCurrency(totalGST)],
        [{ content: 'Grand Total', styles: { fontStyle: 'bold', fontSize: 11 } }, '', '', '', '', '', { content: formatCurrency(transaction.amount), styles: { fontStyle: 'bold', fontSize: 11 } }]
      ],
      theme: 'plain',
      columnStyles: {
        0: { cellWidth: 120 },
        6: { cellWidth: 40, halign: 'right' }
      },
      styles: {
        fontSize: 9
      }
    });
    
    // Amount in Words
    const wordsY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount in Words:', 15, wordsY);
    doc.setFont('helvetica', 'italic');
    doc.text(numberToWords(transaction.amount), 15, wordsY + 7, { maxWidth: pageWidth - 30 });
    
    // Bank Details Section
    const bankY = wordsY + 20;
    doc.setFillColor(245, 245, 245);
    doc.rect(15, bankY, pageWidth - 30, 30, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Bank Details for Payment:', 20, bankY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Bank Name: State Bank of India', 20, bankY + 16);
    doc.text('Account No: 1234567890123', 20, bankY + 23);
    doc.text('IFSC Code: SBIN0001234', 100, bankY + 16);
    doc.text('Branch: Tech Park Branch', 100, bankY + 23);
    
    // Terms and Conditions
    const termsY = bankY + 40;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Terms & Conditions:', 15, termsY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const terms = [
      '1. This is a computer-generated invoice and does not require a physical signature.',
      '2. Payment is due within 30 days from the invoice date.',
      '3. All disputes are subject to Bangalore jurisdiction.',
      '4. GST is charged as per applicable rates under GST Act, 2017.',
      '5. E&OE - Errors and Omissions Excepted.'
    ];
    terms.forEach((term, index) => {
      doc.text(term, 15, termsY + 7 + (index * 5));
    });
    
    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 25;
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`${companyDetails.email} | ${companyDetails.website} | ${companyDetails.phone}`, pageWidth / 2, footerY + 6, { align: 'center' });
    
    // Authorized Signatory
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text('For ' + companyDetails.name, pageWidth - 60, footerY - 15);
    doc.text('Authorized Signatory', pageWidth - 60, footerY - 8);
    
    // Save the PDF
    const fileName = `Invoice_${invoiceNumber.replace(/\//g, '-')}_${transaction.description?.replace(/[^a-zA-Z0-9]/g, '_') || 'Transaction'}.pdf`;
    doc.save(fileName);
  };

  // Download All Transactions as a consolidated invoice/report
  const downloadAllTransactionsInvoice = () => {
    if (transactions.length === 0) {
      alert('No transactions to download!');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const invoiceNumber = generateInvoiceNumber();
    const invoiceDate = formatDate(new Date());
    
    // Calculate totals
    const incomeTransactions = transactions.filter(t => t.type === 'Income');
    const expenseTransactions = transactions.filter(t => t.type === 'Expense');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalIncome - totalExpense;
    
    // GST Calculations for total income
    const baseAmount = totalIncome / (1 + GST_RATE / 100);
    const cgstAmount = baseAmount * (CGST_RATE / 100);
    const sgstAmount = baseAmount * (SGST_RATE / 100);
    const totalGST = cgstAmount + sgstAmount;
    
    // Header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(companyDetails.name, 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Excellence in Technology Solutions', 15, 28);
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSACTION STATEMENT', pageWidth - 15, 25, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    
    // Document Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Statement Number:', 15, 52);
    doc.text('Generated On:', 15, 60);
    doc.text('Total Transactions:', 15, 68);
    doc.text('Period:', 15, 76);
    
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceNumber, 60, 52);
    doc.text(invoiceDate, 60, 60);
    doc.text(transactions.length.toString(), 60, 68);
    
    // Calculate date range
    const dates = transactions.map(t => new Date(t.date)).filter(d => !isNaN(d));
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      doc.text(`${formatDate(minDate)} to ${formatDate(maxDate)}`, 60, 76);
    } else {
      doc.text('All Time', 60, 76);
    }
    
    // Company Details
    doc.setFont('helvetica', 'bold');
    doc.text('Issued By:', pageWidth - 80, 52);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(companyDetails.name, pageWidth - 80, 60);
    doc.text(companyDetails.address, pageWidth - 80, 67, { maxWidth: 70 });
    doc.text(`GST: ${companyDetails.gstNumber}`, pageWidth - 80, 81);
    
    // Divider
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(15, 88, pageWidth - 15, 88);
    
    // Summary Cards
    doc.setFillColor(39, 174, 96);
    doc.rect(15, 95, 55, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Total Income', 20, 103);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(totalIncome), 20, 113);
    
    doc.setFillColor(231, 76, 60);
    doc.rect(77, 95, 55, 25, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Expense', 82, 103);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(totalExpense), 82, 113);
    
    doc.setFillColor(41, 128, 185);
    doc.rect(139, 95, 55, 25, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Net Balance', 144, 103);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(netAmount), 144, 113);
    
    doc.setTextColor(0, 0, 0);
    
    // Transactions Table
    const tableData = transactions.map((t, index) => [
      (index + 1).toString(),
      t.date ? formatDate(t.date) : 'N/A',
      t.description || 'N/A',
      t.category || 'General',
      t.type || 'N/A',
      t.type === 'Income' ? formatCurrency(t.amount) : '-',
      t.type === 'Expense' ? formatCurrency(t.amount) : '-'
    ]);
    
    doc.autoTable({
      startY: 130,
      head: [['#', 'Date', 'Description', 'Category', 'Type', 'Income', 'Expense']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 28 },
        2: { cellWidth: 45 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 28, halign: 'right' },
        6: { cellWidth: 28, halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // GST Summary (for Income)
    let currentY = doc.lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('GST Summary (on Income Transactions)', 15, currentY);
    
    doc.autoTable({
      startY: currentY + 5,
      body: [
        ['Total Income (Inclusive of GST)', formatCurrency(totalIncome)],
        ['Base Amount (Before GST)', formatCurrency(baseAmount)],
        [`CGST @ ${CGST_RATE}%`, formatCurrency(cgstAmount)],
        [`SGST @ ${SGST_RATE}%`, formatCurrency(sgstAmount)],
        ['Total GST Collected', formatCurrency(totalGST)]
      ],
      theme: 'grid',
      columnStyles: {
        0: { cellWidth: 100, fontStyle: 'bold' },
        1: { cellWidth: 50, halign: 'right' }
      },
      styles: {
        fontSize: 9
      }
    });
    
    // Amount in Words
    currentY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Net Amount in Words:', 15, currentY);
    doc.setFont('helvetica', 'italic');
    doc.text(numberToWords(Math.abs(netAmount)), 15, currentY + 7, { maxWidth: pageWidth - 30 });
    
    // Declaration
    currentY += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Declaration:', 15, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('We hereby certify that the above particulars are true and correct. This statement is generated for the transactions', 15, currentY + 7);
    doc.text('recorded in our system. All amounts are in Indian Rupees (INR) and GST has been calculated as per applicable rates.', 15, currentY + 12);
    
    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(41, 128, 185);
    doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer-generated document and does not require a signature.', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`${companyDetails.email} | ${companyDetails.website}`, pageWidth / 2, footerY + 5, { align: 'center' });
    
    // Authorized Signatory
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text('For ' + companyDetails.name, pageWidth - 60, footerY - 15);
    doc.text('Authorized Signatory', pageWidth - 60, footerY - 8);
    
    // Save
    doc.save(`Transaction_Statement_${invoiceNumber.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div>
      <h2>Transactions</h2>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span className="fw-bold">Current Balance: </span>
          <span className={balance >= 0 ? 'text-success' : 'text-danger'}>
            ₹{balance.toLocaleString()}
          </span>
        </div>
        {canView && transactions.length > 0 && (
          <button 
            className="btn btn-outline-success" 
            onClick={downloadAllTransactionsInvoice}
            title="Download complete statement with GST details"
          >
            <i className="bi bi-download me-2"></i>
            Download All Invoices (PDF)
          </button>
        )}
      </div>

      {/* Filter/Search - visible to all who canView */}
      {canView && (
        <form className="row g-2 mb-4" onSubmit={e => { e.preventDefault(); fetchTransactions(); }}>
          <div className="col-md-2">
            <select className="form-select" name="type" value={filter.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" name="category" value={filter.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <input type="date" className="form-control" name="startDate" value={filter.startDate} onChange={handleFilterChange} />
          </div>
          <div className="col-md-2">
            <input type="date" className="form-control" name="endDate" value={filter.endDate} onChange={handleFilterChange} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-primary w-100" type="submit">Filter</button>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" type="button" onClick={() => setFilter({ type: '', category: '', startDate: '', endDate: '' })}>Reset</button>
          </div>
        </form>
      )}

      {/* Add/Edit Form (Admin/Accountant only) */}
      {canEdit && (
        <div className="card mb-4 p-3">
          <h5>{editingId ? 'Edit Transaction' : 'Add Transaction'}</h5>
          <form className="row g-2" onSubmit={handleSubmit}>
            <div className="col-md-3">
              <input type="text" className="form-control" name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <input type="number" className="form-control" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required min="0" />
            </div>
            <div className="col-md-2">
              <select className="form-select" name="type" value={form.type} onChange={handleChange} required>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <input type="date" className="form-control" name="date" value={form.date} onChange={handleChange} required />
            </div>
            <div className="col-md-1 d-flex gap-1">
              <button className="btn btn-success" type="submit">{editingId ? 'Update' : 'Add'}</button>
              {editingId && <button className="btn btn-secondary" type="button" onClick={handleCancel}>Cancel</button>}
            </div>
          </form>
        </div>
      )}

      {/* Transactions Table - visible to all who canView */}
      {canView && (
        <div className="card p-3">
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Invoice</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={canEdit ? 7 : 6} className="text-center">Loading...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={canEdit ? 7 : 6} className="text-center text-muted">No transactions found</td></tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t._id}>
                      <td>{t.date ? t.date.slice(0, 10) : ''}</td>
                      <td>{t.description}</td>
                      <td>{t.type}</td>
                      <td>{t.category}</td>
                      <td className={t.type === 'Income' ? 'text-success' : 'text-danger'}>
                        {t.type === 'Income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          onClick={() => downloadInvoice(t)}
                          title="Download Invoice with GST"
                        >
                          📄 Invoice
                        </button>
                      </td>
                      {canEdit && (
                        <td>
                          <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(t)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t._id)}>Delete</button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  );
};

export default Transactions;

