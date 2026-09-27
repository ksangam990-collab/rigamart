import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';

/**
 * Route Guard for authenticated users with role-based access control
 * @param {Array<string>} allowedRoles - Optional array of authorized roles (e.g. ['seller', 'admin'])
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 gap-3">
        <div className="w-10 h-10 animate-pulse">
          <Logo variant="icon" size="sm" />
        </div>
        <span className="text-xs text-gray-400 font-medium">Verifying credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
