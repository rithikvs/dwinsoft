import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { ThemeContext } from '../context/ThemeContext';
import { FaUsers, FaEdit, FaSave, FaTimes, FaRupeeSign, FaPhone, FaMapMarkerAlt, FaBriefcase, FaCalendarAlt, FaUniversity } from 'react-icons/fa';

const SalaryManagement = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/salary/staff`, { headers });
      setStaff(res.data);
    } catch (err) {
      setError('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const startEdit = (user) => {
    setEditingId(user._id);
    setEditData({
      salary: user.salary || '',
      phone: user.phone || '',
      address: user.address || '',
      department: user.department || '',
      designation: user.designation || '',
      joiningDate: user.joiningDate ? user.joiningDate.split('T')[0] : '',
      bankName: user.bankName || '',
      bankAccountNumber: user.bankAccountNumber || '',
      ifscCode: user.ifscCode || '',
    });
    setSuccess('');
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/salary/staff/${id}`, editData, { headers });
      setSuccess('Updated successfully!');
      setEditingId(null);
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredStaff = filter === 'All' ? staff : staff.filter(s => s.role === filter);

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, color: textColor, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUsers /> Salary Management
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: mutedColor, fontSize: '0.9rem' }}>
            Manage salary and personal details for HR & Employees
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'HR', 'Employee'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                border: `1px solid ${filter === f ? '#667eea' : borderColor}`,
                background: filter === f ? '#667eea' : 'transparent',
                color: filter === f ? '#fff' : textColor,
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {success && <div className="alert alert-success py-2">{success}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* Staff Cards */}
      {filteredStaff.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: mutedColor }}>
          No staff found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
          {filteredStaff.map(user => (
            <div key={user._id} style={{
              background: cardBg,
              borderRadius: '16px',
              boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              border: `1px solid ${borderColor}`,
            }}>
              {/* Card Header */}
              <div style={{
                background: user.role === 'HR' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '1.1rem',
                  }}>
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{user.username}</div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>{user.email}</div>
                  </div>
                </div>
                <span style={{
                  background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.2rem 0.6rem',
                  borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                }}>
                  {user.role}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.25rem' }}>
                {editingId === user._id ? (
                  /* Edit Mode */
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                          <FaRupeeSign /> Salary (₹)
                        </label>
                        <input type="number" value={editData.salary} onChange={e => setEditData({ ...editData, salary: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                          <FaPhone /> Phone
                        </label>
                        <input type="text" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                          <FaBriefcase /> Department
                        </label>
                        <input type="text" value={editData.department} onChange={e => setEditData({ ...editData, department: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                          <FaBriefcase /> Designation
                        </label>
                        <input type="text" value={editData.designation} onChange={e => setEditData({ ...editData, designation: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                          <FaCalendarAlt /> Joining Date
                        </label>
                        <input type="date" value={editData.joiningDate} onChange={e => setEditData({ ...editData, joiningDate: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                          <FaUniversity /> Bank Name
                        </label>
                        <input type="text" value={editData.bankName} onChange={e => setEditData({ ...editData, bankName: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                          <FaUniversity /> Account No.
                        </label>
                        <input type="text" value={editData.bankAccountNumber} onChange={e => setEditData({ ...editData, bankAccountNumber: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                          <FaUniversity /> IFSC Code
                        </label>
                        <input type="text" value={editData.ifscCode} onChange={e => setEditData({ ...editData, ifscCode: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1', marginTop: '0.75rem' }}>
                      <label style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                        <FaMapMarkerAlt /> Address
                      </label>
                      <input type="text" value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                      <button onClick={cancelEdit} style={{
                        padding: '0.45rem 1rem', borderRadius: '8px', border: `1px solid ${borderColor}`,
                        background: 'transparent', color: mutedColor, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem',
                      }}>
                        <FaTimes /> Cancel
                      </button>
                      <button onClick={() => saveEdit(user._id)} style={{
                        padding: '0.45rem 1rem', borderRadius: '8px', border: 'none',
                        background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem',
                      }}>
                        <FaSave /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Salary</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: user.salary ? '#10b981' : '#ef4444' }}>
                          {user.salary ? `₹${Number(user.salary).toLocaleString('en-IN')}` : 'Not Set'}
                        </div>
                      </div>
                      <button onClick={() => startEdit(user)} style={{
                        padding: '0.4rem 0.8rem', borderRadius: '8px', border: `1px solid ${borderColor}`,
                        background: 'transparent', color: '#667eea', cursor: 'pointer', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem',
                      }}>
                        <FaEdit /> Edit
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                      {[
                        { label: 'Phone', value: user.phone },
                        { label: 'Department', value: user.department },
                        { label: 'Designation', value: user.designation },
                        { label: 'Joining Date', value: user.joiningDate ? new Date(user.joiningDate).toLocaleDateString('en-IN') : '' },
                        { label: 'Bank', value: user.bankName },
                        { label: 'Account No.', value: user.bankAccountNumber },
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
  );
};

export default SalaryManagement;
