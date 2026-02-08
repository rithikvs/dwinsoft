import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { ThemeContext } from '../context/ThemeContext';
import { FaUserPlus, FaUsers, FaEnvelope, FaLock, FaUserTag, FaCheckCircle, FaExclamationCircle, FaTrash } from 'react-icons/fa';

const ROLE_COLORS = {
  Admin: { bg: '#dbeafe', color: '#1d4ed8' },
  HR: { bg: '#fef3c7', color: '#b45309' },
  Employee: { bg: '#ede9fe', color: '#7c3aed' },
  Accountant: { bg: '#d1fae5', color: '#059669' },
  Auditor: { bg: '#fce7f3', color: '#be185d' },
};

const CreateUser = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({ username: '', password: '', role: 'HR' });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);

  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? '#1e293b' : '#fff';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const inputBg = isDark ? '#0f172a' : '#f8fafc';
  const hoverBg = isDark ? '#334155' : '#f1f5f9';

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const { username, password, role } = formData;
  const email = username ? `${username}@dwinsoft.com` : '';

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username) { setError('Username is required.'); return; }
    if (!password) { setError('Password is required.'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/auth/create-user`,
        { username, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`User "${username}" created successfully!`);
      setFormData({ username: '', password: '', role: 'HR' });
      fetchUsers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px',
    border: `1px solid ${borderColor}`, background: inputBg, color: textColor,
    fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: '0.75rem', fontWeight: 600, color: mutedColor,
    textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex',
    alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem',
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem',
        padding: '1.5rem 1.75rem', borderRadius: '16px', marginBottom: '1.5rem',
        background: isDark
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(102,126,234,0.3)',
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.5rem' }}>
            <FaUserPlus /> Create User
          </h2>
          <p style={{ margin: '0.3rem 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Provision new HR or Employee accounts with official credentials
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '10px',
          color: '#fff', fontSize: '0.85rem', fontWeight: 600,
        }}>
          {users.length} Users
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
          borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 500,
          background: isDark ? '#064e3b' : '#d1fae5', color: isDark ? '#6ee7b7' : '#065f46',
          border: `1px solid ${isDark ? '#065f46' : '#a7f3d0'}`,
        }}>
          <FaCheckCircle /> {success}
        </div>
      )}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
          borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 500,
          background: isDark ? '#7f1d1d' : '#fee2e2', color: isDark ? '#fca5a5' : '#991b1b',
          border: `1px solid ${isDark ? '#991b1b' : '#fecaca'}`,
        }}>
          <FaExclamationCircle /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Create User Form */}
        <div style={{
          background: cardBg, borderRadius: '16px', border: `1px solid ${borderColor}`,
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '1rem 1.25rem', borderBottom: `1px solid ${borderColor}`,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <FaUserPlus style={{ color: '#667eea', fontSize: '1rem' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: textColor }}>New Account</h3>
          </div>
          <form onSubmit={onSubmit} autoComplete="off" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><FaUserTag /> Username</label>
                <input
                  type="text" name="username" value={username} onChange={onChange}
                  placeholder="e.g. john" required autoComplete="new-username"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}><FaEnvelope /> Official Email</label>
                <input
                  type="email" name="email" value={email} readOnly
                  placeholder="auto-generated"
                  style={{ ...inputStyle, background: isDark ? '#1a2332' : '#f1f5f9', color: mutedColor, cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '0.7rem', color: mutedColor, marginTop: '0.2rem', display: 'block' }}>
                  Auto-generated from username
                </span>
              </div>
              <div>
                <label style={labelStyle}><FaLock /> Password</label>
                <input
                  type="password" name="password" value={password} onChange={onChange}
                  placeholder="Enter a secure password" required autoComplete="new-password"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}><FaUserTag /> Role</label>
                <select name="role" value={role} onChange={onChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="HR">HR</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', marginTop: '1.25rem', padding: '0.7rem', borderRadius: '10px',
              border: 'none', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(102,126,234,0.4)',
              transition: 'all 0.2s',
            }}>
              <FaUserPlus /> {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>

        {/* All Users Table */}
        <div style={{
          background: cardBg, borderRadius: '16px', border: `1px solid ${borderColor}`,
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '1rem 1.25rem', borderBottom: `1px solid ${borderColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaUsers style={{ color: '#667eea', fontSize: '1rem' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: textColor }}>All Users</h3>
            </div>
            <span style={{
              background: isDark ? '#334155' : '#f1f5f9', padding: '0.2rem 0.6rem',
              borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: mutedColor,
            }}>
              {users.length} total
            </span>
          </div>
          <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
            {usersLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: mutedColor }}>
                <div className="spinner-border spinner-border-sm text-primary" role="status" />
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: mutedColor, fontSize: '0.9rem' }}>
                No users found.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: isDark ? '#334155' : '#f8fafc' }}>
                    {['User', 'Email', 'Role'].map(h => (
                      <th key={h} style={{
                        padding: '0.7rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: mutedColor,
                        textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left',
                        borderBottom: `1px solid ${borderColor}`, position: 'sticky', top: 0,
                        background: isDark ? '#334155' : '#f8fafc',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const rc = ROLE_COLORS[u.role] || ROLE_COLORS.Employee;
                    return (
                      <tr key={u._id} style={{
                        borderBottom: i < users.length - 1 ? `1px solid ${borderColor}` : 'none',
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.7rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: `linear-gradient(135deg, ${rc.bg}, ${rc.color}20)`,
                              color: rc.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                            }}>
                              {u.username?.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, color: textColor, fontSize: '0.85rem' }}>{u.username}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.7rem 1rem', color: mutedColor, fontSize: '0.85rem' }}>{u.email}</td>
                        <td style={{ padding: '0.7rem 1rem' }}>
                          <span style={{
                            padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem',
                            fontWeight: 600, background: rc.bg, color: rc.color,
                          }}>{u.role}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
