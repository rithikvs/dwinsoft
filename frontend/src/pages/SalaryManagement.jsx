import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { ThemeContext } from '../context/ThemeContext';
import { FaUsers, FaEdit, FaSave, FaTimes, FaRupeeSign, FaPhone, FaMapMarkerAlt, FaBriefcase, FaCalendarAlt, FaUniversity, FaPlus, FaTrash, FaCheckCircle, FaClock } from 'react-icons/fa';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const SalaryManagement = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('monthly');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  // Monthly salary state
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddForm, setShowAddForm] = useState(false);
  const [salaryForm, setSalaryForm] = useState({ userId: '', basicSalary: '', bonus: '0', deductions: '0', notes: '', status: 'Pending' });
  const [salaryLoading, setSalaryLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/salary/staff`);
      setStaff(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryRecords = async () => {
    try {
      setSalaryLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/salary/records?month=${selectedMonth}&year=${selectedYear}`);
      setSalaryRecords(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load salary records');
    } finally {
      setSalaryLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);
  useEffect(() => { if (activeTab === 'monthly') fetchSalaryRecords(); }, [selectedMonth, selectedYear, activeTab]);

  const startEdit = (user) => {
    setEditingId(user._id);
    setEditData({
      salary: user.salary || '', phone: user.phone || '', address: user.address || '',
      department: user.department || '', designation: user.designation || '',
      joiningDate: user.joiningDate ? user.joiningDate.split('T')[0] : '',
      bankName: user.bankName || '', bankAccountNumber: user.bankAccountNumber || '', ifscCode: user.ifscCode || '',
    });
    setSuccess(''); setError('');
  };
  const cancelEdit = () => { setEditingId(null); setEditData({}); };
  const saveEdit = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/salary/staff/${id}`, editData);
      setSuccess('Updated successfully!');
      setEditingId(null);
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddSalary = async (e) => {
    e.preventDefault();
    if (!salaryForm.userId) { setError('Please select an employee'); return; }
    if (!salaryForm.basicSalary) { setError('Please enter basic salary'); return; }
    try {
      await axios.post(`${API_BASE_URL}/api/salary/records`, {
        ...salaryForm, month: selectedMonth, year: selectedYear,
      });
      setSuccess('Salary record saved!');
      setShowAddForm(false);
      setSalaryForm({ userId: '', basicSalary: '', bonus: '0', deductions: '0', notes: '', status: 'Pending' });
      fetchSalaryRecords();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save salary record');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Delete this salary record?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/salary/records/${id}`);
      setSuccess('Record deleted');
      fetchSalaryRecords();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Failed to delete'); setTimeout(() => setError(''), 3000); }
  };

  const handleMarkPaid = async (record) => {
    try {
      await axios.post(`${API_BASE_URL}/api/salary/records`, {
        userId: record.user._id, month: record.month, year: record.year,
        basicSalary: record.basicSalary, bonus: record.bonus, deductions: record.deductions,
        notes: record.notes, status: record.status === 'Paid' ? 'Pending' : 'Paid',
      });
      fetchSalaryRecords();
      setSuccess(`Marked as ${record.status === 'Paid' ? 'Pending' : 'Paid'}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Failed to update status'); setTimeout(() => setError(''), 3000); }
  };

  const filteredStaff = filter === 'All' ? staff : staff.filter(s => s.role === filter);
  const years = [];
  for (let y = new Date().getFullYear(); y >= 2020; y--) years.push(y);
  const netPreview = (Number(salaryForm.basicSalary) || 0) + (Number(salaryForm.bonus) || 0) - (Number(salaryForm.deductions) || 0);

  const cardBg = isDark ? '#1e293b' : '#fff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const inputBg = isDark ? '#0f172a' : '#f8fafc';

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: mutedColor }}>
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Loading staff data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, color: textColor, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUsers /> Salary Management
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: mutedColor, fontSize: '0.9rem' }}>Manage monthly salary and personal details for HR & Employees</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.25rem', borderBottom: `2px solid ${borderColor}` }}>
        {[{ key: 'monthly', label: 'Monthly Salary', icon: <FaCalendarAlt /> }, { key: 'staff', label: 'Staff Details', icon: <FaUsers /> }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '0.6rem 1.25rem', border: 'none', borderBottom: activeTab === tab.key ? '3px solid #667eea' : '3px solid transparent',
            background: 'transparent', color: activeTab === tab.key ? '#667eea' : mutedColor,
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {success && <div className="alert alert-success py-2">{success}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* ===== MONTHLY SALARY TAB ===== */}
      {activeTab === 'monthly' && (
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.9rem', fontWeight: 500 }}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.9rem', fontWeight: 500 }}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={() => { setShowAddForm(!showAddForm); setError(''); }} style={{
              padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
              background: showAddForm ? '#ef4444' : '#667eea', color: '#fff', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem',
            }}>
              {showAddForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Add Salary</>}
            </button>
          </div>

          {showAddForm && (
            <div style={{ background: cardBg, borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem', border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h5 style={{ margin: '0 0 1rem', color: textColor, fontSize: '1rem', fontWeight: 600 }}>
                <FaPlus /> Add Salary for {MONTHS[selectedMonth - 1]} {selectedYear}
              </h5>
              <form onSubmit={handleAddSalary}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Employee *</label>
                    <select value={salaryForm.userId} onChange={e => setSalaryForm({ ...salaryForm, userId: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }} required>
                      <option value="">Select employee...</option>
                      {staff.map(s => <option key={s._id} value={s._id}>{s.username} ({s.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Basic Salary (₹) *</label>
                    <input type="number" value={salaryForm.basicSalary} onChange={e => setSalaryForm({ ...salaryForm, basicSalary: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Bonus (₹)</label>
                    <input type="number" value={salaryForm.bonus} onChange={e => setSalaryForm({ ...salaryForm, bonus: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Deductions (₹)</label>
                    <input type="number" value={salaryForm.deductions} onChange={e => setSalaryForm({ ...salaryForm, deductions: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Status</label>
                    <select value={salaryForm.status} onChange={e => setSalaryForm({ ...salaryForm, status: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }}>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Notes</label>
                    <input type="text" value={salaryForm.notes} onChange={e => setSalaryForm({ ...salaryForm, notes: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }} placeholder="Optional notes" />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: netPreview >= 0 ? '#10b981' : '#ef4444' }}>
                    Net Salary: ₹{netPreview.toLocaleString('en-IN')}
                  </div>
                  <button type="submit" style={{
                    padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
                    background: '#10b981', color: '#fff', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem',
                  }}>
                    <FaSave /> Save Record
                  </button>
                </div>
              </form>
            </div>
          )}

          {salaryLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: mutedColor }}>
              <div className="spinner-border text-primary spinner-border-sm" role="status" />
            </div>
          ) : salaryRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: mutedColor, background: cardBg, borderRadius: '14px', border: `1px solid ${borderColor}` }}>
              No salary records for {MONTHS[selectedMonth - 1]} {selectedYear}. Click "Add Salary" to create one.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: '14px', overflow: 'hidden', background: cardBg, boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)' }}>
                <thead>
                  <tr style={{ background: isDark ? '#334155' : '#f1f5f9' }}>
                    {['Employee', 'Role', 'Basic', 'Bonus', 'Deductions', 'Net Salary', 'Status', 'Notes', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', borderBottom: `1px solid ${borderColor}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {salaryRecords.map(rec => (
                    <tr key={rec._id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <td style={{ padding: '0.75rem 1rem', color: textColor, fontWeight: 600, fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: rec.user?.role === 'HR' ? '#f59e0b' : '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                            {rec.user?.username?.charAt(0).toUpperCase()}
                          </div>
                          {rec.user?.username}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: rec.user?.role === 'HR' ? '#fef3c7' : '#ede9fe', color: rec.user?.role === 'HR' ? '#b45309' : '#7c3aed' }}>{rec.user?.role}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: textColor, fontSize: '0.85rem' }}>₹{Number(rec.basicSalary).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#10b981', fontSize: '0.85rem' }}>+₹{Number(rec.bonus).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.85rem' }}>-₹{Number(rec.deductions).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.75rem 1rem', color: textColor, fontWeight: 700, fontSize: '0.9rem' }}>₹{Number(rec.netSalary).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span onClick={() => handleMarkPaid(rec)} style={{
                          padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                          background: rec.status === 'Paid' ? '#d1fae5' : '#fef3c7', color: rec.status === 'Paid' ? '#059669' : '#b45309',
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        }}>
                          {rec.status === 'Paid' ? <><FaCheckCircle /> Paid</> : <><FaClock /> Pending</>}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: mutedColor, fontSize: '0.8rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.notes || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button onClick={() => handleDeleteRecord(rec._id)} style={{
                          padding: '0.3rem 0.5rem', borderRadius: '6px', border: 'none',
                          background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem',
                        }}><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', padding: '1rem', background: cardBg, borderRadius: '10px', border: `1px solid ${borderColor}`, flexWrap: 'wrap' }}>
                <div><span style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600 }}>Total Records:</span> <span style={{ fontWeight: 700, color: textColor }}>{salaryRecords.length}</span></div>
                <div><span style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600 }}>Total Payout:</span> <span style={{ fontWeight: 700, color: '#10b981' }}>₹{salaryRecords.reduce((a, r) => a + r.netSalary, 0).toLocaleString('en-IN')}</span></div>
                <div><span style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600 }}>Paid:</span> <span style={{ fontWeight: 700, color: '#059669' }}>{salaryRecords.filter(r => r.status === 'Paid').length}</span></div>
                <div><span style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600 }}>Pending:</span> <span style={{ fontWeight: 700, color: '#b45309' }}>{salaryRecords.filter(r => r.status === 'Pending').length}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== STAFF DETAILS TAB ===== */}
      {activeTab === 'staff' && (
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {['All', 'HR', 'Employee'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '0.4rem 1rem', borderRadius: '8px', border: `1px solid ${filter === f ? '#667eea' : borderColor}`,
                background: filter === f ? '#667eea' : 'transparent', color: filter === f ? '#fff' : textColor,
                fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem',
              }}>{f}</button>
            ))}
          </div>

          {filteredStaff.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: mutedColor }}>No staff found.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
              {filteredStaff.map(user => (
                <div key={user._id} style={{ background: cardBg, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <div style={{ background: user.role === 'HR' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #667eea, #764ba2)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{user.username?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{user.username}</div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>{user.email}</div>
                      </div>
                    </div>
                    <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>{user.role}</span>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    {editingId === user._id ? (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          {[
                            { key: 'salary', label: 'Base Salary (₹)', icon: <FaRupeeSign />, type: 'number' },
                            { key: 'phone', label: 'Phone', icon: <FaPhone />, type: 'text' },
                            { key: 'department', label: 'Department', icon: <FaBriefcase />, type: 'text' },
                            { key: 'designation', label: 'Designation', icon: <FaBriefcase />, type: 'text' },
                            { key: 'joiningDate', label: 'Joining Date', icon: <FaCalendarAlt />, type: 'date' },
                            { key: 'bankName', label: 'Bank Name', icon: <FaUniversity />, type: 'text' },
                            { key: 'bankAccountNumber', label: 'Account No.', icon: <FaUniversity />, type: 'text' },
                            { key: 'ifscCode', label: 'IFSC Code', icon: <FaUniversity />, type: 'text' },
                          ].map(f => (
                            <div key={f.key}>
                              <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>{f.icon} {f.label}</label>
                              <input type={f.type} value={editData[f.key]} onChange={e => setEditData({ ...editData, [f.key]: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }} />
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: '0.75rem' }}>
                          <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}><FaMapMarkerAlt /> Address</label>
                          <input type="text" value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                          <button onClick={cancelEdit} style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: 'transparent', color: mutedColor, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}><FaTimes /> Cancel</button>
                          <button onClick={() => saveEdit(user._id)} style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}><FaSave /> Save</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Base Salary</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: user.salary ? '#10b981' : '#ef4444' }}>{user.salary ? `₹${Number(user.salary).toLocaleString('en-IN')}` : 'Not Set'}</div>
                          </div>
                          <button onClick={() => startEdit(user)} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: 'transparent', color: '#667eea', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}><FaEdit /> Edit</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                          {[
                            { label: 'Phone', value: user.phone }, { label: 'Department', value: user.department },
                            { label: 'Designation', value: user.designation },
                            { label: 'Joining Date', value: user.joiningDate ? new Date(user.joiningDate).toLocaleDateString('en-IN') : '' },
                            { label: 'Bank', value: user.bankName }, { label: 'Account No.', value: user.bankAccountNumber },
                            { label: 'IFSC', value: user.ifscCode },
                          ].map((item, i) => (
                            <div key={i} style={{ padding: '0.4rem 0', borderBottom: `1px solid ${borderColor}` }}>
                              <div style={{ color: mutedColor, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</div>
                              <div style={{ color: textColor, fontWeight: 500 }}>{item.value || '—'}</div>
                            </div>
                          ))}
                          <div style={{ gridColumn: '1 / -1', padding: '0.4rem 0' }}>
                            <div style={{ color: mutedColor, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Address</div>
                            <div style={{ color: textColor, fontWeight: 500 }}>{user.address || '—'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalaryManagement;
