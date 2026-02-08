import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const PageHeader = ({ title, subtitle, actions }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        background: isDark
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 12px 28px rgba(15, 23, 42, 0.08)',
        marginBottom: '1.5rem'
      }}
    >
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a' }}>{title}</div>
        {subtitle && (
          <div style={{ marginTop: '0.35rem', color: isDark ? '#94a3b8' : '#475569', fontSize: '0.95rem' }}>
            {subtitle}
          </div>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};

export default PageHeader;
