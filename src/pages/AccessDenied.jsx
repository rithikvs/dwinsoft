import React from 'react';

const AccessDenied = () => (
  <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
    <h1 className="text-danger">Access Denied</h1>
    <p>You do not have permission to view this page.</p>
  </div>
);

export default AccessDenied;
