import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const SectionCard = ({ children }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <section
      style={{
        background: isDark ? '#1e293b' : '#ffffff',
        borderRadius: '16px',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 12px 30px rgba(15, 23, 42, 0.08)',
        padding: '1.5rem',
        color: isDark ? '#e2e8f0' : '#1e293b'
      }}
    >
      {children}
    </section>
  );
};

export default SectionCard;
