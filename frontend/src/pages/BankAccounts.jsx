
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table, Badge, Spinner, Card } from 'react-bootstrap';
import { FaPlus, FaUniversity, FaCreditCard, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import API_BASE_URL from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

const BankAccounts = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const canEdit = user && (user.role === 'Admin' || user.role === 'Accountant');

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAccount, setCurrentAccount] = useState({
    name: '',
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    branchName: '',
    accountType: 'Savings',
    balance: 0,
    status: 'Active'
  });

  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/bank-accounts`);
      setAccounts(res.data);
    } catch (err) {
      setError('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenModal = (account = null) => {
    if (account) {
      setCurrentAccount(account);
      setIsEditing(true);
    } else {
      setCurrentAccount({
        name: '',
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        branchName: '',
        accountType: 'Savings',
        balance: 0,
        status: 'Active'
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/bank-accounts/${currentAccount._id}`, currentAccount);
      } else {
        await axios.post(`${API_BASE_URL}/api/bank-accounts`, currentAccount);
      }
      fetchAccounts();
      handleCloseModal();
    } catch (err) {
      setError(isEditing ? 'Failed to update account' : 'Failed to create account');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/bank-accounts/${id}`);
        fetchAccounts();
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete account');
      }
    }
  };

  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const cardBg = isDark ? '#1e293b' : '#ffffff';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader
        title="Bank Accounts"
        subtitle="Manage and monitor all your linked bank accounts and balances."
      />

      {canEdit && (
        <div className="d-flex justify-content-end mb-3">
          <Button
            variant="primary"
            className="d-flex align-items-center gap-2 shadow-sm"
            onClick={() => handleOpenModal()}
          >
            <FaPlus /> Add New Bank Account
          </Button>
        </div>
      )}

      <SectionCard>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: textColor, margin: 0 }}>Registered Accounts</h3>
            <p style={{ fontSize: '0.875rem', color: mutedColor, margin: '0.25rem 0 0' }}>Real-time overview of your financial institutions.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2" style={{ color: mutedColor }}>Fetching accounts...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger shadow-sm border-0 d-flex align-items-center gap-2">
            <FaTimesCircle /> {error}
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-5 border rounded-3 bg-light bg-opacity-10">
            <FaUniversity size={48} className="mb-3 text-muted" />
            <p className="fw-bold mb-1" style={{ color: textColor }}>No Bank Accounts Found</p>
            <p style={{ color: mutedColor }}>Click the "Add New Bank Account" button to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover borderless className={`mb-0 align-middle ${isDark ? 'table-dark' : ''}`}>
              <thead className={isDark ? 'bg-darker' : 'bg-light'}>
                <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
                  <th className="px-3" style={{ color: mutedColor }}>Account details</th>
                  <th style={{ color: mutedColor }}>Bank & Branch</th>
                  <th style={{ color: mutedColor }}>Account Number</th>
                  <th style={{ color: mutedColor }}>IFSC</th>
                  <th style={{ color: mutedColor }}>Balance</th>
                  <th style={{ color: mutedColor }}>Status</th>
                  <th style={{ color: mutedColor }} className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => (
                  <tr key={acc._id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                    <td className="px-3 py-3">
                      <div>
                        <div style={{ fontWeight: '600', color: textColor }}>{acc.name}</div>
                        <div style={{ fontSize: '0.75rem', color: mutedColor }}>{acc.accountHolderName} • {acc.accountType}</div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <FaUniversity className="text-primary" />
                        <div>
                          <div style={{ fontWeight: '500', color: textColor }}>{acc.bankName}</div>
                          <div style={{ fontSize: '0.75rem', color: mutedColor }}>{acc.branchName || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="bg-light px-2 py-1 rounded text-dark" style={{ fontSize: '0.9rem' }}>
                        {acc.accountNumber}
                      </code>
                    </td>
                    <td>{acc.ifscCode}</td>
                    <td>
                      <span className="fw-bold" style={{ color: acc.balance < 0 ? '#ef4444' : '#10b981' }}>
                        ₹{acc.balance.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <Badge bg={acc.status === 'Active' ? 'success' : 'secondary'} className="px-2 py-1">
                        {acc.status}
                      </Badge>
                    </td>
                    {canEdit && (
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="border-0"
                            onClick={() => handleOpenModal(acc)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="border-0"
                            onClick={() => handleDelete(acc._id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </SectionCard>

      {/* Account Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        contentClassName={isDark ? 'bg-dark text-light border-secondary' : ''}
        size="lg"
      >
        <Modal.Header closeButton className={isDark ? 'border-secondary close-white' : ''}>
          <Modal.Title className="fw-bold">
            {isEditing ? 'Edit Bank Account' : 'Add New Bank Account'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="px-4 py-4">
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Internal Reference Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Primary HDFC"
                    value={currentAccount.name}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, name: e.target.value })}
                    required
                    className={isDark ? 'bg-dark text-light border-secondary' : ''}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Account Holder Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Full name as per bank record"
                    value={currentAccount.accountHolderName}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, accountHolderName: e.target.value })}
                    required
                    className={isDark ? 'bg-dark text-light border-secondary' : ''}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Account Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter account number"
                    value={currentAccount.accountNumber}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, accountNumber: e.target.value })}
                    required
                    className={isDark ? 'bg-dark text-light border-secondary' : ''}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Bank Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. HDFC Bank, SBI"
                    value={currentAccount.bankName}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, bankName: e.target.value })}
                    required
                    className={isDark ? 'bg-dark text-light border-secondary' : ''}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">IFSC Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. HDFC0001234"
                    value={currentAccount.ifscCode}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, ifscCode: e.target.value })}
                    required
                    className={isDark ? 'bg-dark text-light border-secondary' : ''}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Branch Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Branch location"
                    value={currentAccount.branchName}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, branchName: e.target.value })}
                    className={isDark ? 'bg-dark text-light border-secondary' : ''}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Account Type</Form.Label>
                  <Form.Select
                    value={currentAccount.accountType}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, accountType: e.target.value })}
                    className={isDark ? 'bg-dark text-light border-secondary' : ''}
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Initial Balance (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0.00"
                    value={currentAccount.balance}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, balance: parseFloat(e.target.value) || 0 })}
                    className={isDark ? 'bg-dark text-light border-secondary' : ''}
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Status</Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      label="Active"
                      name="status"
                      id="status-active"
                      checked={currentAccount.status === 'Active'}
                      onChange={() => setCurrentAccount({ ...currentAccount, status: 'Active' })}
                    />
                    <Form.Check
                      type="radio"
                      label="Inactive"
                      name="status"
                      id="status-inactive"
                      checked={currentAccount.status === 'Inactive'}
                      onChange={() => setCurrentAccount({ ...currentAccount, status: 'Inactive' })}
                    />
                  </div>
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className={isDark ? 'border-secondary' : ''}>
            <Button variant="link" onClick={handleCloseModal} className={`text-decoration-none ${isDark ? 'text-light' : 'text-muted'}`}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="px-4 shadow-sm">
              {isEditing ? 'Update Account' : 'Save Account'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style>{`
        .bg-darker { background-color: #0f172a; }
        .close-white .btn-close { filter: invert(1) grayscale(100%) brightness(200%); }
        .table-responsive::-webkit-scrollbar {
          height: 6px;
        }
        .table-responsive::-webkit-scrollbar-track {
          background: transparent;
        }
        .table-responsive::-webkit-scrollbar-thumb {
          background: ${isDark ? '#334155' : '#cbd5e1'};
          border-radius: 10px;
        }
        .table-hover tbody tr:hover {
          background-color: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'};
        }
      `}</style>
    </div>
  );
};

export default BankAccounts;
