import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="form-container">
    <h2>404 - Page Not Found</h2>
    <p>The page you're looking for doesn’t exist.</p>
    <Link to="/" className="auth-form a">Go to Home</Link>
  </div>
);

export default NotFoundPage;
