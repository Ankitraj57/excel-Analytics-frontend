import React from 'react';
import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  return (
    <div className="unauthorized-page">
      <h1>Access Denied</h1>
      <p>You do not have permission to view this page.</p>
      <Link to="/Home">Go to Home</Link>
    </div>
  );
}

export default UnauthorizedPage;