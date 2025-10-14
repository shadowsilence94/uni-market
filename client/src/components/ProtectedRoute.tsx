
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { currentUser } = useAuth();

  // Check if user is logged in and is an admin
  if (!currentUser || currentUser.role !== 'admin') {
    // Redirect to home page if not authorized
    return <Navigate to="/" replace />;
  }

  // If authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
