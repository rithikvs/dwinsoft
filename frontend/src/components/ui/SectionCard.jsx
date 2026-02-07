import React from 'react';

const SectionCard = ({ children }) => {
  return (
    <section
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
        padding: '1.5rem'
      }}
    >
      {children}
    </section>
  );
};

export default SectionCard;
