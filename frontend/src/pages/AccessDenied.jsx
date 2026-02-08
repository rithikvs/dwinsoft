import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const AccessDenied = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <h1 style={{ color: '#ef4444' }}>Access Denied</h1>
      <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>You do not have permission to view this page.</p>
    </div>
  );
};

export default AccessDenied;
