
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FiPlus, FiEdit2, FiTrash2, FiDownload, FiFilter, FiX,
  FiArrowUpRight, FiArrowDownLeft, FiDollarSign, FiTrendingUp,
  FiTrendingDown, FiCreditCard, FiCalendar, FiSearch, FiRefreshCw,
  FiFileText, FiChevronDown, FiChevronUp, FiActivity, FiLayers
} from 'react-icons/fi';

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

const initialHandCashForm = {
  holder: '',
  amount: '',
  description: '',
};

const initialBankAccountForm = {
  accountNumber: '',
  accountHolder: '',
  bankName: '',
  branch: '',
  balance: '',
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
  
  // Form toggle states
  const [showHandCashForm, setShowHandCashForm] = useState(false);
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [handCashForm, setHandCashForm] = useState(initialHandCashForm);
  const [bankAccountForm, setBankAccountForm] = useState(initialBankAccountForm);
  const [formLoading, setFormLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const canEdit = user && (user.role === 'Admin' || user.role === 'Accountant');
  const canView = !!user;

  // Fetch bank accounts and hand cash
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

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_BASE_URL}/api/transactions`;
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

  // Handle Hand Cash Form Submission
  const handleHandCashSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/hand-cash`, {
        holder: handCashForm.holder,
        amount: Number(handCashForm.amount),
        description: handCashForm.description
      });
      setSuccess('Hand Cash record created successfully!');
      setHandCashForm(initialHandCashForm);
      setShowHandCashForm(false);
      fetchPaymentMethods();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create hand cash record');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Bank Account Form Submission
  const handleBankAccountSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/bank-accounts`, {
        accountNumber: bankAccountForm.accountNumber,
        accountHolder: bankAccountForm.accountHolder,
        bankName: bankAccountForm.bankName,
        branch: bankAccountForm.branch,
        balance: Number(bankAccountForm.balance)
      });
      setSuccess('Bank Account created successfully!');
      setBankAccountForm(initialBankAccountForm);
      setShowBankAccountForm(false);
      fetchPaymentMethods();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create bank account');
    } finally {
      setFormLoading(false);
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

  const handleFilterChange = e => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = { 
        ...form, 
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod
      };
      
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/transactions/${editingId}`, payload);
        setSuccess('Transaction updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/transactions`, payload);
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
      await axios.delete(`${API_BASE_URL}/api/transactions/${id}`);
      setSuccess('Transaction deleted successfully');
      fetchTransactions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
    setSuccess('');
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

  const getPaymentMethodLabel = (transaction) => {
    if (transaction?.paymentMethod) return transaction.paymentMethod;
    if (transaction?.bankAccountId) return 'Bank Account';
    if (transaction?.handCashId) return 'Hand Cash';
    return '';
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

  // Computed stats for summary cards
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);

  // Reusable style objects
  const thStyle = { color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.85rem 1.15rem', border: 'none', whiteSpace: 'nowrap' };
  const tdStyle = { padding: '0.85rem 1.15rem', color: '#475569', border: 'none', verticalAlign: 'middle' };
  const modalInputStyle = { borderRadius: '0.65rem', border: '2px solid #e2e8f0', padding: '0.6rem 0.85rem', fontSize: '0.9rem', transition: 'all .2s ease', outline: 'none', background: '#f8fafc' };
  const filterInputStyle = { borderRadius: '0.5rem', border: '2px solid #e2e8f0', fontSize: '0.85rem', background: '#f8fafc' };
  const actionBtnStyle = { background: 'transparent', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s ease', cursor: 'pointer' };

  return (
    <div className="transactions-page" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 50%, #e2e8f0 100%)' }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2563eb 100%)',
        padding: '2.5rem 2.5rem 5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(2px)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: '30%', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: 20, left: '60%', width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)' }} />

        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3" style={{ position: 'relative', zIndex: 2 }}>
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <div style={{
                background: 'rgba(99,102,241,0.3)',
                borderRadius: '0.6rem',
                padding: '0.4rem',
                display: 'inline-flex',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <FiActivity size={20} style={{ color: '#a5b4fc' }} />
              </div>
              <span style={{ color: 'rgba(165,180,252,0.9)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Financial Hub</span>
            </div>
            <h2 className="mb-1" style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Transactions
            </h2>
            <p className="mb-0" style={{ color: 'rgba(203,213,225,0.8)', fontSize: '0.92rem', fontWeight: 400 }}>
              Real-time overview of all your financial movements
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap align-items-center" style={{ marginTop: '0.5rem' }}>
            {canEdit && transactions.length > 0 && (
              <button
                className="txn-btn-glass"
                onClick={downloadAllTransactionsInvoice}
                title="Download complete statement with GST details"
              >
                <FiDownload size={15} style={{ marginRight: 7 }} />
                Export PDF
              </button>
            )}
            {canEdit && (
              <button
                className="txn-btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <FiPlus size={16} style={{ marginRight: 6 }} />
                New Transaction
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-fluid px-3 px-md-4" style={{ position: 'relative', zIndex: 1, marginTop: '-3.5rem' }}>

        {/* ── Alerts ── */}
        {error && (
          <div className="d-flex align-items-center gap-2 mb-3" style={{
            background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
            borderRadius: '0.85rem',
            padding: '0.85rem 1.15rem',
            border: '1px solid #fecdd3',
            boxShadow: '0 4px 12px rgba(239,68,68,0.1)',
            animation: 'slideDown .3s ease'
          }}>
            <div style={{ background: '#fee2e2', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.85rem' }}>⚠️</span>
            </div>
            <span style={{ color: '#991b1b', fontWeight: 500, fontSize: '0.88rem', flex: 1 }}>{error}</span>
            <button className="btn btn-sm p-0" onClick={() => setError('')} style={{ color: '#f87171', background: 'none', border: 'none' }}><FiX size={18} /></button>
          </div>
        )}
        {success && (
          <div className="d-flex align-items-center gap-2 mb-3" style={{
            background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
            borderRadius: '0.85rem',
            padding: '0.85rem 1.15rem',
            border: '1px solid #bbf7d0',
            boxShadow: '0 4px 12px rgba(34,197,94,0.1)',
            animation: 'slideDown .3s ease'
          }}>
            <div style={{ background: '#dcfce7', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.85rem' }}>✅</span>
            </div>
            <span style={{ color: '#166534', fontWeight: 500, fontSize: '0.88rem', flex: 1 }}>{success}</span>
            <button className="btn btn-sm p-0" onClick={() => setSuccess('')} style={{ color: '#4ade80', background: 'none', border: 'none' }}><FiX size={18} /></button>
          </div>
        )}

        {/* ── SUMMARY CARDS ── */}
        <div className="row g-3 mb-4">
          {[
            {
              label: 'Total Income',
              value: totalIncome,
              gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              iconBg: 'rgba(255,255,255,0.2)',
              icon: <FiTrendingUp size={20} />,
              shadow: '0 8px 32px rgba(16,185,129,0.3)'
            },
            {
              label: 'Total Expenses',
              value: totalExpense,
              gradient: 'linear-gradient(135deg, #dc2626 0%, #f43f5e 100%)',
              iconBg: 'rgba(255,255,255,0.2)',
              icon: <FiTrendingDown size={20} />,
              shadow: '0 8px 32px rgba(244,63,94,0.3)'
            },
            {
              label: 'Net Balance',
              value: balance,
              gradient: balance >= 0
                ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
                : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              iconBg: 'rgba(255,255,255,0.2)',
              icon: <FiDollarSign size={20} />,
              shadow: balance >= 0 ? '0 8px 32px rgba(59,130,246,0.3)' : '0 8px 32px rgba(239,68,68,0.3)'
            },
            {
              label: 'Transactions',
              value: transactions.length,
              gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
              iconBg: 'rgba(255,255,255,0.2)',
              icon: <FiLayers size={20} />,
              shadow: '0 8px 32px rgba(139,92,246,0.3)',
              isCurrency: false
            }
          ].map((card, i) => (
            <div className="col-6 col-lg-3" key={i}>
              <div className="txn-summary-card" style={{
                background: card.gradient,
                borderRadius: '1.1rem',
                padding: '1.4rem 1.3rem',
                height: '100%',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: card.shadow,
                cursor: 'default'
              }}>
                {/* Decorative circle */}
                <div style={{ position: 'absolute', top: -15, right: -15, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -20, right: 30, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    background: card.iconBg,
                    borderRadius: '0.65rem',
                    padding: '0.5rem',
                    display: 'inline-flex',
                    marginBottom: '0.85rem',
                    backdropFilter: 'blur(8px)'
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, marginBottom: '0.25rem' }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                    {card.isCurrency === false ? card.value : `₹${card.value.toLocaleString()}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTERS CARD ── */}
        {canView && (
          <div className="txn-card" style={{ marginBottom: '1rem' }}>
            <button
              className="btn w-100 d-flex justify-content-between align-items-center"
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '0.9rem 1.4rem',
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                color: '#334155',
                fontSize: '0.9rem'
              }}
            >
              <span className="d-flex align-items-center gap-2">
                <span style={{ background: '#eef2ff', borderRadius: '0.45rem', padding: '0.3rem', display: 'inline-flex' }}>
                  <FiFilter size={15} style={{ color: '#6366f1' }} />
                </span>
                Filters & Search
                {(filter.type || filter.category || filter.startDate || filter.endDate) && (
                  <span style={{ background: '#6366f1', color: '#fff', borderRadius: '999px', fontSize: '0.65rem', padding: '0.1rem 0.45rem', fontWeight: 700 }}>Active</span>
                )}
              </span>
              <span style={{ background: '#f1f5f9', borderRadius: '0.4rem', padding: '0.25rem', display: 'inline-flex' }}>
                {showFilters ? <FiChevronUp size={16} style={{ color: '#64748b' }} /> : <FiChevronDown size={16} style={{ color: '#64748b' }} />}
              </span>
            </button>
            <div style={{
              maxHeight: showFilters ? 200 : 0,
              overflow: 'hidden',
              transition: 'max-height .3s ease, padding .3s ease',
              padding: showFilters ? '0 1.4rem 1.2rem' : '0 1.4rem'
            }}>
              <form className="row g-2" onSubmit={e => { e.preventDefault(); fetchTransactions(); }}>
                <div className="col-md-2">
                  <label className="form-label mb-1" style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
                  <select className="form-select form-select-sm" style={filterInputStyle} name="type" value={filter.type} onChange={handleFilterChange}>
                    <option value="">All Types</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label mb-1" style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                  <select className="form-select form-select-sm" style={filterInputStyle} name="category" value={filter.category} onChange={handleFilterChange}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label mb-1" style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</label>
                  <input type="date" className="form-control form-control-sm" style={filterInputStyle} name="startDate" value={filter.startDate} onChange={handleFilterChange} />
                </div>
                <div className="col-md-2">
                  <label className="form-label mb-1" style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>To</label>
                  <input type="date" className="form-control form-control-sm" style={filterInputStyle} name="endDate" value={filter.endDate} onChange={handleFilterChange} />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button className="btn btn-sm w-100" type="submit"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', borderRadius: '0.55rem', fontWeight: 600, border: 'none', padding: '0.45rem', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
                    <FiSearch size={13} style={{ marginRight: 4 }} /> Apply
                  </button>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button className="btn btn-sm w-100" type="button"
                    style={{ background: '#f1f5f9', color: '#64748b', borderRadius: '0.55rem', border: '1.5px solid #e2e8f0', fontWeight: 500, padding: '0.45rem' }}
                    onClick={() => setFilter({ type: '', category: '', startDate: '', endDate: '', paymentMethod: '' })}>
                    <FiRefreshCw size={13} style={{ marginRight: 4 }} /> Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── QUICK ADD PAYMENT METHODS ── */}
        {canEdit && (
          <div className="txn-card" style={{ padding: '1.3rem 1.4rem', marginBottom: '1rem' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>
                <span style={{ background: '#fef3c7', borderRadius: '0.45rem', padding: '0.3rem', display: 'inline-flex' }}>
                  <FiCreditCard size={15} style={{ color: '#d97706' }} />
                </span>
                Payment Methods
              </h6>
              <div className="d-flex gap-2">
                <button type="button" className="txn-pill-btn" onClick={() => setShowHandCashForm(!showHandCashForm)}
                  style={{
                    background: showHandCashForm ? 'linear-gradient(135deg, #0284c7, #0ea5e9)' : '#f0f9ff',
                    color: showHandCashForm ? '#fff' : '#0284c7',
                    border: showHandCashForm ? 'none' : '1.5px solid #bae6fd',
                    boxShadow: showHandCashForm ? '0 2px 8px rgba(14,165,233,0.3)' : 'none'
                  }}>
                  {showHandCashForm ? <FiX size={13} /> : <FiPlus size={13} />}
                  <span style={{ marginLeft: 4 }}>{showHandCashForm ? 'Close' : 'Hand Cash'}</span>
                </button>
                <button type="button" className="txn-pill-btn" onClick={() => setShowBankAccountForm(!showBankAccountForm)}
                  style={{
                    background: showBankAccountForm ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : '#faf5ff',
                    color: showBankAccountForm ? '#fff' : '#7c3aed',
                    border: showBankAccountForm ? 'none' : '1.5px solid #ddd6fe',
                    boxShadow: showBankAccountForm ? '0 2px 8px rgba(139,92,246,0.3)' : 'none'
                  }}>
                  {showBankAccountForm ? <FiX size={13} /> : <FiPlus size={13} />}
                  <span style={{ marginLeft: 4 }}>{showBankAccountForm ? 'Close' : 'Bank Account'}</span>
                </button>
              </div>
            </div>

            {showHandCashForm && (
              <div style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', borderRadius: '0.85rem', padding: '1.15rem', marginTop: '0.85rem', border: '1.5px solid #bae6fd', animation: 'slideDown .25s ease' }}>
                <h6 style={{ color: '#0369a1', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9', display: 'inline-block' }} />
                  New Hand Cash Record
                </h6>
                <form onSubmit={handleHandCashSubmit} className="row g-2">
                  <div className="col-md-4">
                    <input type="text" className="form-control form-control-sm" style={modalInputStyle} placeholder="Holder Name"
                      value={handCashForm.holder} onChange={(e) => setHandCashForm({ ...handCashForm, holder: e.target.value })} required />
                  </div>
                  <div className="col-md-3">
                    <input type="number" className="form-control form-control-sm" style={modalInputStyle} placeholder="₹ Amount"
                      value={handCashForm.amount} onChange={(e) => setHandCashForm({ ...handCashForm, amount: e.target.value })} required min="0" step="0.01" />
                  </div>
                  <div className="col-md-3">
                    <input type="text" className="form-control form-control-sm" style={modalInputStyle} placeholder="Description"
                      value={handCashForm.description} onChange={(e) => setHandCashForm({ ...handCashForm, description: e.target.value })} />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button type="submit" className="btn btn-sm w-100" disabled={formLoading}
                      style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', color: '#fff', borderRadius: '0.55rem', fontWeight: 600, border: 'none', boxShadow: '0 2px 8px rgba(14,165,233,0.25)' }}>
                      {formLoading ? '...' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {showBankAccountForm && (
              <div style={{ background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', borderRadius: '0.85rem', padding: '1.15rem', marginTop: '0.85rem', border: '1.5px solid #ddd6fe', animation: 'slideDown .25s ease' }}>
                <h6 style={{ color: '#6d28d9', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
                  New Bank Account
                </h6>
                <form onSubmit={handleBankAccountSubmit} className="row g-2">
                  <div className="col-md-3">
                    <input type="text" className="form-control form-control-sm" style={modalInputStyle} placeholder="Account Number"
                      value={bankAccountForm.accountNumber} onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountNumber: e.target.value })} required />
                  </div>
                  <div className="col-md-2">
                    <input type="text" className="form-control form-control-sm" style={modalInputStyle} placeholder="Holder"
                      value={bankAccountForm.accountHolder} onChange={(e) => setBankAccountForm({ ...bankAccountForm, accountHolder: e.target.value })} required />
                  </div>
                  <div className="col-md-2">
                    <input type="text" className="form-control form-control-sm" style={modalInputStyle} placeholder="Bank Name"
                      value={bankAccountForm.bankName} onChange={(e) => setBankAccountForm({ ...bankAccountForm, bankName: e.target.value })} required />
                  </div>
                  <div className="col-md-2">
                    <input type="text" className="form-control form-control-sm" style={modalInputStyle} placeholder="Branch"
                      value={bankAccountForm.branch} onChange={(e) => setBankAccountForm({ ...bankAccountForm, branch: e.target.value })} required />
                  </div>
                  <div className="col-md-1">
                    <input type="number" className="form-control form-control-sm" style={modalInputStyle} placeholder="₹"
                      value={bankAccountForm.balance} onChange={(e) => setBankAccountForm({ ...bankAccountForm, balance: e.target.value })} required min="0" step="0.01" />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button type="submit" className="btn btn-sm w-100" disabled={formLoading}
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: '#fff', borderRadius: '0.55rem', fontWeight: 600, border: 'none', boxShadow: '0 2px 8px rgba(139,92,246,0.25)' }}>
                      {formLoading ? '...' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ── TRANSACTIONS TABLE ── */}
        <div className="txn-card" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '1.15rem 1.4rem', borderBottom: '1px solid #f1f5f9' }} className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>
              <span style={{ background: '#f1f5f9', borderRadius: '0.45rem', padding: '0.3rem', display: 'inline-flex' }}>
                <FiLayers size={15} style={{ color: '#475569' }} />
              </span>
              All Transactions
              <span style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontSize: '0.68rem',
                padding: '0.15rem 0.6rem',
                borderRadius: '999px',
                fontWeight: 700,
                letterSpacing: '0.02em'
              }}>
                {transactions.length}
              </span>
            </h6>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#fafbfc' }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Category</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                  <th style={thStyle}>Payment</th>
                  {canEdit && <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={canEdit ? 7 : 6} className="text-center" style={{ padding: '4rem 0' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div className="txn-spinner" />
                        <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.88rem' }}>Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 7 : 6} className="text-center" style={{ padding: '4rem 0' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                          borderRadius: '1rem',
                          padding: '1.2rem',
                          marginBottom: 4
                        }}>
                          <FiFileText size={32} style={{ color: '#94a3b8' }} />
                        </div>
                        <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem' }}>No transactions yet</div>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: 280 }}>Start tracking your finances by adding your first transaction</div>
                        {canEdit && (
                          <button className="btn btn-sm mt-2" onClick={() => setShowAddModal(true)}
                            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', borderRadius: '0.55rem', fontWeight: 600, padding: '0.4rem 1rem', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
                            <FiPlus size={14} style={{ marginRight: 4 }} /> Add Transaction
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t, idx) => (
                    <tr key={t._id} className="txn-table-row" style={{ animation: `fadeInRow .3s ease ${idx * 0.02}s both` }}>
                      <td style={tdStyle}>
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ background: '#f1f5f9', borderRadius: '0.4rem', padding: '0.25rem', display: 'inline-flex' }}>
                            <FiCalendar size={12} style={{ color: '#94a3b8' }} />
                          </span>
                          <span style={{ fontWeight: 500, fontSize: '0.84rem' }}>{t.date ? t.date.slice(0, 10) : ''}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#0f172a', maxWidth: 220 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.description}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '0.28rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: t.type === 'Income'
                            ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
                            : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                          color: t.type === 'Income' ? '#15803d' : '#dc2626',
                          letterSpacing: '0.02em'
                        }}>
                          {t.type === 'Income' ? <FiArrowDownLeft size={12} /> : <FiArrowUpRight size={12} />}
                          {t.type}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          padding: '0.22rem 0.6rem',
                          borderRadius: '0.4rem',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          border: '1px solid #e2e8f0'
                        }}>
                          {t.category}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <span style={{
                          color: t.type === 'Income' ? '#059669' : '#dc2626',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          fontFamily: "'Segoe UI', system-ui, monospace",
                          letterSpacing: '-0.01em'
                        }}>
                          {t.type === 'Income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {getPaymentMethodLabel(t) ? (
                          <div>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontWeight: 600,
                              fontSize: '0.82rem',
                              color: '#1e293b'
                            }}>
                              <span style={{
                                background: getPaymentMethodLabel(t) === 'Hand Cash' ? '#fef3c7' : '#dbeafe',
                                borderRadius: '0.35rem',
                                padding: '0.2rem',
                                display: 'inline-flex'
                              }}>
                                <FiCreditCard size={11} style={{ color: getPaymentMethodLabel(t) === 'Hand Cash' ? '#d97706' : '#2563eb' }} />
                              </span>
                              {getPaymentMethodLabel(t)}
                            </span>
                            {getPaymentMethodLabel(t) === 'Bank Account' && t.bankAccountId && (
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 3, fontWeight: 500 }}>
                                {t.bankAccountId.accountNumber} – {t.bankAccountId.accountHolder}
                              </div>
                            )}
                            {getPaymentMethodLabel(t) === 'Hand Cash' && t.handCashId && (
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 3, fontWeight: 500 }}>
                                {t.handCashId.holder} – ₹{t.handCashId.amount}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>—</span>
                        )}
                      </td>
                      {canEdit && (
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div className="d-flex justify-content-center gap-1">
                            <button className="btn btn-sm txn-action-btn txn-action-edit"
                              onClick={() => { handleEdit(t); setShowAddModal(true); }} title="Edit">
                              <FiEdit2 size={14} />
                            </button>
                            <button className="btn btn-sm txn-action-btn txn-action-download"
                              onClick={() => downloadInvoice(t)} title="Invoice">
                              <FiDownload size={14} />
                            </button>
                            <button className="btn btn-sm txn-action-btn txn-action-delete"
                              onClick={() => handleDelete(t._id)} title="Delete">
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── ADD / EDIT TRANSACTION MODAL ── */}
      {showAddModal && canEdit && (
        <div className="txn-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) { handleCancel(); setShowAddModal(false); } }}
        >
          <div className="txn-modal">
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #2563eb 100%)',
              padding: '1.5rem 1.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(99,102,241,0.2)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ color: 'rgba(165,180,252,0.8)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  {editingId ? 'Update Record' : 'Create New'}
                </div>
                <h5 className="mb-0 fw-bold" style={{ color: '#fff', fontSize: '1.15rem' }}>
                  {editingId ? 'Edit Transaction' : 'New Transaction'}
                </h5>
              </div>
              <button className="btn btn-sm" onClick={() => { handleCancel(); setShowAddModal(false); }}
                style={{
                  color: '#fff',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '0.55rem',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                  position: 'relative',
                  zIndex: 1
                }}>
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={(e) => { handleSubmit(e); if (!error) setShowAddModal(false); }} style={{ padding: '1.75rem' }}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label mb-1" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                  <input type="text" className="form-control txn-modal-input" name="description" placeholder="e.g. Office rent payment"
                    value={form.description} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label mb-1" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount (₹)</label>
                  <input type="number" className="form-control txn-modal-input" name="amount" placeholder="0.00"
                    value={form.amount} onChange={handleChange} required min="0" />
                </div>
                <div className="col-md-6">
                  <label className="form-label mb-1" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
                  <select className="form-select txn-modal-input" name="type" value={form.type} onChange={handleChange} required>
                    <option value="Income">💰 Income</option>
                    <option value="Expense">💸 Expense</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label mb-1" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                  <select className="form-select txn-modal-input" name="category" value={form.category} onChange={handleChange} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label mb-1" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
                  <input type="date" className="form-control txn-modal-input" name="date" value={form.date} onChange={handleChange} required />
                </div>
                <div className="col-12">
                  <label className="form-label mb-1" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Method</label>
                  <select className="form-select txn-modal-input" name="paymentMethod" value={form.paymentMethod} onChange={handleChange} required>
                    <option value="">Select Method</option>
                    <option value="Bank Account">🏦 Bank Account</option>
                    <option value="Hand Cash">💵 Hand Cash</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="d-flex justify-content-end gap-2 mt-4 pt-3" style={{ borderTop: '1.5px solid #f1f5f9' }}>
                <button type="button" className="btn"
                  style={{ background: '#f1f5f9', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.55rem 1.3rem', fontWeight: 600, fontSize: '0.88rem' }}
                  onClick={() => { handleCancel(); setShowAddModal(false); }}>
                  Cancel
                </button>
                <button type="submit" className="btn"
                  style={{
                    background: editingId
                      ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                      : 'linear-gradient(135deg, #059669, #10b981)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.6rem',
                    padding: '0.55rem 1.6rem',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    boxShadow: editingId
                      ? '0 4px 14px rgba(37,99,235,0.35)'
                      : '0 4px 14px rgba(16,185,129,0.35)',
                    letterSpacing: '0.01em'
                  }}>
                  {editingId ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EMBEDDED STYLES ── */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeInRow { from { opacity: 0; transform: translateX(-8px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }

        .txn-card {
          background: #fff;
          borderRadius: 1.1rem;
          border: 1px solid #e2e8f0;
          border-radius: 1.1rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.02);
        }

        .txn-btn-glass {
          background: rgba(255,255,255,0.1) !important;
          color: #fff !important;
          border: 1.5px solid rgba(255,255,255,0.2) !important;
          border-radius: 0.6rem !important;
          padding: 0.5rem 1.1rem !important;
          font-weight: 600 !important;
          font-size: 0.85rem !important;
          backdrop-filter: blur(8px);
          transition: all .2s ease !important;
          display: inline-flex !important;
          align-items: center !important;
        }
        .txn-btn-glass:hover {
          background: rgba(255,255,255,0.2) !important;
          border-color: rgba(255,255,255,0.35) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .txn-btn-primary {
          background: linear-gradient(135deg, #10b981, #059669) !important;
          color: #fff !important;
          border: none !important;
          border-radius: 0.6rem !important;
          padding: 0.5rem 1.2rem !important;
          font-weight: 700 !important;
          font-size: 0.85rem !important;
          box-shadow: 0 4px 14px rgba(16,185,129,0.35) !important;
          transition: all .2s ease !important;
          display: inline-flex !important;
          align-items: center !important;
        }
        .txn-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16,185,129,0.45) !important;
        }

        .txn-pill-btn {
          border-radius: 999px !important;
          padding: 0.35rem 0.85rem !important;
          font-weight: 600 !important;
          font-size: 0.78rem !important;
          display: inline-flex !important;
          align-items: center !important;
          transition: all .2s ease !important;
          cursor: pointer !important;
        }

        .txn-summary-card {
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .txn-summary-card:hover {
          transform: translateY(-4px);
        }

        .txn-table-row {
          transition: background .15s ease;
        }
        .txn-table-row:hover {
          background: #f8fafc !important;
        }

        .txn-action-btn {
          background: transparent !important;
          border: 1.5px solid #e2e8f0 !important;
          border-radius: 0.5rem !important;
          width: 34px !important;
          height: 34px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all .2s ease !important;
          cursor: pointer !important;
        }
        .txn-action-edit { color: #3b82f6 !important; }
        .txn-action-edit:hover { background: #eff6ff !important; border-color: #93c5fd !important; transform: translateY(-2px); box-shadow: 0 3px 8px rgba(59,130,246,0.15); }
        .txn-action-download { color: #8b5cf6 !important; }
        .txn-action-download:hover { background: #f5f3ff !important; border-color: #c4b5fd !important; transform: translateY(-2px); box-shadow: 0 3px 8px rgba(139,92,246,0.15); }
        .txn-action-delete { color: #ef4444 !important; }
        .txn-action-delete:hover { background: #fef2f2 !important; border-color: #fca5a5 !important; transform: translateY(-2px); box-shadow: 0 3px 8px rgba(239,68,68,0.15); }

        .txn-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #e2e8f0;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }

        .txn-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.55);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(6px);
          animation: fadeIn .2s ease;
        }

        .txn-modal {
          background: #fff;
          border-radius: 1.25rem;
          width: 100%;
          max-width: 640px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05);
          overflow: hidden;
          animation: slideUp .3s ease;
        }

        .txn-modal-input {
          border-radius: 0.65rem !important;
          border: 2px solid #e2e8f0 !important;
          padding: 0.6rem 0.9rem !important;
          font-size: 0.9rem !important;
          background: #f8fafc !important;
          transition: all .2s ease !important;
        }
        .txn-modal-input:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
          background: #fff !important;
        }
      `}</style>
    </div>
  );
};

export default Transactions;
