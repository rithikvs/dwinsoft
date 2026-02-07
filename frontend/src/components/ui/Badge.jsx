import React from 'react';

const toneStyles = {
  slate: { background: '#e2e8f0', color: '#334155' },
  blue: { background: '#dbeafe', color: '#1d4ed8' },
  green: { background: '#dcfce7', color: '#15803d' },
  amber: { background: '#fef3c7', color: '#b45309' },
  red: { background: '#fee2e2', color: '#b91c1c' }
};

const Badge = ({ children, tone = 'slate' }) => {
  const style = toneStyles[tone] || toneStyles.slate;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.65rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        ...style
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
