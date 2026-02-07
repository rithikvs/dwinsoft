import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { FaRupeeSign, FaPhone, FaMapMarkerAlt, FaBriefcase, FaCalendarAlt, FaUniversity, FaEnvelope, FaUserTag, FaShieldAlt, FaCheckCircle, FaClock } from 'react-icons/fa';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const MyProfile = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/salary/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchSalaryRecords = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/salary/my-records`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSalaryRecords(res.data);
      } catch (err) {
        console.error('Failed to fetch salary records', err);
      }
    };
    fetchSalaryRecords();
  }, []);

  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? '#1e293b' : '#fff';
  const borderColor = isDark ? '#334155' : '#f1f5f9';
  const sectionBg = isDark ? '#0f172a' : '#f8fafc';

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: mutedColor }}>
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  const p = profile || user || {};

  return (
    <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: textColor }}>My Profile</h2>
        <span style={{ fontSize: '0.9rem', color: mutedColor }}>{today}</span>
      </div>

      {/* Profile Banner Card */}
      <div style={{ background: cardBg, borderRadius: '16px', boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', height: '120px', position: 'relative' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', background: '#fff',
            border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 700, color: '#667eea',
            position: 'absolute', bottom: '-40px', left: '2rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            {(p.username || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
        <div style={{ padding: '3.5rem 2rem 1.5rem 2rem' }}>
          <h3 style={{ margin: '0 0 0.25rem 0', color: textColor, fontSize: '1.4rem' }}>{p.username || 'User'}</h3>
          <p style={{ margin: 0, color: mutedColor, fontSize: '0.9rem' }}>{p.email || 'No email on file'}</p>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: '#ede9fe', color: '#7c3aed' }}>
              {p.role || 'Employee'}
            </span>
            {p.department && (
              <span style={{ display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: '#dbeafe', color: '#2563eb' }}>
                {p.department}
              </span>
            )}
            <span style={{ display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: '#d1fae5', color: '#059669' }}>
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Salary Info */}
        <div style={{ background: cardBg, borderRadius: '14px', boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: mutedColor, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaRupeeSign /> Salary Details
          </h4>
          <div style={{ textAlign: 'center', padding: '1rem 0', marginBottom: '1rem', background: sectionBg, borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Salary</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: p.salary ? '#10b981' : '#ef4444', marginTop: '0.25rem' }}>
              {p.salary ? `₹${Number(p.salary).toLocaleString('en-IN')}` : 'Not Assigned'}
            </div>
          </div>
          {p.salary > 0 && (
            <div style={{ fontSize: '0.85rem' }}>
              <InfoRow label="Annual CTC" value={`₹${(p.salary * 12).toLocaleString('en-IN')}`} borderColor={borderColor} textColor={textColor} mutedColor={mutedColor} />
            </div>
          )}
        </div>

        {/* Personal Info */}
        <div style={{ background: cardBg, borderRadius: '14px', boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: mutedColor, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUserTag /> Personal Information
          </h4>
          <InfoRow icon={<FaEnvelope />} label="Email" value={p.email || '—'} borderColor={borderColor} textColor={textColor} mutedColor={mutedColor} />
          <InfoRow icon={<FaPhone />} label="Phone" value={p.phone || '—'} borderColor={borderColor} textColor={textColor} mutedColor={mutedColor} />
          <InfoRow icon={<FaMapMarkerAlt />} label="Address" value={p.address || '—'} borderColor={borderColor} textColor={textColor} mutedColor={mutedColor} />
          <InfoRow icon={<FaBriefcase />} label="Department" value={p.department || '—'} borderColor={borderColor} textColor={textColor} mutedColor={mutedColor} />
          <InfoRow icon={<FaBriefcase />} label="Designation" value={p.designation || '—'} borderColor={borderColor} textColor={textColor} mutedColor={mutedColor} />
          <InfoRow icon={<FaCalendarAlt />} label="Joining Date" value={p.joiningDate ? new Date(p.joiningDate).toLocaleDateString('en-IN') : '—'} borderColor={borderColor} textColor={textColor} mutedColor={mutedColor} last />
        </div>

        {/* Bank Details */}
        <div style={{ background: cardBg, borderRadius: '14px', boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: mutedColor, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUniversity /> Bank Details
          </h4>
          <InfoRow label="Bank Name" value={p.bankName || '—'} borderColor={borderColor} textColor={textColor} mutedColor={mutedColor} />
          <InfoRow label="Account Number" value={p.bankAccountNumber || '—'} borderColor={borderColor} textColor={textColor} mutedColor={mutedColor} />
          <InfoRow label="IFSC Code" value={p.ifscCode || '—'} borderColor={borderColor} textColor={textColor} mutedColor={mutedColor} last />
        </div>

        {/* Access & Permissions */}
        <div style={{ background: cardBg, borderRadius: '14px', boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: mutedColor, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaShieldAlt /> Access & Permissions
          </h4>
          {[
            { label: 'View Invoices', allowed: true },
            { label: 'View Debts & Deductions', allowed: true },
            { label: 'Account Settings', allowed: true },
            { label: 'Manage Transactions', allowed: p.role === 'HR' },
            { label: 'Manage Bank Accounts', allowed: p.role === 'HR' },
            { label: 'Admin Panel', allowed: false },
          ].map((perm, i, arr) => (
            <div key={perm.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.65rem 0', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${borderColor}`,
            }}>
              <span style={{ fontSize: '0.875rem', color: mutedColor, fontWeight: 500 }}>{perm.label}</span>
              <span style={{
                display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '999px',
                fontSize: '0.8rem', fontWeight: 600,
                background: perm.allowed ? '#d1fae5' : '#fee2e2',
                color: perm.allowed ? '#059669' : '#dc2626',
              }}>
                {perm.allowed ? 'Allowed' : 'Restricted'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Salary History */}
      <div style={{ marginTop: '1.5rem', background: cardBg, borderRadius: '14px', boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${borderColor}`, flexWrap: 'wrap', gap: '0.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: mutedColor, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <FaCalendarAlt /> Monthly Salary History
          </h4>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
            style={{ padding: '0.35rem 0.6rem', borderRadius: '8px', border: `1px solid ${borderColor}`, background: sectionBg, color: textColor, fontSize: '0.85rem', fontWeight: 500 }}>
            {[...new Set([new Date().getFullYear(), ...salaryRecords.map(r => r.year)])].sort((a, b) => b - a).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        {(() => {
          const yearRecords = salaryRecords.filter(r => r.year === selectedYear).sort((a, b) => a.month - b.month);
          if (yearRecords.length === 0) {
            return <div style={{ textAlign: 'center', padding: '2rem', color: mutedColor, fontSize: '0.9rem' }}>No salary records for {selectedYear}</div>;
          }
          return (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: isDark ? '#334155' : '#f1f5f9' }}>
                    {['Month', 'Basic', 'Bonus', 'Deductions', 'Net Salary', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0.65rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', borderBottom: `1px solid ${borderColor}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {yearRecords.map(rec => (
                    <tr key={rec._id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <td style={{ padding: '0.65rem 0.75rem', color: textColor, fontWeight: 600 }}>{MONTHS[rec.month - 1]}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: textColor }}>₹{Number(rec.basicSalary).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#10b981' }}>+₹{Number(rec.bonus).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#ef4444' }}>-₹{Number(rec.deductions).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: textColor, fontWeight: 700 }}>₹{Number(rec.netSalary).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span style={{
                          padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                          background: rec.status === 'Paid' ? '#d1fae5' : '#fef3c7', color: rec.status === 'Paid' ? '#059669' : '#b45309',
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        }}>
                          {rec.status === 'Paid' ? <><FaCheckCircle /> Paid</> : <><FaClock /> Pending</>}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', padding: '0.75rem', background: sectionBg, borderRadius: '10px', flexWrap: 'wrap' }}>
                <div><span style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600 }}>Total Earned:</span> <span style={{ fontWeight: 700, color: '#10b981' }}>₹{yearRecords.reduce((a, r) => a + r.netSalary, 0).toLocaleString('en-IN')}</span></div>
                <div><span style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600 }}>Paid:</span> <span style={{ fontWeight: 700, color: '#059669' }}>{yearRecords.filter(r => r.status === 'Paid').length} months</span></div>
                <div><span style={{ fontSize: '0.75rem', color: mutedColor, fontWeight: 600 }}>Pending:</span> <span style={{ fontWeight: 700, color: '#b45309' }}>{yearRecords.filter(r => r.status === 'Pending').length} months</span></div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value, borderColor, textColor, mutedColor, last }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.65rem 0', borderBottom: last ? 'none' : `1px solid ${borderColor}`,
  }}>
    <span style={{ fontSize: '0.875rem', color: mutedColor, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      {icon} {label}
    </span>
    <span style={{ fontSize: '0.875rem', color: textColor, fontWeight: 600 }}>{value}</span>
  </div>
);

export default MyProfile;
