import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { FaCog, FaPalette, FaUserEdit, FaSave, FaSun, FaMoon, FaCheckCircle, FaExclamationCircle, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Settings = () => {
  const { user, token } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [name, setName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    setName(user?.username || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await axios.put(`${API_BASE_URL}/api/auth/me`, { username: name, email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Account updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update account info');
      setTimeout(() => setError(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');
    if (newPassword.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/api/auth/change-password`, { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPwSuccess('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setPwSuccess(''), 4000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
      setTimeout(() => setPwError(''), 4000);
    } finally {
      setPwSaving(false);
    }
  };

  // Theme-aware colors
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const inputBg = isDark ? '#0f172a' : '#f8fafc';
  const pageBg = isDark ? '#0f172a' : '#f1f5f9';
  const headerGradient = isDark
    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px',
    border: `1.5px solid ${borderColor}`, background: inputBg, color: textColor,
    fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle = {
    fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.6px', color: mutedColor, display: 'block', marginBottom: '0.4rem',
  };

  const cardStyle = {
    background: cardBg, borderRadius: '16px', border: `1px solid ${borderColor}`,
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Page Header */}
      <div style={{
        background: headerGradient, borderRadius: '20px', padding: '2rem 2.5rem',
        marginBottom: '2rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-20px', right: '60px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaCog style={{ fontSize: '1.4rem', color: '#fff' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>Settings</h2>
            <p style={{ margin: '0.15rem 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
              Personalize your workspace and manage your account
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Appearance Card */}
        <div style={cardStyle}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isDark ? '#312e81' : '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaPalette style={{ color: '#7c3aed', fontSize: '1rem' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: textColor }}>Appearance</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: mutedColor }}>Customize the look and feel</p>
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <label style={labelStyle}>Theme Mode</label>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              {[
                { value: 'light', icon: <FaSun />, label: 'Light', color: '#f59e0b', bg: '#fffbeb', activeBorder: '#f59e0b' },
                { value: 'dark', icon: <FaMoon />, label: 'Dark', color: '#6366f1', bg: '#eef2ff', activeBorder: '#6366f1' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setTheme(opt.value)} style={{
                  flex: 1, padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                  border: `2px solid ${theme === opt.value ? opt.activeBorder : borderColor}`,
                  background: theme === opt.value ? (isDark ? '#1e1b4b' : opt.bg) : 'transparent',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: theme === opt.value ? opt.activeBorder : (isDark ? '#334155' : '#f1f5f9'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: theme === opt.value ? '#fff' : mutedColor, fontSize: '1.2rem',
                    transition: 'all 0.2s ease',
                  }}>
                    {opt.icon}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === opt.value ? opt.activeBorder : mutedColor }}>
                    {opt.label}
                  </span>
                  {theme === opt.value && (
                    <span style={{ fontSize: '0.7rem', color: opt.activeBorder, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <FaCheckCircle /> Active
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
              <div style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Preview</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${borderColor}` }} />
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: isDark ? '#334155' : '#f1f5f9', border: `1px solid ${borderColor}` }} />
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: '#667eea' }} />
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: '#10b981' }} />
                <span style={{ fontSize: '0.8rem', color: mutedColor, marginLeft: '0.5rem' }}>
                  {isDark ? 'Dark mode enabled' : 'Light mode enabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Card */}
        <div style={cardStyle}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isDark ? '#1e3a5f' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaUserEdit style={{ color: '#3b82f6', fontSize: '1rem' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: textColor }}>Account Details</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: mutedColor }}>Update your display name & email</p>
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Display Name</label>
                <input
                  type="text" placeholder="Your name" value={name}
                  onChange={e => setName(e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = borderColor; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email" placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = borderColor; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Role badge */}
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '10px', border: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: mutedColor, fontWeight: 600 }}>Your Role</span>
                <span style={{ padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, background: '#ede9fe', color: '#7c3aed' }}>
                  {user?.role || 'User'}
                </span>
              </div>

              <button type="submit" disabled={saving} style={{
                width: '100%', padding: '0.7rem', borderRadius: '10px', border: 'none',
                background: saving ? '#94a3b8' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                transition: 'all 0.2s ease', boxShadow: '0 4px 14px rgba(102,126,234,0.3)',
              }}>
                <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
              </button>

              {success && (
                <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '10px', background: isDark ? '#064e3b' : '#d1fae5', color: '#059669', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaCheckCircle /> {success}
                </div>
              )}
              {error && (
                <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '10px', background: isDark ? '#7f1d1d' : '#fee2e2', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaExclamationCircle /> {error}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isDark ? '#3b1c1c' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaLock style={{ color: '#ef4444', fontSize: '1rem' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: textColor }}>Change Password</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: mutedColor }}>Keep your account secure with a strong password</p>
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <form onSubmit={handlePasswordChange}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPw ? 'text' : 'password'} value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      style={{ ...inputStyle, paddingRight: '2.5rem' }} required placeholder="Enter current password"
                      onFocus={e => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.15)'; }}
                      onBlur={e => { e.target.style.borderColor = borderColor; e.target.style.boxShadow = 'none'; }}
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} style={{
                      position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: mutedColor, cursor: 'pointer', fontSize: '0.9rem', padding: '0.2rem',
                    }}>{showCurrentPw ? <FaEyeSlash /> : <FaEye />}</button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPw ? 'text' : 'password'} value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      style={{ ...inputStyle, paddingRight: '2.5rem' }} required placeholder="Min 6 characters"
                      onFocus={e => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.15)'; }}
                      onBlur={e => { e.target.style.borderColor = borderColor; e.target.style.boxShadow = 'none'; }}
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{
                      position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: mutedColor, cursor: 'pointer', fontSize: '0.9rem', padding: '0.2rem',
                    }}>{showNewPw ? <FaEyeSlash /> : <FaEye />}</button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input
                    type="password" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={inputStyle} required placeholder="Re-enter new password"
                    onFocus={e => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = borderColor; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password strength hint */}
              {newPassword && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  {[6, 8, 12].map((len, i) => (
                    <div key={i} style={{ flex: 1, height: '4px', borderRadius: '999px', background: newPassword.length >= len ? ['#ef4444', '#f59e0b', '#10b981'][i] : (isDark ? '#334155' : '#e2e8f0'), transition: 'background 0.3s' }} />
                  ))}
                  <span style={{ fontSize: '0.72rem', color: mutedColor, marginLeft: '0.4rem', fontWeight: 600 }}>
                    {newPassword.length < 6 ? 'Too short' : newPassword.length < 8 ? 'Fair' : newPassword.length < 12 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {pwSuccess && (
                  <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FaCheckCircle /> {pwSuccess}
                  </span>
                )}
                {pwError && (
                  <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FaExclamationCircle /> {pwError}
                  </span>
                )}
                <button type="submit" disabled={pwSaving} style={{
                  padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none',
                  background: pwSaving ? '#94a3b8' : '#ef4444', color: '#fff',
                  fontWeight: 700, fontSize: '0.85rem', cursor: pwSaving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  boxShadow: '0 4px 14px rgba(239,68,68,0.25)', transition: 'all 0.2s ease',
                }}>
                  <FaLock /> {pwSaving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
