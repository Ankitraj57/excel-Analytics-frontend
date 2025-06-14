import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const {jwt, isAuthenticated, role, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="spinner">Checking access...</div>;
  }

  if (!jwt || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Log role for debugging
  console.log('Current role:', role);
  console.log('Allowed roles:', allowedRoles);

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
