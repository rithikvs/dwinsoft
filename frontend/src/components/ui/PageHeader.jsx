import React from 'react';

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
        marginBottom: '1.5rem'
      }}
    >
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{title}</div>
        {subtitle && (
          <div style={{ marginTop: '0.35rem', color: '#475569', fontSize: '0.95rem' }}>
            {subtitle}
          </div>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};

export default PageHeader;
