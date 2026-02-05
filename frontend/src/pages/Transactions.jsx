
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
  const canView = !!user;

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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      date: t.date ? t.date.slice(0, 10) : '',
    });
    setEditingId(t._id);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`);
      fetchTransactions();
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

  // Download Invoice for a single transaction (Professional Template)
  const downloadInvoice = (transaction) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      const invoiceNumber = generateInvoiceNumber();
      const invoiceDate = formatDate(new Date());
      const transactionDate = formatDate(transaction.date || new Date());

      // Helper to format currency for PDF (avoids encoding issues with ₹ symbol)
      const formatCurrencyPDF = (amount) => {
        return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      // Brand Colors (Professional Slate/Navy)
      const primaryColor = [44, 62, 80]; // Navy Blue
      const secondaryColor = [149, 165, 166]; // Gray
      const accentColor = [52, 152, 219]; // Light Blue

      // --- HEADER SECTION ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(...primaryColor);
      doc.text(companyDetails.name.split(' ')[0], margin, 25);

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
      doc.text(`Email: ${companyDetails.email} | Web: ${companyDetails.website}`, margin, 55);

      // --- DIVIDER ---
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(margin, 60, pageWidth - margin, 60);

      // --- BILLING DETAILS ---
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

      // --- ITEM TABLE ---
      // Calculate GST values (Forward Calculation: Base + GST)
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
          0: { cellWidth: 10, halign: 'center' }, // #
          1: { cellWidth: 'auto' },                // Description (auto expands)
          2: { cellWidth: 20, halign: 'center' }, // HSN
          3: { cellWidth: 15, halign: 'center' }, // Qty
          4: { cellWidth: 40, halign: 'right' },  // Rate
          5: { cellWidth: 45, halign: 'right' }   // Total
        },
        margin: { left: margin, right: margin }
      });

      // --- SUMMARY & TOTALS ---
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

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...primaryColor);
      doc.text('Bank Information:', leftColX, summaryY + 35);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(`Bank: State Bank of India`, leftColX, summaryY + 41);
      doc.text(`A/c No: 1234567890123`, leftColX, summaryY + 46);
      doc.text(`IFSC: SBIN0001234`, leftColX, summaryY + 51);

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

      // Save PDF
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      try {
        window.open(url, '_blank');
      } catch (e) {
        // ignore popup blockers
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error('Invoice generation failed', err);
      setError('Invoice generation failed: ' + (err?.message || err));
    }
  };

  const downloadAllTransactionsInvoice = () => {
    if (transactions.length === 0) {
      alert('No transactions to download!');
      return;
    }
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const invoiceNumber = generateInvoiceNumber();
      const invoiceDate = formatDate(new Date());

      const incomeTransactions = transactions.filter(t => t.type === 'Income');
      const expenseTransactions = transactions.filter(t => t.type === 'Expense');
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      const netAmount = totalIncome - totalExpense;

      const baseAmount = totalIncome / (1 + GST_RATE / 100);
      const cgstAmount = baseAmount * (CGST_RATE / 100);
      const sgstAmount = baseAmount * (SGST_RATE / 100);
      const totalGST = cgstAmount + sgstAmount;

      doc.setFillColor(44, 62, 80);
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(companyDetails.name.split(' ')[0], 15, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('T E C H N O L O G I E S', 15, 28);

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('TRANSACTION STATEMENT', pageWidth - 15, 25, { align: 'right' });

      doc.setTextColor(0, 0, 0);

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

      const dates = transactions.map(t => new Date(t.date)).filter(d => !isNaN(d));
      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        doc.text(`${formatDate(minDate)} to ${formatDate(maxDate)}`, 60, 76);
      } else {
        doc.text('All Time', 60, 76);
      }

      doc.setFont('helvetica', 'bold');
      doc.text('Issued By:', pageWidth - 80, 52);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(companyDetails.name, pageWidth - 80, 60);
      doc.text(companyDetails.address, pageWidth - 80, 67, { maxWidth: 70 });
      doc.text(`GST: ${companyDetails.gstNumber}`, pageWidth - 80, 81);

      doc.setDrawColor(44, 62, 80);
      doc.setLineWidth(0.5);
      doc.line(15, 88, pageWidth - 15, 88);

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

      doc.setFillColor(44, 62, 80);
      doc.rect(139, 95, 55, 25, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Net Balance', 144, 103);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(netAmount), 144, 113);

      doc.setTextColor(0, 0, 0);

      const tableData = transactions.map((t, index) => [
        (index + 1).toString(),
        t.date ? formatDate(t.date) : 'N/A',
        t.description || 'N/A',
        t.category || 'General',
        t.type || 'N/A',
        t.type === 'Income' ? formatCurrency(t.amount) : '-',
        t.type === 'Expense' ? formatCurrency(t.amount) : '-'
      ]);

      autoTable(doc, {
        startY: 130,
        head: [['#', 'Date', 'Description', 'Category', 'Type', 'Income', 'Expense']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [44, 62, 80],
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

      let currentY = doc.lastAutoTable.finalY + 15;
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('GST Summary (on Income Transactions)', 15, currentY);

      autoTable(doc, {
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

      currentY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Net Amount in Words:', 15, currentY);
      doc.setFont('helvetica', 'italic');
      doc.text(numberToWords(Math.abs(netAmount)), 15, currentY + 7, { maxWidth: pageWidth - 30 });

      currentY += 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Declaration:', 15, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('We hereby certify that the above particulars are true and correct. This statement is generated for the transactions', 15, currentY + 7);
      doc.text('recorded in our system. All amounts are in Indian Rupees (INR) and GST has been calculated as per applicable rates.', 15, currentY + 12);

      const footerY = doc.internal.pageSize.getHeight() - 20;
      doc.setDrawColor(44, 62, 80);
      doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('This is a computer-generated document and does not require a signature.', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`${companyDetails.email} | ${companyDetails.website}`, pageWidth / 2, footerY + 5, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text('For ' + companyDetails.name, pageWidth - 60, footerY - 15);
      doc.text('Authorized Signatory', pageWidth - 60, footerY - 8);

      const statementFile = `Transaction_Statement_${invoiceNumber.replace(/\//g, '-')}.pdf`;
      const statementBlob = doc.output('blob');
      const statementUrl = URL.createObjectURL(statementBlob);
      try {
        window.open(statementUrl, '_blank');
      } catch (e) {
      }
      setTimeout(() => URL.revokeObjectURL(statementUrl), 10000);
    } catch (err) {
      console.error('Transaction statement generation failed', err);
      setError('Statement generation failed: ' + (err?.message || err));
    }
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
        {transactions.length > 0 && (
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
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  );
};

export default Transactions;
