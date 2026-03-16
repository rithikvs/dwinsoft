import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeColors, colorPalette } from '../utils/colors';
import { FaUsers, FaEdit, FaSave, FaTimes, FaRupeeSign, FaPhone, FaMapMarkerAlt, FaBriefcase, FaCalendarAlt, FaUniversity, FaTrash } from 'react-icons/fa';

const SalaryManagement = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('staff');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [searchId, setSearchId] = useState('');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/salary/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

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
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/salary/staff/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Updated successfully!');
      setEditingId(null);
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredStaff = staff.filter(s => {
    const roleMatch = filter === 'All' || s.role === filter;
    const idMatch = searchId === '' || 
                    (s.employeeId && s.employeeId.toLowerCase().includes(searchId.toLowerCase())) ||
                    (s.username && s.username.toLowerCase().includes(searchId.toLowerCase())) ||
                    (s._id && s._id.toLowerCase().includes(searchId.toLowerCase()));
    return roleMatch && idMatch;
  });

  const colors = getThemeColors(isDark);
  const { cardBg, textColor, mutedColor, borderColor, inputBg } = colors;

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
          <p style={{ margin: '0.25rem 0 0', color: mutedColor, fontSize: '0.9rem' }}>Manage staff personal details and salary information</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.25rem', borderBottom: `2px solid ${borderColor}` }}>
        {[{ key: 'staff', label: 'Staff Details', icon: <FaUsers /> }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '0.6rem 1.25rem', border: 'none', borderBottom: activeTab === tab.key ? `3px solid ${colorPalette.primary.base}` : '3px solid transparent',
            background: 'transparent', color: activeTab === tab.key ? colorPalette.primary.base : mutedColor,
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {success && <div className="alert alert-success py-2">{success}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* ===== STAFF DETAILS TAB ===== */}
      {activeTab === 'staff' && (
        <div>
          {/* Attractive Search Section */}
          <div style={{
            background: cardBg,
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            border: `2px solid ${colorPalette.primary.base}`,
            boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : `0 8px 24px ${colorPalette.primary.light}40`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Search Input with Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '1.8rem', color: colorPalette.primary.base }}>🔍</div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: mutedColor, fontWeight: 700, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Search Staff Member
                </label>
                <input
                  type="text"
                  placeholder="Enter Employee ID, Username, or Name..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.2rem',
                    borderRadius: '10px',
                    border: `2px solid ${searchId ? colorPalette.primary.base : borderColor}`,
                    background: inputBg,
                    color: textColor,
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxShadow: searchId ? `0 0 0 3px ${isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)'}` : 'none'
                  }}
                />
              </div>
            </div>

            {/* Role Filter Buttons */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: mutedColor, fontWeight: 700, marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Filter by Role
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['All', 'HR', 'Employee'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '10px',
                      border: `2px solid ${filter === f ? colorPalette.primary.base : borderColor}`,
                      background: filter === f ? `linear-gradient(135deg, ${colorPalette.primary.base}, ${colorPalette.primary.dark})` : 'transparent',
                      color: filter === f ? '#fff' : textColor,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease',
                      boxShadow: filter === f ? `0 4px 12px ${colorPalette.primary.base}66` : 'none',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Counter */}
            {searchId && (
              <div style={{
                padding: '0.8rem 1.2rem',
                borderRadius: '8px',
                background: isDark ? colorPalette.primary.darkest : '#f0f4ff',
                border: `1px solid ${colorPalette.primary.base}`,
                fontSize: '0.9rem',
                fontWeight: 600,
                color: colorPalette.primary.base,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <span>✓</span>
                <span>{filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''} found</span>
              </div>
            )}
          </div>

          {filteredStaff.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: mutedColor }}>No staff found.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
              {filteredStaff.map(user => (
                <div key={user._id} style={{ background: cardBg, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <div style={{ background: user.role === 'HR' ? '#d1630f' : colorPalette.primary.dark, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{user.username?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{user.username}</div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>{user.email} {user.employeeId && <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>• ID: {user.employeeId}</span>}</div>
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
                          <button onClick={() => saveEdit(user._id)} style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', background: colorPalette.status.success, color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}><FaSave /> Save</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Base Salary</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: user.salary ? colorPalette.status.success : colorPalette.status.error }}>{user.salary ? `₹${Number(user.salary).toLocaleString('en-IN')}` : 'Not Set'}</div>
                          </div>
                          <button onClick={() => startEdit(user)} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: 'transparent', color: colorPalette.primary.base, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}><FaEdit /> Edit</button>
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
