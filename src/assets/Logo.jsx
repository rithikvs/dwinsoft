import React from 'react';
import logo from './image.png';

const Logo = ({ size = 250 }) => (
  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
    <img
      src={logo}
      alt="Dwinsoft Logo"
      style={{
        width: size,
        maxWidth: '90%',
        height: 'auto',
        borderRadius: 18,
        boxShadow: '0 4px 32px 0 rgba(44, 62, 80, 0.15)',
        background: 'white',
        padding: 8
      }}
    />
  </div>
);

export default Logo;
